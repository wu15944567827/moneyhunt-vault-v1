import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 检查环境变量是否正确配置
function validateSupabaseConfig(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[Supabase] 环境变量未正确配置。请确保 .env.local 中设置了:\n' +
      '  NEXT_PUBLIC_SUPABASE_URL\n' +
      '  NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
    return false
  }
  return true
}

// 创建 Supabase 客户端（带安全检查）
function createSupabaseClient(): SupabaseClient {
  if (!validateSupabaseConfig()) {
    // 返回一个模拟客户端，避免运行时崩溃
    // 所有操作会返回空结果而不是崩溃
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: { message: 'Supabase 未配置' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase 未配置' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase 未配置' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase 未配置' } }),
      }),
      channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
        subscribe: () => ({}),
      }),
      removeChannel: () => Promise.resolve(),
    } as unknown as SupabaseClient
  }

  return createClient(supabaseUrl!, supabaseAnonKey!)
}

export const supabase = createSupabaseClient()

// 导出检查函数供其他模块使用
export const isSupabaseConfigured = validateSupabaseConfig()

export interface Annotation {
  id: string
  project_id: string
  content: string
  author: string
  created_at: string
  field_name?: string      // 旧版：字段名
  field_content?: string   // 旧版：字段原内容
  position_x?: number      // 新版：位置x百分比
  position_y?: number      // 新版：位置y百分比
}
