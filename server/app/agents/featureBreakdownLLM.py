import functools
from typing import Optional, Dict, Any, List
import os

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.messages import HumanMessage, AIMessage
from langchain.tools import Tool, tool
from pydantic import BaseModel, Field

from app.core.config import get_settings

class FeatureBreakdown(BaseModel):
    frontend_tasks: List[str] = Field(description="List of tasks related to frontend development.")
    backend_tasks: List[str] = Field(description="List of tasks related to backend API development.")
    database_tasks: List[str] = Field(description="List of tasks related to database schema and operations.")
    security_tasks: List[str] = Field(description="List of tasks related to security, authentication, and authorization.")
    other_tasks: List[str] = Field(description="Any other relevant tasks not covered by the above categories.")

SYSTEM_PROMPT = """
You are an expert software engineer. Your task is to break down a given feature into smaller, actionable tasks across different development domains.
Consider frontend, backend, database, and security aspects.
Provide a comprehensive list of tasks for each category.
"""

def breakdown_feature(
    feature_description: str,
) -> FeatureBreakdown:
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
    def get_feature_breakdown(feature: str) -> FeatureBreakdown:
        """
        Breaks down a given software feature into detailed tasks across different development domains: frontend, backend, database, and security.
        """
        # This function will be called by the LLM to structure its output.
        # The actual breakdown logic is handled by the LLM's reasoning based on the SYSTEM_PROMPT.
        # We return an empty FeatureBreakdown here as a placeholder; the LLM will fill it.
        return FeatureBreakdown(frontend_tasks=[], backend_tasks=[], database_tasks=[], security_tasks=[], other_tasks=[])

    tools = [get_feature_breakdown]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    response = agent_executor.invoke(
        {
            "input": f"Break down the following feature: {feature_description}",
        }
    )
    
    # The response should contain the structured output from the tool call
    # We need to extract the FeatureBreakdown object from the tool's output
    # This part might need adjustment based on how AgentExecutor returns tool outputs
    # For now, let's assume the output directly contains the FeatureBreakdown if the tool was called.
    # If not, we might need to parse `response["output"]` or `response["intermediate_steps"]`
    
    # A more robust way to get the tool output:
    # Check if the agent actually called the tool and extract its output
    for step in response.get("intermediate_steps", []):
        if isinstance(step, tuple) and len(step) == 2:
            action, observation = step
            if hasattr(action, 'tool') and action.tool == 'get_feature_breakdown':
                # Assuming observation is the direct output of the tool (FeatureBreakdown object)
                # This might need more sophisticated parsing if observation is a string representation
                if isinstance(observation, FeatureBreakdown):
                    return observation
                elif isinstance(observation, str):
                    # If observation is a string, try to parse it as JSON into FeatureBreakdown
                    try:
                        import json
                        parsed_output = json.loads(observation)
                        return FeatureBreakdown(**parsed_output)
                    except json.JSONDecodeError:
                        pass # Fall through if parsing fails

    # Fallback if tool output is not directly captured or parsed
    # This might happen if the LLM decides not to call the tool or if parsing fails
    # In a real scenario, you might want to refine the prompt or agent to ensure tool usage.
    print("Warning: Could not extract FeatureBreakdown directly from tool output. Attempting to parse final output.")
    try:
        import json
        # Attempt to parse the final output as JSON, assuming the LLM might just output the JSON directly
        parsed_output = json.loads(response.get("output", "{}"))
        return FeatureBreakdown(**parsed_output)
    except json.JSONDecodeError:
        print("Error: Could not parse final output as JSON. Returning empty breakdown.")
        return FeatureBreakdown(frontend_tasks=[], backend_tasks=[], database_tasks=[], security_tasks=[], other_tasks=[])

