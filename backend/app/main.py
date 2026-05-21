from fastapi import FastAPI

app=FastAPI(title="Shallow dream")

@app.get("/")
def root():
    return {"message": "Hello from Shallow Dream"}

@app.get("/health")
def health():
    return {"status": "ok"}