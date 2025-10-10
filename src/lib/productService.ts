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

  // Obter token de autenticação do usuário logado com tratamento de erro
  private static async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') {
      console.log('⚠️ Executando no servidor, sem acesso ao token')
      return null
    }

    if (!supabase) {
      console.log('⚠️ Supabase não configurado')
      return null
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Erro ao obter sessão:', error)
        handleAuthError(error)
        return null
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
      handleAuthError(error)
      return null
    }
  }

  // Criar headers com autenticação
  private static async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('🔐 Header de autenticação adicionado')
    } else {
      console.log('⚠️ Requisição sem autenticação')
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

  // Produtos de fallback para quando a API não funcionar
  private static getFallbackProducts(): Product[] {
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
      },
      {
        id: '3',
        name: 'Puma RS-X',
        brand: 'Puma',
        category: 'tenis',
        price: 249.99,
        rating: 4.3,
        colors: [{
          id: '3-1',
          name: 'Principal',
          hex: '#000000',
          image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop'
        }],
        selectedColorId: '3-1'
      }
    ]
  }

  // GET /api/produtos - Buscar todos os produtos
  static async getAll(): Promise<Product[]> {
    try {
      console.log('🌐 Fazendo requisição para:', this.baseUrl)
      
      // Configurar timeout e retry
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 segundos
      
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('📡 Resposta da API:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na resposta da API:', response.status, errorText)
        console.log('🔄 Retornando produtos de fallback devido ao erro da API')
        return this.getFallbackProducts()
      }
      
      const data = await response.json()
      console.log('📦 Dados recebidos da API:', data?.length || 0, 'produtos')
      
      // Garantir que data é sempre um array
      if (!Array.isArray(data)) {
        console.log('⚠️ Resposta da API não é um array, usando fallback')
        return this.getFallbackProducts()
      }
      
      // Se não há produtos, retornar fallback
      if (data.length === 0) {
        console.log('📦 Nenhum produto retornado, usando produtos de exemplo')
        return this.getFallbackProducts()
      }
      
      console.log('🔄 Convertendo produtos do banco para frontend')
      
      // Converter produtos do banco para formato do frontend
      const products = data.map((dbProduct: DatabaseProduct) => {
        try {
          return this.convertFromDatabase(dbProduct)
        } catch (error) {
          console.error('❌ Erro ao converter produto:', dbProduct, error)
          return null
        }
      }).filter(Boolean) as Product[]
      
      console.log('✅ Produtos convertidos:', products.length)
      return products.length > 0 ? products : this.getFallbackProducts()
      
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error)
      
      // Tratar diferentes tipos de erro
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('⏱️ Timeout na requisição, usando produtos de fallback')
        } else if (error.message.includes('fetch')) {
          console.log('🌐 Erro de rede, usando produtos de fallback')
        } else {
          console.log('❌ Erro desconhecido, usando produtos de fallback')
        }
      }
      
      handleAuthError(error)
      return this.getFallbackProducts()
    }
  }

  // GET /api/produtos/[id] - Buscar produto específico
  static async getById(id: string): Promise<Product | null> {
    try {
      console.log('🔍 Buscando produto por ID:', id)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        cache: 'no-store',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
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
      
      const headers = await this.getAuthHeaders()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(dbProduct),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
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
      console.log('✅ Produto criado:', createdProduct.id)
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
      console.log('✏️ Atualizando produto:', id, product)
      const dbProduct = this.convertToDatabase(product)
      console.log('🔄 Dados para API:', dbProduct)
      
      const headers = await this.getAuthHeaders()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dbProduct),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
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

  // DELETE /api/produtos/[id] - Excluir produto
  static async delete(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo produto:', id)
      
      const headers = await this.getAuthHeaders()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
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
      console.log('🗑️ Excluindo produto diretamente no Supabase:', id)
      
      const authenticatedClient = await getAuthenticatedClient()
      
      const { error } = await authenticatedClient
        .from('produtos')
        .delete()
        .eq('id', id)
      
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