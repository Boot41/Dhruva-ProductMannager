from __future__ import annotations

import os
from typing import Optional
from datetime import datetime

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.tools import tool
from langchain.agents import AgentExecutor, create_tool_calling_agent

from app.core.config import get_settings
from app.core.db import SessionLocal
from app.models import TaskAssignment


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

@tool
def create_new_task_tool(
    description: str,
    project_id: int,
    user_id: int,  # Assignee
    assigned_by_user_id: int,
    task_type: str = "development",
    status: str = "todo",
    eta: Optional[str] = None, # ISO 8601 format string
) -> str:
    """
    Creates a new task assignment in the database.

    Args:
        description (str): A detailed description of the task.
        project_id (int): The ID of the project the task belongs to.
        user_id (int): The ID of the user to whom the task is assigned.
        assigned_by_user_id (int): The ID of the user who is assigning the task (taken from current_user).
        task_type (str, optional): The type of task (e.g., "development", "bug", "research"). Defaults to "development".
        status (str, optional): The current status of the task (e.g., "todo", "in progress", "completed"). Defaults to "todo".
        eta (Optional[str], optional): The estimated time of arrival/completion for the task in ISO 8601 format (e.g., "2025-12-31T23:59:59").
    Returns:
        str: A confirmation message indicating whether the task was created successfully.
    """
    db = SessionLocal()
    try:
        eta_datetime = datetime.fromisoformat(eta) if eta else None
        new_task = TaskAssignment(
            description=description,
            project_id=project_id,
            user_id=user_id,
            assigned_by=assigned_by_user_id,
            type=task_type,
            status=status,
            eta=eta_datetime,
        )
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        return f"Task '{new_task.description}' (ID: {new_task.id}) created successfully and assigned to user ID {new_task.user_id} for project ID {new_task.project_id}."
    except Exception as e:
        db.rollback()
        return f"Failed to create task: {e}"
    finally:
        db.close()


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

    tools = [create_new_task_tool] # Register the new tool

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

    # Create an agent that can use the tools
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    result = agent_executor.invoke(
        {
            "milestones": milestones.strip(),
            "tech_stack": (tech_stack or "N/A").strip(),
        }
    )
    return result["output"] if "output" in result else str(result)
