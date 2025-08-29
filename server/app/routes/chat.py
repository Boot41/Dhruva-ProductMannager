from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.agents.chatAgentLLM import chat_with_agent
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

class ChatQuery(BaseModel):
    query: str

@router.post("/chat/agent_query")
async def agent_query(chat_query: ChatQuery, current_user: User = Depends(get_current_user)):
    result = chat_with_agent(chat_query.query, current_user.id)
    # result is a dict with keys: output, tool_action
    return {"response": result.get("output", ""), "tool_action": result.get("tool_action")}
