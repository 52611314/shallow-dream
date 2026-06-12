# backend/app/api/chat.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.database import save_message, get_chat_history, get_or_create_session
from app.agent.graph import agent_graph

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    reply: str

@router.post("")
async def chat(req: ChatRequest):
    # 1. 确保会话存在，并获取历史
    await get_or_create_session(req.session_id)
    history = await get_chat_history(req.session_id)

    # 2. 保存用户消息
    await save_message(req.session_id, "user", req.message)

    # 3. 构建 Agent 初始状态
    initial_state = {
        "session_id": req.session_id,
        "user_input": req.message,
        "messages": history,
        "retrieved_docs": [],
        "should_retrieve": False,
        "final_answer": "",
        "next_action": "",
        "llm_response": None
    }

    # 4. 运行 Agent 图
    final_state = await agent_graph.ainvoke(initial_state)

    # 5. 保存 AI 的最终回复
    await save_message(req.session_id, "assistant", final_state["final_answer"])

    # 6. 返回回复
    return ChatResponse(reply=final_state["final_answer"])