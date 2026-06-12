from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import select
Base = declarative_base()
from app.core.config import DATABASE_URL
from app.models import Session, Message, Document
from pgvector.sqlalchemy import Vector# type: ignore
from sqlalchemy import select
from app.models.document import Document

async def search_documents(query_embedding: list, limit: int = 3):
    """向量相似度检索"""
    async with AsyncSessionLocal() as db: # type: ignore
        stmt = select(Document).order_by(
            Document.embedding.cosine_distance(query_embedding)
        ).limit(limit)
        result = await db.execute(stmt)
        docs = result.scalars().all()
        return [doc.content for doc in docs]
# 将 postgresql:// 替换为 postgresql+asyncpg:// 以支持异步
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://") # type: ignore

# 创建异步引擎
engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)

# 创建异步会话工厂
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False) # type: ignore


# 获取或创建会话记录
async def get_or_create_session(session_id: str):
    async with AsyncSessionLocal() as db: # type: ignore
        # 查询是否存在
        stmt = select(Session).where(Session.session_id == session_id)
        result = await db.execute(stmt)
        existing_session = result.scalar_one_or_none()
        
        # 如果不存在，创建新的
        if not existing_session:
            new_session = Session(session_id=session_id)
            db.add(new_session)
            await db.commit()
            # 重新查询一次，返回带完整信息的对象
            return new_session
        return existing_session

# 保存消息
async def save_message(session_id: str, role: str, content: str):
    async with AsyncSessionLocal() as db: # type: ignore
        message = Message(session_id=session_id, role=role, content=content)
        db.add(message)
        await db.commit()

# 获取聊天历史
async def get_chat_history(session_id: str, limit: int = 10):
    async with AsyncSessionLocal() as db: # type: ignore
        stmt = select(Message).where(Message.session_id == session_id).order_by(Message.created_at.asc()).limit(limit)
        result = await db.execute(stmt)
        messages = result.scalars().all()
        return [{"role": m.role, "content": m.content} for m in messages]