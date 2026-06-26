import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ScrollToTop from './utils/ScrollToTop.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { SocketProvider } from './context/SocketContext.tsx'
import { SSEProvider } from './context/SSEContext.tsx'
import { NotificationProvider } from './context/NotificationContext.tsx'
import { AppProvider } from './context/AppContext.tsx'
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SSEProvider>
          <SocketProvider>
            <NotificationProvider>
              <BrowserRouter>
                <AppProvider>
                  <ScrollToTop />
                  <App />
                </AppProvider>
              </BrowserRouter>
            </NotificationProvider>
          </SocketProvider>
        </SSEProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
)



