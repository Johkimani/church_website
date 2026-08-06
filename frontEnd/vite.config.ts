import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (mode === 'production' && !env.VITE_SERVER_URI) {
    throw new Error(
      'VITE_SERVER_URI must be set for production builds. Add VITE_SERVER_URI (https://church-website-q8z9.onrender.com/api/v1) to the Vercel environment variables, then rebuild.'
    )
  }
  return {
    plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  optimizeDeps: {
    include: ['react/jsx-runtime', 'framer-motion'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/localFileUploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/hub-view': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/css': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/styles': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/dist': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/components': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/community-view': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/authentication': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/questions': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  }
})
