import http from '@/api'
import { COMMON_ADMIN_API } from '@/api/axios/servicePort'

/**
 * @name 部门管理
 */
export const DepartmentApi = {
  page: (params: any) => http.post(COMMON_ADMIN_API + '/department/page', params),
  list: (params: any) => http.post(COMMON_ADMIN_API + '/department/list', params),
  saveOrEdit: (params: any) => http.post(COMMON_ADMIN_API + '/department/saveOrEdit', params),
  remove: (params: any) => http.post(COMMON_ADMIN_API + '/department/remove', params)
}
