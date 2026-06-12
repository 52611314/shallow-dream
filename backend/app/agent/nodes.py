# backend/app/agent/nodes.py
import os
from langchain_openai import ChatOpenAI # type: ignore
from langchain_core.tools import tool# type: ignore
from app.core.config import DEEPSEEK_API_KEY
from app.core.database import search_documents
from sentence_transformers import SentenceTransformer# type: ignore
from app.agent.state import AgentState
from app.prompts import load_prompt
from app.agent.tools import (
    save_idea,
    get_word_count,
    generate_outline,
    continue_writing,
    polish_text,
    search_materials,
    extract_characters,
    check_grammar
)
from pathlib import Path

# 初始化 embedding 模型（用于 RAG 检索）
local_model_path = Path("D:/myagent/shallow-dream/backend/model/all-MiniLM-L6-v2")
embedding_model = SentenceTransformer(str(local_model_path))

# ============================================================
# 将普通工具函数转换为 LangChain Tool 对象
# ============================================================
@tool
async def save_idea_tool(session_id: str, idea_content: str) -> str:
    """将用户的灵感或想法保存到数据库中"""
    return await save_idea(session_id, idea_content)

@tool
async def get_word_count_tool(text: str) -> dict:
    """统计给定文本的字数、中文字符数和段落数"""
    return await get_word_count(text)

@tool
async def generate_outline_tool(topic: str, num_sections: int = 5, sub_points_per_section: int = 2, extra_requirements: str = "") -> str:
    """根据主题生成大纲，支持自定义章节数和子要点数"""
    return await generate_outline(topic, num_sections, sub_points_per_section, extra_requirements)

@tool
async def continue_writing_tool(context: str, direction: str = "auto", length: str = "200-300字", style: str = "", extra_requirements: str = "") -> str:
    """续写，支持自定义长度、风格和其他要求"""
    return await continue_writing(context, direction, length, style, extra_requirements)

@tool
async def polish_text_tool(text: str, requirements: str = "使表达更流畅、专业") -> str:
    """对给定文本进行润色"""
    return await polish_text(text, requirements)

@tool
async def search_materials_tool(query: str, max_results: int = 5) -> str:
    """联网搜索，获取实时信息"""
    return await search_materials(query, max_results)

@tool
async def extract_characters_tool(text: str) -> str:
    """从文本中提取人物信息"""
    return await extract_characters(text)

@tool
async def check_grammar_tool(text: str) -> str:
    """检查文本的语法和拼写问题"""
    return await check_grammar(text)

# 工具列表
tools_list = [
    save_idea_tool,
    get_word_count_tool,
    generate_outline_tool,
    continue_writing_tool,
    polish_text_tool,
    search_materials_tool,
    extract_characters_tool,
    check_grammar_tool
]

# 创建可以调用工具的 LLM（用于决策节点）
llm_with_tools = ChatOpenAI(
    base_url="https://api.deepseek.com/v1",
    api_key=DEEPSEEK_API_KEY,
    model="deepseek-v4-flash",
    temperature=0,
    timeout=15
).bind_tools(tools_list)

# 普通 LLM（用于回答节点，不绑定工具）
llm = ChatOpenAI(
    base_url="https://api.deepseek.com/v1",
    api_key=DEEPSEEK_API_KEY,
    model="deepseek-v4-flash",
    temperature=0.7,
    timeout=15
)

# ============================================================
# 决策节点（绑定工具，返回带 tool_calls 的响应）
# ============================================================
async def decision_node(state: AgentState) -> AgentState:
    """调用绑定了工具的 LLM，判断是否需要检索或调用工具"""

    # 1. 构建完整的消息历史（系统提示 + 历史对话 + 当前消息）
    messages = []

    # 添加系统提示（让 LLM 知道它可以调用工具）
    messages.append({
        "role": "system",
        "content": "你是一个有用的助手。你可以调用以下工具：获取实时日期、联网搜索、生成大纲、续写、润色、统计字数、保存灵感、提取人物、语法检查。当用户需要实时信息或特定操作时，请调用对应的工具。"
    })

    # 添加历史对话（state["messages"] 已经是 [{"role": "...", "content": "..."}] 格式）
    messages.extend(state.get("messages", []))

    # 添加当前用户消息
    messages.append({"role": "user", "content": state["user_input"]})

    # 2. 调用绑定了工具的 LLM
    response = await llm_with_tools.ainvoke(messages)

    # 3. 存储 LLM 响应
    state["llm_response"] = response

    # 4. 判断是否有工具调用
    if hasattr(response, "tool_calls") and response.tool_calls:
        print(f"🔍 [DEBUG] 检测到工具调用：{response.tool_calls}")
        state["next_action"] = "tool"
    else:
        # 无工具调用 → 进入 answer_node 进行流式回复
        print(f"🔍 [DEBUG] 无工具调用，进入流式回答节点...")
        state["next_action"] = "direct"

    return state

# ============================================================
# 检索节点（可选，RAG 也可以作为工具）
# ============================================================
async def retrieve_node(state: AgentState) -> AgentState:
    """从知识库检索相关文档"""
    query_embedding = embedding_model.encode(state["user_input"]).tolist()
    docs = await search_documents(query_embedding, limit=3)
    state["retrieved_docs"] = docs
    return state

# ============================================================
# 回答节点（流式生成）
# ============================================================
async def answer_node(state: AgentState) -> AgentState:
    """流式生成最终回复，通过 output_queue 逐个传出 token"""

    queue = state.get("output_queue")

    # 构建消息列表
    messages = []

    # 系统提示
    if state.get("retrieved_docs"):
        # 有 RAG 检索结果
        context = "\n\n".join(state["retrieved_docs"])
        prompt_template = load_prompt("answer_rag")
        system_content = prompt_template.format(context=context)
    elif state.get("tool_results"):
        # 有工具执行结果
        tool_context = "\n\n".join([
            f"工具返回：{tr['content']}" for tr in state["tool_results"]
        ])
        system_content = (
            "你是一个有用的写作助手。以下是工具执行的结果，"
            "请根据这些结果生成一个完整、友好的回复给用户。\n\n"
            f"{tool_context}"
        )
    else:
        system_content = "你是一个有用的写作助手，请以流畅自然的方式回复用户。"

    messages.append({"role": "system", "content": system_content})

    # 添加历史对话
    messages.extend(state.get("messages", []))

    # 添加当前用户消息
    messages.append({"role": "user", "content": state["user_input"]})

    # 流式调用 LLM
    full_response = ""
    try:
        async for chunk in llm.astream(messages):
            if chunk.content:
                token = chunk.content
                full_response += token
                if queue:
                    await queue.put(token)
    except Exception as e:
        error_msg = f"生成回复时出错：{str(e)}"
        print(f"❌ [ERROR] answer_node: {error_msg}")
        if queue:
            await queue.put(error_msg)
        full_response = error_msg

    # 发送结束信号
    if queue:
        await queue.put(None)

    state["final_answer"] = full_response
    print(f"✅ [DEBUG] answer_node 完成，回复长度：{len(full_response)} 字符")
    return state
