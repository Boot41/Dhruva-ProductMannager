import functools
from typing import Optional
import os

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.messages import HumanMessage, AIMessage
from langchain.tools import Tool, tool # Import Tool and tool decorator
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.agents.tasksLLM import create_new_task_tool, get_tasks_for_user_by_status_tool # Import the new tool


SYSTEM_PROMPT = """
You are a helpful AI assistant. You have access to tools to assist you.
"""

def chat_with_agent(
    query: str,
    current_user_id: int,
    chat_history: Optional[list] = None,
) -> str:
    """
    Engages in a chat with an AI agent that can use tools.

    Args:
        query (str): The user's current query.
        current_user_id (int): The ID of the current user, who is assigning the task.
        chat_history (Optional[list]): A list of previous chat messages (HumanMessage, AIMessage).

    Returns:
        str: The agent's response.
    """
    settings = get_settings()
    api_key = (settings.api_key or os.getenv("API_KEY") or os.getenv("GOOGLE_API_KEY"))
    if not api_key:
        raise RuntimeError(
            "API key is not set. Please set API_KEY or GOOGLE_API_KEY in your environment/.env."
        )

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.2,
        google_api_key=api_key,
    )

    @tool
    def create_task_for_agent(
        description: str,
        project_id: int,
        user_id: int,  # Assignee
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
            task_type (str, optional): The type of task (e.g., "development", "bug", "research"). Defaults to "development".
            status (str, optional): The current status of the task (e.g., "todo", "in progress", "completed"). Defaults to "todo".
            eta (Optional[str], optional): The estimated time of arrival/completion for the task in ISO 8601 format (e.g., "2025-12-31T23:59:59").
        Returns:
            str: A confirmation message indicating whether the task was created successfully.
        """
        return create_new_task_tool.func(
            description=description,
            project_id=project_id,
            user_id=user_id,
            assigned_by_user_id=current_user_id, # Use the captured current_user_id
            task_type=task_type,
            status=status,
            eta=eta,
        )

    @tool
    def get_tasks_for_agent(
        status: Optional[str] = None,
    ) -> str:
        """
        Retrieves a list of tasks assigned to the current user, optionally filtered by status.

        Args:
            status (Optional[str], optional): The status of the tasks to filter by (e.g., "todo", "in progress", "completed").
                                              If None, retrieves tasks with "todo" or "in progress" status.
        Returns:
            str: A formatted string listing the tasks, or a message if no tasks are found.
        """
        return get_tasks_for_user_by_status_tool.func(
            user_id=current_user_id,
            status=status,
        )

    tools = [create_task_for_agent, get_tasks_for_agent] # Register the new tool

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    if chat_history is None:
        chat_history = []

    response = agent_executor.invoke(
        {
            "input": query,
            "chat_history": chat_history,
        }
    )
    return response["output"]

