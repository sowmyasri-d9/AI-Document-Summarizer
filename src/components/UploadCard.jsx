import { useState } from 'react'
import axios from 'axios'
import { UploadCloud, FileText, Loader2, Download, RotateCcw, FileCheck } from 'lucide-react'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function UploadCard() {
  const [file, setFile] = useState(null)
  const [length, setLength] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [stats, setStats] = useState(null)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('length', length)

      const res = await axios.post(
        `${API}/summarize`,
        formData
      )

      setSummary(res.data.summary)
      setStats(res.data.stats)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to generate summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await axios.post(
        `${API}/download`,
        { summary: summary },
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = 'summary.docx'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download summary.')
    }
  }

  const handleReset = () => {
    setFile(null)
    setSummary(null)
    setStats(null)
    setLength('medium')
  }

  if (summary) {
    return (
      <div className="w-full max-w-3xl p-8 border rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Summary Result</h1>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            <RotateCcw className="w-4 h-4" />
            New Summary
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.original_words}</p>
              <p className="text-sm text-gray-600">Original Words</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.summary_words}</p>
              <p className="text-sm text-gray-600">Summary Words</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.reduction_percentage}%</p>
              <p className="text-sm text-gray-600">Reduced</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-medium">Summary</h2>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="w-full bg-black text-white py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-800 transition"
        >
          <Download className="w-5 h-5" />
          Download as Word Document
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg p-8 border rounded-2xl shadow-md transition-all">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        AI Document Summarizer
      </h1>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setFile(e.dataTransfer.files[0])
        }}
        onClick={() => document.getElementById('file-input').click()}
        className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition"
      >
        <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
        <p className="text-gray-600 text-sm">
          Drag & drop or click to upload
        </p>
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".txt,.pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>
      {file && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="flex-1">{file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="text-red-500 hover:text-red-700 text-xs"
          >
            Remove
          </button>
        </div>
      )}
      <div className="mt-4">
        <label className="text-sm font-medium">Summary length</label>
        <select
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="mt-1 w-full border rounded-lg p-2 bg-white"
        >
          <option value="short">Short (30-80 words)</option>
          <option value="medium">Medium (60-150 words)</option>
          <option value="detailed">Detailed (100-250 words)</option>
        </select>
      </div>
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="mt-6 w-full bg-black text-white py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {loading ? 'Summarizing...' : 'Generate Summary'}
      </button>
    </div>
  )
}
