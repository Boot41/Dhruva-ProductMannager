from __future__ import annotations

import os
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.config import get_settings


SYSTEM_PROMPT = """
You are a senior delivery lead.
Given a list of milestones (from features like Schema, API, UI), break them down into concrete day-to-day engineering tasks.

Strictly follow this output format in clean markdown:

# Daily Task Plan

## <milestone-1>
- Day 1: <concise task>  
  - Subtasks: <bullet(s) as needed>
- Day 2: <concise task>
- Day 3: <concise task>
...

## <milestone-2>
- Day 1: <concise task>
...

Guidelines:
- Keep tasks small, actionable, and specific (e.g., "Implement user table", "Create React login form").
- Prefer verbs: Design, Implement, Migrate, Test, Document, Review, Refactor, Deploy.
- Include testing and documentation tasks as appropriate.
- If a milestone is too small for multiple days, group multiple tasks under Day 1 and stop.
- Do not add prose outside the sections. Keep it concise and complete.
"""


def generate_tasks(
    milestones: str,
    tech_stack: Optional[str] = None,
    *,
    temperature: float = 0.2,
) -> str:
    """Break milestone items into day-to-day engineering tasks using an LLM.

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
Milestones:
{milestones}

Tech Stack (optional):
{tech_stack}

Please produce a day-to-day task plan per milestone now.
"""
                ).strip(),
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()
    return chain.invoke(
        {
            "milestones": milestones.strip(),
            "tech_stack": (tech_stack or "N/A").strip(),
        }
    )
