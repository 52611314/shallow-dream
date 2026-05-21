from fastapi import FastAPI
from pydantic import BaseModel

import httpx
from app.core.config import DEEPSEEK_API_KEY

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

app=FastAPI(title="Shallow dream")

@app.get("/")
def root():
    return {"message": "Hello from Shallow Dream"}

@app.get("/health")
def health():
    return {"status": "ok"}
@app.post("/chat")
async def chat(req: ChatRequest):
    request_body = {
        "model": "deepseek-v4-flash", 
        "messages": [
            {"role": "user", "content": req.message}
        ],
        "stream": False
    }
    
    # 2. 使用 try...except 包裹可能出错的网络请求代码
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=request_body,
                timeout=15.0 
            )
            # 处理响应（状态码非200的情况也在这里处理）
            if response.status_code == 200:
                data = response.json()
                reply = data["choices"][0]["message"]["content"]
                return ChatResponse(reply=reply)
            else:
                # 记录日志（后面可以加上），给用户一个通用提示
                return ChatResponse(reply="抱歉，AI 服务暂时响应异常，请稍后再试。")
    
    # 4. 捕获网络错误（如超时、连接失败）
    except httpx.TimeoutException:
        return ChatResponse(reply="请求超时，AI 服务响应过慢，请稍后再试。")
    except httpx.RequestError as e:
        # 捕获其他网络请求错误（如DNS解析失败、连接拒绝等）
        return ChatResponse(reply=f"网络请求失败: {str(e)}")
    except Exception as e:
        # 捕获任何其他意料之外的错误，防止程序崩溃
        return ChatResponse(reply="服务器内部错误，请联系管理员。")