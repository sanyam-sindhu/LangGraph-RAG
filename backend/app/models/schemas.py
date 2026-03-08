from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    thread_id: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    thread_id: str
    sources: list[dict]


class DocumentUploadResponse(BaseModel):
    message: str
    document_count: int
    collection: str


class ThreadListItem(BaseModel):
    thread_id: str
    created_at: Optional[str] = None
    message_count: int = 0


class HealthResponse(BaseModel):
    status: str
    vector_store: str
    checkpointer: str
