"use client"

import { useState } from "react"
import { FileSpreadsheet, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { type Project } from "@/lib/projects-data"
import { useToast } from "@/components/toast"

// 字段名映射
const fieldLabels: Record<string, string> = {
  title: "项目标题",
  highlights: "核心亮点",
  images: "图片",
  overview: "这是什么项目",
  whyWorthDoing: "为什么值得做",
  howToProfit: "怎么赚钱",
  costAndRevenue: "成本和收益",
  steps: "怎么做",
  caseReferences: "案例参考",
  relatedLinks: "相关链接",
  general: "整体",
}

interface AnnotationData {
  id: string
  project_id: string
  content: string
  author: string
  created_at: string
  field_name?: string
  field_content?: string
}

interface ExportAnnotationsProps {
  projects: Project[]
}

export function ExportAnnotations({ projects }: ExportAnnotationsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { showToast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // 获取所有批注
      const { data: annotations, error } = await supabase
        .from("annotations")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("导出失败:", error)
        showToast("导出失败：Supabase 连接异常", "error", "error")
        setIsExporting(false)
        return
      }

      if (!annotations || annotations.length === 0) {
        showToast("暂无批注数据可导出", "info")
        setIsExporting(false)
        return
      }

      // 按项目分组
      const grouped: Record<string, AnnotationData[]> = {}
      annotations.forEach((a) => {
        if (!grouped[a.project_id]) grouped[a.project_id] = []
        grouped[a.project_id].push(a)
      })

      // 生成 CSV 内容（5列格式）
      const header = ["项目名称", "字段名称", "字段内容", "批注内容", "批注时间"]
      const rows: string[][] = [header]

      Object.entries(grouped).forEach(([projectId, annos]) => {
        const project = projects.find((p) => p.id === projectId)
        const projectTitle = project?.title || projectId

        annos.forEach((a) => {
          const date = new Date(a.created_at)
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`

          const fieldLabel = fieldLabels[a.field_name || "general"] || a.field_name || "整体"
          const fieldContent = (a.field_content || "").replace(/\n/g, " ").substring(0, 200)

          rows.push([
            projectTitle,
            fieldLabel,
            fieldContent,
            a.content,
            dateStr,
          ])
        })
      })

      // 转为 CSV（处理逗号和换行）
      const csvContent = rows
        .map((row) =>
          row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n")

      // 添加 BOM 以支持中文
      const BOM = "\uFEFF"
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)

      // 下载
      const a = document.createElement("a")
      a.href = url
      a.download = `批注导出_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("导出失败:", error)
      showToast("导出失败，请重试", "error", "error")
    }

    setIsExporting(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all shadow-sm hover:shadow-md text-sm font-medium"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>导出中...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4" />
          <span>导出批注</span>
        </>
      )}
    </button>
  )
}
