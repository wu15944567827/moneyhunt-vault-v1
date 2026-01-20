"use client"

import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import Image from "next/image"
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Target,
  CheckCircle2,
  Coins,
  CircleDollarSign,
  Lightbulb,
  ListChecks,
  Link2,
  BookOpen,
  ExternalLink,
  Heart,
  Share2,
} from "lucide-react"
import {
  type Project,
  type CaseImage,
  type CaseReferenceItem,
  type ArticleLinkItem,
  toggleFavorite,
  isFavorite,
  sortCaseImages,
  sortCaseReferences,
  sortArticleLinks,
} from "@/lib/projects-data"
import { renderRichText } from "@/lib/rich-text"
import { useToast } from "@/components/toast"
import { RightClickAnnotation } from "@/components/right-click-annotation"

// 计算相对时间（如"3天前"）
function getRelativeTime(dateStr: string): string {
  if (!dateStr) return ""

  // 尝试解析日期
  const date = new Date(dateStr.replace(/\s+/g, 'T'))
  if (isNaN(date.getTime())) return dateStr

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffMins < 1) return "刚刚"
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 30) return `${diffDays}天前`
  if (diffMonths < 12) return `${diffMonths}个月前`
  return `${diffYears}年前`
}

// 类型图标组件 - 参考大厂设计
function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "中标":
      return (
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <g clipPath="url(#clip_zhongbiao)">
            <path d="M6.00047 11.9999C4.77438 11.9999 3.60047 11.6347 2.58308 10.9042C1.27873 9.99119 0.391773 8.60858 0.104817 7.04336C-0.18214 5.47815 0.156991 3.88684 1.09612 2.55641C2.03525 1.22597 3.36569 0.365103 4.95699 0.104233C5.60917 -0.000114346 6.26134 -0.0262013 6.91351 0.0781465C7.30482 0.13032 7.59177 0.521625 7.5396 0.912929C7.48743 1.33032 7.09612 1.61728 6.67873 1.53902C6.18308 1.48684 5.68743 1.48684 5.21786 1.5651C4.04395 1.7738 3.00047 2.42597 2.32221 3.41728C1.97773 3.89924 1.73331 4.44534 1.60338 5.02332C1.47344 5.60131 1.46063 6.19947 1.56569 6.78249C2.00916 9.23467 4.3309 10.8521 6.78308 10.4347C9.23525 9.99119 10.8526 7.66945 10.4353 5.21728C10.357 4.79989 10.6439 4.40858 11.0353 4.35641C11.4526 4.27815 11.8439 4.5651 11.8961 4.95641C12.47 8.21728 10.3048 11.3216 7.04395 11.9216C6.70482 11.9738 6.3396 11.9999 6.00047 11.9999Z" fill="#3B796F"/>
            <path d="M6.00011 9.6262C3.99141 9.6262 2.37402 8.00881 2.37402 6.00011C2.37402 3.99141 3.99141 2.37402 6.00011 2.37402H6.20881C6.6262 2.40011 6.93924 2.76533 6.91315 3.15663C6.88707 3.57402 6.52185 3.88707 6.13055 3.86098H6.00011C4.8262 3.86098 3.86098 4.8262 3.86098 6.00011C3.86098 7.17402 4.8262 8.13924 6.00011 8.13924C7.17402 8.13924 8.13924 7.17402 8.13924 6.00011C8.13924 5.58272 8.47837 5.24359 8.89576 5.24359C9.31315 5.24359 9.65228 5.58272 9.65228 6.00011C9.6262 8.00881 7.98272 9.6262 6.00011 9.6262Z" fill="#3B796F"/>
            <path d="M5.24316 6.07823C5.24316 6.18443 5.26408 6.28959 5.30472 6.3877C5.34536 6.48582 5.40493 6.57497 5.48003 6.65006C5.55512 6.72516 5.64427 6.78472 5.74239 6.82536C5.8405 6.866 5.94566 6.88692 6.05186 6.88692C6.15806 6.88692 6.26322 6.866 6.36133 6.82536C6.45945 6.78472 6.5486 6.72516 6.62369 6.65006C6.69879 6.57497 6.75836 6.48582 6.799 6.3877C6.83964 6.28959 6.86056 6.18443 6.86056 6.07823C6.86056 5.97203 6.83964 5.86687 6.799 5.76875C6.75836 5.67064 6.69879 5.58149 6.62369 5.50639C6.5486 5.4313 6.45945 5.37173 6.36133 5.33109C6.26322 5.29045 6.15806 5.26953 6.05186 5.26953C5.94566 5.26953 5.8405 5.29045 5.74239 5.33109C5.64427 5.37173 5.55512 5.4313 5.48003 5.50639C5.40493 5.58149 5.34536 5.67064 5.30472 5.76875C5.26408 5.86687 5.24316 5.97203 5.24316 6.07823Z" fill="#3B796F"/>
            <path d="M6.13086 5.50417L7.38303 4.252L7.2526 2.50417L9.13086 0.756348L9.39173 2.76504L11.4004 3.02591L9.52216 4.90417L7.90477 4.77374L6.6526 5.89548L6.13086 5.50417Z" fill="#3B796F"/>
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
          <path d="M2.5 1V11" stroke="#3B796F" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M2.5 1.5L9.5 3L2.5 5.5V1.5Z" fill="#3B796F"/>
        </svg>
      )
    case "航海":
      return (
        <svg width="14" height="14" viewBox="0 0 22 22" fill="none" className="shrink-0">
          <path d="M3.66671 9.53335V3.66669C3.66671 3.16043 4.07712 2.75002 4.58337 2.75002H9.16671V0.916687H12.8334V2.75002H17.4167C17.923 2.75002 18.3334 3.16043 18.3334 3.66669V9.53335L19.3286 9.83191C19.7977 9.97262 20.0733 10.4572 19.9545 10.9323L18.564 16.4943C18.4876 16.4981 18.4107 16.5 18.3334 16.5C16.8341 16.5 15.5029 15.7802 14.6667 14.6671C13.8305 15.7802 12.4993 16.5 11 16.5C9.50074 16.5 8.16958 15.7802 7.33337 14.6671C6.49716 15.7802 5.16601 16.5 3.66671 16.5C3.58938 16.5 3.51251 16.4981 3.43612 16.4943L2.0456 10.9323C1.92683 10.4572 2.20244 9.97262 2.67149 9.83191L3.66671 9.53335ZM5.50004 8.98335L11 7.33335L13.5246 8.09074L15.1825 8.58811L16.5 8.98335V4.58335H5.50004V8.98335ZM3.66671 18.3334C5.07536 18.3334 6.36032 17.8038 7.33337 16.9329C8.30642 17.8038 9.5914 18.3334 11 18.3334C12.4087 18.3334 13.6937 17.8038 14.6667 16.9329C15.6397 17.8038 16.9247 18.3334 18.3334 18.3334H20.1667V20.1667H18.3334C16.9977 20.1667 15.7453 19.8096 14.6667 19.1856C13.5881 19.8096 12.3357 20.1667 11 20.1667C9.66437 20.1667 8.41201 19.8096 7.33337 19.1856C6.25474 19.8096 5.00243 20.1667 3.66671 20.1667H1.83337V18.3334H3.66671Z" fill="#3B796F"/>
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
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <circle cx="6" cy="6" r="5" fill="#F59E0B" stroke="#F59E0B"/>
          <path d="M6 3V6.5L8 8" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
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
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <circle cx="6" cy="5" r="3" fill="#9CA3AF" stroke="#9CA3AF"/>
          <path d="M6 8V11" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
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
    case "中标": return "text-[#3B796F]"
    case "风向标": return "text-[#3B796F]"
    case "航海": return "text-[#3B796F]"
    case "精华": return "text-[#FF7D00]"
    case "生财好事": return "text-[#F59E0B]"
    case "帖子": return "text-gray-500"
    case "线索": return "text-gray-400"
    default: return "text-gray-400"
  }
}

interface ProjectDetailModalProps {
  project: Project
  onClose: () => void
}

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [isImageFullscreen, setIsImageFullscreen] = useState(false)
  const [isPaused, setIsPaused] = useState(false) // 手动介入后暂停轮播
  const [highlightedCaseOrder, setHighlightedCaseOrder] = useState<number | null>(null) // 高亮的案例序号
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null) // 用于自动恢复轮播
  const { showToast } = useToast()

  // 滑动手势相关
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

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

  // 根据序号获取对应的案例信息（作者、时间等）
  const getCaseInfoByOrder = useCallback((order: number) => {
    const ref = allCaseRefs.find(r => r.order === order)
    return ref || null
  }, [allCaseRefs])

  // 自动轮播 - 4秒切换，手动介入后暂停
  useEffect(() => {
    if (images.length <= 1 || isPaused || isImageFullscreen) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [images.length, isPaused, isImageFullscreen])

  // 手动操作后8秒自动恢复轮播
  useEffect(() => {
    if (isPaused && !isImageFullscreen) {
      pauseTimeoutRef.current = setTimeout(() => {
        setIsPaused(false)
      }, 8000)
    }
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
      }
    }
  }, [isPaused, isImageFullscreen])

  // 检查收藏状态
  useEffect(() => {
    setIsFav(isFavorite(project.id))
  }, [project.id])

  const nextImage = useCallback((manual = false) => {
    if (manual) setIsPaused(true) // 手动操作时暂停自动轮播
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback((manual = false) => {
    if (manual) setIsPaused(true) // 手动操作时暂停自动轮播
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // 处理滑动手势
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50 // 滑动阈值
    if (diff > threshold) {
      nextImage(true) // 左滑，下一张
    } else if (diff < -threshold) {
      prevImage(true) // 右滑，上一张
    }
  }

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isImageFullscreen) {
          setIsImageFullscreen(false)
        } else {
          onClose()
        }
      }
      if (e.key === "ArrowLeft") prevImage(true)
      if (e.key === "ArrowRight") nextImage(true)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, prevImage, nextImage, isImageFullscreen])

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

  // 禁止背景滚动
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  // 跳转到案例参考
  const scrollToCaseReference = (order: number) => {
    const targetElement = document.getElementById(`case-ref-${order}`)
    if (targetElement) {
      // 滚动到目标元素
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 设置高亮
      setHighlightedCaseOrder(order)
      // 1秒后取消高亮
      setTimeout(() => {
        setHighlightedCaseOrder(null)
      }, 1000)
    }
  }

  // 根据序号获取对应的外部链接
  const getCaseLinkByOrder = (order: number): string | null => {
    const ref = allCaseRefs.find(r => r.order === order)
    return ref?.link || null
  }

  // 收藏切换
  const handleToggleFavorite = () => {
    const newState = toggleFavorite(project.id)
    setIsFav(newState)
    if (newState) {
      showToast("已收藏", "success", "heart")
    } else {
      showToast("已取消收藏", "info", "heart")
    }
  }

  // 分享功能
  const handleShare = async () => {
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.summary,
          url: shareUrl,
        })
        return
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.warn('Web Share API failed:', error)
        }
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        showToast("链接已复制", "success", "link")
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (success) {
          showToast("链接已复制", "success", "link")
        } else {
          showToast("复制失败，请手动复制", "error", "error")
        }
      }
    } catch (error) {
      console.error('复制链接失败:', error)
      showToast("复制失败，请手动复制", "error", "error")
    }
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
          <span className={`font-semibold truncate ${isHighlighted ? 'text-[#3B796F]' : 'text-gray-900 group-hover:text-[#3B796F]'}`}>
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
                className="shrink-0 text-gray-600 hover:text-[#3B796F] hover:underline transition-colors font-medium"
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
        ? 'bg-[#e6f3f1] border-[#3B796F] ring-2 ring-[#3B796F] ring-opacity-50 animate-pulse'
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
          <ExternalLink className="w-4 h-4 text-[#3B796F] shrink-0 ml-2" />
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
          <span className="font-semibold text-gray-900 group-hover:text-[#3B796F] truncate">
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
                className="shrink-0 text-gray-600 hover:text-[#3B796F] hover:underline transition-colors font-medium"
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
          <ExternalLink className="w-4 h-4 text-[#3B796F] shrink-0 ml-2" />
        </a>
      )
    }

    return <div className={className}>{content}</div>
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-gray-50 my-4 md:my-8 mx-4 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <RightClickAnnotation projectId={project.id}>
          {/* 图片轮播区域 */}
          <div className="relative">
            <div
              data-field-name="images"
              data-field-label="图片"
              data-field-content={images.map(img => img.imageUrl).join("\n")}
              className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            >
            {/* 滑动容器 */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentImageIndex * 100}%)`,
                height: '100%'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {images.map((img, index) => {
                return (
                  <div
                    key={index}
                    className="relative flex-shrink-0 cursor-pointer"
                    style={{ minWidth: '100%', height: '100%' }}
                    onClick={() => {
                      setIsPaused(true)
                      setIsImageFullscreen(true)
                    }}
                  >
                    <Image
                      src={img.imageUrl || "/placeholder.svg"}
                      alt={img.caseTitle || `${project.title} - 案例${img.order}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 768px"
                      priority={index === 0}
                    />
                  </div>
                )
              })}
            </div>

            {/* 左上角 FOMO 实时信息条 - 精致小巧 */}
            {(() => {
              const currentImg = images[currentImageIndex]
              if (!currentImg) return null
              const caseInfo = getCaseInfoByOrder(currentImg.order)
              const authorName = caseInfo?.author || ""
              const authorLink = caseInfo?.authorLink || ""
              const relativeTime = getRelativeTime(currentImg.publishTime)
              const caseType = currentImg.type || caseInfo?.type || ""

              return (
                <div className="absolute top-3 left-3 z-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-xs">
                    {caseType && <TypeIcon type={caseType} />}
                    {authorName && (
                      authorLink ? (
                        <a
                          href={authorLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-white font-medium hover:text-[#3B796F] transition-colors"
                        >
                          {authorName}
                        </a>
                      ) : (
                        <span className="text-white font-medium">{authorName}</span>
                      )
                    )}
                    {relativeTime && (
                      <span className="text-emerald-400 font-medium">{relativeTime}发布</span>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* 右上角图片计数器 */}
            {images.length > 1 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium z-10">
                {currentImageIndex + 1}/{images.length}
              </div>
            )}

            {/* 底部标题条 - 精简 */}
            {(() => {
              const currentImg = images[currentImageIndex]
              if (!currentImg?.caseTitle) return null

              return (
                <div
                  className="absolute bottom-0 inset-x-0 px-4 py-2.5 bg-gradient-to-t from-black/80 to-transparent cursor-pointer z-[5]"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (currentImg.order > 0) {
                      scrollToCaseReference(currentImg.order)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm truncate flex-1">{currentImg.caseTitle}</h3>
                    {currentImg.order > 0 && (
                      <ChevronDown className="w-4 h-4 text-white/70 ml-2 shrink-0" />
                    )}
                  </div>
                </div>
              )
            })()}

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage(true)
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors z-10"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage(true)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                {/* 底部指示点 - 在标题上方 */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsPaused(true)
                        setCurrentImageIndex(index)
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white w-4"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          </div>

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
              <p className="text-base text-[#3B796F] font-semibold">
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
            className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <Target className="w-5 h-5 text-[#3B796F]" />
              这是什么项目？
            </h2>
            <div className="text-[15px] text-gray-600 leading-relaxed">
              {renderRichText(overviewText)}
            </div>
          </section>

          {/* 为什么值得做 */}
          <section
            data-field-name="whyWorthDoing"
            data-field-label="为什么值得做"
            data-field-content={whyList.join("\n")}
            className="bg-gradient-to-br from-[#e6f3f1] to-[#f0f8f7] rounded-xl p-5 border border-[#cce7e3]"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <Lightbulb className="w-5 h-5 text-[#3B796F]" />
              为什么值得做？
            </h2>
            <div className="space-y-3">
              {whyList.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-[15px] text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#3B796F] shrink-0 mt-0.5" />
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
            className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-100"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <CircleDollarSign className="w-5 h-5 text-amber-500" />
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
            className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <Coins className="w-5 h-5 text-[#3B796F]" />
              成本和收益
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
            className="bg-gradient-to-br from-[#f0f8f7] to-white rounded-xl p-5 shadow-sm border border-[#e6f3f1]"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <ListChecks className="w-5 h-5 text-[#3B796F]" />
              怎么做？
            </h2>
            <div className="space-y-4">
              {stepsList.map((step, index) => (
                <div key={index} className="flex gap-4 text-[15px] text-gray-700">
                  <span className="text-white font-bold shrink-0 w-7 h-7 flex items-center justify-center bg-[#3B796F] rounded-full text-sm">
                    {index + 1}
                  </span>
                  <span className="flex-1 pt-0.5">{renderRichText(step)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 案例参考 */}
          {hasCaseReferences && (
            <section
              data-field-name="caseReferences"
              data-field-label="案例参考"
              data-field-content={allCaseRefs.map(r => r.caseTitle).join("\n")}
              className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                <BookOpen className="w-5 h-5 text-[#3B796F]" />
                案例参考
              </h2>

              {/* 站内案例 */}
              {caseReferences.站内.length > 0 && (
                <div className="space-y-3">
                  {caseReferences.平台.length > 0 && (
                    <h3 className="text-sm font-medium text-gray-500 mb-2">站内</h3>
                  )}
                  {caseReferences.站内.map((item, idx) => (
                    <div key={idx} id={`case-ref-${item.order}`}>
                      {renderCaseReferenceItem(item, highlightedCaseOrder === item.order)}
                    </div>
                  ))}
                </div>
              )}

              {/* 平台案例 */}
              {caseReferences.平台.length > 0 && (
                <div className={caseReferences.站内.length > 0 ? "mt-4 space-y-3" : "space-y-3"}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">平台</h3>
                  {caseReferences.平台.map((item, idx) => (
                    <div key={idx} id={`case-ref-platform-${item.order}`}>
                      {renderCaseReferenceItem(item, false)}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 相关链接 */}
          {hasRelatedLinks && (
            <section
              data-field-name="relatedLinks"
              data-field-label="相关链接"
              data-field-content={[...relatedLinks.文章, ...relatedLinks.政策].map(r => r.title).join("\n")}
              className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                <Link2 className="w-5 h-5 text-[#3B796F]" />
                相关链接
              </h2>

              {/* 文章 */}
              {relatedLinks.文章.length > 0 && (
                <div className="space-y-2">
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

              {/* 政策 */}
              {relatedLinks.政策.length > 0 && (
                <div className={relatedLinks.文章.length > 0 ? "mt-4 space-y-2" : "space-y-2"}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">政策</h3>
                  {relatedLinks.政策.map((item, idx) => (
                    <div key={idx}>
                      {renderArticleLinkItem(item)}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 底部操作栏 */}
          <div className="flex items-center justify-center gap-4 pt-4 pb-2">
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                isFav
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-red-500" : ""}`} />
              <span>{isFav ? "已收藏" : "收藏"}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </button>
          </div>
          </div>
        </RightClickAnnotation>
      </div>

      {/* 全屏图片查看器 */}
      {isImageFullscreen && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
          onClick={() => setIsImageFullscreen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setIsImageFullscreen(false)}
            className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* 图片 */}
          <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <Image
              src={images[currentImageIndex]?.imageUrl || "/placeholder.svg"}
              alt={images[currentImageIndex]?.caseTitle || `${project.title} - 案例${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              onClick={(e) => e.stopPropagation()}
            />
            {/* 右下角案例角标 */}
            {(() => {
              const currentImg = images[currentImageIndex]
              if (!currentImg || currentImg.order <= 0) return null

              const caseLink = getCaseLinkByOrder(currentImg.order)

              if (caseLink) {
                return (
                  <a
                    href={caseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-base font-medium rounded-lg z-10 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <span>案例{currentImg.order}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )
              }

              return (
                <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-base font-medium rounded-lg z-10">
                  案例{currentImg.order}
                </div>
              )
            })()}
          </div>

          {/* 左右切换按钮 */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage(true)
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage(true)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* 图片计数 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
