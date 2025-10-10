import { createClient } from '@supabase/supabase-js'

// CORREÇÃO 1: Leitura correta das variáveis de ambiente do Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Verificar se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis do Supabase não configuradas. Configure nas variáveis de ambiente.')
}

// Cliente público (para leitura e operações autenticadas) - SSR Safe
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Storage customizado que só funciona no cliente
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null
            try {
              return localStorage.getItem(key)
            } catch (error) {
              console.warn('Erro ao acessar localStorage:', error)
              return null
            }
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.setItem(key, value)
            } catch (error) {
              console.warn('Erro ao salvar no localStorage:', error)
            }
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.removeItem(key)
            } catch (error) {
              console.warn('Erro ao remover do localStorage:', error)
            }
          }
        }
      }
    })
  : null

// Cliente administrativo (para operações de escrita com service key)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : (supabaseUrl && supabaseAnonKey 
      ? createClient(supabaseUrl, supabaseAnonKey)
      : null)

// Função para obter cliente autenticado com token do usuário
export const getAuthenticatedClient = async () => {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }

  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('❌ Erro ao obter sessão:', error)
    if (handleAuthError(error)) {
      throw new Error('Sessão expirada')
    }
    throw error
  }

  if (!session) {
    throw new Error('Usuário não autenticado')
  }

  // Retornar cliente com token de autenticação
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    }
  })
}

// Função para limpar sessão inválida - SSR Safe
export const clearInvalidSession = async () => {
  if (!supabase || typeof window === 'undefined') return

  try {
    console.log('🧹 Limpando sessão inválida...')
    await supabase.auth.signOut()
    
    // Limpar localStorage manualmente apenas no cliente
    const keysToRemove = [
      'sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token',
      'supabase.auth.token',
      'supabase_auth_token'
    ]
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.warn('Erro ao limpar chave:', key, error)
      }
    })
    
    console.log('✅ Sessão limpa com sucesso')
  } catch (error) {
    console.error('❌ Erro ao limpar sessão:', error)
  }
}

// Função para verificar e tratar erros de autenticação
export const handleAuthError = (error: any) => {
  if (error?.message?.includes('Invalid Refresh Token') || 
      error?.message?.includes('Refresh Token Not Found')) {
    console.log('🔄 Detectado refresh token inválido, limpando sessão...')
    clearInvalidSession()
    return true // Indica que o erro foi tratado
  }
  return false // Erro não relacionado a refresh token
}

// Configurar listener para erros de autenticação - apenas no cliente
if (typeof window !== 'undefined' && supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Estado de autenticação mudou:', event)
    
    if (event === 'SIGNED_OUT') {
      console.log('👋 Usuário deslogado')
    } else if (event === 'SIGNED_IN') {
      console.log('👋 Usuário logado:', session?.user?.email)
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('🔄 Token renovado com sucesso')
    }
  })
}

// Interface para o produto no banco de dados
export interface DatabaseProduct {
  id: string
  nome: string
  marca: string
  preco: number
  descricao: string
  imagem_url: string
  estoque: number
  categorias: string[]
  created_at?: string
  updated_at?: string
}

// SQL para criar a tabela produtos (execute no painel do Supabase)
export const createProductsTableSQL = `
-- Criar tabela produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  imagem_url TEXT NOT NULL,
  estoque INTEGER DEFAULT 0,
  categorias TEXT[] DEFAULT ARRAY['tenis'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_marca ON produtos(marca);
CREATE INDEX IF NOT EXISTS idx_produtos_categorias ON produtos USING GIN(categorias);
CREATE INDEX IF NOT EXISTS idx_produtos_created_at ON produtos(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON produtos;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON produtos;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON produtos;

-- CORREÇÃO 3: Criar políticas de segurança que exigem autenticação
CREATE POLICY "Permitir leitura pública de produtos" ON produtos
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados" ON produtos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir atualização para usuários autenticados" ON produtos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir exclusão para usuários autenticados" ON produtos
  FOR DELETE USING (auth.uid() IS NOT NULL);
`