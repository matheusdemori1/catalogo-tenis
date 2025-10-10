"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Derivar isAdmin do estado do usuário
  const isAdmin = !!user && !!session

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined') return

    let mounted = true

    // Função para obter sessão inicial
    const getInitialSession = async () => {
      try {
        if (!supabase) {
          console.warn('⚠️ Supabase não configurado')
          if (mounted) {
            setLoading(false)
          }
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro ao obter sessão inicial:', error)
          // Limpar estado em caso de erro
          if (mounted) {
            setUser(null)
            setSession(null)
          }
        } else if (session) {
          console.log('✅ Sessão encontrada:', session.user.email)
          if (mounted) {
            setUser(session.user)
            setSession(session)
          }
        } else {
          console.log('ℹ️ Nenhuma sessão ativa')
          if (mounted) {
            setUser(null)
            setSession(null)
          }
        }
      } catch (error) {
        console.error('❌ Erro inesperado ao obter sessão:', error)
        if (mounted) {
          setUser(null)
          setSession(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Obter sessão inicial
    getInitialSession()

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Estado de autenticação mudou:', event)
        
        if (!mounted) return

        if (event === 'SIGNED_IN' && session) {
          console.log('👋 Usuário logado:', session.user.email)
          setUser(session.user)
          setSession(session)
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Usuário deslogado')
          setUser(null)
          setSession(null)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token renovado')
          setUser(session.user)
          setSession(session)
        }
        
        setLoading(false)
      }
    ) || { subscription: null }

    // Cleanup
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase não configurado' } }
    }

    try {
      setLoading(true)
      console.log('🔐 Tentando fazer login com:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Erro no login:', error.message)
        return { error }
      }

      if (data.user && data.session) {
        console.log('✅ Login realizado com sucesso:', data.user.email)
        // O estado será atualizado pelo listener onAuthStateChange
        return {}
      }

      return { error: { message: 'Falha no login' } }
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return

    try {
      console.log('🚪 Fazendo logout...')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Erro no logout:', error.message)
      } else {
        console.log('✅ Logout realizado com sucesso')
      }
      
      // O estado será atualizado pelo listener onAuthStateChange
    } catch (error) {
      console.error('❌ Erro inesperado no logout:', error)
    }
  }

  const value = {
    user,
    session,
    isAdmin,
    loading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}