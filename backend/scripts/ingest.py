import asyncio
import re
from sentence_transformers import SentenceTransformer # type: ignore
from app.core.database import AsyncSessionLocal
from app.models.document import Document
from sqlalchemy import select

# 初始化模型（下载一次，后续使用缓存）
model = SentenceTransformer('all-MiniLM-L6-v2')

import re

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    """
    按段落和句子边界切分，保持语义完整
    - chunk_size: 目标字符数
    - overlap: 重叠字符数（保留上下文）
    """
    # 1. 先按段落切分
    paragraphs = re.split(r'\n\s*\n', text)
    
    chunks = []
    current_chunk = []
    current_len = 0
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        para_len = len(para)
        
        # 如果单个段落已经超过 chunk_size，按句子再切
        if para_len > chunk_size:
            # 按句子分割
            sentences = re.split(r'(?<=[。！？.!?])\s+', para)
            for sent in sentences:
                sent_len = len(sent)
                if current_len + sent_len > chunk_size and current_chunk:
                    # 保存当前块
                    chunks.append('\n\n'.join(current_chunk))
                    # 重叠：保留最后一句话
                    overlap_text = current_chunk[-1] if current_chunk else ''
                    current_chunk = [overlap_text] if overlap_text else []
                    current_len = len(overlap_text)
                current_chunk.append(sent)
                current_len += sent_len
        else:
            # 正常段落
            if current_len + para_len > chunk_size and current_chunk:
                chunks.append('\n\n'.join(current_chunk))
                # 重叠：保留当前段落的前 overlap 个字符
                if overlap > 0 and current_chunk:
                    overlap_text = current_chunk[-1][-overlap:] if current_chunk else ''
                    current_chunk = [overlap_text] if overlap_text else []
                    current_len = len(overlap_text)
            current_chunk.append(para)
            current_len += para_len
    
    if current_chunk:
        chunks.append('\n\n'.join(current_chunk))
    
    return chunks

async def ingest_file(file_path: str, source_name: str):
    """导入单个文件（异步版本）"""
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    chunks = chunk_text(text)
    print(f"切分成 {len(chunks)} 个片段")
    
    # 异步生成向量（放到线程池）
    loop = asyncio.get_event_loop()
    embeddings = await loop.run_in_executor(None, model.encode, chunks)
    
    async with AsyncSessionLocal() as db: # type: ignore
        for chunk, emb in zip(chunks, embeddings):
            doc = Document(
                content=chunk,
                embedding=emb.tolist(),
                extra_metadata={"source": source_name}
            )
            db.add(doc)
        await db.commit()
    
    print(f"已导入 {source_name}，共 {len(chunks)} 条记录")
async def main():
    # 清空旧数据（可选）
    async with AsyncSessionLocal() as db: # type: ignore
        await db.execute(select(Document).delete())  # type: ignore # 谨慎使用，会删光所有文档
        await db.commit()
    
    # 导入你的笔记文件
    await ingest_file("path/to/your/notes.txt", "我的课程笔记")

if __name__ == "__main__":
    asyncio.run(main())