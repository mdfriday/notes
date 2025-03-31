import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'
import path from 'path'

// Check if we're in analyze mode
const isAnalyze = process.env.ANALYZE === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // 确保React插件正确处理JSX和React导入
      jsxRuntime: 'automatic',
    }),
    tsconfigPaths(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'MDFriday Notes',
          description: 'Generate beautiful emails and images from Markdown',
        },
      },
    }),
    visualizer({
      open: isAnalyze,
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html',
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // 确保使用正确的React版本
    dedupe: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'scheduler']
  },
  build: {
    // 使用esbuild，可能对初始化顺序有更好的处理
    minify: 'esbuild',
    // 禁用进一步优化以减少问题
    cssCodeSplit: true,
    commonjsOptions: {
      // 启用转换前的依赖项 - 有助于解决一些初始化问题
      transformMixedEsModules: true
    },
    rollupOptions: {
      // 禁用内部评估
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: true,
        tryCatchDeoptimization: true
      },
      onwarn(warning, warn) {
        // 忽略循环依赖警告
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        // 使用更简化的分块策略，重点关注模块加载顺序
        manualChunks(id) {
          // React核心放到一个独立的chunk
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/scheduler/')) {
            return 'react-core';
          }

          // React相关库（但不是核心）
          if (id.includes('node_modules/react-router') || 
              id.includes('node_modules/@remix-run') ||
              id.includes('node_modules/framer-motion')) {
            return 'react-libs';
          }
          
          // 所有UI组件库
          if (id.includes('node_modules/@nextui-org/') ||
              id.includes('node_modules/@emotion/')) {
            return 'ui-libs';
          }
          
          // 将主要功能库放入一个公共chunk
          if (id.includes('node_modules/lodash') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/date-fns')) {
            return 'utils';
          }
          
          // 所有其他依赖视为普通vendor
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
          
          // 应用内部代码
          if (id.includes('/src/components/')) {
            return 'components';
          }
          
          if (id.includes('/src/pages/')) {
            return 'pages';
          }
        },
        // 更保守的文件名策略
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 手动控制chunk文件名顺序
        chunkFileNames(chunkInfo) {
          const { name } = chunkInfo;
          
          // 确保React核心最先加载
          if (name === 'react-core') {
            return 'assets/react-core.[hash].js';
          }
          
          // 第二加载React相关库
          if (name === 'react-libs') {
            return 'assets/react-libs.[hash].js';
          }
          
          // 第三加载UI库
          if (name === 'ui-libs') {
            return 'assets/ui-libs.[hash].js';
          }
          
          // 第四加载常用工具库
          if (name === 'utils') {
            return 'assets/utils.[hash].js';
          }
          
          // 第五加载其他vendor
          if (name === 'vendor') {
            return 'assets/vendor.[hash].js';
          }
          
          // 应用代码
          return `assets/${name}.[hash].js`;
        },
        entryFileNames: 'assets/entry-[name].[hash].js',
        // 添加这些配置有助于解决初始化顺序问题
        hoistTransitiveImports: false,
        esModule: 'if-default-prop',
        generatedCode: {
          reservedNamesAsProps: false,
          objectShorthand: false
        }
      },
    },
    target: 'es2015',
    // 禁用预加载优化，让浏览器按脚本顺序自然加载
    modulePreload: false,
    reportCompressedSize: true,
    emptyOutDir: true,
    // 提高警告阈值
    chunkSizeWarningLimit: 1500,
  },
  // 使用优化的预览模式
  preview: {
    port: 4173,
    // 为预览添加特殊头，帮助调试
    headers: {
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'SAMEORIGIN'
    }
  }
})

