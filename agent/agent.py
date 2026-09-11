# -*- coding: utf-8 -*-
"""The Corectorul agent: grounded feedback on free-written Romanian text.

CLAUDE.md's content rules say free writing is never graded "correct" by the
app's own static checker, because it's honest about not being able to make
that call. This agent exists specifically to make that call for real,
grounded in the course's own verified data through the four tools in
tools.py. It doesn't replace the static checker: it's what runs when a
learner clicks "Get Feedback" on a free-writing exercise.
"""
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field
from strands import Agent

from tools import lookup_vocab, lookup_verb, lookup_grammar, check_register


class Verdict(str, Enum):
    correct = "correct"
    almost = "almost"
    unnatural = "unnatural"
    incorrect = "incorrect"


class WritingFeedback(BaseModel):
    verdict: Verdict = Field(description="Overall verdict for the submitted text.")
    explanation: str = Field(
        description=(
            "What was right or wrong, specific enough for the learner to act "
            "on. Reference the actual words or forms checked, not a general "
            "impression."
        )
    )
    corrected_text: Optional[str] = Field(
        default=None,
        description="A corrected version of the text. Required unless verdict is 'correct'.",
    )
    checked: list[str] = Field(
        default_factory=list,
        description=(
            "The specific words, verb forms, or grammar points actually "
            "looked up with a tool, shown to the learner so they know what "
            "was verified versus general knowledge."
        ),
    )


SYSTEM_PROMPT = """You are a Romanian writing tutor for Drumul spre Română, \
grading a learner's free-written Romanian text.

Verdicts mean:
- correct: natural, grammatically sound Romanian a native speaker would write.
- almost: understandable but has a real grammar or word-choice mistake.
- unnatural: grammatically defensible but not how a native speaker would \
actually say it (wrong register, an awkward calque, or overly formal or \
informal for the context).
- incorrect: the meaning breaks down or the grammar is fundamentally wrong.

Before judging anything checkable, use the tools:
- lookup_vocab for any word choice you are not certain about, and for every \
word that seems unusual, informal, or possibly wrong.
- lookup_verb for every conjugated verb in the text, to confirm the exact \
form is real and matches the intended person and tense.
- lookup_grammar when the text turns on a specific grammar point (subjunctive, \
definite articles, word order, etc.) so your explanation cites the course's \
own rule instead of a general impression.
- check_register before praising or flagging a word that could carry a \
register issue (too casual, slang, regional, or offensive), so the learner \
knows when something is fine grammatically but wrong for the context.

If a tool reports a word or verb as not found, say so plainly in the \
explanation rather than presenting a guess as a verified fact. You may still \
use your own knowledge for very basic function words, but be clear about the \
difference between what you checked and what you didn't.

List every word, form, or topic you actually looked up with a tool in \
`checked`.
"""


def build_agent():
    return Agent(
        system_prompt=SYSTEM_PROMPT,
        tools=[lookup_vocab, lookup_verb, lookup_grammar, check_register],
        structured_output_model=WritingFeedback,
    )


if __name__ == "__main__":
    import sys

    text = sys.argv[1] if len(sys.argv) > 1 else "Eu sunt fericit azi."
    agent = build_agent()
    result = agent("Grade this free-written Romanian text: %r" % text)
    print(result.structured_output.model_dump_json(indent=2))
