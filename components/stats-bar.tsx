"use client"

import { useEffect, useState, useRef } from "react"
import { Calendar, TrendingUp, Zap } from "lucide-react"
import type { Project } from "@/lib/projects-data"

// 精细化数字跳动动画组件
function AnimatedNumber({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const prevValueRef = useRef(0)

  useEffect(() => {
    const numValue = typeof value === "string" ? parseInt(value) || 0 : value
    const startValue = prevValueRef.current
    const duration = 1200 // 1.2秒，更平滑
    const startTime = performance.now()

    // 使用 easeOutExpo 缓动函数，更高端的动画效果
    const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)

      const current = Math.round(startValue + (numValue - startValue) * easedProgress)
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        prevValueRef.current = numValue
      }
    }

    requestAnimationFrame(animate)
    return () => setIsAnimating(false)
  }, [value])

  return (
    <span
      className={`tabular-nums tracking-tight ${isAnimating ? "opacity-90" : "opacity-100"}`}
      style={{ fontFeatureSettings: '"tnum"' }}
    >
      {displayValue.toLocaleString()}{suffix}
    </span>
  )
}

// 格式化时间（去掉年份）
function formatLatestTime(timeStr: string): string {
  const date = new Date(timeStr.replace(/\s+/g, 'T'))
  if (isNaN(date.getTime())) return timeStr
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

// 时间显示组件（带渐入动画）
function AnimatedTime({ time }: { time: string }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <span
      className={`tabular-nums transition-all duration-700 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
      style={{ fontFeatureSettings: '"tnum"' }}
    >
      {time}
    </span>
  )
}

// 精细图标容器组件
function IconBox({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-black/5 transition-all duration-500 ${
        show ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      {children}
    </div>
  )
}

interface StatsBarProps {
  projects: Project[]
}

export function StatsBar({ projects }: StatsBarProps) {
  // 判断是否是本周新增（7天内）
  const isThisWeek = (publishTime: string) => {
    const now = new Date()
    const pubDate = new Date(publishTime)
    const diffDays = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  // 计算统计数据
  const latestTime = projects.length > 0
    ? projects.map(p => p.publishTime).sort().reverse()[0]
    : "2025-01-05 09:00"
  const totalCount = projects.length
  const newCount = projects.filter(p => isThisWeek(p.publishTime)).length

  return (
    <div className="bg-gradient-to-r from-[#3B796F] via-[#4A8A80] to-[#3B796F]">
      <div className="scys-container py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* 左侧文案 */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tight">
              发现适合你的赚钱机会
            </h2>
            <p className="text-white/75 text-sm">
              每日精选更新，让你更快看到正在发生的机会
            </p>
          </div>

          {/* 右侧数据 */}
          <div className="flex items-center gap-5">
            {/* 项目总数 */}
            <div className="flex items-center gap-3">
              <IconBox delay={0}>
                <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
              </IconBox>
              <div>
                <div className="text-2xl font-bold text-white leading-none mb-0.5">
                  <AnimatedNumber value={totalCount} suffix="+" />
                </div>
                <div className="text-[11px] text-white/60 font-medium uppercase tracking-wider">精选项目</div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="w-px h-10 bg-white/20" />

            {/* 本周新增 */}
            {newCount > 0 && (
              <>
                <div className="flex items-center gap-3">
                  <IconBox delay={100}>
                    <Zap className="w-5 h-5 text-yellow-300" strokeWidth={2.5} fill="currentColor" />
                  </IconBox>
                  <div>
                    <div className="text-2xl font-bold text-white leading-none mb-0.5">
                      <AnimatedNumber value={newCount} />
                    </div>
                    <div className="text-[11px] text-white/60 font-medium uppercase tracking-wider">本周新增</div>
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="w-px h-10 bg-white/20" />
              </>
            )}

            {/* 最新更新 */}
            <div className="flex items-center gap-3">
              <IconBox delay={200}>
                <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
              </IconBox>
              <div>
                <div className="text-lg font-bold text-white leading-none mb-0.5">
                  <AnimatedTime time={formatLatestTime(latestTime)} />
                </div>
                <div className="text-[11px] text-white/60 font-medium uppercase tracking-wider">最新更新</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
