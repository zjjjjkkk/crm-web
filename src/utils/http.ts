import axios from 'axios'
import { useUserStoreWithOut } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 直接硬编码后端接口基础路径（关键修改）
// 确保后端确实在 8081 端口启动，且上下文路径为 /crm-api
const http = axios.create({
  baseURL: 'http://localhost:8081/crm-api', // 直接写死后端地址，绕过环境变量
  timeout: 5000
})

http.interceptors.request.use(
  (config) => {
    const userStore = useUserStoreWithOut()

    // 1. 携带Token
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    // 2. 给客户列表接口自动加部门权限参数
    const isCustomerListApi = config.url?.includes('/customer/page')
    if (isCustomerListApi && userStore.deptParentIds) {
      // 简化判断条件
      config.params = {
        ...config.params,
        userDeptParentIds: userStore.deptParentIds
      }
    }

    return config
  },
  (error) => {
    ElMessage.error('请求异常，请稍后重试')
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 处理网络错误（如后端未启动）
    if (!error.response) {
      ElMessage.error('后端服务未启动或网络异常')
      return Promise.reject(error)
    }
    // 处理401未授权
    if (error.response?.status === 401) {
      const userStore = useUserStoreWithOut()
      userStore.logout()
      router.push(`/login?redirect=${router.currentRoute.value.fullPath}`)
      ElMessage.error('登录已过期，请重新登录')
    }
    // 处理404错误（路径仍错误时提示）
    if (error.response?.status === 404) {
      ElMessage.error('接口路径错误，请检查后端接口是否存在')
    }
    return Promise.reject(error)
  }
)

export default http
