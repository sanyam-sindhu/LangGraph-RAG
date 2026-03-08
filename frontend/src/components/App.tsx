import { Sidebar } from './Sidebar'
import { ChatWindow } from './ChatWindow'
import { DocumentPanel } from './DocumentPanel'
import { useChat } from '../hooks/useChat'
import { useDocuments } from '../hooks/useDocuments'

export function App() {
  const { threads, activeThreadId, messages, loading, send, selectThread, createThread, clearThread } =
    useChat()
  const { documents, uploading, uploadProgress, error, upload, remove, fetchDocuments } =
    useDocuments()

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Left: Conversation sidebar */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={selectThread}
        onCreateThread={createThread}
        onDeleteThread={clearThread}
      />

      {/* Center: Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow
          messages={messages}
          loading={loading}
          activeThreadId={activeThreadId}
          onSend={send}
        />
      </div>

      {/* Right: Documents */}
      <DocumentPanel
        documents={documents}
        uploading={uploading}
        uploadProgress={uploadProgress}
        error={error}
        onUpload={upload}
        onDelete={remove}
        onRefresh={fetchDocuments}
      />
    </div>
  )
}
