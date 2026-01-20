"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Target,
  CheckCircle2,
  Coins,
  CircleDollarSign,
  Lightbulb,
  ListChecks,
  Link2,
  BookOpen,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Send,
} from "lucide-react"
import {
  type Project,
  type CaseReferenceItem,
  type ArticleLinkItem,
  toggleLike,
  isLiked,
  getLikeCount,
  toggleVoyageRequest,
  hasVoyageRequest,
  getVoyageVoteCount,
  sortCaseImages,
  sortCaseReferences,
  sortArticleLinks,
} from "@/lib/projects-data"
import { renderRichText } from "@/lib/rich-text"
import { useToast } from "@/components/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// 计算相对时间（如"3天前"）
function getRelativeTime(dateStr: string): string {
  if (!dateStr) return ""

  // 尝试解析日期，处理多种格式
  let date: Date
  try {
    // 处理 "2025-12-30 09:00" 格式
    const normalized = dateStr.trim().replace(/\s+/g, 'T')
    date = new Date(normalized)

    // 如果解析失败，尝试其他格式
    if (isNaN(date.getTime())) {
      // 尝试仅解析日期部分 "2025-12"
      const datePart = dateStr.split(' ')[0]
      date = new Date(datePart + 'T00:00:00')
    }

    if (isNaN(date.getTime())) return dateStr
  } catch {
    return dateStr
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  // 如果是未来的日期或时差异常，直接返回原始字符串
  if (diffMs < 0) return dateStr

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

// 类型图标组件 - 参考大厂设计
function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "中标":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <g clipPath="url(#clip_zhongbiao)">
            <path d="M6.00047 11.9999C4.77438 11.9999 3.60047 11.6347 2.58308 10.9042C1.27873 9.99119 0.391773 8.60858 0.104817 7.04336C-0.18214 5.47815 0.156991 3.88684 1.09612 2.55641C2.03525 1.22597 3.36569 0.365103 4.95699 0.104233C5.60917 -0.000114346 6.26134 -0.0262013 6.91351 0.0781465C7.30482 0.13032 7.59177 0.521625 7.5396 0.912929C7.48743 1.33032 7.09612 1.61728 6.67873 1.53902C6.18308 1.48684 5.68743 1.48684 5.21786 1.5651C4.04395 1.7738 3.00047 2.42597 2.32221 3.41728C1.97773 3.89924 1.73331 4.44534 1.60338 5.02332C1.47344 5.60131 1.46063 6.19947 1.56569 6.78249C2.00916 9.23467 4.3309 10.8521 6.78308 10.4347C9.23525 9.99119 10.8526 7.66945 10.4353 5.21728C10.357 4.79989 10.6439 4.40858 11.0353 4.35641C11.4526 4.27815 11.8439 4.5651 11.8961 4.95641C12.47 8.21728 10.3048 11.3216 7.04395 11.9216C6.70482 11.9738 6.3396 11.9999 6.00047 11.9999Z" fill="#2D8C7A"/>
            <path d="M6.00011 9.6262C3.99141 9.6262 2.37402 8.00881 2.37402 6.00011C2.37402 3.99141 3.99141 2.37402 6.00011 2.37402H6.20881C6.6262 2.40011 6.93924 2.76533 6.91315 3.15663C6.88707 3.57402 6.52185 3.88707 6.13055 3.86098H6.00011C4.8262 3.86098 3.86098 4.8262 3.86098 6.00011C3.86098 7.17402 4.8262 8.13924 6.00011 8.13924C7.17402 8.13924 8.13924 7.17402 8.13924 6.00011C8.13924 5.58272 8.47837 5.24359 8.89576 5.24359C9.31315 5.24359 9.65228 5.58272 9.65228 6.00011C9.6262 8.00881 7.98272 9.6262 6.00011 9.6262Z" fill="#2D8C7A"/>
            <path d="M5.24316 6.07823C5.24316 6.18443 5.26408 6.28959 5.30472 6.3877C5.34536 6.48582 5.40493 6.57497 5.48003 6.65006C5.55512 6.72516 5.64427 6.78472 5.74239 6.82536C5.8405 6.866 5.94566 6.88692 6.05186 6.88692C6.15806 6.88692 6.26322 6.866 6.36133 6.82536C6.45945 6.78472 6.5486 6.72516 6.62369 6.65006C6.69879 6.57497 6.75836 6.48582 6.799 6.3877C6.83964 6.28959 6.86056 6.18443 6.86056 6.07823C6.86056 5.97203 6.83964 5.86687 6.799 5.76875C6.75836 5.67064 6.69879 5.58149 6.62369 5.50639C6.5486 5.4313 6.45945 5.37173 6.36133 5.33109C6.26322 5.29045 6.15806 5.26953 6.05186 5.26953C5.94566 5.26953 5.8405 5.29045 5.74239 5.33109C5.64427 5.37173 5.55512 5.4313 5.48003 5.50639C5.40493 5.58149 5.34536 5.67064 5.30472 5.76875C5.26408 5.86687 5.24316 5.97203 5.24316 6.07823Z" fill="#2D8C7A"/>
            <path d="M6.13086 5.50417L7.38303 4.252L7.2526 2.50417L9.13086 0.756348L9.39173 2.76504L11.4004 3.02591L9.52216 4.90417L7.90477 4.77374L6.6526 5.89548L6.13086 5.50417Z" fill="#2D8C7A"/>
          </g>
          <defs>
            <clipPath id="clip_zhongbiao">
              <rect width="12" height="12" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      )
    case "风向标":
      return (
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="shrink-0">
          {/* 旗帜图标 */}
          <path d="M2.5 1V11" stroke="#58A391" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M2.5 1.5L9.5 3L2.5 5.5V1.5Z" fill="#58A391"/>
        </svg>
      )
    case "航海":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M14 12H4C3.82319 12 3.65362 12.0703 3.5286 12.1953C3.40357 12.3203 3.33333 12.4899 3.33333 12.6667C3.33333 12.8435 3.40357 13.0131 3.5286 13.1381C3.65362 13.2631 3.82319 13.3334 4 13.3334H14V14.6667H4C3.46957 14.6667 2.96086 14.456 2.58579 14.0809C2.21071 13.7058 2 13.1971 2 12.6667V2.66671C2 2.31309 2.14048 1.97395 2.39052 1.7239C2.64057 1.47385 2.97971 1.33337 3.33333 1.33337H14V12ZM10.6667 6.00004V4.66671H5.33333V6.00004H10.6667Z" fill="#36A590"/>
        </svg>
      )
    case "精华":
      return (
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <path d="M3 2H9L11 4.521L6 10.5714L1 4.521L3 2Z" fill="#FF7D00" stroke="#FF7D00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 5.5L6 8L4 5.5" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case "生财好事":
      return (
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <path stroke="#58A391" strokeLinejoin="round" strokeWidth="1.667" d="M2.5 17.5 6.114 7.193l6.803 6.99z"/>
          <path stroke="#58A391" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.667" d="m9.583 7.917 2.084-2.084q1.666-1.666.416-2.916m0 7.5 2.084-2.084q2.084-2.084 4.166 0"/>
          <path fill="#58A391" d="M8.333 2.917a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667M17.5 2.5a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667m0 9.583a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666m-1.25 3.75a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666"/>
        </svg>
      )
    case "帖子":
      return (
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <path d="M2 1.5C2 1.22386 2.22386 1 2.5 1H7.5L10 3.5V10.5C10 10.7761 9.77615 11 9.5 11H2.5C2.22386 11 2 10.7761 2 10.5V1.5Z" fill="#6B7280" stroke="#6B7280" strokeLinejoin="round"/>
          <path d="M4 5H8" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 7H8" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case "线索":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          {/* 放大镜主体 */}
          <circle cx="6" cy="6" r="4.5" stroke="#6366F1" strokeWidth="1.5" fill="none"/>
          {/* 放大镜中心的闪光点 */}
          <circle cx="4.5" cy="4.5" r="1" fill="#6366F1" opacity="0.4"/>
          {/* 放大镜手柄 */}
          <path d="M9.5 9.5L12.5 12.5" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <circle cx="6" cy="6" r="5" fill="#9CA3AF" stroke="#9CA3AF"/>
        </svg>
      )
  }
}

// 获取类型对应的颜色
function getTypeColor(type: string): string {
  switch (type) {
    case "中标": return "text-[#58A391]"
    case "风向标": return "text-[#58A391]"
    case "航海": return "text-[#58A391]"
    case "精华": return "text-[#FF7D00]"
    case "生财好事": return "text-[#58A391]"
    case "帖子": return "text-gray-500"
    case "线索": return "text-indigo-500"
    default: return "text-gray-400"
  }
}

interface ProjectDetailPageProps {
  project: Project
}

export function ProjectDetailPage({ project }: ProjectDetailPageProps) {
  const router = useRouter()
  const [isLikedState, setIsLikedState] = useState(false) // 点赞状态
  const [likeCount, setLikeCount] = useState(0) // 点赞数
  const [likeAnimating, setLikeAnimating] = useState(false) // 点赞动画状态
  const [hasVoyage, setHasVoyage] = useState(false) // 上航海投票状态
  const [voyageCount, setVoyageCount] = useState(0) // 航海投票数
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false) // 投稿弹窗状态
  const [submitLink, setSubmitLink] = useState("") // 投稿链接输入值
  const [showAllCases, setShowAllCases] = useState(false) // 案例展示区是否展开
  const { showToast } = useToast()

  // 返回处理函数
  const handleBack = () => {
    // 检查是否有历史记录可以返回
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // 如果没有历史记录，直接导航到首页
      router.push('/')
    }
  }

  // 对图片进行排序
  const images = useMemo(() => {
    return sortCaseImages(project.detailContent.caseImages || [])
  }, [project.detailContent.caseImages])

  // 处理案例参考（分组结构）
  const caseReferences = useMemo(() => {
    const refs = project.detailContent.caseReferences
    // 兼容旧的数组格式和新的对象格式
    if (Array.isArray(refs)) {
      return { 站内: sortCaseReferences(refs as CaseReferenceItem[]), 平台: [] }
    }
    return {
      站内: sortCaseReferences(refs?.站内 || []),
      平台: sortCaseReferences(refs?.平台 || []),
    }
  }, [project.detailContent.caseReferences])

  // 处理相关链接（分组结构）
  const relatedLinks = useMemo(() => {
    const links = project.detailContent.relatedLinks
    // 兼容旧的数组格式和新的对象格式
    if (Array.isArray(links)) {
      return { 文章: sortArticleLinks(links as unknown as ArticleLinkItem[]), 政策: [] }
    }
    return {
      文章: sortArticleLinks(links?.文章 || []),
      政策: sortArticleLinks(links?.政策 || []),
    }
  }, [project.detailContent.relatedLinks])

  // 获取所有站内案例（用于图片跳转）
  const allCaseRefs = useMemo(() => {
    return [...caseReferences.站内, ...caseReferences.平台]
  }, [caseReferences])

  // 检查点赞和上航海状态，初始化计数
  useEffect(() => {
    setIsLikedState(isLiked(project.id))
    setLikeCount(getLikeCount(project.id))
    setHasVoyage(hasVoyageRequest(project.id))
    setVoyageCount(getVoyageVoteCount(project.id))
  }, [project.id])

  // 键盘导航 - ESC 返回
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleBack()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  const fallbackList = <T,>(list?: T[], placeholder?: T): T[] =>
    (list && list.length > 0 ? list : (placeholder ? [placeholder] : []))

  const overviewText = project.detailContent.overview || "待补充"
  const whyList = fallbackList(project.detailContent.whyWorthDoing, "待补充")
  const profitList = fallbackList(project.detailContent.howToProfit, "待补充")
  const stepsList = fallbackList(project.detailContent.steps, "待补充")

  // 检查是否有案例参考
  const hasCaseReferences = caseReferences.站内.length > 0 || caseReferences.平台.length > 0
  // 检查是否有相关链接
  const hasRelatedLinks = relatedLinks.文章.length > 0 || relatedLinks.政策.length > 0

  // 点赞切换
  const handleToggleLike = () => {
    const newState = toggleLike(project.id)
    setIsLikedState(newState)
    setLikeCount(getLikeCount(project.id))

    if (newState) {
      // 触发点赞动画
      setLikeAnimating(true)
      setTimeout(() => setLikeAnimating(false), 400)
      const messages = ["赞一个！", "感谢点赞 💪", "已收到你的赞！", "+1 支持！"]
      showToast(messages[Math.floor(Math.random() * messages.length)], "success", "check")
    } else {
      showToast("已取消点赞", "info", "check")
    }
  }

  // 评论（跳转到评论区或显示提示）
  const handleComment = () => {
    showToast("评论功能即将上线，敬请期待！", "info", "check")
  }

  // 上航海投票
  const handleToggleVoyage = () => {
    const newState = toggleVoyageRequest(project.id)
    setHasVoyage(newState)
    setVoyageCount(getVoyageVoteCount(project.id))

    if (newState) {
      const messages = [
        "你的声音我们听到了！",
        "已记录，票数+1！",
        "想学的人越多，越早安排！",
        "收到！我们会优先考虑！"
      ]
      showToast(messages[Math.floor(Math.random() * messages.length)], "success", "check")
    } else {
      showToast("已取消投票", "info", "check")
    }
  }

  // 打开投稿弹窗
  const handleOpenSubmitDialog = () => {
    setSubmitLink("")
    setIsSubmitDialogOpen(true)
  }

  // 提交投稿
  const handleSubmitCase = () => {
    if (!submitLink.trim()) {
      showToast("请输入案例链接", "error", "error")
      return
    }

    // URL格式验证
    try {
      new URL(submitLink.trim())
    } catch {
      showToast("请输入有效的链接地址", "error", "error")
      return
    }

    // 模拟提交成功（实际需对接后端API）
    console.log("投稿链接:", submitLink.trim(), "项目ID:", project.id)
    const successMessages = [
      "太棒了！投稿成功 🎉",
      "感谢分享！你真是太棒了！",
      "已收到，感谢你的贡献！",
      "投稿成功！社区因你更精彩！"
    ]
    showToast(successMessages[Math.floor(Math.random() * successMessages.length)], "success", "check")
    setIsSubmitDialogOpen(false)
    setSubmitLink("")
  }

  // 渲染案例参考项（站内/平台）- 紧凑两行布局
  const renderCaseReferenceItem = (item: CaseReferenceItem, isHighlighted: boolean) => {
    const relativeTime = getRelativeTime(item.publishTime)

    const content = (
      <div className="flex-1 min-w-0">
        {/* 第一行：类型标签（图标+文字） + 标题 */}
        <div className="flex items-center gap-2 mb-1">
          {item.type && (
            <span className="inline-flex items-center gap-1 shrink-0">
              <TypeIcon type={item.type} />
              <span className={`text-xs font-medium ${getTypeColor(item.type)}`}>{item.type}</span>
            </span>
          )}
          <span className={`font-semibold truncate ${isHighlighted ? 'text-[#58A391]' : 'text-gray-900 group-hover:text-[#58A391]'}`}>
            {item.caseTitle}
          </span>
        </div>
        {/* 第二行：作者（可点击） + 时间 + 变现详情 */}
        <div className="text-gray-500 text-sm flex items-center gap-1">
          {item.author && (
            item.authorLink ? (
              <a
                href={item.authorLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-[#5D6E90] hover:text-[#58A391] hover:underline transition-colors font-medium"
              >
                {item.author}
              </a>
            ) : (
              <span className="shrink-0">{item.author}</span>
            )
          )}
          {item.author && relativeTime && <span className="text-gray-300">·</span>}
          {relativeTime && <span className="shrink-0 text-emerald-600">{relativeTime}</span>}
          {item.profitDetail && (
            <>
              <span className="text-gray-300 mx-1">|</span>
              <span className="text-gray-600 truncate flex-1">{item.profitDetail}</span>
            </>
          )}
        </div>
      </div>
    )

    const className = `flex items-center justify-between p-3 rounded-lg text-[15px] border transition-all ${
      isHighlighted
        ? 'bg-[#e6f3f1] border-[#58A391] ring-2 ring-[#58A391] ring-opacity-50 animate-pulse'
        : 'bg-gray-50 border-gray-100 hover:bg-[#e6f3f1] hover:border-[#cce7e3]'
    }`

    if (item.link) {
      return (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`${className} cursor-pointer group`}
        >
          {content}
          <ExternalLink className="w-4 h-4 text-[#58A391] shrink-0 ml-2" />
        </a>
      )
    }

    return <div className={className}>{content}</div>
  }

  // 渲染文章链接项（文章/政策）- 紧凑两行布局
  const renderArticleLinkItem = (item: ArticleLinkItem) => {
    const relativeTime = getRelativeTime(item.publishTime)
    const hasAuthor = item.author && item.author !== '/'

    const content = (
      <div className="flex-1 min-w-0">
        {/* 第一行：类型标签（图标+文字） + 标题 */}
        <div className="flex items-center gap-2 mb-1">
          {item.type && (
            <span className="inline-flex items-center gap-1 shrink-0">
              <TypeIcon type={item.type} />
              <span className={`text-xs font-medium ${getTypeColor(item.type)}`}>{item.type}</span>
            </span>
          )}
          <span className="font-semibold text-gray-900 group-hover:text-[#58A391] truncate">
            {item.title}
          </span>
        </div>
        {/* 第二行：作者（可点击） + 时间 */}
        <div className="text-gray-500 text-sm flex items-center gap-1">
          {hasAuthor && (
            item.authorLink ? (
              <a
                href={item.authorLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-[#5D6E90] hover:text-[#58A391] hover:underline transition-colors font-medium"
              >
                {item.author}
              </a>
            ) : (
              <span className="shrink-0">{item.author}</span>
            )
          )}
          {hasAuthor && relativeTime && <span className="text-gray-300">·</span>}
          {relativeTime && <span className="shrink-0 text-emerald-600">{relativeTime}</span>}
        </div>
      </div>
    )

    const className = "flex items-center justify-between p-3 rounded-lg text-[15px] border transition-all bg-gray-50 border-gray-100 hover:bg-[#e6f3f1] hover:border-[#cce7e3]"

    if (item.link) {
      return (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`${className} cursor-pointer group`}
        >
          {content}
          <ExternalLink className="w-4 h-4 text-[#58A391] shrink-0 ml-2" />
        </a>
      )
    }

    return <div className={className}>{content}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - 悬浮胶囊 */}
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 px-3 py-2 bg-black/60 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-black/80 transition-all shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
      </div>

      {/* 主内容区域 */}
      <main className="max-w-3xl mx-auto pb-20 pt-4">
        <div className="bg-white shadow-sm rounded-t-lg">
              {/* 标题区域 */}
              <div
                data-field-name="title"
                data-field-label="项目标题"
                data-field-content={project.title}
                className="px-5 md:px-8 py-5 border-b border-gray-100"
              >
              {/* 标题行：标题 + 平台标签 */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                {/* 标题 */}
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight flex-1">
                  {project.title}
                </h1>
                {/* 平台标签 */}
                <div className="flex flex-wrap gap-1.5 md:shrink-0">
                  {project.platform.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* 核心亮点 */}
              <div
                data-field-name="highlights"
                data-field-label="核心亮点"
                data-field-content={project.highlights}
                className="inline-block px-4 py-2 bg-[#e6f3f1] border border-[#cce7e3] rounded-lg"
              >
                <p className="text-base text-[#58A391] font-semibold">
                  {project.highlights}
                </p>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="px-5 md:px-8 py-6 space-y-5">
              {/* 这是什么项目 */}
            <section
              data-field-name="overview"
              data-field-label="这是什么项目"
              data-field-content={overviewText}
              className="bg-gradient-to-br from-white to-gray-50/50 rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                <Target className="w-4 h-4 text-[#58A391]" />
                这是什么项目？
              </h2>
              <div className="text-[15px] text-gray-600 leading-relaxed">
                {renderRichText(overviewText)}
              </div>
            </section>

            {/* 案例图文列表 - 公众号风格 */}
            {images.length > 0 && (
              <section className="bg-gradient-to-br from-white to-gray-50/50 rounded-lg p-4 shadow-sm border border-gray-100">
                <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                  <BookOpen className="w-4 h-4 text-[#58A391]" />
                  有哪些案例？
                  {images.length > 3 && (
                    <span className="text-sm font-normal text-gray-400 ml-1">
                      ({images.length}个)
                    </span>
                  )}
                </h2>
                <div className="space-y-4">
                  {(showAllCases ? images : images.slice(0, 3)).map((img, index) => {
                    // 通过 order 找到对应的案例参考，获取发布人信息
                    const matchedRef = allCaseRefs.find(ref => ref.order === img.order)
                    const author = matchedRef?.author
                    const authorLink = matchedRef?.authorLink

                    return (
                      <div key={index} className="group">
                        {/* 案例卡片 - 两行布局 */}
                        <div className="mb-2">
                          {/* 第一行：发布者 · 时间 */}
                          {(author || img.publishTime) && (
                            <div className="mb-1 flex items-center">
                              {author && (
                                authorLink ? (
                                  <a
                                    href={authorLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[15px] text-[#5D6E90] hover:text-[#58A391] transition-colors"
                                  >
                                    {author}
                                  </a>
                                ) : (
                                  <span className="text-[15px] text-[#5D6E90]">{author}</span>
                                )
                              )}
                              {author && img.publishTime && <span className="text-[#86868b] mx-1.5">·</span>}
                              {img.publishTime && (
                                <span className="text-[13px] text-[#86868b]">{getRelativeTime(img.publishTime)}</span>
                              )}
                            </div>
                          )}
                          {/* 第二行：类型标签 标题：变现详情 */}
                          <div className="flex items-start gap-2">
                            {img.type && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#E8F5F1] rounded text-xs shrink-0">
                                <TypeIcon type={img.type} />
                                <span className="text-[#2D8C7A] font-medium">{img.type}</span>
                              </span>
                            )}
                            {img.caseTitle && (
                              matchedRef?.link ? (
                                <a
                                  href={matchedRef.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-[15px] text-[#1d1d1f] hover:text-[#58A391] transition-colors leading-snug"
                                >
                                  {img.caseTitle}{img.profitDetail && `：${img.profitDetail}`}
                                </a>
                              ) : (
                                <span className="font-semibold text-[15px] text-[#1d1d1f] leading-snug">
                                  {img.caseTitle}{img.profitDetail && `：${img.profitDetail}`}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        {/* 图片 */}
                        <div className="relative w-full overflow-hidden rounded-lg border border-gray-100">
                          <Image
                            src={img.imageUrl || "/placeholder.svg"}
                            alt={img.caseTitle || `${project.title} - 案例${img.order}`}
                            width={800}
                            height={600}
                            className="w-full h-auto"
                            priority={index === 0}
                          />
                        </div>
                        {/* 分隔线 - 非最后一个才显示 */}
                        {index < (showAllCases ? images.length : Math.min(images.length, 3)) - 1 && (
                          <div className="border-b border-gray-100 mt-4" />
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* 查看更多/收起按钮 */}
                {images.length > 3 && (
                  <button
                    onClick={() => setShowAllCases(!showAllCases)}
                    className="w-full mt-5 py-3 text-[15px] font-medium text-[#58A391] bg-[#e6f3f1] hover:bg-[#d9efec] rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    {showAllCases ? (
                      <>
                        收起
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        查看更多 ({images.length - 3}个)
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </section>
            )}

            {/* 为什么值得做 */}
            <section
              data-field-name="whyWorthDoing"
              data-field-label="为什么值得做"
              data-field-content={whyList.join("\n")}
              className="bg-gradient-to-br from-[#e6f3f1] to-[#f0f8f7] rounded-lg p-4 border border-[#cce7e3]"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                <Lightbulb className="w-4 h-4 text-[#58A391]" />
                为什么值得做？
              </h2>
              <div className="space-y-3">
                {whyList.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-[15px] text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#58A391] shrink-0 mt-0.5" />
                    <span className="flex-1">{renderRichText(item)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 怎么赚钱 */}
            <section
              data-field-name="howToProfit"
              data-field-label="怎么赚钱"
              data-field-content={profitList.join("\n")}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                <CircleDollarSign className="w-4 h-4 text-amber-500" />
                怎么赚钱？
              </h2>
              <div className="space-y-3">
                {profitList.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-[15px] text-gray-700">
                    <span className="text-amber-500 font-bold shrink-0">¥</span>
                    <span className="flex-1">{renderRichText(item)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 成本和收益 */}
            <section
              data-field-name="costAndRevenue"
              data-field-label="成本和收益"
              data-field-content={`启动成本: ${project.detailContent.costAndRevenue.startupCost}\n预期收益: ${project.detailContent.costAndRevenue.expectedRevenue}\n回本周期: ${project.detailContent.costAndRevenue.paybackPeriod}`}
              className="bg-gradient-to-br from-white to-gray-50/50 rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                <Coins className="w-4 h-4 text-[#58A391]" />
                能赚多少？
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 shrink-0 w-20 text-sm font-medium">启动成本</span>
                  <span className="text-[15px] text-gray-700 flex-1">
                    {renderRichText(project.detailContent.costAndRevenue.startupCost || "待补充")}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 shrink-0 w-20 text-sm font-medium">预期收益</span>
                  <span className="text-[15px] text-gray-700 flex-1">
                    {renderRichText(project.detailContent.costAndRevenue.expectedRevenue || "待补充")}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 shrink-0 w-20 text-sm font-medium">回本周期</span>
                  <span className="text-[15px] text-gray-700 flex-1">
                    {renderRichText(project.detailContent.costAndRevenue.paybackPeriod || "待补充")}
                  </span>
                </div>
              </div>
            </section>

            {/* 怎么做 */}
            <section
              data-field-name="steps"
              data-field-label="怎么做"
              data-field-content={stepsList.join("\n")}
              className="bg-gradient-to-br from-[#f0f8f7] to-white rounded-lg p-4 shadow-sm border border-[#e6f3f1]"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                <ListChecks className="w-4 h-4 text-[#58A391]" />
                怎么做？
              </h2>
              <div className="space-y-4">
                {stepsList.map((step, index) => (
                  <div key={index} className="flex gap-4 text-[15px] text-gray-700">
                    <span className="text-white font-bold shrink-0 w-7 h-7 flex items-center justify-center bg-[#58A391] rounded-full text-sm">
                      {index + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{renderRichText(step)}</span>
                  </div>
                ))}
              </div>
            </section>


            {/* 相关链接 */}
            {hasRelatedLinks && (
              <section
                data-field-name="relatedLinks"
                data-field-label="相关链接"
                data-field-content={[...relatedLinks.文章, ...relatedLinks.政策].map(r => r.title).join("\n")}
                className="bg-gradient-to-br from-white to-gray-50/50 rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                  <Link2 className="w-4 h-4 text-[#58A391]" />
                  去哪里学习？
                </h2>

                {/* 政策（放在前面） */}
                {relatedLinks.政策.length > 0 && (
                  <div className="space-y-2">
                    {relatedLinks.文章.length > 0 && (
                      <h3 className="text-sm font-medium text-gray-500 mb-2">政策</h3>
                    )}
                    {relatedLinks.政策.map((item, idx) => (
                      <div key={idx}>
                        {renderArticleLinkItem(item)}
                      </div>
                    ))}
                  </div>
                )}

                {/* 文章（放在后面） */}
                {relatedLinks.文章.length > 0 && (
                  <div className={relatedLinks.政策.length > 0 ? "mt-4 space-y-2" : "space-y-2"}>
                    {relatedLinks.政策.length > 0 && (
                      <h3 className="text-sm font-medium text-gray-500 mb-2">文章</h3>
                    )}
                    {relatedLinks.文章.map((item, idx) => (
                      <div key={idx}>
                        {renderArticleLinkItem(item)}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            </div>
        </div>
      </main>

      {/* 底部固定操作栏 - 品牌绿色悬浮胶囊 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 p-1.5 bg-[#58A391]/90 backdrop-blur-xl rounded-full shadow-2xl">
          {/* 点赞 */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
              isLikedState
                ? "bg-white text-[#58A391]"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
            title={`${likeCount}人点赞`}
          >
            <ThumbsUp
              className={`w-[18px] h-[18px] transition-transform ${
                isLikedState ? "fill-[#58A391]" : ""
              } ${likeAnimating ? "scale-125" : ""}`}
            />
            <span className="text-sm font-medium tabular-nums">{likeCount}</span>
          </button>

          {/* 分隔线 */}
          <div className="w-px h-5 bg-white/20" />

          {/* 评论 */}
          <button
            onClick={handleComment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
            title="评论"
          >
            <MessageCircle className="w-[18px] h-[18px]" />
            <span className="text-sm font-medium">评论</span>
          </button>

          {/* 分隔线 */}
          <div className="w-px h-5 bg-white/20" />

          {/* 上航海 - 核心 CTA */}
          <button
            onClick={handleToggleVoyage}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
              hasVoyage
                ? "bg-white text-[#58A391]"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
            title={`${voyageCount}人想学`}
          >
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" className="shrink-0">
              <path d="M3.66671 9.53335V3.66669C3.66671 3.16043 4.07712 2.75002 4.58337 2.75002H9.16671V0.916687H12.8334V2.75002H17.4167C17.923 2.75002 18.3334 3.16043 18.3334 3.66669V9.53335L19.3286 9.83191C19.7977 9.97262 20.0733 10.4572 19.9545 10.9323L18.564 16.4943C18.4876 16.4981 18.4107 16.5 18.3334 16.5C16.8341 16.5 15.5029 15.7802 14.6667 14.6671C13.8305 15.7802 12.4993 16.5 11 16.5C9.50074 16.5 8.16958 15.7802 7.33337 14.6671C6.49716 15.7802 5.16601 16.5 3.66671 16.5C3.58938 16.5 3.51251 16.4981 3.43612 16.4943L2.0456 10.9323C1.92683 10.4572 2.20244 9.97262 2.67149 9.83191L3.66671 9.53335ZM5.50004 8.98335L11 7.33335L13.5246 8.09074L15.1825 8.58811L16.5 8.98335V4.58335H5.50004V8.98335ZM3.66671 18.3334C5.07536 18.3334 6.36032 17.8038 7.33337 16.9329C8.30642 17.8038 9.5914 18.3334 11 18.3334C12.4087 18.3334 13.6937 17.8038 14.6667 16.9329C15.6397 17.8038 16.9247 18.3334 18.3334 18.3334H20.1667V20.1667H18.3334C16.9977 20.1667 15.7453 19.8096 14.6667 19.1856C13.5881 19.8096 12.3357 20.1667 11 20.1667C9.66437 20.1667 8.41201 19.8096 7.33337 19.1856C6.25474 19.8096 5.00243 20.1667 3.66671 20.1667H1.83337V18.3334H3.66671Z" fill={hasVoyage ? "#58A391" : "currentColor"}/>
            </svg>
            <span className="text-sm font-medium">{hasVoyage ? "已投票" : "上航海"}</span>
            {voyageCount > 0 && (
              <span className={`text-sm ${hasVoyage ? "text-[#58A391]/60" : "text-white/50"}`}>
                {voyageCount}
              </span>
            )}
          </button>

          {/* 分隔线 */}
          <div className="w-px h-5 bg-white/20" />

          {/* 投稿 */}
          <button
            onClick={handleOpenSubmitDialog}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
            title="投稿案例"
          >
            <Send className="w-[18px] h-[18px]" />
            <span className="text-sm font-medium">投稿</span>
          </button>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© 2025 生财有术 · 项目库 | 新项目，新机会，持续更新</p>
        </div>
      </footer>

      {/* 投稿弹窗 - 更有趣的设计 */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#58A391]" />
              投稿案例
            </DialogTitle>
            <DialogDescription className="text-base">
              发现了与「<span className="font-medium text-gray-700">{project.title}</span>」相关的好案例？分享给大家吧！
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Input
                placeholder="粘贴案例链接，如 https://..."
                value={submitLink}
                onChange={(e) => setSubmitLink(e.target.value)}
                className="w-full h-11 text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitCase()
                  }
                }}
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">可以投稿什么？</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-[#58A391] rounded-full"></span>
                  生财有术社区精华帖、中标帖
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-[#58A391] rounded-full"></span>
                  小红书、抖音上的实操案例
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-[#58A391] rounded-full"></span>
                  公众号、知乎等平台的深度分析文章
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmitCase}
              className="bg-[#58A391] hover:bg-[#4A9080] gap-1.5"
            >
              <Send className="w-4 h-4" />
              提交投稿
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
