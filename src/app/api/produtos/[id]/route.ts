import { NextRequest, NextResponse } from 'next/server'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Criar clientes Supabase
let supabase: any = null
let supabaseAdmin: any = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    const { createClient } = require('@supabase/supabase-js')
    
    // Cliente público
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Cliente administrativo (usa service key se disponível, senão usa anon key)
    if (supabaseServiceKey) {
      console.log('🔑 Usando service role key para operações administrativas')
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } else {
      console.log('⚠️ Service role key não encontrada, usando anon key')
      supabaseAdmin = supabase
    }
  } catch (error) {
    console.error('❌ Erro ao criar cliente Supabase:', error)
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
    console.log('📡 GET /api/produtos/[id] - Buscando produto:', id)
    
    if (supabase) {
      const { data: produto, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
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
    console.log('📡 PUT /api/produtos/[id] - Atualizando produto:', id)
    
    const body = await request.json()
    console.log('📦 Dados recebidos para atualização:', body)
    
    const { nome, marca, preco, descricao, imagem_url, estoque, categorias } = body

    if (supabaseAdmin) {
      const updateData: any = {}
      if (nome !== undefined) updateData.nome = nome
      if (marca !== undefined) updateData.marca = marca
      if (preco !== undefined) updateData.preco = parseFloat(preco) || 0
      if (descricao !== undefined) updateData.descricao = descricao
      if (imagem_url !== undefined) updateData.imagem_url = imagem_url
      if (estoque !== undefined) updateData.estoque = parseInt(estoque) || 100
      if (categorias !== undefined) updateData.categorias = Array.isArray(categorias) ? categorias : [categorias]
      
      updateData.updated_at = new Date().toISOString()

      console.log('🔄 Tentando atualizar com dados:', updateData)

      const { data: produto, error } = await supabaseAdmin
        .from('produtos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar produto no Supabase:', error)
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
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

// DELETE /api/produtos/[id] - Excluir produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('📡 DELETE /api/produtos/[id] - Excluindo produto:', id)
    
    if (supabaseAdmin) {
      console.log('🔄 Tentando excluir produto com ID:', id)

      const { error } = await supabaseAdmin
        .from('produtos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao excluir produto no Supabase:', error)
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
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