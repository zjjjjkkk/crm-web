// src/api/customer.ts
import http from '@/utils/http'
import { useUserStore } from '@/store/modules/user'

// 客户列表查询（自动携带部门权限参数）
export const getCustomerList = (params: any) => {
  const userStore = useUserStore()
  // 从 Vuex 中获取部门父ID链，作为权限过滤参数
  const userDeptParentIds = userStore.deptParentIds
  return http.get('/customer/page', {
    params: {
      ...params,
      userDeptParentIds // 传递给后端，用于部门权限过滤
    }
  })
}