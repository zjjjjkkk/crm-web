declare interface UserType {
  Id: number
  nickname: string
  phone: string
  sex: number
  brief: string
  areaCode: string
  createTime?: string
}

declare interface ReqPageUser {
  asc?: boolean
  company?: string
  limit: number
  nickname?: string
  order?: string
  page: number
  phone?: string
}
