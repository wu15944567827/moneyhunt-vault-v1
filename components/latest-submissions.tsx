"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { Send } from "lucide-react"
import {
  type Project,
  type CaseReferenceItem,
  type ArticleLinkItem,
} from "@/lib/projects-data"

// 刷新图标 - 官网同款
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M14 2.66669V8.00002" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 8V13.3333" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 8C14 4.6863 11.3137 2 8 2C6.30483 2 4.77387 2.70299 3.6827 3.83333M2 8C2 11.3137 4.6863 14 8 14C9.61853 14 11.0874 13.3591 12.1667 12.3173" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}


// 投稿记录类型
interface SubmissionItem {
  title: string
  link?: string
  type: string
  publishTime: string
  author?: string
  authorLink?: string
  projectId: string
  projectTitle: string
}

// 获取相对时间
function getRelativeTime(dateStr: string): string {
  if (!dateStr) return ""

  const date = new Date(dateStr.replace(/\s+/g, 'T'))
  if (isNaN(date.getTime())) return ""

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return ""

  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "刚刚"
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 30) return `${diffDays}天前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  return `${Math.floor(diffDays / 365)}年前`
}

// 判断是否在近1个月内
function isWithinOneMonth(dateStr: string): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr.replace(/\s+/g, 'T'))
  if (isNaN(date.getTime())) return false
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= 30
}

// 允许的投稿类型（不包括帖子）
const ALLOWED_TYPES = ['中标', '风向标', '生财好事', '案例', '线索']

// 从所有项目中提取投稿记录
function extractSubmissions(projects: Project[]): SubmissionItem[] {
  const submissions: SubmissionItem[] = []

  for (const project of projects) {
    const detail = project.detailContent
    if (!detail) continue

    // 只提取案例参考（不提取相关链接/帖子）
    const caseRefs = detail.caseReferences
    if (caseRefs) {
      const allCases: CaseReferenceItem[] = Array.isArray(caseRefs)
        ? caseRefs
        : [...(caseRefs.站内 || []), ...(caseRefs.平台 || [])]

      for (const item of allCases) {
        if (!item.publishTime) continue
        // 过滤：近1个月内
        if (!isWithinOneMonth(item.publishTime)) continue
        // 过滤：去掉帖子类型
        const itemType = item.type || "案例"
        if (itemType === "帖子") continue
        // 过滤：去掉SCBI的投稿
        if (item.author && item.author.includes("SCBI")) continue

        submissions.push({
          title: item.profitDetail || item.caseTitle || "案例分享",
          link: item.link,
          type: itemType,
          publishTime: item.publishTime,
          author: item.author,
          authorLink: item.authorLink,
          projectId: project.id,
          projectTitle: project.title,
        })
      }
    }
  }

  // 按发布时间排序
  return submissions.sort((a, b) => {
    const timeA = new Date(a.publishTime.replace(/\s+/g, 'T')).getTime() || 0
    const timeB = new Date(b.publishTime.replace(/\s+/g, 'T')).getTime() || 0
    return timeB - timeA
  })
}

interface LatestSubmissionsProps {
  projects: Project[]
}

export function LatestSubmissions({ projects }: LatestSubmissionsProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 提取所有投稿记录
  const allSubmissions = useMemo(() => {
    return extractSubmissions(projects)
  }, [projects])

  // 每页显示3条
  const pageSize = 3
  const totalPages = Math.ceil(allSubmissions.length / pageSize)

  // 当前显示的3条
  const displaySubmissions = useMemo(() => {
    const start = currentPage * pageSize
    return allSubmissions.slice(start, start + pageSize)
  }, [allSubmissions, currentPage])

  // 自动轮换（每8秒）
  useEffect(() => {
    if (totalPages <= 1) return

    const interval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages)
    }, 8000)

    return () => clearInterval(interval)
  }, [totalPages])

  // 手动刷新
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setCurrentPage(prev => (prev + 1) % Math.max(1, totalPages))
    setTimeout(() => setIsRefreshing(false), 500)
  }, [totalPages])

  if (displaySubmissions.length === 0) {
    return null
  }

  return (
    <div className="vc-latest-coins">
      {/* header - 官网同款样式 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[15px] font-medium text-gray-900">最新投稿</span>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`text-gray-400 hover:text-[#3B796F] transition-colors disabled:opacity-50 ${isRefreshing ? 'animate-spin' : ''}`}
          title="刷新"
        >
          <RefreshIcon />
        </button>
      </div>

      {/* content - 连续列表 */}
      <div className="bg-white rounded-xl p-3 space-y-1">
        {displaySubmissions.map((item, index) => {
          const relativeTime = getRelativeTime(item.publishTime)

          return (
            <div
              key={`${item.projectId}-${item.publishTime}-${index}`}
              className="py-2 hover:bg-gray-50 rounded-lg px-1"
            >
              {/* post-title - 单行显示 */}
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[13px] text-gray-800 leading-[1.6] truncate hover:text-[#3B796F] transition-colors"
                >
                  {item.title}
                </a>
              ) : (
                <p className="text-[13px] text-gray-800 leading-[1.6] truncate">
                  {item.title}
                </p>
              )}

              {/* info */}
              <div className="flex items-center mt-1.5">
                {/* meta */}
                <div className="flex items-center text-xs text-gray-400 whitespace-nowrap overflow-hidden min-w-0 flex-1">
                  {/* time */}
                  {relativeTime && <span className="shrink-0">{relativeTime}</span>}

                  {/* user */}
                  {item.author && (
                    item.authorLink ? (
                      <a
                        href={item.authorLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3B796F] hover:underline ml-1 shrink-0"
                      >
                        {item.author}
                      </a>
                    ) : (
                      <span className="text-[#3B796F] ml-1 shrink-0">{item.author}</span>
                    )
                  )}

                  {/* action: 给 */}
                  <span style={{ margin: '0 3px' }} className="shrink-0">给</span>

                  {/* author (项目名) */}
                  <Link
                    href={`/project/${item.projectId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3B796F] hover:underline truncate"
                  >
                    {item.projectTitle}
                  </Link>

                  {/* action: 投了 */}
                  <span style={{ marginLeft: '4px' }} className="shrink-0">投了</span>

                  {/* count-number (橙色) */}
                  <span className="text-orange-500 font-medium shrink-0 ml-0.5">1</span>

                  {/* count: 个 + 类型 */}
                  <span className="shrink-0 ml-0.5">个{item.type}</span>

                  {/* 投稿图标 */}
                  <Send className="w-3 h-3 text-[#3B796F] shrink-0 ml-1" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
