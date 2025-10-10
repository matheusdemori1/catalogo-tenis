import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/supabase'

// GET /api/produtos - Buscar todos os produtos
export async function GET(request: NextRequest) {
  try {
    console.log('📡 GET /api/produtos - Buscando todos os produtos')
    
    // Extrair token de autenticação do header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔐 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
    
    const supabase = createAuthenticatedClient(authToken)
    
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
    }

    console.log('🔄 Buscando produtos no Supabase...')

    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar produtos no Supabase:', error)
      console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Erro ao buscar produtos. Verifique sua conexão com o banco de dados.',
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Produtos encontrados no Supabase:', produtos?.length || 0)
    return NextResponse.json(produtos || [], { status: 200 })
  } catch (error) {
    console.error('❌ Erro interno na busca:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/produtos - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    console.log('📡 POST /api/produtos - Criando produto')
    
    const body = await request.json()
    console.log('📦 Dados recebidos para criação:', body)
    
    // Extrair token de autenticação do header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔐 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
    
    const { nome, marca, preco, descricao, imagem_url, estoque, categorias } = body

    const supabase = createAuthenticatedClient(authToken)
    
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
    }

    const insertData = {
      nome: nome || '',
      marca: marca || '',
      preco: parseFloat(preco) || 0,
      descricao: descricao || '',
      imagem_url: imagem_url || '',
      estoque: parseInt(estoque) || 100,
      categorias: Array.isArray(categorias) ? categorias : [categorias || 'geral'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('🔄 Tentando inserir com dados:', insertData)

    const { data: produto, error } = await supabase
      .from('produtos')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar produto no Supabase:', error)
      console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Erro ao criar produto. Verifique sua conexão com o banco de dados.',
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Produto criado no Supabase:', produto)
    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    console.error('❌ Erro interno na criação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}