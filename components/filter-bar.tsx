"use client"

import { useMemo } from "react"
import { platforms, profitModels, type Project } from "@/lib/projects-data"

interface FilterBarProps {
  platformFilter: string
  profitModelFilter: string
  projects: Project[]
  onPlatformChange: (platform: string) => void
  onProfitModelChange: (profitModel: string) => void
}

// 计算某平台的项目数量
function countPlatformProjects(projects: Project[], platform: string, currentProfitModel: string): number {
  return projects.filter(p => {
    // 如果有变现方式筛选，先过滤
    if (currentProfitModel !== "all" && p.profitModel !== currentProfitModel) {
      return false
    }
    // 平台筛选
    if (platform === "all") return true
    return p.platform.includes(platform)
  }).length
}

// 计算某变现方式的项目数量
function countProfitModelProjects(projects: Project[], profitModel: string, currentPlatform: string): number {
  return projects.filter(p => {
    // 如果有平台筛选，先过滤
    if (currentPlatform !== "all" && !p.platform.includes(currentPlatform)) {
      return false
    }
    // 变现方式筛选
    if (profitModel === "all") return true
    return p.profitModel === profitModel
  }).length
}

// 获取当前筛选条件下可用的平台列表
function getAvailablePlatforms(projects: Project[], currentProfitModel: string): string[] {
  const platformSet = new Set<string>()
  projects.forEach(p => {
    if (currentProfitModel !== "all" && p.profitModel !== currentProfitModel) return
    p.platform.forEach(plat => platformSet.add(plat))
  })
  return Array.from(platformSet)
}

// 获取当前筛选条件下可用的变现方式列表
function getAvailableProfitModels(projects: Project[], currentPlatform: string): string[] {
  const profitSet = new Set<string>()
  projects.forEach(p => {
    if (currentPlatform !== "all" && !p.platform.includes(currentPlatform)) return
    profitSet.add(p.profitModel)
  })
  return Array.from(profitSet)
}

// 官网品牌绿色
const BRAND_GREEN = "#3B796F"
const BRAND_GREEN_LIGHT = "#E8F3F1"

export function FilterBar({
  platformFilter,
  profitModelFilter,
  projects,
  onPlatformChange,
  onProfitModelChange,
}: FilterBarProps) {
  // 计算可用的平台和变现方式
  const availablePlatforms = useMemo(() =>
    getAvailablePlatforms(projects, profitModelFilter),
    [projects, profitModelFilter]
  )
  const availableProfitModels = useMemo(() =>
    getAvailableProfitModels(projects, platformFilter),
    [projects, platformFilter]
  )

  // 过滤出有数据的平台
  const filteredPlatforms = platforms.filter(p =>
    p.id === "all" || availablePlatforms.includes(p.id)
  )

  // 过滤出有数据的变现方式
  const filteredProfitModels = profitModels.filter(p =>
    p.id === "all" || availableProfitModels.includes(p.id)
  )

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="scys-container py-4">
        <div className="flex flex-col gap-4">
          {/* 平台筛选 */}
          <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-xs text-gray-400 shrink-0">
              平台
            </span>
            <div className="flex gap-2">
              {filteredPlatforms.map((platform) => {
                const count = countPlatformProjects(projects, platform.id, profitModelFilter)
                const isActive = platformFilter === platform.id
                const isDisabled = count === 0 && platform.id !== "all"

                return (
                  <button
                    key={platform.id}
                    onClick={() => !isDisabled && onPlatformChange(platform.id)}
                    disabled={isDisabled}
                    className={`
                      px-2.5 py-1 rounded text-sm whitespace-nowrap
                      transition-all duration-200 outline-none border-none focus:outline-none
                      ${isActive
                        ? 'bg-[#E6F3F1] text-[#58A391] font-medium'
                        : 'bg-[#F5F5F7] text-[#6e6e73] hover:bg-[#EBEBF0]'
                      }
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    {platform.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 盈利模式筛选 */}
          <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-xs text-gray-400 shrink-0">
              变现
            </span>
            <div className="flex gap-2">
              {filteredProfitModels.map((profitModel) => {
                const count = countProfitModelProjects(projects, profitModel.id, platformFilter)
                const isActive = profitModelFilter === profitModel.id
                const isDisabled = count === 0 && profitModel.id !== "all"

                return (
                  <button
                    key={profitModel.id}
                    onClick={() => !isDisabled && onProfitModelChange(profitModel.id)}
                    disabled={isDisabled}
                    className={`
                      px-2.5 py-1 rounded text-sm whitespace-nowrap
                      transition-all duration-200 outline-none border-none focus:outline-none
                      ${isActive
                        ? 'bg-[#E6F3F1] text-[#58A391] font-medium'
                        : 'bg-[#F5F5F7] text-[#6e6e73] hover:bg-[#EBEBF0]'
                      }
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    {profitModel.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
