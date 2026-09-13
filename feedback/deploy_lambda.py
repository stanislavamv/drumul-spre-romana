# -*- coding: utf-8 -*-
"""One-shot Lambda deploy for the site feedback form.

Run this yourself, in the terminal where AWS_ACCESS_KEY_ID /
AWS_SECRET_ACCESS_KEY / AWS_REGION are already set, plus the two
feedback-specific secrets below (see feedback/README.md for how to get
them):

    TURNSTILE_SECRET   the secret key from your Cloudflare Turnstile widget
    FEEDBACK_TO         the address that receives feedback (must be a
                        verified SES identity in the same account/region --
                        see README.md)

Reads all of them from the shell's environment, never from this file, so
nothing secret ends up on disk or in a diff. Creates (or updates, if run
again) an IAM execution role and the Lambda function itself. No
third-party packages: the handler only needs boto3 and the standard
library, both already present in the Lambda Python runtime, so the
deployment package is just handler.py, zipped -- no pip install step.
"""
import io
import json
import os
import sys
import time
import zipfile

import boto3
from botocore.exceptions import ClientError

FUNCTION_NAME = "site-feedback-form"
ROLE_NAME = "site-feedback-lambda-execution"
REGION = os.environ.get("AWS_REGION", "us-east-1")
HANDLER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "handler.py")

TRUST_POLICY = {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": {"Service": "lambda.amazonaws.com"},
        "Action": "sts:AssumeRole",
    }],
}

BASIC_EXECUTION_POLICY_ARN = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

# Scoped to sending as this one identity, not "ses:*" -- the role can email
# on behalf of the feedback address and nothing else.
SES_POLICY_NAME = "site-feedback-ses-send"


def ses_send_policy(account_id, region, email):
    return {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": ["ses:SendEmail", "ses:SendRawEmail"],
            "Resource": "arn:aws:ses:%s:%s:identity/%s" % (region, account_id, email),
        }],
    }


def ensure_role(iam, account_id, region, feedback_to):
    try:
        role = iam.get_role(RoleName=ROLE_NAME)
        print("Reusing existing role:", role["Role"]["Arn"])
    except ClientError as e:
        if e.response["Error"]["Code"] != "NoSuchEntity":
            raise
        role = iam.create_role(
            RoleName=ROLE_NAME,
            AssumeRolePolicyDocument=json.dumps(TRUST_POLICY),
            Description="Execution role for the site feedback form Lambda",
        )
        iam.attach_role_policy(RoleName=ROLE_NAME, PolicyArn=BASIC_EXECUTION_POLICY_ARN)
        print("Created role:", role["Role"]["Arn"])

    iam.put_role_policy(
        RoleName=ROLE_NAME,
        PolicyName=SES_POLICY_NAME,
        PolicyDocument=json.dumps(ses_send_policy(account_id, region, feedback_to)),
    )
    print("Attached/refreshed SES send policy, scoped to:", feedback_to)
    return role["Role"]["Arn"] if "Role" in role else iam.get_role(RoleName=ROLE_NAME)["Role"]["Arn"]


def build_zip():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(HANDLER_PATH, arcname="handler.py")
    return buf.getvalue()


def ensure_function(lam, role_arn, turnstile_secret, feedback_to, ses_region):
    zip_bytes = build_zip()
    env = {"Variables": {
        "TURNSTILE_SECRET": turnstile_secret,
        "FEEDBACK_TO": feedback_to,
        "SES_REGION": ses_region,
    }}
    common = dict(
        Runtime="python3.13",
        Role=role_arn,
        Handler="handler.handler",
        Timeout=15,
        MemorySize=256,
        Environment=env,
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
                Architectures=["x86_64"],
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


def main():
    turnstile_secret = os.environ.get("TURNSTILE_SECRET")
    feedback_to = os.environ.get("FEEDBACK_TO")
    if not turnstile_secret:
        sys.exit("TURNSTILE_SECRET is not set in this shell. Set it, then re-run.")
    if not feedback_to:
        sys.exit("FEEDBACK_TO is not set in this shell (the address feedback goes to). Set it, then re-run.")

    ses_region = os.environ.get("SES_REGION", REGION)

    iam = boto3.client("iam")
    lam = boto3.client("lambda", region_name=REGION)
    account_id = boto3.client("sts").get_caller_identity()["Account"]

    role_arn = ensure_role(iam, account_id, ses_region, feedback_to)
    ensure_function(lam, role_arn, turnstile_secret, feedback_to, ses_region)

    print()
    print("Done. Run deploy_apigw.py next to put a public endpoint in front of it.")
    print("Reminder: FEEDBACK_TO (%s) must be a verified SES identity in %s," % (feedback_to, ses_region))
    print("or every send will fail with MessageRejected -- see README.md.")


if __name__ == "__main__":
    main()
