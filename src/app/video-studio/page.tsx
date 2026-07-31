"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadView } from "@/components/video-studio/UploadView"
import { ProcessingView } from "@/components/video-studio/ProcessingView"
import { StudioView } from "@/components/video-studio/StudioView"
import { SavedProject, saveProject } from "@/lib/projects"

export type ViewState = 'upload' | 'processing' | 'studio'

export default function VideoStudio() {
  const [view, setView] = useState<ViewState>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [videoContext, setVideoContext] = useState("")
  const [clips, setClips] = useState<Record<string, unknown>[]>([])
  const [captions, setCaptions] = useState<Record<string, unknown>[]>([])
  const [cuts, setCuts] = useState<Record<string, unknown>[]>([])
  const [fileKey, setFileKey] = useState<string | null>(null)

  const handleUploadComplete = (uploadedFile: File, context: string) => {
    setFile(uploadedFile)
    setFileUrl(URL.createObjectURL(uploadedFile))
    setVideoContext(context)
    setView('processing')
  }

  const handleProcessingComplete = (data: Record<string, unknown>) => {
    const parsedClips = (data.clips as Record<string, unknown>[]) || []
    const parsedCaptions = (data.captions as Record<string, unknown>[]) || []
    const parsedCuts = (data.cuts as Record<string, unknown>[]) || []
    const key = (data.fileKey as string) || null

    setClips(parsedClips)
    setCaptions(parsedCaptions)
    setCuts(parsedCuts)
    setFileKey(key)

    // Save project for instant re-editing in My Projects
    const projId = 'proj_' + Date.now()
    const projName = file ? file.name.replace(/\.[^/.]+$/, "") : "Podcast AI Project"
    const newProject: SavedProject = {
      id: projId,
      name: projName,
      fileKey: key,
      fileUrl: fileUrl,
      fileName: file ? file.name : "video.mp4",
      fileSize: file ? file.size : 0,
      clips: parsedClips,
      captions: parsedCaptions,
      cuts: parsedCuts,
      updatedAt: new Date().toISOString()
    }
    
    saveProject(newProject)
    setView('studio')
  }

  const handleOpenSavedProject = async (project: SavedProject) => {
    setClips(project.clips || [])
    setCaptions(project.captions || [])
    setCuts(project.cuts || [])
    setFileKey(project.fileKey || null)

    let currentUrl = project.fileUrl || null;
    
    if (project.fileKey && (!currentUrl || currentUrl.startsWith('blob:'))) {
      try {
        const res = await fetch("/api/video/stream-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileKey: project.fileKey })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            currentUrl = data.url;
            saveProject({ ...project, fileUrl: data.url });
          }
        }
      } catch (e: unknown) {
        console.error("Error resolving stream URL:", e);
      }
    }

    setFileUrl(currentUrl)
    setView('studio')
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col bg-background relative">
      <AnimatePresence mode="wait">
        {view === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full w-full flex items-center justify-center p-4 md:p-8 overflow-y-auto"
          >
            <UploadView 
              onUploadComplete={handleUploadComplete} 
              onOpenSavedProject={handleOpenSavedProject}
            />
          </motion.div>
        )}

        {view === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="h-full w-full flex items-center justify-center p-4 md:p-8"
          >
            <ProcessingView 
              file={file} 
              context={videoContext} 
              onComplete={handleProcessingComplete} 
              onCancel={() => setView('upload')} 
            />
          </motion.div>
        )}

        {view === 'studio' && (
          <motion.div
            key="studio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full"
          >
            <StudioView 
              file={file} 
              fileKey={fileKey} 
              fileUrl={fileUrl} 
              clips={clips} 
              initialCaptions={captions} 
              initialCuts={cuts} 
              onBack={() => setView('upload')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
