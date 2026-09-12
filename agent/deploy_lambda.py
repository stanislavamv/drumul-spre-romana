# -*- coding: utf-8 -*-
"""One-shot Lambda deploy for Corectorul.

Run this yourself, in the terminal where AWS_ACCESS_KEY_ID /
AWS_SECRET_ACCESS_KEY / AWS_REGION and ANTHROPIC_API_KEY are already set --
it reads the key from your shell's environment, never from this file, so
nothing secret ends up on disk or in a diff.

Creates (or updates, if run again): an IAM execution role, the Lambda
function itself, and a public Function URL with CORS enabled. No Bedrock
permissions needed at all -- the function calls Anthropic's API directly
over HTTPS, so the execution role only needs to write its own logs.
"""
import json
import os
import sys
import time

import boto3
from botocore.exceptions import ClientError

FUNCTION_NAME = "corectorul-feedback"
ROLE_NAME = "corectorul-lambda-execution"
REGION = os.environ.get("AWS_REGION", "us-east-1")
ZIP_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build", "deployment_package.zip")

TRUST_POLICY = {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": {"Service": "lambda.amazonaws.com"},
        "Action": "sts:AssumeRole",
    }],
}

BASIC_EXECUTION_POLICY_ARN = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"


def ensure_role(iam):
    try:
        role = iam.get_role(RoleName=ROLE_NAME)
        print("Reusing existing role:", role["Role"]["Arn"])
        return role["Role"]["Arn"]
    except ClientError as e:
        if e.response["Error"]["Code"] != "NoSuchEntity":
            raise

    role = iam.create_role(
        RoleName=ROLE_NAME,
        AssumeRolePolicyDocument=json.dumps(TRUST_POLICY),
        Description="Execution role for the Corectorul feedback Lambda",
    )
    iam.attach_role_policy(RoleName=ROLE_NAME, PolicyArn=BASIC_EXECUTION_POLICY_ARN)
    print("Created role:", role["Role"]["Arn"])
    print("Waiting for IAM role propagation...")
    time.sleep(10)
    return role["Role"]["Arn"]


def ensure_function(lam, role_arn, api_key):
    with open(ZIP_PATH, "rb") as f:
        zip_bytes = f.read()

    env = {"Variables": {"ANTHROPIC_API_KEY": api_key}}
    common = dict(
        Runtime="python3.13",
        Role=role_arn,
        Handler="lambda_handler.handler",
        Timeout=90,
        MemorySize=1024,
        Environment=env,
        Architectures=["x86_64"],
    )

    try:
        lam.get_function(FunctionName=FUNCTION_NAME)
        exists = True
    except ClientError as e:
        if e.response["Error"]["Code"] != "ResourceNotFoundException":
            raise
        exists = False

    if exists:
        print("Updating existing function code...")
        lam.update_function_code(FunctionName=FUNCTION_NAME, ZipFile=zip_bytes)
        _wait_until_updatable(lam)
        lam.update_function_configuration(FunctionName=FUNCTION_NAME, **common)
        print("Updated:", FUNCTION_NAME)
        return

    print("Creating function (retrying briefly if the role isn't assumable yet)...")
    last_err = None
    for attempt in range(6):
        try:
            lam.create_function(
                FunctionName=FUNCTION_NAME,
                Code={"ZipFile": zip_bytes},
                **common,
            )
            print("Created:", FUNCTION_NAME)
            return
        except ClientError as e:
            if e.response["Error"]["Code"] == "InvalidParameterValueException" and attempt < 5:
                last_err = e
                print("  role not ready yet, waiting 5s...")
                time.sleep(5)
                continue
            raise
    raise last_err


def _wait_until_updatable(lam):
    for _ in range(20):
        state = lam.get_function_configuration(FunctionName=FUNCTION_NAME)
        if state.get("LastUpdateStatus") != "InProgress":
            return
        time.sleep(2)


def ensure_function_url(lam):
    """Still created for completeness, but public invocation of Function
    URLs is blocked on this AWS account by some account-level restriction
    independent of this code (confirmed: the function itself works fine
    via an authenticated boto3 invoke, only anonymous access to the URL
    returns Forbidden). deploy_apigw.py puts API Gateway in front of the
    same function instead, which isn't caught by the same restriction --
    that's the endpoint actually in use. See agent/README.md."""
    cors = {
        "AllowOrigins": ["*"],
        "AllowMethods": ["POST"],
        "AllowHeaders": ["content-type"],
    }
    try:
        result = lam.get_function_url_config(FunctionName=FUNCTION_NAME)
        print("Function URL already exists:", result["FunctionUrl"])
        return result["FunctionUrl"]
    except ClientError as e:
        if e.response["Error"]["Code"] != "ResourceNotFoundException":
            raise

    result = lam.create_function_url_config(
        FunctionName=FUNCTION_NAME,
        AuthType="NONE",
        Cors=cors,
    )
    lam.add_permission(
        FunctionName=FUNCTION_NAME,
        StatementId="FunctionURLAllowPublicAccess",
        Action="lambda:InvokeFunctionUrl",
        Principal="*",
        FunctionUrlAuthType="NONE",
    )
    print("Created Function URL:", result["FunctionUrl"])
    return result["FunctionUrl"]


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("ANTHROPIC_API_KEY is not set in this shell. Set it, then re-run.")
    if not os.path.exists(ZIP_PATH):
        sys.exit("build/deployment_package.zip not found -- build it first.")

    iam = boto3.client("iam")
    lam = boto3.client("lambda", region_name=REGION)

    role_arn = ensure_role(iam)
    ensure_function(lam, role_arn, api_key)
    url = ensure_function_url(lam)

    print()
    print("Done. This Function URL likely returns Forbidden on this account")
    print("(see the note in ensure_function_url) -- run deploy_apigw.py for")
    print("a working public endpoint to the same function.")
    print(url)


if __name__ == "__main__":
    main()
