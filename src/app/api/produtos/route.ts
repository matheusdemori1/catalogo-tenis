import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️ Variáveis de ambiente do Supabase não configuradas - usando modo fallback')
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// GET /api/produtos - Retorna todos os produtos
export async function GET() {
  try {
    console.log('📡 GET /api/produtos - Iniciando busca de produtos')
    
    // Se Supabase não estiver configurado, retornar array vazio
    if (!supabase) {
      console.log('⚠️ Supabase não configurado, retornando array vazio')
      return NextResponse.json([])
    }

    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar produtos no Supabase:', error)
      // Retornar array vazio em vez de erro para não quebrar o frontend
      return NextResponse.json([])
    }

    console.log('✅ Produtos encontrados:', produtos?.length || 0)
    return NextResponse.json(produtos || [])
  } catch (error) {
    console.error('❌ Erro interno na API:', error)
    // Retornar array vazio em vez de erro para não quebrar o frontend
    return NextResponse.json([])
  }
}

// POST /api/produtos - Cria um novo produto
export async function POST(request: NextRequest) {
  try {
    console.log('📡 POST /api/produtos - Criando produto')
    
    if (!supabase) {
      console.log('⚠️ Supabase não configurado')
      return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 })
    }

    const body = await request.json()
    console.log('📦 Dados recebidos:', body)
    
    // Validar campos obrigatórios
    const { nome, marca, preco, descricao, imagem_url, estoque, categorias } = body
    
    if (!nome || !marca || preco === undefined || !descricao || !imagem_url || estoque === undefined || !categorias) {
      console.log('❌ Campos obrigatórios faltando')
      return NextResponse.json({ 
        error: 'Campos obrigatórios: nome, marca, preco, descricao, imagem_url, estoque, categorias' 
      }, { status: 400 })
    }

    const { data: produto, error } = await supabase
      .from('produtos')
      .insert([{
        nome,
        marca,
        preco: parseFloat(preco),
        descricao,
        imagem_url,
        estoque: parseInt(estoque),
        categorias: Array.isArray(categorias) ? categorias : [categorias]
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar produto no Supabase:', error)
      return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
    }

    console.log('✅ Produto criado:', produto)
    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    console.error('❌ Erro interno na criação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}