"use client"

import Link from "next/link"
import { Flame, DollarSign } from "lucide-react"
import { getMonthlyRevenue, type Project } from "@/lib/projects-data"

interface SidebarProps {
  projects: Project[]
}

// 计算项目热度分数
function getPopularityScore(project: Project): number {
  const stats = project.statistics
  if (!stats) return 0
  return (stats.likeCount || 0) + (stats.favoriteCount || 0) + (stats.readCount || 0) / 10
}

export function Sidebar({ projects }: SidebarProps) {
  // 计算热门项目（按热度分数排序）
  const hotProjects = [...projects]
    .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
    .slice(0, 5)

  // 排名颜色配置
  const rankColors = [
    "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-sm",  // 金色
    "bg-gradient-to-br from-gray-300 to-gray-400 text-white",               // 银色
    "bg-gradient-to-br from-amber-500 to-orange-600 text-white",            // 铜色
    "bg-gray-100 text-gray-500",                                            // 灰色
    "bg-gray-100 text-gray-500"                                             // 灰色
  ]

  return (
    <aside className="w-72 shrink-0 space-y-6 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
      {/* 热门榜单 - 唯一保留的模块 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          热门项目 TOP5
        </h3>
        <div className="space-y-3">
          {hotProjects.map((project, index) => {
            const monthlyRevenue = getMonthlyRevenue(project)
            return (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hot-project-item flex items-start gap-3 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* 排名徽章 */}
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold shrink-0 text-xs ${rankColors[index]}`}>
                  {index + 1}
                </div>
                {/* 项目信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-[#3B796F] transition-colors">
                    {project.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <DollarSign className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-gray-400 truncate">{monthlyRevenue}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
