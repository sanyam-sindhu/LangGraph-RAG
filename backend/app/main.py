from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import chat, documents

app = FastAPI(
    title="LangGraph RAG API",
    description="RAG system with LangGraph and PostgreSQL persistence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(documents.router)


@app.get("/")
async def root():
    return {"message": "LangGraph RAG API is running", "docs": "/docs"}
