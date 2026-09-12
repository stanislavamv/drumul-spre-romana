# -*- coding: utf-8 -*-
"""AgentCore Runtime entrypoint.

Wraps the Strands agent in agent.py for direct code deployment. AgentCore
Runtime POSTs the request body, unparsed, to whatever function is decorated
with @app.entrypoint, and serializes whatever it returns back as the JSON
response. See bedrock_agentcore.runtime.app for the exact contract.

Payload shape matches the "Get Feedback" button's request from the app:
{"text": "...", "exerciseId": "...", "level": "..."}. exerciseId and level
aren't used by the agent yet; they're accepted now so the frontend contract
doesn't need to change later if per-level tone or per-exercise context gets
added.
"""
from bedrock_agentcore import BedrockAgentCoreApp

from agent import build_agent

app = BedrockAgentCoreApp()
_agent = build_agent()


@app.entrypoint
def handler(payload):
    text = (payload or {}).get("text", "")
    if not text.strip():
        return {"error": "No text submitted."}
    result = _agent("Grade this free-written Romanian text: %r" % text)
    return result.structured_output.model_dump()


if __name__ == "__main__":
    app.run()
