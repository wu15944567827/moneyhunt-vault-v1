import fs from "fs"
import path from "path"
import type { Project } from "./projects-data"

/**
 * 从 public/projects 目录加载所有项目数据
 * 这个函数只能在服务端运行（Server Component 或 getStaticProps）
 */
export function loadProjectsFromFiles(): Project[] {
  const projectsDir = path.join(process.cwd(), "public", "projects")

  // 检查目录是否存在
  if (!fs.existsSync(projectsDir)) {
    console.warn("Projects directory not found:", projectsDir)
    return []
  }

  let fileList: string[] = []
  try {
    fileList = fs.readdirSync(projectsDir)
  } catch (error) {
    console.error("Failed to read projects directory:", error)
    return []
  }

  // 获取所有项目JSON文件（project-XXXX.json格式）
  const projectFiles = fileList.filter((file) => {
    return file.startsWith("project-") && file.endsWith(".json")
  })

  // 读取每个项目的 JSON 文件
  const projects: Project[] = []

  for (const file of projectFiles) {
    const dataPath = path.join(projectsDir, file)

    try {
      const rawData = fs.readFileSync(dataPath, "utf-8")
      const data = JSON.parse(rawData) as Project

      // 图片已经是完整URL，直接使用JSON中的数据
      projects.push(data)
    } catch (error) {
      console.error(`Error loading ${file}:`, error)
    }
  }

  // 按 id 降序排列（新项目在前）
  return projects.sort((a, b) => b.id.localeCompare(a.id))
}

/**
 * 获取所有项目数据（服务端使用）
 */
export function getAllProjects(): Project[] {
  return loadProjectsFromFiles()
}

/**
 * 根据 ID 获取项目（服务端使用）
 */
export function getProjectByIdFromFiles(id: string): Project | undefined {
  const projects = loadProjectsFromFiles()
  return projects.find((p) => p.id === id)
}
