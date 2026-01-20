"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { useToast } from "@/components/toast"
import { Copy, Pencil, Send, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface PositionAnnotation {
  id: string
  project_id: string
  content: string
  author: string
  created_at: string
  position_x: number
  position_y: number
  field_name?: string
  field_content?: string
}

interface RightClickAnnotationProps {
  projectId: string
  children: React.ReactNode
}

export function RightClickAnnotation({ projectId, children }: RightClickAnnotationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [annotations, setAnnotations] = useState<PositionAnnotation[]>([])
  const [showAnnotations, setShowAnnotations] = useState(true)
  const { showToast } = useToast()
  const [menuTarget, setMenuTarget] = useState<{
    id: string
    left: number
    top: number
    content: string
    fieldName?: string
    fieldContent?: string
    positionX: number
    positionY: number
  } | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [inputPos, setInputPos] = useState<{
    left: number
    top: number
    relX: number
    relY: number
    fieldName: string
    fieldLabel: string
    fieldContent: string
  } | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [author, setAuthor] = useState("")
  const [needAuthor, setNeedAuthor] = useState(false)

  const openMenu = useCallback((target: PositionAnnotation, clientX: number, clientY: number) => {
    const MENU_W = 180
    const MENU_H = 140
    const GAP = 8
    const left = Math.min(clientX + GAP, window.innerWidth - MENU_W - 8)
    const top = Math.min(clientY + GAP, window.innerHeight - MENU_H - 8)
    setMenuTarget({
      id: target.id,
      left,
      top,
      content: target.content,
      fieldName: target.field_name,
      fieldContent: target.field_content,
      positionX: target.position_x,
      positionY: target.position_y,
    })
    setInputPos(null)
    setEditId(null)
  }, [])

  // 加载作者
  useEffect(() => {
    const saved = localStorage.getItem("annotation_author")
    if (saved) setAuthor(saved)
  }, [])

  // 批注显示开关（从首页同步）
  useEffect(() => {
    const savedVisible = localStorage.getItem("annotations_visible")
    if (savedVisible !== null) {
      setShowAnnotations(savedVisible === "1")
    }
    const handler = () => {
      const next = localStorage.getItem("annotations_visible")
      if (next !== null) setShowAnnotations(next === "1")
    }
    window.addEventListener("annotations-visibility-change", handler)
    return () => window.removeEventListener("annotations-visibility-change", handler)
  }, [])

  // 加载批注 - 增强错误处理和订阅清理
  useEffect(() => {
    let isMounted = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function load() {
      try {
        const { data, error } = await supabase
          .from("annotations")
          .select("*")
          .eq("project_id", projectId)
          .not("position_x", "is", null)
          .order("created_at", { ascending: true })

        if (error) {
          console.error("加载批注失败:", error)
          return
        }

        if (isMounted && data) {
          setAnnotations(data as PositionAnnotation[])
        }
      } catch (error) {
        console.error("加载批注异常:", error)
      }
    }
    load()

    // 设置实时订阅
    try {
      channel = supabase
        .channel(`pos-anno-${projectId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "annotations",
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            if (!isMounted) return
            const anno = payload.new as PositionAnnotation
            if (anno.position_x != null && anno.position_y != null) {
              setAnnotations((prev) => [...prev, anno])
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.error('Supabase 实时订阅连接错误')
          }
        })
    } catch (error) {
      console.error("设置实时订阅失败:", error)
    }

    return () => {
      isMounted = false
      if (channel) {
        // 异步清理，但不阻塞
        supabase.removeChannel(channel).catch((err) => {
          console.warn("清理订阅通道失败:", err)
        })
      }
    }
  }, [projectId])

  // 右键 - 检测所在section，位置保持稳定不跳动
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!containerRef.current) return

      // 检测点击位置所在的section
      const target = e.target as HTMLElement
      const annoTarget = target.closest("[data-annotation-id]") as HTMLElement | null
      if (annoTarget) {
        const id = annoTarget.dataset.annotationId
        if (id) {
          const hit = annotations.find((a) => a.id === id)
          if (hit) openMenu(hit, e.clientX, e.clientY)
          return
        }
      }
      const section = target.closest("[data-field-name]") as HTMLElement | null

      const fieldName = section?.dataset.fieldName || "general"
      const fieldLabel = section?.dataset.fieldLabel || "整体"
      const fieldContent = section?.dataset.fieldContent || ""

      const rect = containerRef.current.getBoundingClientRect()
      const containerHeight = containerRef.current.scrollHeight || rect.height
      const scrollContainer = containerRef.current.closest(".overflow-y-auto") as HTMLElement | null

      // 计算相对位置（基于内容高度；rect 已包含滚动偏移）
      const relX = ((e.clientX - rect.left) / rect.width) * 100
      const relY = ((e.clientY - rect.top) / containerHeight) * 100
      const clamp = (v: number) => Math.max(0, Math.min(100, v))

      if (!author) {
        setNeedAuthor(true)
      }

      // 输入框显示在鼠标右边（不够空间则放左边）
      const INPUT_W = 320
      const INPUT_H = 210
      const GAP = 12
      const desiredLeft = e.clientX + GAP
      const canPlaceRight = desiredLeft + INPUT_W <= window.innerWidth - 8
      const left = canPlaceRight ? desiredLeft : Math.max(8, e.clientX - INPUT_W - GAP)
      const top = Math.min(e.clientY + GAP, window.innerHeight - INPUT_H - 8)

      const prevScrollTop = scrollContainer?.scrollTop ?? 0

      setInputPos({
        left,
        top,
        relX: clamp(relX),
        relY: clamp(relY),
        fieldName,
        fieldLabel,
        fieldContent,
      })
      setEditId(null)
      setMenuTarget(null)
      setTimeout(() => {
        textareaRef.current?.focus({ preventScroll: true })
        if (scrollContainer) scrollContainer.scrollTop = prevScrollTop
      }, 0)
    },
    [author, openMenu, annotations]
  )

  // 发送
  const handleSend = async () => {
    if (!inputValue.trim() || !inputPos) return

    if (needAuthor) {
      const name = inputValue.trim()
      setAuthor(name)
      localStorage.setItem("annotation_author", name)
      setInputValue("")
      setNeedAuthor(false)
      showToast("已记住名字", "success", "check")
      setTimeout(() => {
        textareaRef.current?.focus({ preventScroll: true })
      }, 0)
      return
    }

    if (editId) {
      const { data: updated, error } = await supabase
        .from("annotations")
        .update({ content: inputValue.trim() })
        .eq("id", editId)
        .select("*")
        .single()
      if (error) {
        console.error("编辑批注失败:", error)
        const detail = error.message ? `：${error.message}` : ""
        showToast(`编辑失败${detail}`, "error", "error")
        return
      }
      if (updated) {
        setAnnotations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      }
      showToast("批注已更新", "success", "check")
      setEditId(null)
    } else {
      const { data: inserted, error } = await supabase.from("annotations").insert({
        project_id: projectId,
        content: inputValue.trim(),
        author,
        position_x: inputPos.relX,
        position_y: inputPos.relY,
        field_name: inputPos.fieldName,
        field_content: inputPos.fieldContent.substring(0, 500),
      }).select("*").single()
      if (error) {
        console.error("保存批注失败:", error)
        const detail = error.message ? `：${error.message}` : ""
        showToast(`保存失败${detail}`, "error", "error")
        return
      }
      if (inserted) {
        setAnnotations((prev) => (prev.some((item) => item.id === inserted.id) ? prev : [...prev, inserted]))
      }
      showToast("批注已保存", "success", "check")
    }
    setInputValue("")
    setInputPos(null)
  }

  const handleDelete = async () => {
    if (!menuTarget) return
    const { error } = await supabase.from("annotations").delete().eq("id", menuTarget.id)
    if (error) {
      console.error("删除批注失败:", error)
      const detail = error.message ? `：${error.message}` : ""
      showToast(`删除失败${detail}`, "error", "error")
      return
    }
    setAnnotations((prev) => prev.filter((a) => a.id !== menuTarget.id))
    setMenuTarget(null)
    setEditId(null)
    showToast("批注已删除", "success", "check")
  }

  // 复制功能 - 增强浏览器兼容性
  const handleCopy = async () => {
    if (!menuTarget) return
    const text = menuTarget.content || ""

    try {
      // 优先使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        showToast("已复制批注", "success", "check")
      } else {
        // 降级方案：使用 document.execCommand
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        textArea.style.top = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (success) {
          showToast("已复制批注", "success", "check")
        } else {
          showToast("复制失败，请手动复制", "error", "error")
        }
      }
    } catch (error) {
      console.error("复制失败:", error)
      showToast("复制失败，请手动复制", "error", "error")
    } finally {
      setMenuTarget(null)
    }
  }

  const handleEdit = () => {
    if (!menuTarget) return
    const fieldLabelMap: Record<string, string> = {
      overview: "这是什么项目",
      whyWorthDoing: "为什么值得做",
      howToProfit: "怎么赚钱",
      costAndRevenue: "成本和收益",
      steps: "怎么做",
      caseReferences: "案例参考",
      relatedLinks: "相关链接",
      images: "图片",
      general: "整体",
    }
    const fieldName = menuTarget.fieldName || "general"
    const fieldLabel = fieldLabelMap[fieldName] || "整体"
    setEditId(menuTarget.id)
    setNeedAuthor(false)
    setInputValue(menuTarget.content)
    setInputPos({
      left: menuTarget.left,
      top: menuTarget.top,
      relX: menuTarget.positionX,
      relY: menuTarget.positionY,
      fieldName,
      fieldLabel,
      fieldContent: menuTarget.fieldContent || "",
    })
    setMenuTarget(null)
    setTimeout(() => {
      textareaRef.current?.focus({ preventScroll: true })
    }, 0)
  }

  // 键盘：回车发送，shift+回车换行
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else if (e.key === "Escape") {
      setInputPos(null)
      setInputValue("")
      setNeedAuthor(false)
      setMenuTarget(null)
      setEditId(null)
    }
  }

  // 点击外部关闭
  useEffect(() => {
    if (!inputPos) return
    const handler = (e: MouseEvent) => {
      const textarea = textareaRef.current
      const parent = textarea?.closest(".annotation-input-box")
      if (parent && !parent.contains(e.target as Node)) {
        setInputPos(null)
        setInputValue("")
        setNeedAuthor(false)
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler)
    }, 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handler)
    }
  }, [inputPos])

  // 点击外部关闭菜单
  useEffect(() => {
    if (!menuTarget) return
    const handler = (e: MouseEvent) => {
      const menu = document.querySelector(".annotation-menu")
      if (menu && !menu.contains(e.target as Node)) {
        setMenuTarget(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuTarget])

  return (
    <div ref={containerRef} className="relative" onContextMenu={handleContextMenu}>
      {children}

      {/* 简化的批注显示：小圆点 + 连接线 + 只显示内容 */}
      {showAnnotations && annotations.map((a) => (
        <div
          key={a.id}
          className="absolute z-20"
          style={{
            left: `${a.position_x}%`,
            top: `${a.position_y}%`,
          }}
        >
          {/* 小圆点 */}
          <div
            data-annotation-id={a.id}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openMenu(a, e.clientX, e.clientY)
            }}
            className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full ring-2 ring-white shadow-sm pointer-events-auto"
          />

          {/* 连接线 + 批注卡片（只显示内容） */}
          <div className="absolute left-1 top-0 flex items-start">
            {/* 横线 */}
            <div className="w-10 h-[2px] bg-orange-400 mt-[5px]" />

            {/* 批注卡片 - 只显示内容，字体大一些 */}
            <div
              data-annotation-id={a.id}
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                openMenu(a, e.clientX, e.clientY)
              }}
              className="pointer-events-auto w-72 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-lg flex-shrink-0"
            >
              <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                {a.content}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* 输入框 - textarea支持换行 */}
      {inputPos && typeof document !== "undefined" &&
        createPortal(
          <div
            className="annotation-input-box fixed z-[100] animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: inputPos.left,
              top: inputPos.top,
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* 字段提示 */}
              <div className="px-3 py-1.5 bg-orange-50 border-b border-orange-100 text-xs text-orange-600">
                批注到：{inputPos.fieldLabel}
              </div>
              <div className="p-2">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={needAuthor ? "输入名字，回车确认" : "输入批注，回车发送\nShift+回车换行"}
                  className="w-72 h-24 px-3 py-2 text-[15px] focus:outline-none resize-none border border-gray-100 rounded-lg"
                  autoComplete="off"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>发送</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {menuTarget && typeof document !== "undefined" &&
        createPortal(
          <div
            className="annotation-menu fixed z-[110] bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1.5"
            style={{ left: menuTarget.left, top: menuTarget.top }}
          >
            <button
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleEdit()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full"
            >
              <Pencil className="w-4 h-4" />
              <span>编辑</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleCopy()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full"
            >
              <Copy className="w-4 h-4" />
              <span>复制</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDelete()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
            >
              <Trash2 className="w-4 h-4" />
              <span>删除</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  )
}
