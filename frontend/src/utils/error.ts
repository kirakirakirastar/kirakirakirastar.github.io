/**
 * Standard error handling for the application
 */

export interface AppError {
  message: string
  code?: string
  originalError?: any
}

export const handleSupabaseError = (error: any): AppError => {
  console.error('Supabase Error Trace:', error)

  // Default message
  let message = '发生未知错误，请重试'
  
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        message = '未找到相关记录'
        break
      case '23505':
        message = '记录已存在 (唯一约束冲突)'
        break
      case '42P01':
        message = '数据库配置错误 (表不存在)'
        break
      case 'auth/invalid-email':
        message = '邮箱格式不正确'
        break
      case 'auth/wrong-password':
        message = '密码错误'
        break
      default:
        message = error.message || message
    }
  } else if (error.message) {
    message = error.message
  }

  return {
    message,
    code: error.code,
    originalError: error
  }
}

/**
 * Helper to extract message for UI display
 */
export const getErrorMessage = (error: any): string => {
  return handleSupabaseError(error).message
}
