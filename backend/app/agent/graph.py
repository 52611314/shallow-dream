# backend/app/agent/graph.py
from langgraph.graph import StateGraph, END # type: ignore
from langgraph.prebuilt import ToolNode # type: ignore
from app.agent.state import AgentState
from app.agent.nodes import decision_node, retrieve_node, answer_node, tools_list

# 创建 ToolNode
tool_node = ToolNode(tools_list)

# 包装函数：从 state 中提取 llm_response 给 ToolNode，将工具结果存入 tool_results
async def wrapped_tool_node(state: AgentState) -> AgentState:
    """执行工具调用，将结果存入 tool_results 供 answer_node 流式生成时使用"""
    llm_response = state.get("llm_response")
    if llm_response is None:
        print("⚠️ [DEBUG] wrapped_tool_node: 没有找到 llm_response")
        return state

    # 将单个 AIMessage 包装成列表（ToolNode 要求的格式）
    messages_to_pass = [llm_response] if not isinstance(llm_response, list) else llm_response
    print(f"🔍 [DEBUG] 传递给 ToolNode 的消息数量：{len(messages_to_pass)}")

    # 调用 ToolNode
    result = await tool_node.ainvoke(messages_to_pass)

    # 将工具执行结果转为消息列表，存入 tool_results
    tool_results = []

    # ToolNode 可能返回 list 或 dict，做兼容处理
    items = result
    if isinstance(result, dict):
        items = result.get("messages", [])
    elif not isinstance(result, list):
        items = [result]

    for msg in items:
        content = msg.content if hasattr(msg, "content") else str(msg)
        tool_results.append({"role": "tool", "content": content})

    state["tool_results"] = tool_results
    print(f"🔍 [DEBUG] 工具执行完成，结果数量：{len(tool_results)}")
    return state

# 创建图
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("decision", decision_node)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("answer", answer_node)
workflow.add_node("tools", wrapped_tool_node)

# 设置入口
workflow.set_entry_point("decision")

# 条件边：根据决策结果路由
def route_after_decision(state: AgentState) -> str:
    next_action = state.get("next_action", "direct")
    print(f"🔍 [DEBUG] route_after_decision 收到 next_action：{next_action}")

    if next_action == "retrieve":
        print("🔍 [DEBUG] 路由到 retrieve")
        return "retrieve"
    elif next_action == "tool":
        print("🔍 [DEBUG] 路由到 tools")
        return "tools"
    else:
        print("🔍 [DEBUG] 路由到 answer")
        return "answer"

workflow.add_conditional_edges(
    "decision",
    route_after_decision,
    {
        "retrieve": "retrieve",
        "tools": "tools",
        "answer": "answer"
    }
)

# 检索后进入流式回答
workflow.add_edge("retrieve", "answer")
# 工具执行后进入流式回答
workflow.add_edge("tools", "answer")
# 回答后结束
workflow.add_edge("answer", END)

# 编译
agent_graph = workflow.compile()
