# -*- coding: utf-8 -*-
"""Puts an API Gateway HTTP API in front of the site-feedback-form Lambda.

Run in the same terminal as deploy_lambda.py: same credentials, nothing
new needed.
"""
import time

import boto3
from botocore.exceptions import ClientError

FUNCTION_NAME = "site-feedback-form"
API_NAME = "site-feedback-api"
REGION = "us-east-1"

# Same reasoning as agent/deploy_apigw.py: this is public and
# unauthenticated, so it's scoped to the two origins that actually need
# it rather than left at "*".
ALLOWED_ORIGINS = [
    "https://stanislavamv.github.io",
    "http://127.0.0.1:8777",
    "http://localhost:8777",
]
CORS_CONFIG = {
    "AllowOrigins": ALLOWED_ORIGINS,
    "AllowMethods": ["POST"],
    "AllowHeaders": ["content-type"],
}

# Turnstile already keeps casual bot traffic out; this is the backstop for
# whatever gets through anyway. A contact form has no legitimate reason to
# be hit faster than a person can click submit.
THROTTLE_SETTINGS = {"ThrottlingRateLimit": 3.0, "ThrottlingBurstLimit": 6}


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
        apigw.update_api(ApiId=api_id, CorsConfiguration=CORS_CONFIG)
        print("Reusing existing API, CORS config refreshed:", api_id)
    else:
        api = apigw.create_api(
            Name=API_NAME,
            ProtocolType="HTTP",
            CorsConfiguration=CORS_CONFIG,
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
    if not any(r["RouteKey"] == "POST /submit" for r in routes):
        apigw.create_route(
            ApiId=api_id,
            RouteKey="POST /submit",
            Target="integrations/%s" % integration_id,
        )
        print("Created route: POST /submit")

    stages = apigw.get_stages(ApiId=api_id)["Items"]
    if not any(s["StageName"] == "$default" for s in stages):
        apigw.create_stage(
            ApiId=api_id, StageName="$default", AutoDeploy=True,
            DefaultRouteSettings=THROTTLE_SETTINGS,
        )
        print("Created default stage with throttling:", THROTTLE_SETTINGS)
    else:
        apigw.update_stage(
            ApiId=api_id, StageName="$default",
            DefaultRouteSettings=THROTTLE_SETTINGS,
        )
        print("Refreshed throttling on existing stage:", THROTTLE_SETTINGS)

    source_arn = "arn:aws:execute-api:%s:%s:%s/*/*/submit" % (REGION, account_id, api_id)
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

    endpoint = "https://%s.execute-api.%s.amazonaws.com/submit" % (api_id, REGION)
    print()
    print("Waiting a few seconds for the route to become live...")
    time.sleep(8)
    print()
    print("Endpoint:", endpoint)
    print()
    print("Paste this into js/features/actions.js as SITE_FEEDBACK_ENDPOINT,")
    print("run tools/stamp_assets.py, and commit.")
    print()
    print("Test with:")
    print('  Invoke-RestMethod -Uri "%s" -Method Post -ContentType "application/json" -Body \'{"category":"general","message":"test","token":"x"}\'' % endpoint)
    print("  (expect a 400 captcha-verification error -- that confirms the route and Lambda are wired correctly)")


if __name__ == "__main__":
    main()
