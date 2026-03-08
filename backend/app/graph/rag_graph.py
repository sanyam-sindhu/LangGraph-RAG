from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from app.graph.state import RAGState
from app.core.config import settings
from app.core.database import get_vector_store, get_checkpointer

SYSTEM_PROMPT = """You are a helpful AI assistant that answers questions based on the provided context documents.
Use the context to answer the user's question accurately and concisely.
If the context doesn't contain enough information to answer the question, say so clearly.
Always cite which document or source your answer comes from when possible."""

DIRECT_SYSTEM_PROMPT = """You are a helpful AI assistant. Answer the user's question to the best of your ability."""


def get_history_with_summary(state: RAGState, llm: ChatGroq) -> list:
    """Return recent messages. If older messages were trimmed, prepend a summary of them."""
    history = list(state["messages"][:-1])
    if len(history) <= settings.max_history_messages:
        return history

    old_messages = history[:-settings.max_history_messages]
    recent_messages = history[-settings.max_history_messages:]

    conversation_text = "\n".join(
        f"{'User' if isinstance(m, HumanMessage) else 'Assistant'}: {m.content}"
        for m in old_messages
    )
    summary_response = llm.invoke([
        SystemMessage(content="Summarize the following conversation concisely, preserving all key facts, names, and important context mentioned by the user."),
        HumanMessage(content=conversation_text),
    ])

    return [SystemMessage(content=f"[Summary of earlier conversation]: {summary_response.content}")] + recent_messages


def retrieve(state: RAGState) -> RAGState:
    question = state["messages"][-1].content
    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(
        search_kwargs={"k": settings.retriever_k}
    )
    docs = retriever.invoke(question)
    context = [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("source", "unknown"),
            "page": doc.metadata.get("page", 0),
        }
        for doc in docs
    ]
    return {"context": context, "question": question}


def generate(state: RAGState) -> RAGState:
    llm = ChatGroq(
        model=settings.groq_model,
        groq_api_key=settings.groq_api_key,
        temperature=0.1,
    )

    context_text = "\n\n".join(
        f"[Source: {c['source']}, Page: {c['page']}]\n{c['content']}"
        for c in state.get("context", [])
    )

    messages = [SystemMessage(content=SYSTEM_PROMPT)]

    for msg in get_history_with_summary(state, llm):
        messages.append(msg)

    # Add context + current question
    user_message = f"""Context Documents:
{context_text}

Question: {state['question']}

Please answer based on the context above."""
    messages.append(HumanMessage(content=user_message))

    response = llm.invoke(messages)
    return {"messages": [AIMessage(content=response.content)]}


def direct_generate(state: RAGState) -> RAGState:
    llm = ChatGroq(
        model=settings.groq_model,
        groq_api_key=settings.groq_api_key,
        temperature=0.1,
    )

    messages = [SystemMessage(content=DIRECT_SYSTEM_PROMPT)]

    for msg in get_history_with_summary(state, llm):
        messages.append(msg)

    messages.append(HumanMessage(content=state["question"]))

    response = llm.invoke(messages)
    return {"messages": [AIMessage(content=response.content)]}


def route_after_retrieve(state: RAGState) -> str:
    if not state.get("context"):
        return "direct_generate"
    return "generate"


def build_rag_graph(checkpointer=None):
    graph = StateGraph(RAGState)
    graph.add_node("retrieve", retrieve)
    graph.add_node("generate", generate)
    graph.add_node("direct_generate", direct_generate)
    graph.set_entry_point("retrieve")
    graph.add_conditional_edges("retrieve", route_after_retrieve, {
        "generate": "generate",
        "direct_generate": "direct_generate",
    })
    graph.add_edge("generate", END)
    graph.add_edge("direct_generate", END)
    return graph.compile(checkpointer=checkpointer)
