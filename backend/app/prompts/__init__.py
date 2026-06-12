from pathlib import Path

PROMPT_DIR = Path(__file__).parent

def load_prompt(name: str) -> str:
    """加载指定名称的提示词模板"""
    file_path = PROMPT_DIR / f"{name}.txt"
    if file_path.exists():
        return file_path.read_text(encoding="utf-8")
    return ""