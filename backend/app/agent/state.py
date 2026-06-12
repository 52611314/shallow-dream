import asyncio
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
    llm_response: AIMessage
    output_queue: asyncio.Queue  # 流式输出队列，answer_node 通过它将 token 传出
    tool_results: List[Dict[str, str]]  # 工具执行结果，供 answer_node 作为上下文
