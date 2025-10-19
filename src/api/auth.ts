// src/api/auth.ts
import http from '@/utils/http'

// 登录请求（接收含部门信息的响应）
export const login = (data: { account: string; password: string }) => {
  return http.post('/sys/auth/login', data)
}

// 退出登录
export const logout = () => {
  return http.post('/sys/auth/logout')
}
