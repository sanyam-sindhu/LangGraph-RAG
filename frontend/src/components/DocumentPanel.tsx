import { useRef } from 'react'
import { Upload, FileText, Trash2, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import type { Document } from '../types'

interface DocumentPanelProps {
  documents: Document[]
  uploading: boolean
  uploadProgress: string | null
  error: string | null
  onUpload: (file: File) => void
  onDelete: (source: string) => void
  onRefresh: () => void
}

const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'text/markdown']
const ALLOWED_EXT = ['.pdf', '.txt', '.md']

export function DocumentPanel({
  documents,
  uploading,
  uploadProgress,
  error,
  onUpload,
  onDelete,
  onRefresh,
}: DocumentPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onUpload(file)
  }

  return (
    <div className="w-72 shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-sm text-gray-700">Knowledge Base</h2>
        <button
          onClick={onRefresh}
          className="text-gray-400 hover:text-gray-700 transition"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Upload area */}
      <div className="p-4">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
            uploading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-brand-300 bg-brand-50 hover:bg-brand-100'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_EXT.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />
          {uploading ? (
            <Loader2 size={24} className="mx-auto text-brand-500 animate-spin mb-2" />
          ) : (
            <Upload size={24} className="mx-auto text-brand-500 mb-2" />
          )}
          <p className="text-xs font-medium text-brand-700">
            {uploading ? 'Uploading...' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, TXT, MD</p>
        </div>

        {/* Status */}
        {uploadProgress && (
          <div className="flex items-center gap-2 mt-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
            <CheckCircle size={13} />
            <span>{uploadProgress}</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 mt-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-xs text-gray-500 font-medium mb-2">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </p>
        {documents.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            No documents yet. Upload files to get started.
          </p>
        )}
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.source}
              className="group flex items-start gap-2 bg-white border border-gray-200 rounded-lg p-3"
            >
              <FileText size={14} className="text-brand-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{doc.source}</p>
                <p className="text-xs text-gray-400">{doc.chunk_count} chunks</p>
              </div>
              <button
                onClick={() => onDelete(doc.source)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition shrink-0"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
