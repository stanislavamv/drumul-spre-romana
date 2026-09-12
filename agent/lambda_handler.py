# -*- coding: utf-8 -*-
"""AWS Lambda entrypoint, behind a Function URL with CORS enabled there
(not in this code: Function URLs handle CORS natively, see agent/README.md).

Same request/response contract as main.py's AgentCore entrypoint, so the
frontend doesn't need to know or care which one is actually serving it.
"""
import json

from agent import build_agent

_agent = build_agent()

# This endpoint is public and unauthenticated, and every call costs real
# money against a real Anthropic account for the whole judging window. The
# longest real writing task in the course targets ~180 words (see
# README.md's course stats table); 4x that in characters is generous
# headroom for a genuine learner and a hard stop for an accidental or
# deliberate attempt to run up cost per call.
MAX_TEXT_CHARS = 4000


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
    except (json.JSONDecodeError, AttributeError):
        body = {}

    text = str(body.get("text") or "").strip()
    if not text:
        return _response(400, {"error": "No text submitted."})
    if len(text) > MAX_TEXT_CHARS:
        return _response(400, {"error": "Text is too long (max %d characters)." % MAX_TEXT_CHARS})

    result = _agent("Grade this free-written Romanian text: %r" % text)
    return _response(200, result.structured_output.model_dump())


def _response(status_code, payload):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload, ensure_ascii=False),
    }
