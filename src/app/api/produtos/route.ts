import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Configuração Supabase:', {
  url: supabaseUrl ? '✅ Configurada' : '❌ Não configurada',
  key: supabaseKey ? '✅ Configurada' : '❌ Não configurada'
})

if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️ Variáveis de ambiente do Supabase não configuradas - usando modo fallback')
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// GET /api/produtos - Retorna todos os produtos
export async function GET() {
  try {
    console.log('📡 GET /api/produtos - Iniciando busca de produtos')
    
    // Se Supabase não estiver configurado, retornar produtos de exemplo
    if (!supabase) {
      console.log('⚠️ Supabase não configurado, retornando produtos de exemplo')
      const produtosExemplo = [
        {
          id: '1',
          nome: 'Nike Air Max 90',
          marca: 'Nike',
          preco: 299.99,
          descricao: 'Tênis Nike Air Max 90 clássico',
          imagem_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          estoque: 50,
          categorias: ['tenis'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          nome: 'Adidas Ultraboost',
          marca: 'Adidas',
          preco: 399.99,
          descricao: 'Tênis Adidas Ultraboost para corrida',
          imagem_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
          estoque: 30,
          categorias: ['tenis'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      return NextResponse.json(produtosExemplo)
    }

    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar produtos no Supabase:', error)
      // Retornar produtos de exemplo em caso de erro
      const produtosExemplo = [
        {
          id: '1',
          nome: 'Nike Air Max 90',
          marca: 'Nike',
          preco: 299.99,
          descricao: 'Tênis Nike Air Max 90 clássico',
          imagem_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          estoque: 50,
          categorias: ['tenis'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      return NextResponse.json(produtosExemplo)
    }

    console.log('✅ Produtos encontrados:', produtos?.length || 0)
    return NextResponse.json(produtos || [])
  } catch (error) {
    console.error('❌ Erro interno na API:', error)
    // Retornar produtos de exemplo em caso de erro
    const produtosExemplo = [
      {
        id: '1',
        nome: 'Nike Air Max 90',
        marca: 'Nike',
        preco: 299.99,
        descricao: 'Tênis Nike Air Max 90 clássico',
        imagem_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        estoque: 50,
        categorias: ['tenis'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    return NextResponse.json(produtosExemplo)
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
    
    if (!nome || !marca || preco === undefined || !imagem_url || !categorias) {
      console.log('❌ Campos obrigatórios faltando')
      return NextResponse.json({ 
        error: 'Campos obrigatórios: nome, marca, preco, imagem_url, categorias' 
      }, { status: 400 })
    }

    const { data: produto, error } = await supabase
      .from('produtos')
      .insert([{
        nome,
        marca,
        preco: parseFloat(preco) || 0,
        descricao: descricao || `${nome} da marca ${marca}`,
        imagem_url,
        estoque: parseInt(estoque) || 100,
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