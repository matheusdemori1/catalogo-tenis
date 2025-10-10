import { NextRequest, NextResponse } from 'next/server'

// CORREÇÃO 1: Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// CORREÇÃO 3: Função para criar cliente Supabase autenticado com token do usuário
function createAuthenticatedClient(authToken?: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente do Supabase não configuradas')
    return null
  }

  try {
    const { createClient } = require('@supabase/supabase-js')
    
    // CORREÇÃO 3: Priorizar token de autenticação do usuário para operações CRUD
    if (authToken) {
      console.log('🔐 Usando token de autenticação do usuário para operação CRUD')
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      })
    }
    
    // Se temos service key, usar ela (para operações administrativas)
    if (supabaseServiceKey) {
      console.log('🔑 Usando service role key para operações administrativas')
      return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }
    
    // Fallback para cliente público (apenas leitura)
    console.log('⚠️ Usando cliente público (apenas leitura)')
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('❌ Erro ao criar cliente Supabase:', error)
    return null
  }
}

// Sistema de produtos em memória para fallback
let fallbackProducts: any[] = [
  {
    id: '1',
    nome: 'Nike Air Max 90',
    marca: 'Nike',
    preco: 299.99,
    descricao: 'Tênis Nike Air Max 90 com tecnologia de amortecimento',
    imagem_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    estoque: 100,
    categorias: ['tenis'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Adidas Ultraboost',
    marca: 'Adidas',
    preco: 399.99,
    descricao: 'Tênis Adidas Ultraboost com tecnologia Boost',
    imagem_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    estoque: 100,
    categorias: ['tenis'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// GET /api/produtos - Listar todos os produtos
export async function GET() {
  try {
    console.log('📡 GET /api/produtos - Listando produtos')
    
    const supabase = createAuthenticatedClient()
    
    if (supabase) {
      const { data: produtos, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar produtos no Supabase:', error)
        console.log('⚠️ Usando produtos de fallback devido ao erro')
        return NextResponse.json(fallbackProducts)
      }

      console.log(`✅ ${produtos?.length || 0} produtos encontrados no Supabase`)
      return NextResponse.json(produtos || [])
    } else {
      console.log('⚠️ Supabase não configurado, usando fallback')
      return NextResponse.json(fallbackProducts)
    }
  } catch (error) {
    console.error('❌ Erro interno na listagem:', error)
    console.log('⚠️ Retornando produtos de fallback devido ao erro')
    return NextResponse.json(fallbackProducts)
  }
}

// POST /api/produtos - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    console.log('📡 POST /api/produtos - Criando produto')
    
    const body = await request.json()
    console.log('📦 Dados recebidos:', body)
    
    // CORREÇÃO 3: Extrair token de autenticação do header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔐 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
    
    // CORREÇÃO 3: Verificar se usuário está autenticado para operações de escrita
    if (!authToken) {
      console.error('❌ Token de autenticação obrigatório para criar produtos')
      return NextResponse.json({ 
        error: 'Não autorizado. Faça login para adicionar produtos.' 
      }, { status: 401 })
    }
    
    const { nome, marca, preco, descricao, imagem_url, estoque, categorias } = body

    // Validação básica
    if (!nome || !marca || !preco || !imagem_url) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: nome, marca, preco, imagem_url' 
      }, { status: 400 })
    }

    const novoProduto = {
      nome,
      marca,
      preco: parseFloat(preco) || 0,
      descricao: descricao || '',
      imagem_url,
      estoque: parseInt(estoque) || 100,
      categorias: Array.isArray(categorias) ? categorias : [categorias || 'tenis']
    }

    // CORREÇÃO 3: Usar cliente autenticado com token do usuário
    const supabase = createAuthenticatedClient(authToken)
    
    if (supabase) {
      console.log('🔄 Tentando criar produto com autenticação:', novoProduto)

      const { data: produto, error } = await supabase
        .from('produtos')
        .insert([novoProduto])
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar produto no Supabase:', error)
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
        
        if (error.code === '42501' || error.message.includes('permission denied')) {
          return NextResponse.json({ 
            error: 'Não autorizado. Verifique suas permissões no banco de dados.',
            details: error.message 
          }, { status: 403 })
        }
        
        return NextResponse.json({ 
          error: 'Erro ao criar produto. Verifique sua conexão com o banco de dados.',
          details: error.message 
        }, { status: 500 })
      }

      console.log('✅ Produto criado no Supabase:', produto)
      return NextResponse.json(produto, { status: 201 })
    } else {
      // Fallback: adicionar aos produtos de exemplo
      console.log('⚠️ Supabase não configurado, usando fallback')
      const produtoComId = {
        id: (fallbackProducts.length + 1).toString(),
        ...novoProduto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      fallbackProducts.push(produtoComId)
      console.log('✅ Produto criado no fallback:', produtoComId)
      return NextResponse.json(produtoComId, { status: 201 })
    }
  } catch (error) {
    console.error('❌ Erro interno na criação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}