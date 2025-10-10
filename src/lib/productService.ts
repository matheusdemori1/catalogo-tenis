import { DatabaseProduct, handleAuthError, getAuthenticatedClient } from './supabase'
import { supabase } from './supabase'

// Interface para o produto no frontend (compatível com o formato atual)
export interface Product {
  id: string
  name: string
  brand: string
  category: 'tenis' | 'camiseta-time' | 'society' | 'chuteira' | 'bolsa'
  price: number
  rating: number
  colors: Color[]
  selectedColorId: string
}

export interface Color {
  id: string
  name: string
  hex: string
  image: string
}

// Serviço para comunicação com a API
export class ProductService {
  private static baseUrl = '/api/produtos'

  // CORREÇÃO 3: Obter token de autenticação do usuário logado com tratamento de erro
  private static async getAuthToken(): Promise<string | null> {
    if (!supabase) {
      console.log('⚠️ Supabase não configurado')
      return null
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Erro ao obter sessão:', error)
        // Tratar erro de refresh token
        if (handleAuthError(error)) {
          return null
        }
        throw error
      }
      
      if (session?.access_token) {
        console.log('🔐 Token de autenticação obtido para usuário:', session.user?.email)
        return session.access_token
      } else {
        console.log('⚠️ Usuário não autenticado')
        return null
      }
    } catch (error) {
      console.error('❌ Erro ao obter token:', error)
      // Tratar erro de refresh token
      handleAuthError(error)
      return null
    }
  }

  // CORREÇÃO 3: Criar headers com autenticação obrigatória para operações de escrita
  private static async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('🔐 Header de autenticação adicionado')
    } else {
      console.log('⚠️ Requisição sem autenticação - operações de escrita podem falhar')
    }

    return headers
  }

  // Converter produto do banco para formato do frontend
  private static convertFromDatabase(dbProduct: DatabaseProduct): Product {
    // Para manter compatibilidade, vamos criar cores baseadas na imagem principal
    const colors: Color[] = [
      {
        id: `${dbProduct.id}-1`,
        name: 'Principal',
        hex: '#000000',
        image: dbProduct.imagem_url
      }
    ]

    // Mapear categoria do banco para formato do frontend
    const categoryMap: Record<string, Product['category']> = {
      'tenis': 'tenis',
      'camiseta': 'camiseta-time',
      'society': 'society',
      'chuteira': 'chuteira',
      'bolsa': 'bolsa'
    }

    const category = Array.isArray(dbProduct.categorias) ? dbProduct.categorias[0] : 'tenis'
    const mappedCategory = categoryMap[category] || 'tenis'

    return {
      id: dbProduct.id,
      name: dbProduct.nome,
      brand: dbProduct.marca,
      category: mappedCategory,
      price: dbProduct.preco,
      rating: 4.5, // Valor padrão por enquanto
      colors,
      selectedColorId: colors[0].id
    }
  }

  // Converter produto do frontend para formato do banco
  private static convertToDatabase(product: Partial<Product>): Partial<DatabaseProduct> {
    const categoryMap: Record<Product['category'], string> = {
      'tenis': 'tenis',
      'camiseta-time': 'camiseta',
      'society': 'society',
      'chuteira': 'chuteira',
      'bolsa': 'bolsa'
    }

    return {
      nome: product.name,
      marca: product.brand,
      preco: product.price || 0,
      descricao: `${product.name} da marca ${product.brand}`,
      imagem_url: product.colors?.[0]?.image || '',
      estoque: 100, // Valor padrão
      categorias: product.category ? [categoryMap[product.category]] : ['tenis']
    }
  }

  // GET /api/produtos - Buscar todos os produtos
  static async getAll(): Promise<Product[]> {
    try {
      console.log('🌐 Fazendo requisição para:', this.baseUrl)
      
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Evitar cache para sempre buscar dados atualizados
        // Adicionar timeout para evitar travamento
        signal: AbortSignal.timeout(10000) // 10 segundos
      })
      
      console.log('📡 Resposta da API:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', errorText)
        console.log('🔄 Retornando array vazio devido ao erro')
        return []
      }
      
      const data = await response.json()
      console.log('📦 Dados recebidos da API:', data)
      
      // Garantir que data é sempre um array
      if (!Array.isArray(data)) {
        console.log('⚠️ Resposta da API não é um array:', typeof data)
        return []
      }
      
      console.log('🔄 Convertendo produtos:', data.length)
      
      // Converter produtos do banco para formato do frontend
      const products = data.map((dbProduct: DatabaseProduct) => {
        try {
          return this.convertFromDatabase(dbProduct)
        } catch (error) {
          console.error('❌ Erro ao converter produto:', dbProduct, error)
          return null
        }
      }).filter(Boolean) as Product[] // Remover produtos que falharam na conversão
      
      console.log('✅ Produtos convertidos:', products.length)
      return products
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error)
      
      // Tratar erro de refresh token
      if (handleAuthError(error)) {
        console.log('🔄 Erro de refresh token tratado, retornando array vazio')
        return []
      }
      
      // Se for erro de timeout ou rede, retornar produtos de exemplo
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.log('🔄 Retornando produtos de exemplo devido a erro de rede')
        return [
          {
            id: '1',
            name: 'Nike Air Max 90',
            brand: 'Nike',
            category: 'tenis',
            price: 299.99,
            rating: 4.5,
            colors: [{
              id: '1-1',
              name: 'Principal',
              hex: '#000000',
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
            }],
            selectedColorId: '1-1'
          },
          {
            id: '2',
            name: 'Adidas Ultraboost',
            brand: 'Adidas',
            category: 'tenis',
            price: 399.99,
            rating: 4.7,
            colors: [{
              id: '2-1',
              name: 'Principal',
              hex: '#000000',
              image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
            }],
            selectedColorId: '2-1'
          }
        ]
      }
      
      return []
    }
  }

  // GET /api/produtos/[id] - Buscar produto específico
  static async getById(id: string): Promise<Product | null> {
    try {
      console.log('🔍 Buscando produto por ID UUID:', id)
      const response = await fetch(`${this.baseUrl}/${id}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000) // 5 segundos
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('❌ Produto não encontrado')
          return null
        }
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const dbProduct: DatabaseProduct = await response.json()
      console.log('✅ Produto encontrado:', dbProduct)
      return this.convertFromDatabase(dbProduct)
    } catch (error) {
      console.error('❌ Erro ao buscar produto:', error)
      handleAuthError(error)
      return null
    }
  }

  // POST /api/produtos - Criar novo produto
  static async create(product: Omit<Product, 'id'>): Promise<Product | null> {
    try {
      console.log('➕ Criando produto:', product)
      const dbProduct = this.convertToDatabase(product)
      console.log('🔄 Dados para API:', dbProduct)
      
      // CORREÇÃO 3: Obter headers com token de autenticação
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(dbProduct),
        signal: AbortSignal.timeout(10000) // 10 segundos
      })
      
      console.log('📡 Resposta da criação:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na criação:', errorText)
        
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login para adicionar produtos.')
        }
        
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
      }
      
      const createdProduct: DatabaseProduct = await response.json()
      console.log('✅ Produto criado com UUID:', createdProduct.id)
      return this.convertFromDatabase(createdProduct)
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error)
      handleAuthError(error)
      throw error
    }
  }

  // PUT /api/produtos/[id] - Atualizar produto
  static async update(id: string, product: Partial<Product>): Promise<Product | null> {
    try {
      console.log('✏️ Atualizando produto com UUID:', id, product)
      const dbProduct = this.convertToDatabase(product)
      console.log('🔄 Dados para API:', dbProduct)
      
      // CORREÇÃO 3: Obter headers com token de autenticação
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dbProduct),
        signal: AbortSignal.timeout(10000) // 10 segundos
      })
      
      console.log('📡 Resposta da atualização:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na atualização:', errorText)
        
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login para editar produtos.')
        }
        
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
      }
      
      const updatedProduct: DatabaseProduct = await response.json()
      console.log('✅ Produto atualizado:', updatedProduct)
      return this.convertFromDatabase(updatedProduct)
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error)
      handleAuthError(error)
      throw error
    }
  }

  // CORREÇÃO 2: DELETE /api/produtos/[id] - Excluir produto usando UUID
  static async delete(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo produto com UUID:', id)
      
      // CORREÇÃO 3: Obter headers com token de autenticação
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers,
        signal: AbortSignal.timeout(10000) // 10 segundos
      })
      
      console.log('📡 Resposta da exclusão:', response.status)
      
      if (response.ok) {
        console.log('✅ Produto excluído com sucesso')
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ Erro na exclusão:', errorText)
        
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login para excluir produtos.')
        }
        
        return false
      }
    } catch (error) {
      console.error('❌ Erro ao excluir produto:', error)
      handleAuthError(error)
      
      if (error instanceof Error && error.message.includes('Não autorizado')) {
        throw error
      }
      
      return false
    }
  }

  // Método direto para operações no Supabase (alternativa à API)
  static async deleteDirectly(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo produto diretamente no Supabase com UUID:', id)
      
      const authenticatedClient = await getAuthenticatedClient()
      
      const { error } = await authenticatedClient
        .from('produtos')
        .delete()
        .eq('id', id) // CORREÇÃO 2: Usar UUID diretamente
      
      if (error) {
        console.error('❌ Erro ao excluir no Supabase:', error)
        return false
      }
      
      console.log('✅ Produto excluído diretamente no Supabase')
      return true
    } catch (error) {
      console.error('❌ Erro na exclusão direta:', error)
      handleAuthError(error)
      return false
    }
  }
}