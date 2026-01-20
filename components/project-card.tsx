"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  type Project,
  isRead,
  markAsRead,
  getDisplayPlatform,
  getRevenueDisplay,
} from "@/lib/projects-data"

// ========================================
// Apple 风格颜色系统 - 克制的灰度体系
// ========================================
const COLORS = {
  textPrimary: "#1d1d1f",
  textSecondary: "#6e6e73",
  textTertiary: "#86868b",
  bgTag: "#f5f5f7",
}

interface ProjectCardProps {
  project: Project
  onClick?: () => void
  index?: number
}

export function ProjectCard({ project, onClick, index = 0 }: ProjectCardProps) {
  const [hasRead, setHasRead] = useState(false)

  useEffect(() => {
    setHasRead(isRead(project.id))
  }, [project.id])

  const handleClick = () => {
    markAsRead(project.id)
    setHasRead(true)
    onClick?.()
  }

  const revenueDisplay = getRevenueDisplay(project)

  const getRelativeTime = (dateStr: string) => {
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
  const relativeTime = getRelativeTime(project.publishTime)

  return (
    <div className="group">
      <Link
        href={`/project/${project.id}`}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-lg p-5 will-change-transform
                   transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                   hover:scale-[1.015] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]
                   active:scale-[0.98]"
      >
      {/* 标题 - 悬停时颜色变化 */}
      <h3
        className="text-xl font-semibold leading-snug line-clamp-2 mb-2
                   transition-colors duration-300 text-[#1d1d1f] group-hover:text-[#58A391]"
        style={{ letterSpacing: '-0.01em' }}
      >
        {project.title}
      </h3>

      {/* 收入 - Apple风格：深色文字，无背景框 */}
      <div className="mb-4">
        <span
          className="text-sm font-medium"
          style={{ color: COLORS.textPrimary }}
        >
          {revenueDisplay}
        </span>
      </div>

      {/* 图片区域 - Facebook 内阴影方案 */}
      <div className="relative aspect-[16/10] bg-[#f5f5f7] rounded-md overflow-hidden mb-4">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            className="w-full h-full object-cover transition-transform duration-700 ease-out
                       group-hover:scale-105"
            loading="lazy"
            alt={project.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: COLORS.textTertiary }}>
            暂无配图
          </div>
        )}
      </div>

      {/* 底部 - Apple风格：统一灰色标签，无边框 */}
      <div className="flex items-center justify-between">
        {/* 标签区：前2个平台 + 盈利模式 */}
        <div className="flex gap-1.5">
          {project.platform.slice(0, 2).map((p) => (
            <span
              key={p}
              className="px-2.5 py-1 rounded-md text-xs"
              style={{
                color: COLORS.textSecondary,
                backgroundColor: COLORS.bgTag
              }}
            >
              {getDisplayPlatform(p)}
            </span>
          ))}
          <span
            className="px-2.5 py-1 rounded-md text-xs"
            style={{
              color: COLORS.textTertiary,
              backgroundColor: COLORS.bgTag
            }}
          >
            {project.profitModel}
          </span>
        </div>
        {/* 时间 */}
        <span className="text-xs" style={{ color: COLORS.textTertiary }}>
          {relativeTime}
        </span>
      </div>
      </Link>
    </div>
  )
}

// ========================================
// 骨架屏组件
// ========================================
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
      {/* 标题 + 已读 */}
      <div className="flex justify-between mb-3">
        <div className="w-3/4 h-6 rounded bg-gray-100" />
        <div className="w-8 h-4 rounded bg-gray-100" />
      </div>
      {/* 收入标签 */}
      <div className="w-40 h-7 rounded bg-gray-100 mb-4" />
      {/* 图片区域 */}
      <div className="aspect-[16/10] rounded-lg bg-gray-100 mb-4" />
      {/* 描述 */}
      <div className="w-full h-4 rounded bg-gray-100 mb-2" />
      <div className="w-4/5 h-4 rounded bg-gray-100 mb-4" />
      {/* 底部 */}
      <div className="flex justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="w-14 h-5 rounded bg-gray-100" />
          <div className="w-12 h-5 rounded bg-gray-100" />
          <div className="w-10 h-5 rounded bg-gray-100" />
        </div>
        <div className="w-12 h-5 rounded bg-gray-100" />
      </div>
    </div>
  )
}
