import { defineConfig } from 'vite'
import path from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh'
// link @col0ring/vite-plugin-mock local
import viteMockPlugin from '@col0ring/vite-plugin-mock'

function resolve(relativePath: string) {
  return path.resolve(__dirname, relativePath)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    viteMockPlugin({
      dir: [resolve('./mock')]
    })
  ],
  resolve: {
    alias: {
      '@src': resolve('./src'),
      '@examples': resolve('./examples')
    }
  }
})
