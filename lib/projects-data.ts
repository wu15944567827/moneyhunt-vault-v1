// ============================================
// 生财项目库 - 数据结构定义
// ============================================

// 案例轮播图片
export interface CaseImage {
  imageUrl: string       // 图片链接
  order: number          // 序号（自动排序后的序号）
  caseTitle: string      // 案例标题
  profitDetail: string   // 变现详情
  type: string           // 类型（中标/风向标/生财好事/帖子/线索）
  publishTime: string    // 发布时间（用于排序）
}

// 案例参考条目（站内/平台）
export interface CaseReferenceItem {
  order: number          // 序号
  author: string         // 作者
  authorLink: string     // 作者主页链接
  publishTime: string    // 发布时间
  caseTitle: string      // 案例标题
  profitDetail: string   // 变现详情
  link: string           // 链接
  type: string           // 类型（中标/风向标/生财好事/帖子/线索）
}

// 相关链接条目（文章/政策）
export interface ArticleLinkItem {
  order: number          // 序号
  author: string         // 作者
  authorLink: string     // 作者主页链接
  publishTime: string    // 发布时间
  title: string          // 文章标题
  link: string           // 链接
  type: string           // 类型（航海/精华/帖子）
}

// 案例参考分组结构
export interface CaseReferences {
  站内: CaseReferenceItem[]
  平台: CaseReferenceItem[]
}

// 相关链接分组结构
export interface RelatedLinks {
  文章: ArticleLinkItem[]
  政策: ArticleLinkItem[]
}

// 成本与收益
export interface CostAndRevenue {
  startupCost: string    // 启动成本
  expectedRevenue: string // 预期收益
  paybackPeriod: string  // 回本周期
}

// 统计数据
export interface Statistics {
  clickCount: number     // 点击数
  readCount: number      // 阅读数
  favoriteCount: number  // 收藏数
  likeCount: number      // 点赞数
  commentCount: number   // 评论数
  shareCount: number     // 分享数
}

// 项目主结构
export interface Project {
  // 基础信息
  id: string                    // 项目编号，格式：0001
  title: string                 // 项目标题（10字以内）
  summary: string               // 项目简介（35字以内）
  highlights: string            // 核心亮点（3个，用｜分隔，15字以内）
  platform: string[]            // 平台标签
  profitModel: string           // 盈利模式
  caseRevenue: string           // 案例收益（15字以内）
  coverImage: string            // 封面图链接
  publishTime: string           // 发布时间（含年份）

  // 详情内容
  detailContent: {
    overview: string            // 这是什么项目？
    caseImages: CaseImage[]     // 案例轮播图片
    whyWorthDoing: string[]     // 为什么值得做？
    howToProfit: string[]       // 怎么赚钱？
    costAndRevenue: CostAndRevenue // 成本与收益
    steps: string[]             // 怎么做？
    caseReferences: CaseReferences // 参考案例（分组）
    relatedLinks: RelatedLinks     // 相关链接（分组）
  }

  // 统计数据
  statistics: Statistics
}

// ============================================
// 排序优先级配置
// ============================================

// 案例区类型优先级（数字越小优先级越高）
export const caseTypePriority: Record<string, number> = {
  "中标": 1,
  "风向标": 2,
  "生财好事": 3,
  "帖子": 4,
  "线索": 5,
}

// 文章区类型优先级（航海 > 精华 > 帖子 > 中标）
export const articleTypePriority: Record<string, number> = {
  "航海": 1,
  "精华": 2,
  "帖子": 3,
  "中标": 4,
}

// ============================================
// 排序工具函数
// ============================================

/**
 * 解析发布时间为可比较的数字
 * 支持格式：2025-12-18、2025-12-18 14:28、2025-09
 */
function parsePublishTime(timeStr: string): number {
  if (!timeStr) return 0
  // 标准化时间字符串
  const normalized = timeStr.replace(/\s+/g, 'T')
  const date = new Date(normalized)
  return isNaN(date.getTime()) ? 0 : date.getTime()
}

/**
 * 排序案例参考（仅按发布时间降序，新的在前）
 */
export function sortCaseReferences(items: CaseReferenceItem[]): CaseReferenceItem[] {
  const sorted = [...items].sort((a, b) => {
    // 仅按发布时间降序排列（新的在前）
    return parsePublishTime(b.publishTime) - parsePublishTime(a.publishTime)
  })
  // 重新分配序号
  return sorted.map((item, index) => ({ ...item, order: index + 1 }))
}

/**
 * 排序文章链接（先按类型优先级：航海 > 精华 > 帖子 > 中标，同类型按发布时间降序）
 */
export function sortArticleLinks(items: ArticleLinkItem[]): ArticleLinkItem[] {
  const sorted = [...items].sort((a, b) => {
    // 第一优先级：按类型排序（航海 > 精华 > 帖子 > 中标）
    const priorityA = articleTypePriority[a.type] ?? 999
    const priorityB = articleTypePriority[b.type] ?? 999
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    // 第二优先级：同类型按发布时间降序排列（新的在前）
    return parsePublishTime(b.publishTime) - parsePublishTime(a.publishTime)
  })
  // 重新分配序号
  return sorted.map((item, index) => ({ ...item, order: index + 1 }))
}

/**
 * 排序案例轮播图片（仅按发布时间降序，新的在前）
 * 注意：轮播图不分类型优先级，只按时间排序
 */
export function sortCaseImages(items: CaseImage[]): CaseImage[] {
  const sorted = [...items].sort((a, b) => {
    // 仅按发布时间降序排列（新的在前）
    return parsePublishTime(b.publishTime) - parsePublishTime(a.publishTime)
  })
  // 重新分配序号
  return sorted.map((item, index) => ({ ...item, order: index + 1 }))
}

// ============================================
// 平台列表
// ============================================
export const platforms = [
  { id: "all", label: "全部平台" },
  { id: "小红书", label: "小红书" },
  { id: "抖音", label: "抖音" },
  { id: "微信视频号", label: "微信视频号" },
  { id: "哔哩哔哩", label: "B站" },
  { id: "快手", label: "快手" },
  { id: "微信公众号", label: "微信公众号" },
  { id: "知乎", label: "知乎" },
  { id: "闲鱼", label: "闲鱼" },
  { id: "淘宝", label: "淘宝" },
  { id: "拼多多", label: "拼多多" },
  { id: "X", label: "X" },
  { id: "YouTube", label: "YouTube" },
  { id: "TikTok", label: "TikTok" },
  { id: "Reddit", label: "Reddit" },
  { id: "Instagram", label: "Instagram" },
  { id: "Google", label: "Google" },
  { id: "亚马逊", label: "亚马逊" },
  { id: "独立站", label: "独立站" },
  { id: "Telegram", label: "Telegram" },
]

// ============================================
// 盈利模式
// ============================================
export const profitModels = [
  { id: "all", label: "全部" },
  { id: "电商带货", label: "电商带货" },
  { id: "自营电商", label: "自营电商" },
  { id: "虚拟产品销售", label: "虚拟产品销售" },
  { id: "订阅制", label: "订阅制" },
  { id: "创作者分成", label: "创作者分成" },
  { id: "广告投放", label: "广告投放" },
  { id: "拉新推广", label: "拉新推广" },
  { id: "接广商单", label: "接广商单" },
  { id: "代找", label: "代找" },
  { id: "咨询服务", label: "咨询服务" },
  { id: "定制服务", label: "定制服务" },
  { id: "社群", label: "社群" },
  { id: "引流", label: "引流" },
  { id: "淘客", label: "淘客" },
]

// ============================================
// 快捷筛选标签
// ============================================
export const quickTags = [
  { id: "hot", label: "热门项目", icon: "flame" },
  { id: "new", label: "本周新增", icon: "sparkles" },
  { id: "high-revenue", label: "高收益案例", icon: "trending-up" },
  { id: "low-cost", label: "低门槛", icon: "rocket" },
]

// ============================================
// 收藏功能（使用localStorage）
// ============================================

const FAVORITES_KEY = "scbi_project_favorites"

export function getFavorites(): string[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(FAVORITES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function addFavorite(projectId: string): void {
  if (typeof window === "undefined") return
  const favorites = getFavorites()
  if (!favorites.includes(projectId)) {
    favorites.push(projectId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }
}

export function removeFavorite(projectId: string): void {
  if (typeof window === "undefined") return
  const favorites = getFavorites().filter(id => id !== projectId)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

export function isFavorite(projectId: string): boolean {
  return getFavorites().includes(projectId)
}

export function toggleFavorite(projectId: string): boolean {
  if (isFavorite(projectId)) {
    removeFavorite(projectId)
    return false
  } else {
    addFavorite(projectId)
    return true
  }
}

// ============================================
// 已读状态功能（使用localStorage）
// ============================================

const READ_PROJECTS_KEY = "scbi_read_projects"

export function getReadProjects(): string[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(READ_PROJECTS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function markAsRead(projectId: string): void {
  if (typeof window === "undefined") return
  const readProjects = getReadProjects()
  if (!readProjects.includes(projectId)) {
    readProjects.push(projectId)
    localStorage.setItem(READ_PROJECTS_KEY, JSON.stringify(readProjects))
  }
}

export function isRead(projectId: string): boolean {
  return getReadProjects().includes(projectId)
}

// ============================================
// 点赞功能（使用localStorage）
// ============================================

const LIKES_KEY = "scbi_project_likes"

export function getLikes(): string[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(LIKES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function addLike(projectId: string): void {
  if (typeof window === "undefined") return
  const likes = getLikes()
  if (!likes.includes(projectId)) {
    likes.push(projectId)
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes))
  }
}

export function removeLike(projectId: string): void {
  if (typeof window === "undefined") return
  const likes = getLikes().filter(id => id !== projectId)
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes))
}

export function isLiked(projectId: string): boolean {
  return getLikes().includes(projectId)
}

export function toggleLike(projectId: string): boolean {
  if (isLiked(projectId)) {
    removeLike(projectId)
    return false
  } else {
    addLike(projectId)
    return true
  }
}

// ============================================
// 上航海功能（使用localStorage）
// ============================================

const VOYAGE_KEY = "scbi_project_voyage"

export function getVoyageRequests(): string[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(VOYAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function addVoyageRequest(projectId: string): void {
  if (typeof window === "undefined") return
  const voyages = getVoyageRequests()
  if (!voyages.includes(projectId)) {
    voyages.push(projectId)
    localStorage.setItem(VOYAGE_KEY, JSON.stringify(voyages))
  }
}

export function removeVoyageRequest(projectId: string): void {
  if (typeof window === "undefined") return
  const voyages = getVoyageRequests().filter(id => id !== projectId)
  localStorage.setItem(VOYAGE_KEY, JSON.stringify(voyages))
}

export function hasVoyageRequest(projectId: string): boolean {
  return getVoyageRequests().includes(projectId)
}

export function toggleVoyageRequest(projectId: string): boolean {
  if (hasVoyageRequest(projectId)) {
    removeVoyageRequest(projectId)
    return false
  } else {
    addVoyageRequest(projectId)
    return true
  }
}

/**
 * 获取项目的航海投票数（模拟）
 * 基于项目ID生成一个稳定的基础票数 + 用户投票
 */
export function getVoyageVoteCount(projectId: string): number {
  // 基于项目ID生成稳定的伪随机基础票数 (5-50之间)
  let hash = 0
  for (let i = 0; i < projectId.length; i++) {
    hash = ((hash << 5) - hash) + projectId.charCodeAt(i)
    hash = hash & hash
  }
  const baseCount = Math.abs(hash % 46) + 5

  // 如果用户已投票，+1
  const userVoted = hasVoyageRequest(projectId) ? 1 : 0
  return baseCount + userVoted
}

/**
 * 获取项目的点赞数（模拟）
 * 基于项目ID生成一个稳定的基础数 + 用户点赞
 */
export function getLikeCount(projectId: string): number {
  // 基于项目ID生成稳定的伪随机基础数 (10-100之间)
  let hash = 0
  for (let i = 0; i < projectId.length; i++) {
    hash = ((hash << 3) - hash) + projectId.charCodeAt(i)
    hash = hash & hash
  }
  const baseCount = Math.abs(hash % 91) + 10

  // 如果用户已点赞，+1
  const userLiked = isLiked(projectId) ? 1 : 0
  return baseCount + userLiked
}

// ============================================
// 卡片主题配置系统
// ============================================

// 主题配置类型
export interface ThemeConfig {
  gradient: string          // 封面渐变背景
  orbPrimary: string        // 主光斑颜色
  orbSecondary: string      // 次光斑颜色
  textPrimary: string       // 主标题颜色
  textSecondary: string     // 副标题颜色
  tagBg: string             // 标签背景
  tagBorder: string         // 标签边框
  tagText: string           // 标签文字
  accentLine: string        // 装饰线颜色
  iconBg: string            // 图标背景渐变
  numberColor: string       // 序号水印颜色
  highlightText: string     // 亮点文字颜色
}

// 主题类型
export type ThemeType = 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'cyan' | 'orange' | 'indigo'

// 8种主题配置
export const themeConfigs: Record<ThemeType, ThemeConfig> = {
  emerald: {
    gradient: 'from-emerald-50 via-teal-50 to-emerald-100',
    orbPrimary: 'bg-emerald-300',
    orbSecondary: 'bg-teal-200',
    textPrimary: 'text-emerald-900',
    textSecondary: 'text-emerald-700',
    tagBg: 'bg-emerald-100/80',
    tagBorder: 'border-emerald-200/50',
    tagText: 'text-emerald-700',
    accentLine: 'bg-emerald-500',
    iconBg: 'from-emerald-400 to-teal-500',
    numberColor: 'text-emerald-900/10',
    highlightText: 'text-emerald-600'
  },
  blue: {
    gradient: 'from-blue-50 via-indigo-50 to-blue-100',
    orbPrimary: 'bg-blue-300',
    orbSecondary: 'bg-indigo-200',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-blue-700',
    tagBg: 'bg-blue-100/80',
    tagBorder: 'border-blue-200/50',
    tagText: 'text-blue-700',
    accentLine: 'bg-blue-500',
    iconBg: 'from-blue-400 to-indigo-500',
    numberColor: 'text-blue-900/10',
    highlightText: 'text-blue-600'
  },
  amber: {
    gradient: 'from-amber-50 via-orange-50 to-yellow-50',
    orbPrimary: 'bg-amber-300',
    orbSecondary: 'bg-yellow-200',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-amber-800',
    tagBg: 'bg-amber-100/80',
    tagBorder: 'border-amber-200/50',
    tagText: 'text-amber-700',
    accentLine: 'bg-amber-500',
    iconBg: 'from-amber-400 to-orange-500',
    numberColor: 'text-amber-900/10',
    highlightText: 'text-amber-600'
  },
  purple: {
    gradient: 'from-purple-50 via-fuchsia-50 to-purple-100',
    orbPrimary: 'bg-purple-300',
    orbSecondary: 'bg-fuchsia-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-purple-700',
    tagBg: 'bg-purple-100/80',
    tagBorder: 'border-purple-200/50',
    tagText: 'text-purple-700',
    accentLine: 'bg-purple-500',
    iconBg: 'from-purple-400 to-fuchsia-500',
    numberColor: 'text-purple-900/10',
    highlightText: 'text-purple-600'
  },
  rose: {
    gradient: 'from-rose-50 via-pink-50 to-rose-100',
    orbPrimary: 'bg-rose-300',
    orbSecondary: 'bg-pink-200',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-rose-700',
    tagBg: 'bg-rose-100/80',
    tagBorder: 'border-rose-200/50',
    tagText: 'text-rose-700',
    accentLine: 'bg-rose-500',
    iconBg: 'from-rose-400 to-pink-500',
    numberColor: 'text-rose-900/10',
    highlightText: 'text-rose-600'
  },
  cyan: {
    gradient: 'from-cyan-50 via-sky-50 to-cyan-100',
    orbPrimary: 'bg-cyan-300',
    orbSecondary: 'bg-sky-200',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-cyan-700',
    tagBg: 'bg-cyan-100/80',
    tagBorder: 'border-cyan-200/50',
    tagText: 'text-cyan-700',
    accentLine: 'bg-cyan-500',
    iconBg: 'from-cyan-400 to-sky-500',
    numberColor: 'text-cyan-900/10',
    highlightText: 'text-cyan-600'
  },
  orange: {
    gradient: 'from-orange-50 via-amber-50 to-orange-100',
    orbPrimary: 'bg-orange-300',
    orbSecondary: 'bg-amber-200',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-orange-700',
    tagBg: 'bg-orange-100/80',
    tagBorder: 'border-orange-200/50',
    tagText: 'text-orange-700',
    accentLine: 'bg-orange-500',
    iconBg: 'from-orange-400 to-amber-500',
    numberColor: 'text-orange-900/10',
    highlightText: 'text-orange-600'
  },
  indigo: {
    gradient: 'from-indigo-50 via-violet-50 to-indigo-100',
    orbPrimary: 'bg-indigo-300',
    orbSecondary: 'bg-violet-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-indigo-700',
    tagBg: 'bg-indigo-100/80',
    tagBorder: 'border-indigo-200/50',
    tagText: 'text-indigo-700',
    accentLine: 'bg-indigo-500',
    iconBg: 'from-indigo-400 to-violet-500',
    numberColor: 'text-indigo-900/10',
    highlightText: 'text-indigo-600'
  }
}

// 所有主题列表
const themeList: ThemeType[] = ['emerald', 'blue', 'amber', 'purple', 'rose', 'cyan', 'orange', 'indigo']

// 固定的项目主题映射（与HTML设计保持一致）
const projectThemeMap: Record<string, ThemeType> = {
  '0001': 'amber',
  '0002': 'purple',
  '0003': 'blue',
  '0004': 'rose',
  '0005': 'cyan',
  '0006': 'emerald',
  '0007': 'indigo',
  '0008': 'orange',
  '0009': 'purple',
  '0010': 'blue',
  '0011': 'rose',
  '0012': 'cyan',
  '0013': 'amber',
  '0014': 'emerald',
  '0015': 'indigo',
  '0016': 'orange',
  '0017': 'purple',
  '0018': 'blue',
  '0019': 'rose',
  '0020': 'cyan',
  '0021': 'emerald',
}

/**
 * 根据项目ID获取主题
 * 优先使用固定映射，无映射时按序号循环分配
 */
export function getProjectTheme(projectId: string): ThemeType {
  // 优先使用固定映射
  if (projectThemeMap[projectId]) {
    return projectThemeMap[projectId]
  }
  // 无固定映射时，按项目编号循环分配主题
  const num = parseInt(projectId, 10)
  if (!isNaN(num)) {
    return themeList[(num - 1) % themeList.length]
  }
  // 兜底：使用 emerald
  return 'emerald'
}

// ============================================
// 平台名称显示映射
// ============================================

const platformDisplayNames: Record<string, string> = {
  '微信视频号': '视频号',
  '哔哩哔哩': 'B站',
  '微信公众号': '公众号',
  '独立站': '网站'
}

/**
 * 获取平台显示名称（简化版）
 */
export function getDisplayPlatform(platform: string): string {
  return platformDisplayNames[platform] || platform
}

// ============================================
// 项目类型标签映射
// ============================================

const profitModelToType: Record<string, string> = {
  "电商带货": "电商",
  "电商卖货": "电商",
  "创作者分成": "创作",
  "内容创作": "创作",
  "定制服务": "服务",
  "咨询服务": "服务",
  "接广商单": "服务",
  "拉新推广": "推广",
  "推广返佣": "推广",
  "CPA推广": "推广",
  "引流": "引流",
  "引流变现": "引流",
  "虚拟产品销售": "虚拟产品",
  "虚拟产品": "虚拟产品",
  "知识付费": "虚拟产品",
  "订阅制": "订阅",
  "会员订阅": "订阅",
  "付费订阅": "订阅",
}

/**
 * 获取项目类型标签（用于卡片展示）
 * 将盈利模式映射为简短的类型标签
 */
export function getProjectTypeLabel(profitModel: string): string {
  return profitModelToType[profitModel] || "项目"
}

// ============================================
// 月入收益提取
// ============================================

const monthlyRevenueRegex = /(月入|月赚|月收入|月佣金)([^，。；,.;\s)）"”]{1,20})/

/**
 * 从项目内容中提取“月入xx”展示文案
 * - 优先匹配月入/月赚/月收入/月佣金
 * - 未命中时回退为 caseRevenue（去掉“案例：”）
 */
export function getMonthlyRevenue(project: Project): string {
  const haystack = JSON.stringify(project)
  const match = monthlyRevenueRegex.exec(haystack)
  if (match) {
    const value = match[2].replace(/[\""]/g, "").trim()
    return `月入${value}`
  }
  return project.caseRevenue.replace(/^案例[:：]/, "").trim()
}

/**
 * 格式化金额（带千分位）
 */
function fmt(n: number): string {
  return Math.round(n).toLocaleString()
}

/**
 * 从案例 profitDetail 中提取月收入区间
 * 返回 [minMonthly, maxMonthly] 或 null
 */
function extractMonthlyFromCase(profitDetail: string): [number, number] | null {
  let m: RegExpMatchArray | null

  // === 混合单位模式（优先匹配） ===

  // 月赚X(百元)到Y千（如：月赚500到2千）- 左边是三位以上数字（元），右边带"千"单位
  m = profitDetail.match(/月[赚入收][入]?\s*(\d{3,})\s*[到至-]\s*(\d+)\s*千/)
  if (m) {
    return [parseFloat(m[1]), parseFloat(m[2]) * 1000]
  }

  // 月入X到Y万（如：月入1400到1.4万）- 左边是三位以上数字（元），右边带"万"单位
  m = profitDetail.match(/月[赚入收][入]?\s*(\d{3,})\s*[到至-]\s*(\d+(?:\.\d+)?)\s*万/)
  if (m) {
    return [parseFloat(m[1]), parseFloat(m[2]) * 10000]
  }

  // 月赚X千到Y万（如：月赚3千到1万）
  m = profitDetail.match(/月[赚入收][入]?\s*(\d+(?:\.\d+)?)\s*千[到至-]\s*(\d+(?:\.\d+)?)\s*万/)
  if (m) {
    return [parseFloat(m[1]) * 1000, parseFloat(m[2]) * 10000]
  }

  // === 统一单位模式 ===

  // 月赚X到Y万 / 月入X到Y万（两边都是万元单位，数字通常 < 100）
  m = profitDetail.match(/月[赚入收][入]?\s*(\d{1,2}(?:\.\d+)?)\s*[到至-]\s*(\d{1,2}(?:\.\d+)?)\s*万/)
  if (m) {
    return [parseFloat(m[1]) * 10000, parseFloat(m[2]) * 10000]
  }

  // 月赚X到Y千（如：月赚3到5千）- 左边是小数字（表示千），右边带"千"单位
  m = profitDetail.match(/月[赚入收][入]?\s*(\d{1,2})\s*[到至-]\s*(\d+(?:\.\d+)?)\s*千/)
  if (m) {
    return [parseFloat(m[1]) * 1000, parseFloat(m[2]) * 1000]
  }

  // 月赚几千到几万（模糊表述）
  if (profitDetail.match(/月[赚入].*几千[到至].*几万/)) {
    return [3000, 30000]
  }

  // 月赚几百到几千
  if (profitDetail.match(/月[赚入].*几百[到至].*几千/)) {
    return [500, 5000]
  }

  // 月入X万（单值）
  m = profitDetail.match(/月[赚入收][入]?\s*(\d+(?:\.\d+)?)\s*万/)
  if (m) {
    const v = parseFloat(m[1]) * 10000
    return [v * 0.6, v * 1.2] // 构造保守区间
  }

  // 月赚X到Y（带单位判断：万/千/元）
  m = profitDetail.match(/月[赚入收][入]?\s*(\d+)\s*[到至-]\s*(\d+)\s*(万|千|元)?/)
  if (m) {
    let min = +m[1], max = +m[2]
    const unit = m[3] || ''

    if (unit === '万') {
      min *= 10000
      max *= 10000
    } else if (unit === '千') {
      min *= 1000
      max *= 1000
    } else {
      // 无单位，根据数字大小判断
      // 如果两个数字都很小（<100），可能是万元
      if (min < 100 && max < 100) {
        min *= 10000
        max *= 10000
      }
      // 如果数字较大（>=1000），直接作为元
      // 否则可能需要更多上下文
    }

    if (min >= 100 && max >= 100 && max >= min) {
      return [min, max]
    }
  }

  // 日赚X元 → 月收入 = X * 30
  m = profitDetail.match(/[日天]赚?\s*(\d+)\s*[到至-]?\s*(\d+)?\s*元/)
  if (m) {
    const dayMin = +m[1]
    const dayMax = m[2] ? +m[2] : dayMin
    return [dayMin * 30 * 0.7, dayMax * 30] // 日收入转月收入，保守系数
  }

  // 一天X-Y单，单价Z元
  const dailyOrders = profitDetail.match(/[一每]天\s*(\d+)\s*[到至-]?\s*(\d+)?\s*单/)
  const unitPrice = profitDetail.match(/(\d+)\s*[块元].*一[单份]|单价\s*(\d+)/)
  if (dailyOrders) {
    const dMin = +dailyOrders[1]
    const dMax = dailyOrders[2] ? +dailyOrders[2] : dMin
    const price = unitPrice ? +(unitPrice[1] || unitPrice[2]) : 30 // 默认单价30
    return [price * dMin * 30 * 0.7, price * dMax * 30]
  }

  // 累计赚了X万 → 假设6个月
  m = profitDetail.match(/[累总共]计?[赚进账了]*\s*(\d+(?:\.\d+)?)\s*万/)
  if (m) {
    const total = parseFloat(m[1]) * 10000
    const monthly = total / 6 // 假设6个月
    return [monthly * 0.5, monthly * 1.5]
  }

  // 年赚X万 → 月收入
  m = profitDetail.match(/年[赚入收][入]?\s*(\d+(?:\.\d+)?)\s*万/)
  if (m) {
    const yearly = parseFloat(m[1]) * 10000
    const monthly = yearly / 12
    return [monthly * 0.8, monthly * 1.2]
  }

  // X人充值/付费，单价Y → 月收入（假设这是月数据）
  m = profitDetail.match(/(\d+(?:\.\d+)?)\s*[万千]?人?.*[充值付费买]/)
  const priceM = profitDetail.match(/(\d+)\s*[块元].*一[份个]|[每单].*(\d+)\s*[块元]/)
  if (m && priceM) {
    let users = parseFloat(m[1])
    if (profitDetail.includes("万人")) users *= 10000
    else if (profitDetail.includes("千人")) users *= 1000
    const price = +(priceM[1] || priceM[2])
    // 假设这是累计用户，按12个月平摊
    const monthly = (users * price) / 12
    return [monthly * 0.3, monthly * 0.8] // 很保守，因为是累计数据
  }

  return null
}

/**
 * 获取收益区间显示（v8 基于案例数据版）
 * 核心原则：
 * 1. 优先从 caseImages 案例数据提取真实月收入
 * 2. 日收入自动换算为月收入
 * 3. 累计收入按合理周期平摊
 * 4. 多个案例取中位数区间
 * 输出格式：¥X,XXX-X,XXX/月
 */
export function getRevenueDisplay(project: Project): string {
  const allRanges: [number, number][] = []

  // ===== 1. 从案例数据提取月收入 =====
  const cases = project.detailContent?.caseImages || []
  for (const c of cases) {
    if (c.profitDetail) {
      const range = extractMonthlyFromCase(c.profitDetail)
      if (range && range[0] > 0 && range[1] > 0) {
        allRanges.push(range)
      }
    }
  }

  // 如果有足够的案例数据，计算区间
  if (allRanges.length >= 2) {
    // 取所有案例的最小值的中位数作为下限
    // 取所有案例的最大值的中位数作为上限
    const mins = allRanges.map(r => r[0]).sort((a, b) => a - b)
    const maxs = allRanges.map(r => r[1]).sort((a, b) => a - b)
    const medianMin = mins[Math.floor(mins.length / 2)]
    const medianMax = maxs[Math.floor(maxs.length / 2)]
    // 约束：上限不超过下限的5倍
    const cappedMax = Math.min(medianMax, medianMin * 5)
    return `¥${fmt(medianMin)}-${fmt(cappedMax)}/月`
  }

  // 只有一个案例数据
  if (allRanges.length === 1) {
    const [min, max] = allRanges[0]
    const cappedMax = Math.min(max, min * 5)
    return `¥${fmt(min)}-${fmt(cappedMax)}/月`
  }

  // ===== 2. 从 expectedRevenue 和 caseRevenue 提取 =====
  const text = (project.detailContent?.costAndRevenue?.expectedRevenue || "") + " " + (project.caseRevenue || "")

  // 月赚/月入 X到Y万
  let m = text.match(/月[赚入收][入]?\s*(\d+(?:\.\d+)?)\s*[到至-]\s*(\d+(?:\.\d+)?)\s*万/)
  if (m) {
    const min = parseFloat(m[1]) * 10000
    const max = Math.min(parseFloat(m[2]) * 10000, min * 5)
    return `¥${fmt(min)}-${fmt(max)}/月`
  }

  // 月赚/月入 X千到Y万
  m = text.match(/月[赚入收][入]?\s*(\d+(?:\.\d+)?)\s*千[到至-]\s*(\d+(?:\.\d+)?)\s*万/)
  if (m) {
    const min = parseFloat(m[1]) * 1000
    const max = Math.min(parseFloat(m[2]) * 10000, min * 5)
    return `¥${fmt(min)}-${fmt(max)}/月`
  }

  // 月入X万+
  m = text.match(/月[赚入收][入]?\s*(\d+(?:\.\d+)?)\s*万\+?/)
  if (m) {
    const base = parseFloat(m[1]) * 10000
    return `¥${fmt(base * 0.6)}-${fmt(base * 1.5)}/月`
  }

  // 日均X-Y元
  m = text.match(/日均?\s*(\d+)\s*[-到至]\s*(\d+)\s*元/)
  if (m) {
    const dayMin = +m[1], dayMax = +m[2]
    const monthMin = dayMin * 30 * 0.7
    const monthMax = Math.min(dayMax * 30, monthMin * 5)
    return `¥${fmt(monthMin)}-${fmt(monthMax)}/月`
  }

  // 单视频变现X元 → 假设月产10-20条
  m = text.match(/单[视条]频.*?(\d+)\s*元/)
  if (m) {
    const perVideo = +m[1]
    const monthMin = perVideo * 10 * 0.5 // 保守：月产10条，50%成功率
    const monthMax = perVideo * 20
    return `¥${fmt(monthMin)}-${fmt(Math.min(monthMax, monthMin * 5))}/月`
  }

  // X万人充值 → 平台扣点后按月计算
  m = text.match(/(\d+(?:\.\d+)?)\s*万人?.*?充[值电]/)
  if (m) {
    const users = parseFloat(m[1]) * 10000
    // 假设平均单价15元（6-30元区间），平台扣30%，按12个月平摊
    const monthlyRevenue = (users * 15 * 0.7) / 12
    return `¥${fmt(monthlyRevenue * 0.5)}-${fmt(monthlyRevenue * 1.5)}/月`
  }

  // 累计/总共X万
  m = text.match(/[累总进账共].*?(\d+(?:\.\d+)?)\s*万/)
  if (m) {
    const total = parseFloat(m[1]) * 10000
    const monthly = total / 6 // 假设6个月周期
    return `¥${fmt(monthly * 0.5)}-${fmt(monthly * 1.2)}/月`
  }

  // X到Y精准用户（非收入数据，需要估算客单价）
  m = text.match(/(\d+)\s*[到至-]\s*(\d+)\s*[个名位]?精准[用客]户/)
  if (m) {
    // 假设10%转化率，客单价1000元
    const usersMin = +m[1], usersMax = +m[2]
    const monthMin = usersMin * 0.1 * 1000
    const monthMax = usersMax * 0.1 * 1000
    return `¥${fmt(monthMin)}-${fmt(Math.min(monthMax, monthMin * 5))}/月`
  }

  // ===== 3. 兜底 =====
  // 从文本中提取任何看起来像月收入的数字
  const monthlyNums = text.match(/月[赚入收].*?(\d+)/g)
  if (monthlyNums && monthlyNums.length > 0) {
    const nums = monthlyNums.map(s => {
      const n = s.match(/(\d+)/)
      return n ? +n[1] : 0
    }).filter(n => n > 0)
    if (nums.length > 0) {
      const min = Math.min(...nums)
      const max = Math.max(...nums)
      // 判断单位（小数字可能是万元）
      if (max < 100) {
        return `¥${fmt(min * 10000)}-${fmt(Math.min(max * 10000, min * 10000 * 5))}/月`
      }
      return `¥${fmt(min)}-${fmt(Math.min(max, min * 5))}/月`
    }
  }

  // 实在没有数据
  return "¥3,000-10,000/月"
}
