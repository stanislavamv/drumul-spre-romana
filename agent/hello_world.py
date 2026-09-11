"""Step 1 sanity check: confirm Strands can reach Claude via Bedrock.

Run this after AWS Bedrock model access is enabled and credentials
(Bedrock API key or IAM) are set in the environment. Delete once the
real agent module replaces it.
"""

from strands import Agent

agent = Agent()
agent("Say hello in Romanian and in English, one short sentence each.")
