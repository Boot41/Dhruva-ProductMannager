from __future__ import annotations

import os
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.config import get_settings


SYSTEM_PROMPT = """
You are a senior product/engineering planner.
Given a product requirement description, extract clear features and convert them into concise milestones.

Strictly follow this output structure in clean markdown:

# Features
- <feature-1>
- <feature-2>
- ...

# Milestones by Feature
## <feature-1>
- Schema: short milestone describing the data model work (tables, fields, indexes, migrations)
- API: short milestone describing backend/API endpoints and contracts
- UI: short milestone describing the user interface flows/components

## <feature-2>
- Schema: ...
- API: ...
- UI: ...

# Notes
- Keep each milestone 1-2 lines, crisp and actionable.
- Prefer verbs: Design, Implement, Migrate, Test, Document.
- If a feature does not require a category, write: "<category>: N/A".
- Do not include any prose outside of these sections.
"""


def generate_milestones(
    requirements: str,
    tech_stack: Optional[str] = None,
    *,
    temperature: float = 0.2,
) -> str:
    """Convert requirement text into feature milestones (Schema, API, UI) using an LLM.

    Uses Google Gemini via LangChain when an API key is present.
    """
    settings = get_settings()
    api_key = (settings.api_key or os.getenv("API_KEY") or os.getenv("GOOGLE_API_KEY"))
    if not api_key:
        raise RuntimeError(
            "API key is not set. Please set API_KEY or GOOGLE_API_KEY in your environment/.env."
        )

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
                (
                    """
Requirements:
{requirements}

Tech Stack (optional):
{tech_stack}

Please extract features and produce milestones now.
"""
                ).strip(),
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()
    return chain.invoke(
        {
            "requirements": requirements.strip(),
            "tech_stack": (tech_stack or "N/A").strip(),
        }
    )
