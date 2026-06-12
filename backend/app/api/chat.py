import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.core.database import save_message, get_chat_history, get_or_create_session
from app.agent.graph import agent_graph

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: str


@router.post("")
async def chat(req: ChatRequest):
    """流式对话接口（SSE）"""
    # 1. 确保会话存在，并获取历史
    await get_or_create_session(req.session_id)
    history = await get_chat_history(req.session_id)

    # 2. 保存用户消息
    await save_message(req.session_id, "user", req.message)

    # 3. 创建流式输出队列
    output_queue: asyncio.Queue = asyncio.Queue()

    # 4. 构建 Agent 初始状态
    initial_state = {
        "session_id": req.session_id,
        "user_input": req.message,
        "messages": history,
        "retrieved_docs": [],
        "should_retrieve": False,
        "final_answer": "",
        "next_action": "",
        "llm_response": None,
        "output_queue": output_queue,
        "tool_results": [],
    }

    async def event_generator():
        """SSE 事件生成器：在后台运行 Agent 图，同时从队列读取流式 token"""
        # 在后台启动 Agent 图的执行
        task = asyncio.create_task(agent_graph.ainvoke(initial_state))

        # 从队列读取流式输出并发送 SSE 事件
        try:
            while True:
                token = await output_queue.get()
                if token is None:
                    # None 作为哨兵值，表示流结束
                    break
                # SSE 格式：data: <content>\n\n
                # 转义 token 中的换行符，避免破坏 SSE 格式
                safe_token = token.replace("\n", "\\n").replace("\r", "")
                yield f"data: {safe_token}\n\n"
        except asyncio.CancelledError:
            # 客户端断开连接
            print("⚠️ [INFO] 客户端断开连接")
            task.cancel()
            return

        # 发送结束事件
        yield "data: [DONE]\n\n"

        # 等待 Agent 图完成，获取最终状态
        try:
            final_state = await task
            # 保存 AI 的最终回复
            final_answer = final_state.get("final_answer", "")
            if final_answer:
                await save_message(req.session_id, "assistant", final_answer)
                print(f"✅ [INFO] 已保存回复，长度：{len(final_answer)} 字符")
        except Exception as e:
            print(f"❌ [ERROR] Agent 图执行失败：{e}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 禁用 nginx 缓冲
        },
    )
