import os
import tempfile
from fastapi import APIRouter, HTTPException, UploadFile, File
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.models.schemas import DocumentUploadResponse
from app.core.database import get_vector_store, COLLECTION_NAME
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        if ext == ".pdf":
            loader = PyPDFLoader(tmp_path)
        else:
            loader = TextLoader(tmp_path, encoding="utf-8")

        docs = loader.load()

        # Tag each doc with original filename
        for doc in docs:
            doc.metadata["source"] = file.filename

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
        )
        chunks = splitter.split_documents(docs)

        vector_store = get_vector_store()
        vector_store.add_documents(chunks)

        return DocumentUploadResponse(
            message=f"Successfully uploaded and indexed '{file.filename}'",
            document_count=len(chunks),
            collection=COLLECTION_NAME,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)


@router.get("/list")
async def list_documents():
    try:
        vector_store = get_vector_store()
        # Query a large number to get all unique sources
        results = vector_store.similarity_search(".", k=1000)
        sources = {}
        for doc in results:
            src = doc.metadata.get("source", "unknown")
            sources[src] = sources.get(src, 0) + 1
        return {
            "documents": [
                {"source": src, "chunk_count": count}
                for src, count in sources.items()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{source_name}")
async def delete_document(source_name: str):
    try:
        vector_store = get_vector_store()
        # Get all docs matching the source
        results = vector_store.similarity_search(".", k=1000)
        ids_to_delete = [
            doc.metadata.get("id") or doc.id
            for doc in results
            if doc.metadata.get("source") == source_name and hasattr(doc, "id")
        ]
        if ids_to_delete:
            vector_store.delete(ids_to_delete)
        return {"message": f"Deleted documents from source '{source_name}'"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
