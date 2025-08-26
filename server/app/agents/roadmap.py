from __future__ import annotations

import os
from typing import Optional

from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser


SYSTEM_PROMPT = """
You are a senior software delivery planner. Given product requirements and a specified tech stack,
produce a structured, step-by-step engineering roadmap.

Follow this structure strictly:

1) Features
   - Bullet list of top-level features extracted from the requirements.
2) Milestones per Feature
   - For each feature, list 3-6 milestones (schema, API, UI, integrations, testing, deployment).
3) Day-to-Day Tasks
   - Break each milestone into daily tasks with crisp, actionable items (1 day each when possible).
   - Use task verbs like: Design, Implement, Migrate, Test, Document, Review, Deploy.
4) Dependencies
   - Note any ordering constraints between milestones/features.
5) Deliverables & Acceptance Criteria
   - Concrete outputs per milestone and simple acceptance criteria.

Constraints and style:
- Reflect the provided tech stack and best practices.
- Prefer pragmatic sequencing and parallelization opportunities where safe.
- Be concise but complete; avoid filler text.
- Output in clean markdown with headings and bullet lists only.
"""


def generate_roadmap(
    requirements: str,
    tech_stack: str,
    best_practices: Optional[str] = None,
    temperature: float = 0.2,
) -> str:
    """Generate a structured roadmap using an LLM via LangChain.

    If the OPENAI_API_KEY env var is not set but API_KEY is, we will use API_KEY for OpenAI.
    """
    # Provider selection: prefer Google if GOOGLE_API_KEY is present, else OpenAI
    google_key = os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY")

    llm = None
    if google_key:
        # If default OpenAI-ish model is passed, pick a reasonable Gemini default
        chosen_model = "gemini-1.5-flash"
        llm = ChatGoogleGenerativeAI(model=chosen_model, temperature=temperature)
    else:
        if not openai_key:
            raise RuntimeError(
                "No API key found. Set GOOGLE_API_KEY for Gemini or OPENAI_API_KEY/API_KEY for OpenAI."
            )
        # Ensure OPENAI_API_KEY env var is set for the SDK
        if not os.getenv("OPENAI_API_KEY") and openai_key:
            os.environ["OPENAI_API_KEY"] = openai_key
        llm = ChatOpenAI(model=model or "gpt-4o-mini", temperature=temperature)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            (
                "user",
                """
Requirements:
{requirements}

Tech Stack:
{tech_stack}

Best Practices / Context (optional):
{best_practices}

Please produce the roadmap now.
""".strip(),
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()
    return chain.invoke(
        {
            "requirements": requirements.strip(),
            "tech_stack": tech_stack.strip(),
            "best_practices": (best_practices or "N/A").strip(),
        }
    )
