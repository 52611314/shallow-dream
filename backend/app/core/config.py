import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

# 定义环境变量（你只需要把等号右边补全）
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")   # 填：.env 文件里变量名
DATABASE_URL = os.getenv("DATABASE_URL")        # 填：同上