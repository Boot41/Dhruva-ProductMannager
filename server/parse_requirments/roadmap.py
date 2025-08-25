"""
LangChain-based roadmap generator.

Usage:
    from server.parse_requirments.roadmap import generate_roadmap
    roadmap = generate_roadmap(requirements_str, tech_stack_str)

Requires environment variable OPENAI_API_KEY to be set.
"""
from typing import Optional

from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI


SYSTEM_PROMPT = (
    "You are a senior product+tech planner. Given product requirements and a tech stack, "
    "produce a concise, practical roadmap:",
)

PROMPT_TEMPLATE = """
You will receive two inputs:
- Requirements: a plain English description of the product requirements and scope.
- Tech Stack: the intended technologies (frontend, backend, DB, infra, CI/CD, etc.).

Return a roadmap as a single UTF-8 text string with the following structure:

1) Features
   - List core features as bullets (e.g., Login, Cart, Payments).

2) Milestones per Feature
   - For each feature, list phased milestones (e.g., Schema/Models, API Endpoints, UI Components, Integration, Testing).

3) Day-to-Day Tasks
   - Break each milestone into daily implementable tasks.
   - Use short, action-oriented items, each starting with a verb.

4) Notes & Risks
   - Call out assumptions, dependencies, sequencing considerations, and major risks.

Guidelines:
- Be specific to the tech stack provided.
- Keep it pragmatic and shippable; prefer iterative milestones.
- Keep wording crisp; avoid filler.
- Output only the roadmap text, no preface or explanations.

Inputs:
Requirements:
"""


def _build_chain(model_name: str = "gpt-4o-mini", temperature: float = 0) -> ChatOpenAI:
    llm = ChatOpenAI(model=model_name, temperature=temperature)
    return llm


def generate_roadmap(
    requirements: str,
    tech_stack: str,
    *,
    model_name: str = "gpt-4o-mini",
    temperature: float = 0.2,
    max_retries: int = 2,
) -> str:
    """Generate a roadmap string from free-text requirements and tech stack.

    Args:
        requirements: Product requirements in plain text.
        tech_stack: Target technologies in plain text.
        model_name: LLM name usable by langchain_openai.ChatOpenAI.
        temperature: Decoding temperature.
        max_retries: Number of retries on transient failures.

    Returns:
        A roadmap as a single string.
    """
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT[0]),
            (
                "human",
                PROMPT_TEMPLATE
                + "{requirements}\n\nTech Stack:\n{tech_stack}\n\nReturn the roadmap now.",
            ),
        ]
    )

    chain = prompt | _build_chain(model_name, temperature) | StrOutputParser()

    # Invoke with simple retry semantics handled by LangChain's built-in mechanism via llm
    # For explicit retries, loop here if desired
    try:
        return chain.invoke({"requirements": requirements.strip(), "tech_stack": tech_stack.strip()})
    except Exception as e:
        # Best-effort single retry if configured
        last_err = e
        for _ in range(max_retries):
            try:
                return chain.invoke(
                    {"requirements": requirements.strip(), "tech_stack": tech_stack.strip()}
                )
            except Exception as e2:
                last_err = e2
                continue
        raise last_err
