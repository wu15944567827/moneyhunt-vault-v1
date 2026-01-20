"use client"

import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from "react"
import { CheckCircle2, X, Heart, Link2, AlertCircle } from "lucide-react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
  icon?: "check" | "heart" | "link" | "error"
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"], icon?: Toast["icon"]) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast["type"] = "success", icon?: Toast["icon"]) => {
    const id = Math.random().toString(36).slice(2)
    // 只保留一个 Toast，替换之前的
    setToasts([{ id, message, type, icon }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast容器 - 在底部操作栏上方 */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 入场动画
    requestAnimationFrame(() => setIsVisible(true))

    // 自动消失
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onRemove, 200)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onRemove])

  const iconMap = {
    check: <CheckCircle2 className="w-4 h-4" />,
    heart: <Heart className="w-4 h-4 fill-current" />,
    link: <Link2 className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
  }

  const bgColorMap = {
    success: "bg-[#1d1d1f]",
    error: "bg-[#1d1d1f]",
    info: "bg-[#1d1d1f]",
  }

  const Icon = iconMap[toast.icon || "check"]

  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 ${bgColorMap[toast.type]} text-white text-sm font-medium rounded-full shadow-lg transition-all duration-200 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {Icon}
      <span>{toast.message}</span>
      <button onClick={onRemove} className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
