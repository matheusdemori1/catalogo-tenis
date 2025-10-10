import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// GET /api/produtos/[id] - Buscar produto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('📡 GET /api/produtos/[id] - Buscando produto:', id)
    
    if (!supabase) {
      console.log('⚠️ Supabase não configurado')
      return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 })
    }

    const { data: produto, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Erro ao buscar produto no Supabase:', error)
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    console.log('✅ Produto encontrado:', produto)
    return NextResponse.json(produto)
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
    
    if (!supabase) {
      console.log('⚠️ Supabase não configurado')
      return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 })
    }

    const body = await request.json()
    console.log('📦 Dados recebidos para atualização:', body)
    
    const { nome, marca, preco, descricao, imagem_url, estoque, categorias } = body

    const updateData: any = {}
    if (nome !== undefined) updateData.nome = nome
    if (marca !== undefined) updateData.marca = marca
    if (preco !== undefined) updateData.preco = parseFloat(preco) || 0
    if (descricao !== undefined) updateData.descricao = descricao
    if (imagem_url !== undefined) updateData.imagem_url = imagem_url
    if (estoque !== undefined) updateData.estoque = parseInt(estoque) || 100
    if (categorias !== undefined) updateData.categorias = Array.isArray(categorias) ? categorias : [categorias]
    
    updateData.updated_at = new Date().toISOString()

    const { data: produto, error } = await supabase
      .from('produtos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar produto no Supabase:', error)
      return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
    }

    if (!produto) {
      console.log('❌ Produto não encontrado')
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    console.log('✅ Produto atualizado:', produto)
    return NextResponse.json(produto)
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
    
    if (!supabase) {
      console.log('⚠️ Supabase não configurado')
      return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 })
    }

    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Erro ao excluir produto no Supabase:', error)
      return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 })
    }

    console.log('✅ Produto excluído com sucesso')
    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    console.error('❌ Erro interno na exclusão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}