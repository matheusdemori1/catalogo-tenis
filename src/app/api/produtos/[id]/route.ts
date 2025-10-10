import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/supabase'

// GET /api/produtos/[id] - Buscar produto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('📡 GET /api/produtos/[id] - Buscando produto:', id)
    
    // Extrair token de autenticação do header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔐 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
    
    const supabase = createAuthenticatedClient(authToken)
    
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
    }

    console.log('🔍 Buscando produto com ID:', id)

    const { data: produto, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Erro ao buscar produto no Supabase:', error)
      console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        error: 'Erro ao buscar produto. Verifique sua conexão com o banco de dados.',
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Produto encontrado no Supabase:', produto)
    return NextResponse.json(produto, { status: 200 })
  } catch (error) {
    console.error('❌ Erro interno na busca por ID:', error)
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
    
    // Extrair token de autenticação do header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔐 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
    
    const supabase = createAuthenticatedClient(authToken)
    
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    console.log('🔄 Tentando atualizar produto com dados:', updateData)

    const { data: produto, error } = await supabase
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
      console.log('❌ Produto não encontrado para atualização')
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    console.log('✅ Produto atualizado no Supabase:', produto)
    return NextResponse.json(produto, { status: 200 })
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
    
    // Extrair token de autenticação do header
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔐 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
    
    const supabase = createAuthenticatedClient(authToken)
    
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
    }

    console.log('🗑️ Tentando excluir produto com ID:', id)

    const { data: produto, error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao excluir produto no Supabase:', error)
      console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Erro ao excluir produto. Verifique sua conexão com o banco de dados.',
        details: error.message 
      }, { status: 500 })
    }

    if (!produto) {
      console.log('❌ Produto não encontrado para exclusão')
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    console.log('✅ Produto excluído no Supabase:', produto)
    return NextResponse.json({ message: 'Produto excluído com sucesso', produto })
  } catch (error) {
    console.error('❌ Erro interno na exclusão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}