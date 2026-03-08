from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage
from app.models.schemas import ChatRequest, ChatResponse
from app.graph.rag_graph import build_rag_graph
from app.core.database import get_checkpointer

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        checkpointer = get_checkpointer()
        graph = build_rag_graph(checkpointer=checkpointer)

        config = {"configurable": {"thread_id": request.thread_id}}
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "context": [],
            "question": request.message,
        }

        result = graph.invoke(initial_state, config=config)

        answer = result["messages"][-1].content
        sources = result.get("context", [])

        return ChatResponse(
            answer=answer,
            thread_id=request.thread_id,
            sources=sources,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{thread_id}")
async def get_history(thread_id: str):
    try:
        checkpointer = get_checkpointer()
        graph = build_rag_graph(checkpointer=checkpointer)
        config = {"configurable": {"thread_id": thread_id}}
        state = graph.get_state(config)

        if not state or not state.values:
            return {"thread_id": thread_id, "messages": []}

        messages = []
        for msg in state.values.get("messages", []):
            messages.append({
                "role": "human" if msg.__class__.__name__ == "HumanMessage" else "assistant",
                "content": msg.content,
            })

        return {"thread_id": thread_id, "messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history/{thread_id}")
async def clear_history(thread_id: str):
    try:
        checkpointer = get_checkpointer()
        # Delete all checkpoints for this thread
        with checkpointer.conn.cursor() as cur:
            cur.execute(
                "DELETE FROM checkpoints WHERE thread_id = %s",
                (thread_id,)
            )
            cur.execute(
                "DELETE FROM checkpoint_writes WHERE thread_id = %s",
                (thread_id,)
            )
        return {"message": f"History cleared for thread {thread_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
