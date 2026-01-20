import { getAllProjects } from "@/lib/projects-loader"
import { FavoritesClient } from "./favorites-client"

export default function FavoritesPage() {
  const allProjects = getAllProjects()

  return <FavoritesClient allProjects={allProjects} />
}
