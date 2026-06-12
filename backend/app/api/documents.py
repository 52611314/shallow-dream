from fastapi import APIRouter, UploadFile, File, HTTPException
from sentence_transformers import SentenceTransformer# type: ignore
import asyncio
import tempfile
import os
from app.core.database import AsyncSessionLocal
from app.models.document import Document

router = APIRouter(prefix="/documents", tags=["documents"])

from pathlib import Path
local_model_path = Path("D:/myagent/shallow-dream/backend/model/all-MiniLM-L6-v2")
embedding_model = SentenceTransformer(str(local_model_path))

def chunk_text(text: str, chunk_size: int = 500):
    """复用之前的切分逻辑"""
    import re
    paragraphs = re.split(r'\n\s*\n', text)
    chunks = []
    current_chunk = []
    current_len = 0
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        para_len = len(para)
        if current_len + para_len > chunk_size and current_chunk:
            chunks.append('\n\n'.join(current_chunk))
            current_chunk = [para]
            current_len = para_len
        else:
            current_chunk.append(para)
            current_len += para_len
    
    if current_chunk:
        chunks.append('\n\n'.join(current_chunk))
    return chunks

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """上传文档文件并导入到知识库"""
    # 检查文件类型
    if not file.filename.endswith(('.txt', '.md', '.rst')):# type: ignore
        raise HTTPException(status_code=400, detail="只支持 .txt, .md, .rst 文件")
    
    try:
        # 保存临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix='.txt') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # 读取内容
        with open(tmp_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # 清理临时文件
        os.unlink(tmp_path)
        
        # 切分文档
        chunks = chunk_text(text)
        if not chunks:
            raise HTTPException(status_code=400, detail="文件内容为空")
        
        # 生成向量（异步）
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(None, embedding_model.encode, chunks)
        
        # 存入数据库
        async with AsyncSessionLocal() as db:# type: ignore
            for chunk, emb in zip(chunks, embeddings):
                doc = Document(
                    content=chunk,
                    embedding=emb.tolist(),
                    extra_metadata={"source": file.filename}
                )
                db.add(doc)
            await db.commit()
        
        return {"message": f"成功导入 {len(chunks)} 个文档片段", "chunks": len(chunks)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")

@router.get("/list")
async def list_documents():
    """列出所有已导入的文档（按来源分组）"""
    async with AsyncSessionLocal() as db:# type: ignore
        from sqlalchemy import select, func, distinct
        # 查询所有不同的来源
        stmt = select(distinct(Document.extra_metadata['source']).label('source'))
        result = await db.execute(stmt)
        sources = [row[0] for row in result.all() if row[0]]
        
        # 统计每个来源的片段数
        docs = []
        for source in sources:
            count_stmt = select(func.count()).where(Document.extra_metadata['source'].astext == source)
            count = await db.execute(count_stmt)
            docs.append({"source": source, "chunks": count.scalar()})
        
        return {"documents": docs}

@router.delete("/clear")
async def clear_documents():
    """清空所有文档（慎用）"""
    async with AsyncSessionLocal() as db: # type: ignore
        from sqlalchemy import delete
        stmt = delete(Document)
        await db.execute(stmt)
        await db.commit()
    return {"message": "已清空所有文档"}