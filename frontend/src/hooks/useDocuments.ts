import { useState, useCallback, useEffect } from 'react'
import type { Document } from '../types'
import { listDocuments, uploadDocument, deleteDocument } from '../services/api'

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await listDocuments()
      setDocuments(docs)
    } catch {
      setDocuments([])
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const upload = useCallback(
    async (file: File) => {
      setUploading(true)
      setUploadProgress(`Uploading ${file.name}...`)
      setError(null)
      try {
        const result = await uploadDocument(file)
        setUploadProgress(result.message)
        await fetchDocuments()
        setTimeout(() => setUploadProgress(null), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        setUploadProgress(null)
      } finally {
        setUploading(false)
      }
    },
    [fetchDocuments]
  )

  const remove = useCallback(
    async (sourceName: string) => {
      setError(null)
      try {
        await deleteDocument(sourceName)
        await fetchDocuments()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed')
      }
    },
    [fetchDocuments]
  )

  return { documents, uploading, uploadProgress, error, upload, remove, fetchDocuments }
}
