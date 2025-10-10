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

// GET /api/produtos/[id] - Buscar produto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('📡 GET /api/produtos/[id] - Buscando produto UUID:', id)
    
    const supabase = createAuthenticatedClient()
    
    if (supabase) {
      // CORREÇÃO 2: Buscar produto usando UUID diretamente
      const { data: produto, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id) // UUID é usado diretamente
        .single()

      if (error) {
        console.error('❌ Erro ao buscar produto no Supabase:', error)
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }

      console.log('✅ Produto encontrado no Supabase:', produto)
      return NextResponse.json(produto)
    } else {
      // Fallback: buscar em produtos de exemplo
      console.log('⚠️ Supabase não configurado, usando fallback')
      const produto = fallbackProducts.find(p => p.id === id)
      
      if (!produto) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }
      
      console.log('✅ Produto encontrado no fallback:', produto)
      return NextResponse.json(produto)
    }
  } catch (error) {
    console.error('❌ Erro interno na busca:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/produtos/[id] - Atualizar produto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('📡 PUT /api/produtos/[id] - Atualizando produto UUID:', id)
    
    const body = await request.json()
    console.log('📦 Dados recebidos para atualização:', body)
    
    // CORREÇÃO 3: Extrair token de autenticação do header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔐 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
    
    // CORREÇÃO 3: Verificar se usuário está autenticado para operações de escrita
    if (!authToken) {
      console.error('❌ Token de autenticação obrigatório para atualizar produtos')
      return NextResponse.json({ 
        error: 'Não autorizado. Faça login para editar produtos.' 
      }, { status: 401 })
    }
    
    const { nome, marca, preco, descricao, imagem_url, estoque, categorias } = body

    // CORREÇÃO 3: Usar cliente autenticado com token do usuário
    const supabase = createAuthenticatedClient(authToken)
    
    if (supabase) {
      const updateData: any = {}
      if (nome !== undefined) updateData.nome = nome
      if (marca !== undefined) updateData.marca = marca
      if (preco !== undefined) updateData.preco = parseFloat(preco) || 0
      if (descricao !== undefined) updateData.descricao = descricao
      if (imagem_url !== undefined) updateData.imagem_url = imagem_url
      if (estoque !== undefined) updateData.estoque = parseInt(estoque) || 100
      if (categorias !== undefined) updateData.categorias = Array.isArray(categorias) ? categorias : [categorias]
      
      updateData.updated_at = new Date().toISOString()

      console.log('🔄 Tentando atualizar produto com UUID:', id, updateData)

      // CORREÇÃO 2: Atualizar produto usando UUID diretamente
      const { data: produto, error } = await supabase
        .from('produtos')
        .update(updateData)
        .eq('id', id) // UUID é usado diretamente
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar produto no Supabase:', error)
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
        
        if (error.code === '42501' || error.message.includes('permission denied')) {
          return NextResponse.json({ 
            error: 'Não autorizado. Verifique suas permissões no banco de dados.',
            details: error.message 
          }, { status: 403 })
        }
        
        return NextResponse.json({ 
          error: 'Erro ao atualizar produto. Verifique sua conexão com o banco de dados.',
          details: error.message 
        }, { status: 500 })
      }

      if (!produto) {
        console.log('❌ Produto não encontrado')
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }

      console.log('✅ Produto atualizado no Supabase:', produto)
      return NextResponse.json(produto)
    } else {
      // Fallback: atualizar em produtos de exemplo
      console.log('⚠️ Supabase não configurado, usando fallback')
      const productIndex = fallbackProducts.findIndex(p => p.id === id)
      
      if (productIndex === -1) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }
      
      const updateData = {
        ...fallbackProducts[productIndex],
        ...(nome !== undefined && { nome }),
        ...(marca !== undefined && { marca }),
        ...(preco !== undefined && { preco: parseFloat(preco) || 0 }),
        ...(descricao !== undefined && { descricao }),
        ...(imagem_url !== undefined && { imagem_url }),
        ...(estoque !== undefined && { estoque: parseInt(estoque) || 100 }),
        ...(categorias !== undefined && { categorias: Array.isArray(categorias) ? categorias : [categorias] }),
        updated_at: new Date().toISOString()
      }
      
      fallbackProducts[productIndex] = updateData
      console.log('✅ Produto atualizado no fallback:', updateData)
      return NextResponse.json(updateData)
    }
  } catch (error) {
    console.error('❌ Erro interno na atualização:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// CORREÇÃO 2: DELETE /api/produtos/[id] - Excluir produto usando UUID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('📡 DELETE /api/produtos/[id] - Excluindo produto UUID:', id)
    
    // CORREÇÃO 3: Extrair token de autenticação do header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔐 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
    
    // CORREÇÃO 3: Verificar se usuário está autenticado para operações de escrita
    if (!authToken) {
      console.error('❌ Token de autenticação obrigatório para excluir produtos')
      return NextResponse.json({ 
        error: 'Não autorizado. Faça login para excluir produtos.' 
      }, { status: 401 })
    }
    
    // CORREÇÃO 3: Usar cliente autenticado com token do usuário
    const supabase = createAuthenticatedClient(authToken)
    
    if (supabase) {
      console.log('🔄 Tentando excluir produto com UUID:', id)

      // CORREÇÃO 2: Excluir produto usando UUID diretamente
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id) // UUID é usado diretamente

      if (error) {
        console.error('❌ Erro ao excluir produto no Supabase:', error)
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
        
        if (error.code === '42501' || error.message.includes('permission denied')) {
          return NextResponse.json({ 
            error: 'Não autorizado. Verifique suas permissões no banco de dados.',
            details: error.message 
          }, { status: 403 })
        }
        
        return NextResponse.json({ 
          error: 'Erro ao excluir produto. Verifique sua conexão com o banco de dados.',
          details: error.message 
        }, { status: 500 })
      }

      console.log('✅ Produto excluído com sucesso do Supabase')
      return NextResponse.json({ message: 'Produto excluído com sucesso' })
    } else {
      // Fallback: excluir de produtos de exemplo
      console.log('⚠️ Supabase não configurado, usando fallback')
      const productIndex = fallbackProducts.findIndex(p => p.id === id)
      
      if (productIndex === -1) {
        console.log('❌ Produto não encontrado no fallback')
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }
      
      // Remover produto do array
      const removedProduct = fallbackProducts.splice(productIndex, 1)[0]
      console.log('✅ Produto excluído com sucesso do fallback:', removedProduct.nome)
      return NextResponse.json({ message: 'Produto excluído com sucesso' })
    }
  } catch (error) {
    console.error('❌ Erro interno na exclusão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}