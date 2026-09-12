# -*- coding: utf-8 -*-
"""Puts an API Gateway HTTP API in front of the corectorul-feedback Lambda,
as a fallback path if the Lambda Function URL's public access is blocked
by an account-level restriction (see agent/README.md) that a different
AWS resource type might not share.

Run in the same terminal as deploy_lambda.py -- same credentials, nothing
new needed.
"""
import json
import time

import boto3
from botocore.exceptions import ClientError

FUNCTION_NAME = "corectorul-feedback"
API_NAME = "corectorul-feedback-api"
REGION = "us-east-1"


def get_function_arn(lam):
    return lam.get_function(FunctionName=FUNCTION_NAME)["Configuration"]["FunctionArn"]


def find_existing_api(apigw):
    apis = apigw.get_apis()["Items"]
    for api in apis:
        if api["Name"] == API_NAME:
            return api
    return None


def main():
    lam = boto3.client("lambda", region_name=REGION)
    apigw = boto3.client("apigatewayv2", region_name=REGION)
    account_id = boto3.client("sts").get_caller_identity()["Account"]

    function_arn = get_function_arn(lam)

    api = find_existing_api(apigw)
    if api:
        api_id = api["ApiId"]
        print("Reusing existing API:", api_id)
    else:
        api = apigw.create_api(
            Name=API_NAME,
            ProtocolType="HTTP",
            CorsConfiguration={
                "AllowOrigins": ["*"],
                "AllowMethods": ["POST"],
                "AllowHeaders": ["content-type"],
            },
        )
        api_id = api["ApiId"]
        print("Created API:", api_id)

    integration = apigw.create_integration(
        ApiId=api_id,
        IntegrationType="AWS_PROXY",
        IntegrationUri=function_arn,
        PayloadFormatVersion="2.0",
    )
    integration_id = integration["IntegrationId"]

    routes = apigw.get_routes(ApiId=api_id)["Items"]
    if not any(r["RouteKey"] == "POST /feedback" for r in routes):
        apigw.create_route(
            ApiId=api_id,
            RouteKey="POST /feedback",
            Target="integrations/%s" % integration_id,
        )
        print("Created route: POST /feedback")

    stages = apigw.get_stages(ApiId=api_id)["Items"]
    if not any(s["StageName"] == "$default" for s in stages):
        apigw.create_stage(ApiId=api_id, StageName="$default", AutoDeploy=True)
        print("Created default stage")

    source_arn = "arn:aws:execute-api:%s:%s:%s/*/*/feedback" % (REGION, account_id, api_id)
    try:
        lam.add_permission(
            FunctionName=FUNCTION_NAME,
            StatementId="AllowAPIGatewayInvoke",
            Action="lambda:InvokeFunction",
            Principal="apigateway.amazonaws.com",
            SourceArn=source_arn,
        )
        print("Granted API Gateway permission to invoke the function")
    except ClientError as e:
        if e.response["Error"]["Code"] != "ResourceConflictException":
            raise
        print("Permission already granted")

    endpoint = "https://%s.execute-api.%s.amazonaws.com/feedback" % (api_id, REGION)
    print()
    print("Waiting a few seconds for the route to become live...")
    time.sleep(8)
    print()
    print("Endpoint:", endpoint)
    print("Test with:")
    print('  Invoke-RestMethod -Uri "%s" -Method Post -ContentType "application/json" -Body \'{"text": "Vreau invata romana."}\'' % endpoint)


if __name__ == "__main__":
    main()
