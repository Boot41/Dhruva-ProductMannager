from typing import Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
import os
from app.core.config import get_settings

from app.schema import UmlDesign


SYSTEM_PROMPT = """
You are a principal systems architect.
Given product features, expected users, and geography,
produce a UML schema strictly following the Pydantic model provided.

Do not output anything except a valid JSON object.
"""


def generate_system_design(
    features: str,
    expected_users: str,
    geography: str,
    *,
    constraints: str | None = None,
    tech_stack: str | None = None,
    project_id: Optional[int] = None,
    temperature: float = 0.2,
) -> UmlDesign:
    """Generate a UML schema validated by Pydantic."""

    settings = get_settings()
    api_key = settings.api_key or os.getenv("API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("API key not set in env or settings")

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=temperature,
        google_api_key=api_key,
    )

    parser = PydanticOutputParser(pydantic_object=UmlDesign)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            (
                "user",
                """
Inputs

Project ID: {project_id}

Features:
{features}

Expected Users:
{expected_users}

Geography:
{geography}

Tech Stack (optional):
{tech_stack}

Constraints (optional):
{constraints}

Output must strictly conform to the UmlDesign schema:
{format_instructions}
""",
            ),
        ]
    )

    chain = prompt | llm | parser
    result: UmlDesign = chain.invoke(
        {
            "features": features,
            "expected_users": expected_users,
            "geography": geography,
            "constraints": constraints or "N/A",
            "tech_stack": tech_stack or "N/A",
            "project_id": project_id,
            "format_instructions": parser.get_format_instructions(),
        }
    )

    # Fill project_id if LLM misses it
    if result.project_id != project_id:
        result.project_id = project_id

    return result
