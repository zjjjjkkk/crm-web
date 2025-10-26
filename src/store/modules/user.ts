// src/store/modules/user.ts
import { defineStore } from 'pinia'
import { useAppStoreWithOut } from './app' // 引入 AppStore

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userId: 0,
    username: '',
    deptId: 0,
    deptName: '',
    deptParentIds: ''
  }),
  getters: {
    hasDeptInfo: (state) => state.deptId > 0 && state.deptParentIds !== ''
  },
  actions: {
    setUserInfo(info: any) {
      this.token = info.accessToken
      this.userId = info.userId
      this.username = info.username
      this.deptId = info.deptId
      this.deptName = info.deptName
      this.deptParentIds = info.deptParentIds

      // 关键：同步 Token 到 AppStore，让路由守卫能读取
      const appStore = useAppStoreWithOut()
      appStore.setToken(info.accessToken)
    },
    logout() {
      this.token = ''
      this.userId = 0
      this.username = ''
      this.deptId = 0
      this.deptName = ''
      this.deptParentIds = ''

      // 登出时清空 AppStore 的 Token
      const appStore = useAppStoreWithOut()
      appStore.setToken('')
    }
  },
  persist: {
    key: 'userInfo',
    storage: localStorage,
    paths: ['token', 'userId', 'username', 'deptId', 'deptName', 'deptParentIds']
  }
})
export const useUserStoreWithOut = () => useUserStore()
