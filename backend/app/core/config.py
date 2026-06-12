import os
from dotenv import load_dotenv

load_dotenv()  # 加载 .env 文件

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")