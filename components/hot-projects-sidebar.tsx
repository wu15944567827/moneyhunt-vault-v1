"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { type Project } from "@/lib/projects-data"

// ========================================
// 主题色系统 - 绿色主题
// ========================================
const COLORS = {
  textPrimary: "#1d1d1f",
  textSecondary: "#6e6e73",
  textTertiary: "#86868b",
  bgTag: "#f5f5f7",
  hoverBg: "#f5f5f7",
  // 主题色
  primary: "#3B796F",
  primaryLight: "#E6F3F1",
}

interface HotProjectsSidebarProps {
  projects: Project[]
}

// 计算项目热度分数
function getPopularityScore(project: Project): number {
  const stats = project.statistics
  if (!stats) return 0
  return (stats.likeCount || 0) + (stats.favoriteCount || 0) + (stats.readCount || 0) / 10
}

// 获取相对时间
function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "今天"
  if (diffDays === 1) return "昨天"
  if (diffDays < 30) return `${diffDays}天前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  return `${Math.floor(diffDays / 365)}年前`
}

// 排名序号颜色
const RANK_COLORS = {
  1: { bg: '#D25147', text: '#FFFFFF' },      // 第一名 - 红色
  2: { bg: '#D77F36', text: '#FFFFFF' },      // 第二名 - 橙色
  3: { bg: '#EAB16B', text: '#FFFFFF' },      // 第三名 - 金色
  default: { bg: '#EEF2F1', text: '#8E9198' }  // 其他 - 灰色
}

// 时间筛选选项
type TimeFilter = '7d' | '1m' | '3m' | '1y'
const TIME_FILTERS: { key: TimeFilter; label: string; days: number }[] = [
  { key: '7d', label: '近7天', days: 7 },
  { key: '1m', label: '近1月', days: 30 },
  { key: '3m', label: '近3月', days: 90 },
  { key: '1y', label: '近1年', days: 365 },
]

export function HotProjectsSidebar({ projects }: HotProjectsSidebarProps) {
  const [activeTab, setActiveTab] = useState<"likes" | "voyage">("likes")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1m')

  // 根据时间筛选过滤项目
  const filteredByTime = useMemo(() => {
    const filterConfig = TIME_FILTERS.find(f => f.key === timeFilter)
    if (!filterConfig) return projects

    const now = new Date()
    const cutoffDate = new Date(now.getTime() - filterConfig.days * 24 * 60 * 60 * 1000)

    return projects.filter(p => {
      const publishDate = new Date(p.publishTime)
      return publishDate >= cutoffDate
    })
  }, [projects, timeFilter])

  // 获取项目点赞榜 - 按热度排序前6个
  const likedProjects = useMemo(() => {
    return [...filteredByTime]
      .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
      .slice(0, 6)
  }, [filteredByTime])

  // 我要上航海 - 按最新发布排序前6个
  const voyageProjects = useMemo(() => {
    return [...filteredByTime]
      .sort((a, b) => b.publishTime.localeCompare(a.publishTime))
      .slice(0, 6)
  }, [filteredByTime])

  const displayProjects = activeTab === "likes" ? likedProjects : voyageProjects

  return (
    <div className="bg-white rounded-lg p-4">
      {/* 标题栏 */}
      <div className="flex items-center gap-6 mb-3">
        <button
          onClick={() => setActiveTab("likes")}
          className="relative pb-1.5 transition-colors duration-300"
          style={{
            color: activeTab === "likes" ? COLORS.textPrimary : COLORS.textTertiary,
            fontWeight: activeTab === "likes" ? 600 : 400,
            fontSize: '15px',
            letterSpacing: '-0.01em'
          }}
        >
          点赞榜
          {activeTab === "likes" && (
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] transition-all duration-300"
              style={{ backgroundColor: '#58A391' }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("voyage")}
          className="relative pb-1.5 transition-colors duration-300"
          style={{
            color: activeTab === "voyage" ? COLORS.textPrimary : COLORS.textTertiary,
            fontWeight: activeTab === "voyage" ? 600 : 400,
            fontSize: '15px',
            letterSpacing: '-0.01em'
          }}
        >
          航海热度榜
          {activeTab === "voyage" && (
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] transition-all duration-300"
              style={{ backgroundColor: '#58A391' }}
            />
          )}
        </button>
      </div>

      {/* 时间筛选器 */}
      <div className="flex items-center gap-3 mb-4">
        {TIME_FILTERS.map((filter) => {
          const isActive = timeFilter === filter.key
          return (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key)}
              className={`
                px-2.5 py-1 text-xs rounded transition-all duration-200 outline-none border-none focus:outline-none
                ${isActive
                  ? 'bg-[#E6F3F1] text-[#58A391] font-medium'
                  : 'text-[#86868b] hover:bg-[#F5F5F7] hover:text-[#6e6e73]'
                }
              `}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* 列表内容 */}
      <div className="space-y-0.5">
        {displayProjects.map((project, index) => {
          const score = project.statistics?.likeCount || 0
          const relativeTime = getRelativeTime(project.publishTime)
          const rankNum = index + 1
          const rankColor = RANK_COLORS[rankNum as keyof typeof RANK_COLORS] || RANK_COLORS.default

          return (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 py-2.5 rounded-xl transition-all duration-300 group px-2 -mx-2"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* 序号 */}
              <span
                className="w-[18px] h-[18px] rounded text-[11px] font-medium flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: rankColor.bg,
                  color: rankColor.text
                }}
              >
                {rankNum}
              </span>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] leading-snug line-clamp-2 transition-colors duration-300"
                  style={{ color: COLORS.textPrimary }}
                >
                  {project.title}
                </p>
                {/* 信息行 */}
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px]" style={{ color: COLORS.textTertiary }}>
                    {relativeTime}
                  </span>
                  {activeTab === "likes" && score > 0 && (
                    <span
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: COLORS.textTertiary }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      {score}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
