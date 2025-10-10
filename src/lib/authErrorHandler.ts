import { handleAuthError } from './supabase'

// Interceptador global para erros de autenticação
export function setupGlobalAuthErrorHandler() {
  // Interceptar erros do console
  const originalConsoleError = console.error
  console.error = (...args) => {
    const message = args.join(' ')
    
    // Verificar se é um erro de refresh token
    if (message.includes('Invalid Refresh Token') || 
        message.includes('Refresh Token Not Found') ||
        message.includes('AuthApiError')) {
      console.log('🔄 Erro de autenticação detectado no console, tratando...')
      handleAuthError({ message })
      
      // Disparar evento customizado para componentes React
      window.dispatchEvent(new CustomEvent('auth-error', { 
        detail: { message, type: 'refresh_token_invalid' }
      }))
    }
    
    // Chamar o console.error original
    originalConsoleError.apply(console, args)
  }

  // Interceptar erros não capturados
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    if (error?.message?.includes('Invalid Refresh Token') || 
        error?.message?.includes('Refresh Token Not Found')) {
      console.log('🔄 Erro de refresh token não capturado, tratando...')
      handleAuthError(error)
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('auth-error', { 
        detail: { message: error.message, type: 'refresh_token_invalid' }
      }))
      
      // Prevenir que o erro apareça no console
      event.preventDefault()
    }
  })

  // Interceptar erros globais
  window.addEventListener('error', (event) => {
    const error = event.error
    if (error?.message?.includes('Invalid Refresh Token') || 
        error?.message?.includes('Refresh Token Not Found')) {
      console.log('🔄 Erro global de refresh token, tratando...')
      handleAuthError(error)
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('auth-error', { 
        detail: { message: error.message, type: 'refresh_token_invalid' }
      }))
    }
  })

  console.log('✅ Interceptador global de erros de autenticação configurado')
}

// Hook para componentes React escutarem erros de autenticação
export function useAuthErrorListener(callback: () => void) {
  const handleAuthError = () => {
    console.log('🔄 Evento de erro de autenticação recebido')
    callback()
  }

  // Adicionar listener
  window.addEventListener('auth-error', handleAuthError)
  
  // Cleanup
  return () => {
    window.removeEventListener('auth-error', handleAuthError)
  }
}