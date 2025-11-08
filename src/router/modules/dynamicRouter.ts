import router from '@/router/index'
import { isType } from '@/utils/util'
import { LOGIN_URL } from '@/configs/config'
import { ElNotification } from 'element-plus'
import { useAppStoreWithOut } from '@/store/modules/app'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { useDepartmentStore } from '@/store/modules/department'

// 引入 views 文件夹下所有 vue 文件（支持嵌套目录，兼容大小写路径）
const modules = import.meta.glob('@/views/**/*.vue', { eager: false })

/**
 * 初始化动态路由（完整修复：组件路径兼容、父路由占位、404兜底）
 */
export const initDynamicRouter = async () => {
  const permissionStore = usePermissionStoreWithOut()
  const appStore = useAppStoreWithOut()
  const departmentStore = useDepartmentStore()

  try {
    // 1. 获取菜单列表 && 按钮权限
    await permissionStore.getAuthMenuList()
    await permissionStore.getAuthButtonList()

    // 2. 无菜单权限处理
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

    // 3. 根路径重定向（增加容错，避免数组越界）
    const firstValidRoute = permissionStore.getFlatMenuList.find((item) => item.path)
    const homeItem = {
      path: '/',
      redirect: firstValidRoute?.path || '/404' // 找不到有效路由时跳404
    }
    // 避免重复添加重定向路由
    if (!router.hasRoute('homeRedirect')) {
      router.addRoute({ ...homeItem, name: 'homeRedirect' })
    }

    // 4. 获取部门列表（不改动原有业务）
    await departmentStore.getDepartmentList()

    // 5. 添加动态路由（核心修复：兼容 Customer 大写文件夹 + 父路由空组件 + 组件路径校验）
    permissionStore.getFlatMenuList.forEach((item: any, index: number) => {
      // 跳过无效路由（无 path 或 path 格式错误）
      if (!item.path || typeof item.path !== 'string' || item.path.startsWith('http')) {
        console.warn(`跳过无效动态路由：`, item)
        return
      }

      // 跳过通配符路由，避免覆盖404兜底规则
      if (item.path === '*' || item.path === ':pathMatch(.*)*') {
        console.warn(`跳过通配符路由，避免覆盖404兜底规则：`, item)
        return
      }

      // 删除 children（扁平化路由已处理，避免嵌套冲突）
      if (item.children) delete item.children

      // 核心：component 配置修复（兼容 Customer 大写文件夹 + 父路由空组件）
      let component: any = null
      if (item.component && isType(item.component) === 'string') {
        // 1. 路径处理：补全前缀 /，保留原始大小写（不强制转换）
        let componentPath = item.component.startsWith('/') ? item.component : `/${item.component}`

        // 2. 关键兼容：将 /customer/ 前缀替换为 /Customer/（匹配你的大写文件夹路径）
        // 覆盖场景：后端返回 customer（小写）→ 映射到 Customer（大写）文件夹
        if (componentPath.toLowerCase().startsWith('/customer/')) {
          componentPath = componentPath.replace(/^\/customer\//i, '/Customer/')
        }

        // 3. 拼接完整组件路径（对应 E:\CRM\crm-web\src\views\Customer\XXX.vue）
        let fullComponentPath = `/src/views${componentPath}.vue`

        // 🔧 兼容后台误带 @ 前缀
        fullComponentPath = fullComponentPath.replace(/^\/src\/views\/@\/src\/views/, '/src/views')

        // 4. 校验组件是否存在（兼容 vite 路径匹配规则）
        if (modules[fullComponentPath]) {
          component = modules[fullComponentPath]
        } else {
          // 额外容错：尝试匹配大小写不敏感的路径（避免文件名大小写问题）
          const matchedPath = Object.keys(modules).find((key) => key.toLowerCase() === fullComponentPath.toLowerCase())
          if (matchedPath) {
            component = modules[matchedPath]
            console.log(`路由 ${item.path} 组件路径大小写不匹配，已自动兼容：${matchedPath}`)
          } else {
            console.warn(`路由 ${item.path} 对应的组件不存在：${fullComponentPath}，请检查组件路径和文件名`, item)
            return
          }
        }
      } else {
        // 父路由（/system、/customer）无 component，添加空组件占位（避免被跳过）
        component = { render: () => null }
        console.log(`父路由 ${item.path} 无 component，添加空组件占位（仅用于承载子路由）`)
      }

      // 确保路由 name 唯一（避免重复添加，支持 resetRouter 删除）
      const routeName = item.name
        ? item.name.replace(/\//g, '_').replace(/\s+/g, '') // 替换路径分隔符和空格
        : `dynamic_route_${index}_${item.path.replace(/\//g, '_').replace(/\s+/g, '')}`

      // 构造合法路由配置（补全必要字段）
      const validRoute = {
        path: item.path,
        name: routeName,
        component: component,
        meta: {
          title: item.meta?.title || '未命名路由',
          hidden: item.meta?.hidden ?? false,
          icon: item.meta?.icon || '',
          ...item.meta
        },
        redirect: item.redirect || ''
      }

      // 优先添加到 layout 父路由下（确保路由层级正确）
      if (router.hasRoute('layout')) {
        router.addRoute('layout', validRoute)
      } else {
        router.addRoute(validRoute)
        console.warn(`父路由 layout 不存在，已将 ${item.path} 作为一级路由添加`)
      }
    })

    console.log(
      '动态路由初始化完成，已加载路由：',
      router.getRoutes().map((route) => route.path)
    )
  } catch (error) {
    // 异常处理：清除 token 并重定向到登录页
    appStore.setToken('')
    router.replace(LOGIN_URL)
    console.error('动态路由初始化失败：', error)
    return Promise.reject(error)
  }
}

console.log('glob 所有 key：', Object.keys(modules).sort())
