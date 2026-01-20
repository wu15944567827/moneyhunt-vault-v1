"use client"

import { useState, useMemo, useEffect } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import { Header } from "@/components/header"
import { FilterBar } from "@/components/filter-bar"
import { ProjectGrid } from "@/components/project-grid"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { ExportAnnotations } from "@/components/export-annotations"
import { HotProjectsSidebar } from "@/components/hot-projects-sidebar"
import type { Project } from "@/lib/projects-data"

type SortOption = "time" | "popularity"

interface ProjectLibraryClientProps {
  initialProjects: Project[]
}

// 计算项目热度分数
function getPopularityScore(project: Project): number {
  const stats = project.statistics
  if (!stats) return 0
  return (stats.likeCount || 0) + (stats.favoriteCount || 0) + (stats.readCount || 0) / 10
}

// 判断是否是高收益项目（容错：字段缺失时不筛掉）
function isHighRevenue(project: Project): boolean {
  // 优先检查 tags 字段（如果有）
  if ((project as { tags?: string[] }).tags?.includes("high-revenue")) {
    return true
  }
  // 兜底逻辑：按热度分数判断（前 30%）
  return true // 容错：不筛掉任何项目，由排序来体现优先级
}

// 判断是否是低门槛项目（容错：字段缺失时不筛掉）
function isLowThreshold(project: Project): boolean {
  // 优先检查 tags 字段（如果有）
  if ((project as { tags?: string[] }).tags?.includes("low-threshold")) {
    return true
  }
  // 兜底逻辑：检查启动成本
  const cost = project.detailContent?.costAndRevenue?.startupCost || ""
  if (cost.includes("0") || cost.includes("几百") || cost.includes("免费") || cost.includes("低")) {
    return true
  }
  // 容错：如果无法判断，不筛掉
  return false
}

// 客户端筛选函数 - 顺序：Filter → Preference → Sort
function filterProjectsClient(
  projects: Project[],
  platformFilter: string,
  profitModelFilter: string,
  searchQuery: string,
  preference: string = "all",
  sortBy: "time" | "popularity" = "time"
): Project[] {
  // Step 1: Filter（平台 + 变现方式 + 搜索）
  let filtered = projects.filter((project) => {
    if (platformFilter !== "all" && !project.platform.includes(platformFilter)) return false
    if (profitModelFilter !== "all" && project.profitModel !== profitModelFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        project.title.toLowerCase().includes(query) ||
        project.summary.toLowerCase().includes(query) ||
        project.highlights.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Step 2: Preference（高收益/低门槛）
  if (preference === "high-revenue") {
    // 高收益：优先展示高收益项目，但不完全筛掉其他项目（容错）
    filtered = filtered.filter((p) => isHighRevenue(p))
  } else if (preference === "low-threshold") {
    // 低门槛：筛选低门槛项目
    const lowThresholdProjects = filtered.filter((p) => isLowThreshold(p))
    // 容错：如果没有符合条件的项目，返回全部
    if (lowThresholdProjects.length > 0) {
      filtered = lowThresholdProjects
    }
  }

  // Step 3: Sort（最新/最热）
  if (sortBy === "popularity") {
    return [...filtered].sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
  }

  // 默认按时间排序（从新到旧）
  return [...filtered].sort((a, b) => {
    return b.publishTime.localeCompare(a.publishTime)
  })
}

export function ProjectLibraryClient({ initialProjects }: ProjectLibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [profitModelFilter, setProfitModelFilter] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("time")
  const [annotationsVisible, setAnnotationsVisible] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("annotations_visible")
    if (saved !== null) {
      setAnnotationsVisible(saved === "1")
    }
  }, [])

  const toggleAnnotations = () => {
    const next = !annotationsVisible
    setAnnotationsVisible(next)
    localStorage.setItem("annotations_visible", next ? "1" : "0")
    window.dispatchEvent(new Event("annotations-visibility-change"))
  }

  const filteredProjects = useMemo(() => {
    return filterProjectsClient(
      initialProjects,
      platformFilter,
      profitModelFilter,
      searchQuery,
      "all",
      sortBy
    )
  }, [initialProjects, platformFilter, profitModelFilter, searchQuery, sortBy])

  // 检查是否有任何筛选条件
  const hasActiveFilters =
    platformFilter !== "all" || profitModelFilter !== "all" || searchQuery !== ""

  // 清除所有筛选
  const clearAllFilters = () => {
    setPlatformFilter("all")
    setProfitModelFilter("all")
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FilterBar
        platformFilter={platformFilter}
        profitModelFilter={profitModelFilter}
        projects={initialProjects}
        onPlatformChange={setPlatformFilter}
        onProfitModelChange={setProfitModelFilter}
      />

      <main className="scys-container py-6">
        {/* 顶部排序栏 - 主题色 */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-6">
            {/* 排序切换 - 主题色 Tab */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setSortBy("time")}
                className="relative pb-1.5 transition-colors duration-300"
                style={{
                  color: sortBy === "time" ? "#58A391" : "#86868b",
                  fontWeight: sortBy === "time" ? 600 : 400,
                  fontSize: '15px',
                  letterSpacing: '-0.01em'
                }}
              >
                最新
                {sortBy === "time" && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300"
                    style={{ backgroundColor: '#58A391' }}
                  />
                )}
              </button>
              <button
                onClick={() => setSortBy("popularity")}
                className="relative pb-1.5 transition-colors duration-300"
                style={{
                  color: sortBy === "popularity" ? "#58A391" : "#86868b",
                  fontWeight: sortBy === "popularity" ? 600 : 400,
                  fontSize: '15px',
                  letterSpacing: '-0.01em'
                }}
              >
                热门
                {sortBy === "popularity" && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300"
                    style={{ backgroundColor: '#58A391' }}
                  />
                )}
              </button>
            </div>
            {/* 项目数量和清除筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: '#86868b' }}>
                共 <span style={{ color: '#58A391', fontWeight: 500 }}>{filteredProjects.length}</span> 个项目
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: '#E8F3F1',
                    color: '#58A391'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d0e8e3'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#E8F3F1'
                  }}
                >
                  <X className="w-3 h-3" />
                  清除
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 内容区：项目网格 + 侧边栏（顶部对齐） */}
        <div className="flex gap-6 items-start">
          {/* 主内容区 */}
          <div className="flex-1 min-w-0">
            <ProjectGrid projects={filteredProjects} />
          </div>

          {/* 右侧边栏 - Apple 风格 */}
          <aside className="hidden xl:block w-80 shrink-0 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
            {/* 项目榜单 */}
            <HotProjectsSidebar projects={initialProjects} />
          </aside>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-100 py-8 pb-20 lg:pb-8">
        <div className="scys-container text-center">
          <p className="text-sm text-gray-500">© 2025 生财有术 · 项目库 | 新项目，新机会，持续更新</p>
        </div>
      </footer>

      {/* 移动端底部导航栏 */}
      <MobileBottomNav projects={initialProjects} />
    </div>
  )
}
