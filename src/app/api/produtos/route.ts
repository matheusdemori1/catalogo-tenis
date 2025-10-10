import { NextRequest, NextResponse } from 'next/server'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Função para criar cliente Supabase com tratamento de erro robusto
function createSupabaseClient(authToken?: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('⚠️ Variáveis de ambiente do Supabase não configuradas')
    return null
  }

  try {
    const { createClient } = require('@supabase/supabase-js')
    
    // Priorizar token de autenticação do usuário
    if (authToken) {
      console.log('🔐 Usando token de autenticação do usuário')
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      })
    }
    
    // Se temos service key, usar ela
    if (supabaseServiceKey) {
      console.log('🔑 Usando service role key')
      return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }
    
    // Fallback para cliente público
    console.log('📖 Usando cliente público')
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
  },
  {
    id: '3',
    nome: 'Puma RS-X',
    marca: 'Puma',
    preco: 249.99,
    descricao: 'Tênis Puma RS-X com design futurista',
    imagem_url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop',
    estoque: 100,
    categorias: ['tenis'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// GET /api/produtos - Listar todos os produtos
export async function GET() {
  try {
    console.log('📡 GET /api/produtos - Iniciando busca de produtos')
    
    const supabase = createSupabaseClient()
    
    if (supabase) {
      try {
        console.log('🔄 Tentando buscar produtos no Supabase...')
        
        const { data: produtos, error } = await supabase
          .from('produtos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ Erro ao buscar produtos no Supabase:', error)
          console.log('⚠️ Usando produtos de fallback devido ao erro do Supabase')
          return NextResponse.json(fallbackProducts)
        }

        console.log(`✅ ${produtos?.length || 0} produtos encontrados no Supabase`)
        
        // Se não há produtos no banco, retornar fallback
        if (!produtos || produtos.length === 0) {
          console.log('📦 Nenhum produto no banco, retornando produtos de exemplo')
          return NextResponse.json(fallbackProducts)
        }
        
        return NextResponse.json(produtos)
      } catch (supabaseError) {
        console.error('❌ Erro na conexão com Supabase:', supabaseError)
        console.log('⚠️ Usando produtos de fallback devido ao erro de conexão')
        return NextResponse.json(fallbackProducts)
      }
    } else {
      console.log('⚠️ Supabase não configurado, usando produtos de fallback')
      return NextResponse.json(fallbackProducts)
    }
  } catch (error) {
    console.error('❌ Erro interno na API:', error)
    console.log('⚠️ Retornando produtos de fallback devido ao erro interno')
    return NextResponse.json(fallbackProducts)
  }
}

// POST /api/produtos - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    console.log('📡 POST /api/produtos - Criando produto')
    
    const body = await request.json()
    console.log('📦 Dados recebidos:', body)
    
    // Extrair token de autenticação do header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔐 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
    
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

    const supabase = createSupabaseClient(authToken)
    
    if (supabase) {
      try {
        console.log('🔄 Tentando criar produto no Supabase:', novoProduto)

        const { data: produto, error } = await supabase
          .from('produtos')
          .insert([novoProduto])
          .select()
          .single()

        if (error) {
          console.error('❌ Erro ao criar produto no Supabase:', error)
          
          if (error.code === '42501' || error.message.includes('permission denied')) {
            return NextResponse.json({ 
              error: 'Não autorizado. Verifique suas permissões no banco de dados.',
              details: error.message 
            }, { status: 403 })
          }
          
          // Fallback: criar no sistema local
          console.log('⚠️ Criando produto no fallback devido ao erro do Supabase')
          const produtoComId = {
            id: (fallbackProducts.length + 1).toString(),
            ...novoProduto,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          fallbackProducts.push(produtoComId)
          return NextResponse.json(produtoComId, { status: 201 })
        }

        console.log('✅ Produto criado no Supabase:', produto)
        return NextResponse.json(produto, { status: 201 })
      } catch (supabaseError) {
        console.error('❌ Erro na conexão com Supabase:', supabaseError)
        
        // Fallback: criar no sistema local
        console.log('⚠️ Criando produto no fallback devido ao erro de conexão')
        const produtoComId = {
          id: (fallbackProducts.length + 1).toString(),
          ...novoProduto,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        fallbackProducts.push(produtoComId)
        return NextResponse.json(produtoComId, { status: 201 })
      }
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

// PUT /api/produtos/[id] - Atualizar produto (implementação futura)
export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Método não implementado' }, { status: 501 })
}

// DELETE /api/produtos/[id] - Excluir produto (implementação futura)
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Método não implementado' }, { status: 501 })
}