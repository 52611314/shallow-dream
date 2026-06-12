from sqlalchemy import Column, Integer, String, Text, JSON
from pgvector.sqlalchemy import Vector # type: ignore
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(384))
    extra_metadata = Column(JSON, default=dict)   # metadata → extra_metadata