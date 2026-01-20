import { notFound } from "next/navigation"
import { getProjectByIdFromFiles, getAllProjects } from "@/lib/projects-loader"
import { ProjectDetailPage } from "@/components/project-detail-page"

interface PageProps {
  params: Promise<{ id: string }>
}

// 生成静态路径
export async function generateStaticParams() {
  const projects = getAllProjects()
  return projects.map((project) => ({
    id: project.id,
  }))
}

// 动态生成页面元数据
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const project = getProjectByIdFromFiles(id)

  if (!project) {
    return {
      title: "项目未找到 | 生财项目库",
    }
  }

  return {
    title: `${project.title} | 生财项目库`,
    description: project.summary,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params
  const project = getProjectByIdFromFiles(id)

  if (!project) {
    notFound()
  }

  return <ProjectDetailPage project={project} />
}
