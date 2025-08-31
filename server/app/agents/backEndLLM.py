import os
import json
from typing import Optional, Dict, Any

from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.tools import tool
from pydantic import BaseModel, Field

from app.core.config import get_settings

class DependencyAnalysisOutput(BaseModel):
    new_feature: str = Field(description="The new feature being analyzed.")
    depends_on: list[int] = Field(description="List of feature IDs that the new feature depends on.")
    reasoning: str = Field(description="Short explanation of the dependencies.")

# Prompt template (as it was)
dependency_prompt = PromptTemplate(
    input_variables=["project_name", "features", "milestones", "tech_stack", "new_feature"],
    template="""
You are an expert project architect helping to determine dependencies between software features.

Project: {project_name}

Existing features (with IDs, milestone, and description):
{features}

Milestones:
{milestones}

Tech stack and constraints:
{tech_stack}

A new feature is being added:
"{new_feature}"

---

Task:
1. Based on the existing features, milestones, and tech stack, decide if this new feature depends on any existing feature(s).
2. If dependencies exist, list the feature IDs and explain why.
3. If no dependencies exist, state "No dependencies".
4. Output in JSON format:

{{
  "new_feature": "{new_feature}",
  "depends_on": [list of feature IDs or empty],
  "reasoning": "short explanation"
}}
"""
)

@tool
def analyze_feature_dependencies_tool(
    project_name: str,
    features: str,
    milestones: str,
    tech_stack: str,
    new_feature: str,
) -> DependencyAnalysisOutput:
    """
    Analyzes the dependencies of a new feature on existing features within a project.

    Args:
        project_name (str): The name of the project.
        features (str): A string representation of existing features, including IDs, milestones, and descriptions.
        milestones (str): A string representation of project milestones.
        tech_stack (str): A string representation of the project's tech stack and constraints.
        new_feature (str): The description of the new feature to be analyzed.

    Returns:
        DependencyAnalysisOutput: An object containing the new feature, its dependencies, and reasoning.
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

    formatted_prompt = dependency_prompt.format(
        project_name=project_name,
        features=features,
        milestones=milestones,
        tech_stack=tech_stack,
        new_feature=new_feature,
    )

    response = llm.invoke(formatted_prompt)

    try:
        json_output = json.loads(response.content)
        return DependencyAnalysisOutput(**json_output)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse LLM response as JSON: {e}. Response: {response.content}")
    except Exception as e:
        raise ValueError(f"Error creating DependencyAnalysisOutput from LLM response: {e}. Response: {response.content}")

# This function will be the main entry point for using this LLM for dependency analysis
def get_feature_dependencies(
    project_name: str,
    features: str,
    milestones: str,
    tech_stack: str,
    new_feature: str,
) -> DependencyAnalysisOutput:
    """
    Orchestrates the dependency analysis for a new feature using the LLM tool.

    Args:
        project_name (str): The name of the project.
        features (str): A string representation of existing features.
        milestones (str): A string representation of project milestones.
        tech_stack (str): A string representation of the project's tech stack.
        new_feature (str): The description of the new feature.

    Returns:
        DependencyAnalysisOutput: The result of the dependency analysis.
    """
    # Directly call the tool function. If this were part of a larger agent system,
    # you might set up an AgentExecutor here, but for a single specific task,
    # direct tool invocation is simpler.
    return analyze_feature_dependencies_tool(
        project_name=project_name,
        features=features,
        milestones=milestones,
        tech_stack=tech_stack,
        new_feature=new_feature,
    )