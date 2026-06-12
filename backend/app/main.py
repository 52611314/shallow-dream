from fastapi import FastAPI
from app.core.config import DEEPSEEK_API_KEY
# 先导入数据库相关
from app.core.database import engine, Base

# 再导入模型（确保 Base 已定义）
from app.models import session, document

# 其他导入...
from contextlib import asynccontextmanager
from sentence_transformers import SentenceTransformer # type: ignore
from app.core.database import search_documents
from app.api import chat, documents  # 导入路由模块
# 创建所有表（第一次运行时）
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 这里写启动时要做的事（相当于之前的 startup）
    print("🚀 应用启动，初始化数据库...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # 这里写关闭时要做的事（相当于之前的 shutdown）
    print("🛑 应用关闭，清理资源...")
    # 如果将来有数据库连接池需要关闭，可以在这里做
    await engine.dispose()
app = FastAPI(title="Shallow dream", lifespan=lifespan)
# 注册路由
app.include_router(chat.router)
app.include_router(documents.router)
@app.get("/")
def root():
    return {"message": "Hello from Shallow Dream"}

@app.get("/health")
def health():
    return {"status": "ok"}

