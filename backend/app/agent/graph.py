# backend/app/agent/graph.py
from langgraph.graph import StateGraph, END # type: ignore
from langgraph.prebuilt import ToolNode # type: ignore
from app.agent.state import AgentState
from app.agent.nodes import decision_node, retrieve_node, answer_node, tools_list

# 创建 ToolNode
tool_node = ToolNode(tools_list)

# 包装函数：从 state 中提取 llm_response 给 ToolNode，再将结果存回 state
async def wrapped_tool_node(state: AgentState) -> AgentState:
    # 提取 LLM 响应
    llm_response = state.get("llm_response")
    if llm_response is None:
        print("⚠️ [DEBUG] wrapped_tool_node: 没有找到 llm_response")
        return state
    
    # 将单个 AIMessage 包装成列表（ToolNode 要求的格式）
    messages_to_pass = [llm_response] if not isinstance(llm_response, list) else llm_response
    print(f"🔍 [DEBUG] 传递给 ToolNode 的消息数量：{len(messages_to_pass)}")
    
    # 调用 ToolNode
    result = await tool_node.ainvoke(messages_to_pass)
    
    # 将工具执行结果存入 state
    if result and len(result) > 0:
        last_message = result[-1]
        if hasattr(last_message, "content"):
            state["final_answer"] = last_message.content
        else:
            state["final_answer"] = str(last_message)
    else:
        state["final_answer"] = "工具执行完成，但没有返回结果。"
    
    print(f"🔍 [DEBUG] 工具执行结果：{state['final_answer'][:100]}...")
    return state

# 创建图
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("decision", decision_node)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("answer", answer_node)
workflow.add_node("tools", wrapped_tool_node)  # 使用包装节点

# 设置入口
workflow.set_entry_point("decision")

# 条件边
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

# 检索后进入回答
workflow.add_edge("retrieve", "answer")
# 工具执行后进入回答
workflow.add_edge("tools", "answer")
# 回答后结束
workflow.add_edge("answer", END)

# 编译
agent_graph = workflow.compile()