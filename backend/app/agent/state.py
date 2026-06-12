# backend/app/agent/state.py
from typing import List, Dict, Any, TypedDict
from langchain_core.messages import AIMessage # type: ignore

class AgentState(TypedDict):
    session_id: str
    user_input: str
    messages: List[Dict[str, str]]
    retrieved_docs: List[str]
    should_retrieve: bool
    final_answer: str
    next_action: str
    llm_response: AIMessage  # 新增：存储 LLM 的原始响应