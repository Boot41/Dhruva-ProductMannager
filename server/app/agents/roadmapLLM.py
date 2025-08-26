from __future__ import annotations

import os
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import get_settings


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

    Uses Google Gemini when an API key is present.
    """
    # Read from pydantic settings (.env supported) and fallback to raw env vars
    settings = get_settings()
    api_key = (settings.api_key or os.getenv("API_KEY") or os.getenv("GOOGLE_API_KEY"))
    if not api_key:
        raise RuntimeError(
            "API key is not set. Please set API_KEY or GOOGLE_API_KEY in your environment/.env."
        )

    # Reasonable default Gemini model for planning tasks
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=temperature,
        google_api_key=api_key,
    )

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
