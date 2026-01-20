"use client"

import { useEffect, useState, useRef } from "react"
import { MessageSquare, Send, User } from "lucide-react"
import { supabase, type Annotation } from "@/lib/supabase"

interface AnnotationSectionProps {
  projectId: string
}

export function AnnotationSection({ projectId }: AnnotationSectionProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)

  // 从 localStorage 读取作者名
  useEffect(() => {
    const savedAuthor = localStorage.getItem("annotation_author")
    if (savedAuthor) {
      setAuthor(savedAuthor)
    }
  }, [])

  // 加载批注
  useEffect(() => {
    async function loadAnnotations() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("annotations")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true })

      if (!error && data) {
        setAnnotations(data)
      }
      setIsLoading(false)
    }

    loadAnnotations()

    // 实时订阅
    const channel = supabase
      .channel(`annotations-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "annotations",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setAnnotations((prev) => [...prev, payload.new as Annotation])
          // 滚动到底部
          setTimeout(() => {
            listRef.current?.scrollTo({
              top: listRef.current.scrollHeight,
              behavior: "smooth",
            })
          }, 100)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  // 提交批注
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !author.trim() || isSubmitting) return

    setIsSubmitting(true)

    // 保存作者名到 localStorage
    localStorage.setItem("annotation_author", author)

    const { error } = await supabase.from("annotations").insert({
      project_id: projectId,
      content: content.trim(),
      author: author.trim(),
    })

    if (!error) {
      setContent("")
    }

    setIsSubmitting(false)
  }

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${month}-${day} ${hours}:${minutes}`
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        批注 {annotations.length > 0 && `(${annotations.length})`}
      </h2>

      {/* 批注列表 */}
      <div
        ref={listRef}
        className="space-y-3 max-h-[300px] overflow-y-auto mb-4"
      >
        {isLoading ? (
          <div className="text-center py-4 text-gray-400 text-sm">加载中...</div>
        ) : annotations.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            暂无批注，添加第一条吧
          </div>
        ) : (
          annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="p-3 bg-white rounded-lg border border-blue-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {annotation.author}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(annotation.created_at)}
                </span>
              </div>
              <p className="text-[15px] text-gray-600 pl-8 whitespace-pre-wrap">
                {annotation.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="你的名字"
            className="w-24 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入批注内容..."
            className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!content.trim() || !author.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </section>
  )
}
