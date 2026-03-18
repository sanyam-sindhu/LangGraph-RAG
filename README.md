# LangGraph RAG

A RAG (Retrieval-Augmented Generation) chatbot that lets you upload documents and ask questions about them. Built with LangGraph for the agent logic, FastAPI for the backend, and Vue for the frontend. Uses PostgreSQL with pgvector for storing document embeddings and conversation history.

Traces every LLM call and retrieval step in Langfuse so you can monitor quality over time.

## What it does

- Upload PDFs, text files, or markdown files
- Ask questions and get answers grounded in your documents
- Remembers conversation history per thread
- Shows which document each answer came from
- Automatically evaluates responses for hallucinations using LLM-as-a-judge

## Stack

- **LangGraph** — agent graph (retrieve → generate)
- **Groq** — LLM inference (llama-3.1-8b-instant)
- **PostgreSQL + pgvector** — vector store and checkpointing
- **sentence-transformers** — local embeddings (no API key needed)
- **FastAPI** — REST API
- **Vue + Vite** — frontend
- **Langfuse** — observability and LLM evaluation

## Getting started

You need Docker Desktop installed.

**1. Clone and configure**

```bash
git clone https://github.com/sanyam-sindhu/LangGraph-RAG.git
cd LangGraph-RAG
```

Copy the example env file and fill in your Groq API key:

```bash
cp backend/.env.example backend/.env
```

```
GROQ_API_KEY=your_key_here
```

Get a free Groq key at https://console.groq.com

**2. Start everything**

```bash
docker compose up postgres langfuse-db clickhouse redis minio minio-init -d
docker compose up langfuse-server langfuse-worker -d
```

Then start the backend and frontend locally:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

cd frontend
npm install
npm run dev
```

**3. Open the apps**

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API docs | http://localhost:8000/docs |
| Langfuse | http://localhost:3001 |

Langfuse default login: `admin@local.dev` / `Admin1234!`

## Usage

1. Go to http://localhost:5173
2. Upload a PDF using the upload button
3. Start chatting — the bot will answer based on your document
4. Open Langfuse to see traces, token usage, and hallucination scores

## Project structure

```
backend/
  app/
    api/          — chat and document endpoints
    core/         — config, database, langfuse client
    graph/        — LangGraph nodes (retrieve, generate)
    models/       — request/response schemas
frontend/         — Vue app
docker-compose.yml
```

## Notes

- Embeddings run locally using sentence-transformers, no API key needed
- Conversation history is persisted in PostgreSQL per thread ID
- If you restart Docker and lose data, just re-upload your documents
- Langfuse project is auto-created on first start with the keys in docker-compose.yml
