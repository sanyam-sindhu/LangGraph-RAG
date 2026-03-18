import os
from app.core.config import settings

_configured = (
    settings.langfuse_secret_key
    and not settings.langfuse_secret_key.startswith("sk-lf-...")
)

if _configured:
    os.environ["LANGFUSE_SECRET_KEY"] = settings.langfuse_secret_key
    os.environ["LANGFUSE_PUBLIC_KEY"] = settings.langfuse_public_key
    os.environ["LANGFUSE_HOST"] = settings.langfuse_host

    from langfuse import Langfuse

    langfuse = Langfuse(
        secret_key=settings.langfuse_secret_key,
        public_key=settings.langfuse_public_key,
        host=settings.langfuse_host,
    )
else:
    langfuse = None


def get_langfuse_callback(session_id: str = None, user_id: str = None):
    """Return a LangChain CallbackHandler for the current request, or None."""
    if not _configured:
        return None

    from langfuse.langchain import CallbackHandler

    return CallbackHandler(
        public_key=settings.langfuse_public_key,
        trace_context={"session_id": session_id, "user_id": user_id},
    )
