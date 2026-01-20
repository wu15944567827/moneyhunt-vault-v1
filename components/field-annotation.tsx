"use client"

import { useEffect, useState, useRef } from "react"
import { MessageCircle, Send, X, User } from "lucide-react"
import { supabase, type Annotation } from "@/lib/supabase"

interface FieldAnnotationProps {
  projectId: string
  projectTitle: string
  fieldName: string        // 字段标识（如 overview, expectedRevenue）
  fieldLabel: string       // 字段显示名（如 "项目概述", "预期收益"）
  fieldContent: string     // 字段内容（用于导出）
}

export function FieldAnnotation({
  projectId,
  projectTitle,
  fieldName,
  fieldLabel,
  fieldContent,
}: FieldAnnotationProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedAuthor = localStorage.getItem("annotation_author")
    if (savedAuthor) setAuthor(savedAuthor)
  }, [])

  // 加载该字段的批注
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("annotations")
        .select("*")
        .eq("project_id", projectId)
        .eq("field_name", fieldName)
        .order("created_at", { ascending: true })
      if (data) setAnnotations(data)
    }
    load()

    // 实时订阅
    const channel = supabase
      .channel(`field-${projectId}-${fieldName}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "annotations",
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        const newAnnotation = payload.new as Annotation
        if (newAnnotation.field_name === fieldName) {
          setAnnotations((prev) => [...prev, newAnnotation])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId, fieldName])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !author.trim() || isSubmitting) return
    setIsSubmitting(true)
    localStorage.setItem("annotation_author", author)

    await supabase.from("annotations").insert({
      project_id: projectId,
      content: content.trim(),
      author: author.trim(),
      field_name: fieldName,
      field_content: fieldContent.substring(0, 500), // 截取前500字符
    })

    setContent("")
    setIsSubmitting(false)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  const count = annotations.length

  return (
    <div ref={popoverRef} className="relative inline-flex items-center">
      {/* 批注按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className={`ml-2 p-1.5 rounded-full transition-all duration-200 ${
          count > 0
            ? "bg-blue-100 hover:bg-blue-200 text-blue-600"
            : "bg-gray-100 hover:bg-gray-200 text-gray-400 opacity-0 group-hover:opacity-100"
        }`}
        title={`${fieldLabel}的批注`}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {/* 批注弹窗 */}
      {isOpen && (
        <div
          className="absolute left-8 top-0 z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600 truncate flex-1">
              {fieldLabel}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>

          {/* 批注列表 */}
          <div className="max-h-40 overflow-y-auto">
            {annotations.length === 0 ? (
              <div className="py-4 text-center text-gray-400 text-xs">
                暂无批注
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {annotations.map((item) => (
                  <div key={item.id} className="p-2 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                        <User className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{item.author}</span>
                      <span className="text-[10px] text-gray-400">{formatTime(item.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-600 pl-5 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="border-t border-gray-100 p-2 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-1.5">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="名字"
                className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入批注..."
                  className="flex-1 px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!content.trim() || !author.trim() || isSubmitting}
                  className="px-2 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
