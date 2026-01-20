"use client"

import { useEffect, useState, useRef } from "react"
import { MessageCircle, Send, X, User } from "lucide-react"
import { supabase, type Annotation } from "@/lib/supabase"

interface AnnotationBubbleProps {
  projectId: string
  projectTitle: string
}

export function AnnotationBubble({ projectId, projectTitle }: AnnotationBubbleProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 从 localStorage 读取作者名
  useEffect(() => {
    const savedAuthor = localStorage.getItem("annotation_author")
    if (savedAuthor) setAuthor(savedAuthor)
  }, [])

  // 加载批注
  useEffect(() => {
    async function loadAnnotations() {
      const { data } = await supabase
        .from("annotations")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
      if (data) setAnnotations(data)
    }
    loadAnnotations()

    // 实时订阅
    const channel = supabase
      .channel(`bubble-${projectId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "annotations",
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        setAnnotations((prev) => [payload.new as Annotation, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setShowInput(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // 提交批注
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !author.trim() || isSubmitting) return
    setIsSubmitting(true)
    localStorage.setItem("annotation_author", author)

    await supabase.from("annotations").insert({
      project_id: projectId,
      content: content.trim(),
      author: author.trim(),
    })

    setContent("")
    setShowInput(false)
    setIsSubmitting(false)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "刚刚"
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return `${date.getMonth() + 1}-${date.getDate()}`
  }

  const count = annotations.length

  return (
    <div ref={bubbleRef} className="absolute top-3 right-3 z-20">
      {/* 批注气泡按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition-all duration-300 ${
          count > 0
            ? "bg-blue-500 hover:bg-blue-600 hover:scale-110"
            : "bg-white/90 hover:bg-white hover:scale-110 border border-gray-200"
        }`}
      >
        <MessageCircle className={`w-4 h-4 ${count > 0 ? "text-white" : "text-gray-500"}`} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* 批注弹窗 */}
      {isOpen && (
        <div
          className="absolute top-10 right-0 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">批注</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {count}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* 批注列表 */}
          <div className="max-h-60 overflow-y-auto">
            {annotations.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>暂无批注</p>
                <p className="text-xs mt-1">点击下方添加批注</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {annotations.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-right-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.author}</span>
                      <span className="text-xs text-gray-400">{formatTime(item.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 pl-8 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 添加批注 */}
          <div className="border-t border-gray-100 p-3 bg-gray-50">
            {!showInput ? (
              <button
                onClick={() => {
                  setShowInput(true)
                  setTimeout(() => inputRef.current?.focus(), 100)
                }}
                className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                + 添加批注
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="你的名字"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="输入批注..."
                    className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!content.trim() || !author.trim() || isSubmitting}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
