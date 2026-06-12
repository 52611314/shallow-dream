# backend/app/agent/tools.py
import re
from langchain_openai import ChatOpenAI # type: ignore
from app.core.config import DEEPSEEK_API_KEY
from app.core.database import AsyncSessionLocal
from app.models.idea import Idea
from app.prompts import load_prompt# type: ignore
from tavily import TavilyClient # type: ignore
from app.core.config import TAVILY_API_KEY

_tavily_client = None

def get_tavily_client():
    global _tavily_client
    if _tavily_client is None:
        _tavily_client = TavilyClient(api_key=TAVILY_API_KEY)
    return _tavily_client
# 初始化 LLM
_llm = ChatOpenAI(
    base_url="https://api.deepseek.com/v1",
    api_key=DEEPSEEK_API_KEY,
    model="deepseek-v4-flash",
    temperature=0.7
)

# ============================================================
# 工具1：保存灵感
# ============================================================
async def save_idea(session_id: str, idea_content: str) -> str:
    """将用户的灵感或想法保存到数据库中"""
    if not idea_content or not idea_content.strip():
        return "想法内容为空，无法保存。"
    try:
        async with AsyncSessionLocal() as db:# type: ignore
            new_idea = Idea(session_id=session_id, content=idea_content.strip())
            db.add(new_idea)
            await db.commit()
        preview = idea_content[:50] + "..." if len(idea_content) > 50 else idea_content
        return f"✅ 成功保存灵感：「{preview}」"
    except Exception as e:
        return f"❌ 保存灵感失败：{str(e)}"

# ============================================================
# 工具2：统计字数
# ============================================================
async def get_word_count(text: str) -> dict:
    """统计给定文本的字数、中文字符数和段落数"""
    if not text:
        return {"word_count": 0, "chinese_char_count": 0, "paragraph_count": 0}
    
    # 字数：按空白字符分割后计数
    word_count = len(text.split())
    
    # 中文字符数：使用正则匹配
    chinese_char_count = len(re.findall(r'[\u4e00-\u9fff]', text))
    
    # 段落数：按连续两个换行符分割，过滤空串
    paragraphs = [p for p in text.split('\n\n') if p.strip()]
    paragraph_count = len(paragraphs)
    
    return {
        "word_count": word_count,
        "chinese_char_count": chinese_char_count,
        "paragraph_count": paragraph_count
    }

# ============================================================
# 工具3：生成大纲（支持自定义）
# ============================================================
async def generate_outline(
    topic: str,
    num_sections: int = 5,
    sub_points_per_section: int = 2,
    extra_requirements: str = ""
) -> str:
    """根据主题生成大纲，支持自定义章节数和子要点数"""
    prompt_template = load_prompt("generate_outline")
    prompt = prompt_template.format(
        topic=topic,
        num_sections=num_sections,
        sub_points_per_section=sub_points_per_section,
        extra_requirements=extra_requirements
    )
    
    try:
        response = await _llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        return f"生成大纲失败：{str(e)}"

# ============================================================
# 工具4：续写（支持自定义）
# ============================================================
async def continue_writing(
    context: str,
    direction: str = "auto",
    length: str = "200-300字",
    style: str = "",
    extra_requirements: str = ""
) -> str:
    """续写，支持自定义长度、风格和其他要求"""
    # 构建完整的方向描述
    full_direction = direction
    if style:
        full_direction += f"，风格要求：{style}"
    if length:
        full_direction += f"，长度要求：{length}"
    
    prompt_template = load_prompt("continue_writing")
    prompt = prompt_template.format(
        context=context,
        direction=full_direction,
        extra_requirements=extra_requirements
    )
    
    try:
        response = await _llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        return f"续写失败：{str(e)}"
# ============================================================
# 工具5：润色文本 (P1)
# ============================================================
async def polish_text(text: str, requirements: str = "使表达更流畅、专业") -> str:
    """对给定文本进行润色"""
    prompt_template = load_prompt("polish_text")
    prompt = prompt_template.format(text=text, requirements=requirements)
    
    try:
        response = await _llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        return f"润色失败：{str(e)}"

# ============================================================
# 工具6：联网搜集素材 (P1) - 使用 Tavily API
# ============================================================
async def search_materials(
    query: str,
    max_results: int = 3,
    include_domains: list = None, # type: ignore
    exclude_domains: list = None # type: ignore
) -> str:
    """联网搜索，并让 LLM 提炼关键信息"""
    client = get_tavily_client() # type: ignore
    print(f"🔍 [DEBUG] 调用 search_materials，查询：{query}")
    
    response = client.search(
        query=query,
        max_results=max_results,
        search_depth="advanced",
        include_domains=include_domains,
        exclude_domains=exclude_domains,
        include_answer=True
    )
    
    # 格式化原始结果
    raw_results = []
    if response.get("answer"):
        raw_results.append(f"AI 摘要：{response['answer']}")
    
    for result in response.get("results", []):
        raw_results.append(
            f"标题：{result['title']}\n"
            f"内容：{result['content'][:500]}"
        )
    
    raw_context = "\n---\n".join(raw_results)
    
    # 使用 LLM 提炼关键信息
    prompt_template = load_prompt("search_materials")
    refine_prompt = prompt_template.format(query=query, raw_context=raw_context)
    
    refined_response = await _llm.ainvoke(refine_prompt)
    return refined_response.content
# ============================================================
# 工具7：提取人物设定 (P2)
# ============================================================
async def extract_characters(text: str) -> str:
    """从文本中提取人物信息"""
    prompt_template = load_prompt("extract_characters")
    prompt = prompt_template.format(text=text)
    
    try:
        response = await _llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        return f"提取人物失败：{str(e)}"

# ============================================================
# 工具8：语法检查 (P2)
# ============================================================
async def check_grammar(text: str) -> str:
    """检查文本的语法和拼写问题"""
    prompt_template = load_prompt("check_grammar")
    prompt = prompt_template.format(text=text)
    
    try:
        response = await _llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        return f"语法检查失败：{str(e)}"