import { defineConfig, loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
import { resolve } from 'path'
import Vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import VueJsx from '@vitejs/plugin-vue-jsx'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import EslintPlugin from 'vite-plugin-eslint'
import { viteMockServe } from 'vite-plugin-mock'
import progress from 'vite-plugin-progress'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

const root = process.cwd()

function pathResolve(dir: string) {
  return resolve(root, '.', dir)
}

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  let env = {} as any
  const isBuild = command === 'build'
  if (!isBuild) {
    env = loadEnv((process.argv[3] === '--mode' ? process.argv[4] : process.argv[3]), root)
  } else {
    env = loadEnv(mode, root)
  }
  return {
    base: env.VITE_BASE_PATH,
    plugins: [
      Vue(),
      VueJsx(),
      WindiCSS(),
      progress(),
      EslintPlugin({
        cache: false,
        // 检查的文件
        include: ['src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx']
      }),
      VueI18nPlugin({
        runtimeOnly: true,
        compositionOnly: true,
        include: [resolve(__dirname, 'src/locales/**')]
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]"
      }),
      viteMockServe({
        supportTs: false,
        logger: false,
        mockPath: './src/mock/'
      })
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "./src/styles/variables.module.less";',
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.less', '.css'],
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
        },
        {
          find: /\@\//,
          replacement: `${pathResolve('src')}/`
        }
      ]
    },
    build: {
      //'terser' 相对较慢，但大多数情况下构建后的文件体积更小。'esbuild' 最小化混淆更快但构建后的文件相对更大。
      minify: 'terser',
      outDir: env.VITE_OUT_DIR,
      sourcemap: env.VITE_SOURCEMAP === 'true' ? 'inline' : false,
      //minify 为terser生效
      terserOptions: {
        compress: {
          drop_debugger: env.VITE_DROP_DEBUGGER === 'true',
          drop_console: env.VITE_DROP_CONSOLE === 'true'
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_PORT),
      open: env.VITE_OPEN === 'true',
      //设置 server.hmr.overlay 为 false 可以禁用开发服务器错误的屏蔽
      // hmr: {
      //   overlay: false
      // },
      cors: true,
      // 跨域代理配置
      //
      // 在 server.proxy 中修改为：
      proxy: {
        // 匹配以 /crm-api 开头的请求（与后端上下文路径一致）
        "/crm-api": {
          target: "http://127.0.0.1:8081", // 后端服务地址
          changeOrigin: true,
          // 关键：不修改路径（保留 /crm-api 前缀，因为后端接口需要）
          rewrite: (path) => path // 不要删除 /crm-api 前缀
        }
      }
    }
  }
})
