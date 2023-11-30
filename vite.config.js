import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cesium(), AutoImport({
    imports: [
      // 需要自动导入的API，自动导入vue和vue-router相关函数
      'vue',
      'vue-router',
      'pinia',
    ],
    resolvers: [ElementPlusResolver()], // 指明 .d.ts 文件的位置和文件名，生成 `auto-import.d.ts` 全局声明
    dts: 'src/types/auto-import.d.ts'
  }),
  Components({
    resolvers: [ElementPlusResolver()],
  }),]
})
