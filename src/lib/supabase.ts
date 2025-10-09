import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

-- Política para permitir leitura pública
CREATE POLICY IF NOT EXISTS "Permitir leitura pública de produtos" ON produtos
  FOR SELECT USING (true);

-- Política para permitir inserção pública (para desenvolvimento)
CREATE POLICY IF NOT EXISTS "Permitir inserção pública de produtos" ON produtos
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização pública (para desenvolvimento)
CREATE POLICY IF NOT EXISTS "Permitir atualização pública de produtos" ON produtos
  FOR UPDATE USING (true);

-- Política para permitir exclusão pública (para desenvolvimento)
CREATE POLICY IF NOT EXISTS "Permitir exclusão pública de produtos" ON produtos
  FOR DELETE USING (true);
`