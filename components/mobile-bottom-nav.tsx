"use client"

import { useState } from "react"
import Link from "next/link"
import { Flame, Sparkles, X, ChevronRight } from "lucide-react"
import { type Project, getMonthlyRevenue } from "@/lib/projects-data"

interface MobileBottomNavProps {
  projects: Project[]
}

type PanelType = "hot" | "new" | null

export function MobileBottomNav({ projects }: MobileBottomNavProps) {
  const [activePanel, setActivePanel] = useState<PanelType>(null)

  // 计算热门项目（按统计数据排序）和新增项目（按时间判断本周）
  const hotProjects = [...projects].sort((a, b) => {
    const aScore = (a.statistics?.likeCount || 0) + (a.statistics?.favoriteCount || 0)
    const bScore = (b.statistics?.likeCount || 0) + (b.statistics?.favoriteCount || 0)
    return bScore - aScore
  }).slice(0, 5)

  // 判断是否是本周新增（7天内）
  const isThisWeek = (publishTime: string) => {
    const now = new Date()
    const pubDate = new Date(publishTime)
    const diffDays = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }
  const newProjects = projects.filter(p => isThisWeek(p.publishTime))

  const togglePanel = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  return (
    <>
      {/* 遮罩层 */}
      {activePanel && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setActivePanel(null)}
        />
      )}

      {/* 滑出面板 - 浅色主题 */}
      <div
        className={`fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 lg:hidden transition-transform duration-300 ${
          activePanel ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "60vh" }}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            {activePanel === "hot" && (
              <>
                <Flame className="w-5 h-5 text-orange-500" />
                热门项目 TOP5
              </>
            )}
            {activePanel === "new" && (
              <>
                <Sparkles className="w-5 h-5 text-purple-500" />
                本周新增
              </>
            )}
          </h3>
          <button
            onClick={() => setActivePanel(null)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(60vh - 60px)" }}>
          {activePanel === "hot" && (
            <div className="space-y-3">
              {hotProjects.map((project, index) => {
                const monthlyRevenue = getMonthlyRevenue(project)
                return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  onClick={() => setActivePanel(null)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium shrink-0 ${
                      index < 3
                        ? "bg-[#3B796F] text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{project.title}</p>
                    <p className="text-xs text-gray-500 truncate">{monthlyRevenue}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
                )
              })}
            </div>
          )}
          {activePanel === "new" && (
            <div className="space-y-3">
              {newProjects.length > 0 ? (
                newProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    onClick={() => setActivePanel(null)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <span className="px-2 py-0.5 bg-[#3B796F] text-white text-[10px] font-semibold rounded shrink-0">
                      NEW
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{project.title}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">暂无本周新增项目</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部导航栏 - 浅色主题 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden safe-area-pb">
        <div className="flex items-center justify-center gap-8 py-2">
          <button
            onClick={() => togglePanel("hot")}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors ${
              activePanel === "hot" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            <Flame className="w-5 h-5" />
            <span className="text-xs">热门</span>
          </button>
          <button
            onClick={() => togglePanel("new")}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors relative ${
              activePanel === "new" ? "text-purple-500" : "text-gray-500"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">新增</span>
            {newProjects.length > 0 && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 bg-[#3B796F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {newProjects.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    </>
  )
}
