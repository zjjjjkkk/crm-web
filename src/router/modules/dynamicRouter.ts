import router from '@/router/index'
import { isType } from '@/utils/util'
import { LOGIN_URL } from '@/configs/config'
import { ElNotification } from 'element-plus'
import { useAppStoreWithOut } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useDepartmentStore } from '@/store/modules/department'

// 引入 views 文件夹下所有 vue 文件（保留原依赖，确保组件加载正常）
const modules = import.meta.glob('@/views/**/*.vue')

/**
 * 初始化动态路由（移除 /dashboard 路由，调整默认跳转）
 */
export const initDynamicRouter = async () => {
  const permissionStore = usePermissionStore()
  const appStore = useAppStoreWithOut()
  const departmentStore = useDepartmentStore()

  try {
    // 1. 获取菜单列表 && 按钮权限（保持原接口逻辑）
    await permissionStore.getAuthMenuList()
    await permissionStore.getAuthButtonList()

    // 2. 判断当前用户有没有菜单权限（保持原提示逻辑）
    if (!permissionStore.getMenuList.length) {
      ElNotification({
        title: '无权限访问',
        message: '当前账号无任何菜单权限，请联系系统管理员！',
        type: 'warning',
        duration: 3000
      })
      appStore.setToken('')
      router.replace(LOGIN_URL)
      return Promise.reject('No permission')
    }

    // 3. 核心：过滤 /dashboard 路由，设置新默认跳转
    const flatMenuList = permissionStore.getFlatMenuList
    // 过滤掉 path 为 /dashboard 的路由，只保留其他有效菜单
    const validMenus = flatMenuList.filter((item: any) => item.path !== '/dashboard')
    // 处理极端情况：过滤后无菜单时，回退到原始列表第一个（避免空数组报错）
    const targetMenus = validMenus.length > 0 ? validMenus : flatMenuList

    // 添加根路由重定向（跳转到过滤后的第一个有效菜单）
    const homeItem = {
      path: '/',
      redirect: targetMenus[0].path
    }
    router.addRoute(homeItem)

    // 4. 加载部门列表（保留原业务逻辑）
    await departmentStore.getDepartmentList()

    // 5. 添加动态路由（双重保险：跳过 /dashboard 路由）
    flatMenuList.forEach((item: any) => {
      // 跳过 /dashboard 路由，不添加到路由表
      if (item.path === '/dashboard') return

      // 移除子路由（避免重复添加，保持原逻辑）
      if (item.children && item.children.length) {
        delete item.children
      }

      // 组件路径处理（补充类型判断，避免加载异常）
      if (item.component && isType(item.component) === 'string') {
        item.component = modules[`/src/views${item.component}.vue`]
      }

      // 添加路由到 layout 父路由下（保持原层级）
      router.addRoute('layout', item)
    })
  } catch (error) {
    // 异常处理：清空 Token 并跳回登录页（保持原逻辑）
    appStore.setToken('')
    router.replace(LOGIN_URL)
    return Promise.reject(error)
  }
}
