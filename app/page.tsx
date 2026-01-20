import { getAllProjects } from "@/lib/projects-loader"
import { ProjectLibraryClient } from "@/components/project-library-client"

export default function ProjectLibrary() {
  // 在服务端加载项目数据
  const projects = getAllProjects()

  return <ProjectLibraryClient initialProjects={projects} />
}
