import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Verificar se as variáveis de ambiente estão definidas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔑 URL do Supabase:', supabaseUrl ? 'Definida' : 'Não definida')
    console.log('🔑 Chave do Supabase:', supabaseKey ? 'Definida' : 'Não definida')
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas',
        details: {
          url: !!supabaseUrl,
          key: !!supabaseKey
        }
      })
    }
    
    // Testar conexão básica
    console.log('📡 Testando conexão básica...')
    const { data, error } = await supabase
      .from('produtos')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Erro na conexão:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro na conexão com Supabase',
        details: {
          code: error.code,
          message: error.message,
          hint: error.hint
        }
      })
    }
    
    console.log('✅ Conexão bem-sucedida!')
    return NextResponse.json({
      success: true,
      message: 'Conexão com Supabase funcionando',
      count: data
    })
    
  } catch (error) {
    console.error('❌ Erro interno:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}