import { createClient } from '@supabase/supabase-js'

// Configuração com fallback para desenvolvimento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Verificar se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis do Supabase não configuradas. Usando modo fallback.')
}

// Cliente público (para leitura)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Cliente administrativo (para operações de escrita)
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
DROP POLICY IF EXISTS "Permitir inserção pública de produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir atualização pública de produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir exclusão pública de produtos" ON produtos;

-- Criar políticas de segurança
CREATE POLICY "Permitir leitura pública de produtos" ON produtos
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública de produtos" ON produtos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de produtos" ON produtos
  FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão pública de produtos" ON produtos
  FOR DELETE USING (true);
`