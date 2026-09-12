# Corectorul

A free-writing feedback agent for [Drumul spre Română](../README.md), built
with the Strands Agents SDK for AWS's "Agents for Humans" hackathon
(submission period August 10 – September 14, 2026).

## Status: in progress

Working end to end from the command line and through the AgentCore
entrypoint contract, locally. Not yet done: public deployment, and the
"Get Feedback" button in the course app itself. Check the commit history
for current progress.

## What it does

The course's free-writing exercises can currently only be graded
`submitted` (see the main README's *Design commitments*) because the
rule-based checker is honest that it can't evaluate open-ended text. This
agent reads what a learner wrote, checks it against the course's own
verified vocabulary, verb, and grammar data through four tools, and
returns a real verdict (`correct` / `almost` / `unnatural` / `incorrect`)
backed by an explanation.

## Timeline and disclosure

The base course (this repository, minus `agent/`) was built August 15–26,
2026. This agent was built September 11–14, 2026. Both fall inside the
hackathon's submission period, but the course predates this hackathon by
about three weeks; it was built with no idea the hackathon would exist.
That gap is visible in the commit log too, so it's worth saying outright.

## Architecture

- **Model**: Claude, called through the Strands Agents SDK.
- **Grounding**: four tools (`lookup_vocab`, `lookup_verb`, `lookup_grammar`,
  `check_register`) read data extracted from the course's own
  `js/data/*.js` files, so a verdict is checked against real course
  content, not the model's memory of Romanian grammar. See
  [`grounding/README.md`](grounding/README.md) for exactly how each dataset
  was produced.
- **Deployment target**: Amazon Bedrock AgentCore Runtime (direct code
  deployment), with a Lambda-based fallback if that isn't cleanly working
  in time.

## Running it locally

```bash
cd agent
python -m venv .venv
.venv/Scripts/activate    # or: source .venv/bin/activate  (macOS/Linux)
pip install -r requirements.txt
python agent.py "Vreau învăța română."
```

Needs AWS credentials with Bedrock access available in the environment
(`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION`, an IAM role,
or a Bedrock API key). `main.py` is the AgentCore Runtime entrypoint used
for deployment; `agent.py` is the plain CLI entrypoint used for local
testing.
