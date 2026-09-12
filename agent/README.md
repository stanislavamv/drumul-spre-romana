# Corectorul

A free-writing feedback agent for [Drumul spre Română](../README.md), built
with the Strands Agents SDK for AWS's "Agents for Humans" hackathon
(submission period August 10 – September 14, 2026).

## Status: in progress

Deployed and working end to end from the open internet: browser-reachable
endpoint → API Gateway → Lambda → this agent → the four grounding tools →
Anthropic → a real verdict. Not yet done: the "Get Feedback" button in the
course app itself, and GitHub Pages hosting for the frontend. Check the
commit history for current progress.

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

- **Model**: Claude, called through the Strands Agents SDK. The provider is
  picked at runtime in `agent.py`: Bedrock by default, or Anthropic's own
  API directly if `ANTHROPIC_API_KEY` is set. Currently running on the
  Anthropic path — Bedrock access on the AWS account used for this project
  is stuck in AWS's account-verification queue as of September 2026, and
  waiting on it wasn't worth blocking the rest of the build. Swapping back
  once that clears is just unsetting the env var.
- **Grounding**: four tools (`lookup_vocab`, `lookup_verb`, `lookup_grammar`,
  `check_register`) read data extracted from the course's own
  `js/data/*.js` files, so a verdict is checked against real course
  content, not the model's memory of Romanian grammar. See
  [`grounding/README.md`](grounding/README.md) for exactly how each dataset
  was produced.
- **Deployment**: AWS Lambda behind API Gateway (`deploy_lambda.py`,
  `deploy_apigw.py`). A plain Lambda Function URL was tried first and
  works when invoked directly with authenticated AWS credentials, but
  returns `Forbidden` for genuinely public/anonymous access — this AWS
  account appears to have a separate restriction on public Function URLs,
  independent of the Bedrock issue above. API Gateway, an older AWS
  service, isn't caught by it, so that's the endpoint actually in use.
  Amazon Bedrock AgentCore Runtime was the original plan and remains a
  stretch goal if Bedrock access clears with time to spare (`main.py` is
  still the entrypoint for that path), but it depends on the same Bedrock
  service family currently blocked, so Lambda is primary for now.

## Running it locally

```bash
cd agent
python -m venv .venv
.venv/Scripts/activate    # or: source .venv/bin/activate  (macOS/Linux)
pip install -r requirements.txt
python agent.py "Vreau învăța română."
```

Needs one of two things in the environment: an `ANTHROPIC_API_KEY` (current
default, see *Architecture* above), or AWS credentials with Bedrock access
(`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION`, an IAM role,
or a Bedrock API key) with `ANTHROPIC_API_KEY` left unset. `main.py` is the
AgentCore Runtime entrypoint used for that deployment path; `agent.py` is
the plain CLI entrypoint used for local testing.

## Deploying

```bash
# Package (cross-platform build via uv -- plain pip mis-resolves this on
# Windows, see the comment in deploy_lambda.py's git history for why):
uv pip install --python-platform x86_64-manylinux2014 --python 3.13 \
  --target=build/package -r requirements.txt
cp lambda_handler.py agent.py tools.py build/package/
cp -r grounding build/package/
# then zip build/package into build/deployment_package.zip

python deploy_lambda.py   # creates the IAM role + Lambda function
python deploy_apigw.py    # puts API Gateway in front of it, the working public path
```

Both scripts read `ANTHROPIC_API_KEY` from the shell they're run in and are
safe to re-run: they update the existing function/API instead of
duplicating it.
