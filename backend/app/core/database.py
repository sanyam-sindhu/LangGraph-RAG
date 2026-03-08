import psycopg
from langchain_postgres import PGVector
from langchain_huggingface import HuggingFaceEmbeddings
from langgraph.checkpoint.postgres import PostgresSaver
from app.core.config import settings

COLLECTION_NAME = "rag_documents"


def get_connection_string() -> str:
    return (
        f"host={settings.postgres_host} "
        f"port={settings.postgres_port} "
        f"dbname={settings.postgres_db} "
        f"user={settings.postgres_user} "
        f"password={settings.postgres_password}"
    )


def get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(model_name=settings.embedding_model)


def get_vector_store() -> PGVector:
    return PGVector(
        embeddings=get_embeddings(),
        collection_name=COLLECTION_NAME,
        connection=settings.postgres_url,
        use_jsonb=True,
    )


def get_checkpointer() -> PostgresSaver:
    conn = psycopg.connect(get_connection_string(), autocommit=True)
    checkpointer = PostgresSaver(conn)
    checkpointer.setup()
    return checkpointer
