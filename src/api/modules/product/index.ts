import { COMMON_ADMIN_API } from '@/api/axios/servicePort'
import http from '@/api'

/**
 * @name 商品管理
 */
export const ProductApi = {
  page: (params: any) => http.post(COMMON_ADMIN_API + '/product/page', params),
  saveOrEdit: (params: any) => http.post(COMMON_ADMIN_API + '/product/saveOrEdit', params),
  remove: (params: any) => http.post(COMMON_ADMIN_API + '/product/remove', params)
}
