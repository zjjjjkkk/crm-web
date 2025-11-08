import http from '@/api'
import { COMMON_ADMIN_API } from '@/api/axios/servicePort'

/**
 * @name 线索管理
 */
export const LeadApi = {
  page: (params: any) => http.post(COMMON_ADMIN_API + '/lead/page', params),
  saveOrEdit: (params: any) => http.post(COMMON_ADMIN_API + '/lead/saveOrEdit', params),
  toCustomer: (params: any) => http.post(COMMON_ADMIN_API + '/lead/convertToCustomer', params),
  followLead: (params: any) => http.post(COMMON_ADMIN_API + '/lead/followLead', params)
}
