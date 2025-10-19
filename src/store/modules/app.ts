// src/store/modules/app.ts（已有代码，重点检查 persist 配置）
import { defineStore } from 'pinia'
import { pinia } from '../index'
import { AppState, ThemeProps, AssemblySizeType, UserinfoType } from '../interface'
import { DEFAULT_PRIMARY } from '@/configs/config'
import { usePiniaPersist } from '@/hooks/usePiniaPersist'

export const useAppStore = defineStore({
  id: 'AppState',
  state: (): AppState => ({
    token: '', // 存储 Token，供路由守卫判断
    userInfo: {},
    assemblySize: 'default',
    theme: {
      layout: 'vertical',
      primary: DEFAULT_PRIMARY,
      isDark: false,
      isGrey: false,
      isWeak: false,
      isCollapse: false,
      breadcrumb: true,
      breadcrumbIcon: true,
      tabs: true,
      tabsIcon: true,
      footer: true,
      maximize: false,
      asideInverted: true
    }
  }),
  getters: {},
  actions: {
    setToken(token: string) {
      this.token = token
    },
    setUserinfo(userinfo: UserinfoType) {
      this.userInfo = userinfo
    },
    setAssemblySizeSize(assemblySize: AssemblySizeType) {
      this.assemblySize = assemblySize
    },
    setTheme(...args: ObjToKeyValArray<ThemeProps>) {
      this.$patch({
        theme: {
          [args[0]]: args[1]
        }
      })
    }
  },
  persist: usePiniaPersist('AppState') // 确保 persist 包含 token 字段
})

export const useAppStoreWithOut = () => useAppStore(pinia)
