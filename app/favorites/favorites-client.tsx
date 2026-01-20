"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, Trash2 } from "lucide-react"
import { ProjectCard } from "@/components/project-card"
import { getFavorites, removeFavorite, type Project } from "@/lib/projects-data"

interface FavoritesClientProps {
  allProjects: Project[]
}

export function FavoritesClient({ allProjects }: FavoritesClientProps) {
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 加载收藏的项目
  useEffect(() => {
    const loadFavorites = () => {
      const favoriteIds = getFavorites()
      const projects = allProjects.filter((p) => favoriteIds.includes(p.id))
      setFavoriteProjects(projects)
      setIsLoading(false)
    }
    loadFavorites()
  }, [allProjects])

  // 取消收藏
  const handleRemoveFavorite = (projectId: string) => {
    removeFavorite(projectId)
    setFavoriteProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="scys-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-[#3B796F] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">返回首页</span>
              </Link>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <h1 className="text-lg font-bold text-gray-900">我的收藏</h1>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              共 {favoriteProjects.length} 个项目
            </span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="scys-container py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : favoriteProjects.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">暂无收藏</h2>
            <p className="text-gray-400 mb-6">浏览项目时点击收藏按钮，即可在这里找到</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B796F] text-white rounded-lg hover:bg-[#2D5C55] transition-colors"
            >
              去浏览项目
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProjects.map((project, index) => (
              <div key={project.id} className="relative group">
                <ProjectCard project={project} index={index} />
                {/* 取消收藏按钮 */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleRemoveFavorite(project.id)
                  }}
                  className="absolute top-2 left-2 z-20 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="取消收藏"
                >
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="scys-container text-center">
          <p className="text-sm text-gray-500">© 2025 生财有术 · 项目库 | 新项目，新机会，持续更新</p>
        </div>
      </footer>
    </div>
  )
}
