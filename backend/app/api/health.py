from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.core.database import get_vector_store, get_checkpointer

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/", response_model=HealthResponse)
async def health_check():
    vector_status = "ok"
    checkpointer_status = "ok"

    try:
        get_vector_store()
    except Exception as e:
        vector_status = f"error: {str(e)}"

    try:
        get_checkpointer()
    except Exception as e:
        checkpointer_status = f"error: {str(e)}"

    overall = "healthy" if vector_status == "ok" and checkpointer_status == "ok" else "degraded"
    return HealthResponse(
        status=overall,
        vector_store=vector_status,
        checkpointer=checkpointer_status,
    )
