"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  UploadCloud, FileVideo, X, Play, Clock, Monitor, 
  FolderOpen, Edit2, Trash2, Check, Sparkles, ArrowRight
} from "lucide-react"
import { 
  SavedProject, getSavedProjects, renameSavedProject, deleteSavedProject 
} from "@/lib/projects"

interface UploadViewProps {
  onUploadComplete: (file: File, context: string) => void
  onOpenSavedProject?: (project: SavedProject) => void
}

export function UploadView({ onUploadComplete, onOpenSavedProject }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoContext, setVideoContext] = useState("")
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setProjects(getSavedProjects())
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo', 'video/webm']
    if (validTypes.includes(file.type)) {
      setSelectedFile(file)
    } else {
      alert("Invalid file type. Please upload MP4, MOV, MKV, AVI, or WEBM.")
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return "Recently"
    }
  }

  const handleStartRename = (project: SavedProject, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProjectId(project.id)
    setEditingName(project.name)
  }

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!editingName.trim()) return
    const updated = renameSavedProject(id, editingName.trim())
    setProjects(updated)
    setEditingProjectId(null)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this project from your list?")) {
      const updated = deleteSavedProject(id)
      setProjects(updated)
    }
  }

  return (
    <div className="w-full max-w-5xl space-y-12 pb-16">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-4 flex items-center justify-center gap-3">
          <FileVideo className="w-10 h-10 text-blue-500" />
          AI Video Intelligence Studio
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload your podcast and let AI automatically find, edit, and caption your most viral moments.
        </p>
      </div>

      {/* Main Upload Dropzone or Selected File Config */}
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-3xl p-14 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer bg-card/50 backdrop-blur-xl ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/mp4,video/quicktime,video/x-matroska,video/x-msvideo,video/webm" 
            className="hidden" 
          />
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 pointer-events-none">
            <UploadCloud className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 pointer-events-none">Drag & Drop your video here</h3>
          <p className="text-muted-foreground pointer-events-none mb-6">or click to browse files</p>
          <div className="flex gap-2 text-xs font-medium text-muted-foreground bg-background px-4 py-2 rounded-full border">
            Supported: MP4, MOV, MKV, AVI, WEBM
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/50 backdrop-blur-xl border rounded-3xl p-8 shadow-sm relative"
        >
          <button 
            onClick={() => setSelectedFile(null)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 aspect-video bg-black/10 rounded-2xl border flex items-center justify-center relative overflow-hidden">
              <FileVideo className="w-16 h-16 text-muted-foreground/30" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-white font-medium text-sm drop-shadow-md truncate">{selectedFile.name}</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">Ready to Process</h3>
                <p className="text-muted-foreground">We'll analyze the video for viral hooks, speakers, and topics.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background border rounded-xl p-4 flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">File Size</p>
                    <p className="font-semibold">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <div className="bg-background border rounded-xl p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Processing</p>
                    <p className="font-semibold">~2-5 mins</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">What is this video about? (Optional)</label>
                <textarea 
                  value={videoContext}
                  onChange={(e) => setVideoContext(e.target.value)}
                  placeholder="e.g., This is a podcast about AI startups. Find the most funny and viral moments."
                  className="w-full bg-background border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none min-h-20"
                />
              </div>

              <button 
                onClick={() => onUploadComplete(selectedFile, videoContext)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                Analyze & Generate Clips
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* MY PROJECTS SECTION */}
      <div className="space-y-6 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">My Projects</h2>
              <p className="text-xs text-muted-foreground">Continue editing your previously processed podcast projects without re-uploading.</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-muted border rounded-full text-muted-foreground">
            {projects.length} Saved {projects.length === 1 ? 'Project' : 'Projects'}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed rounded-3xl bg-card/30">
            <Sparkles className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h4 className="font-semibold text-lg text-foreground mb-1">No Projects Saved Yet</h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Once you upload and analyze a video, your project will automatically be saved here so you can re-edit anytime.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                className="bg-card border hover:border-primary/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Thumbnail / Header Preview */}
                <div>
                  <div className="aspect-video bg-slate-900 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center border border-border/60 group-hover:border-primary/30 transition-colors">
                    <FileVideo className="w-12 h-12 text-slate-600" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase shadow">
                          {project.clips.length} AI Clips
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg p-1">
                          <button
                            onClick={(e) => handleStartRename(project, e)}
                            className="p-1 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors"
                            title="Rename Project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(project.id, e)}
                            className="p-1 hover:bg-red-500/30 rounded text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-white text-xs font-mono truncate opacity-80">
                        {project.fileName}
                      </div>
                    </div>
                  </div>

                  {/* Project Name (Editable) */}
                  {editingProjectId === project.id ? (
                    <form onSubmit={(e) => handleSaveRename(project.id, e)} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="w-full text-sm font-semibold bg-background border px-2.5 py-1 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <h3 className="font-bold text-lg text-foreground truncate mb-1 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                  )}

                  <p className="text-xs text-muted-foreground flex items-center gap-2 mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    Updated {formatDate(project.updatedAt)}
                  </p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => onOpenSavedProject && onOpenSavedProject(project)}
                  className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground py-2.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm group-hover:shadow"
                >
                  <span>Continue Editing</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
