// Tipos para o banco de dados
interface DatabaseProduct {
  id: string
  nome: string
  preco: number
  descricao?: string
  categoria?: string
  imagem?: string
  estoque?: number
  created_at?: string
  updated_at?: string
}

// Tipos para o frontend
interface Product {
  id: string
  name: string
  price: number
  description?: string
  category?: string
  image?: string
  stock?: number
  createdAt?: string
  updatedAt?: string
}

export class ProductService {
  private static baseUrl = '/api/produtos'

  // Converter produto do banco para formato do frontend
  private static convertFromDatabase(dbProduct: DatabaseProduct): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.nome,
      price: dbProduct.preco,
      description: dbProduct.descricao,
      category: dbProduct.categoria,
      image: dbProduct.imagem,
      stock: dbProduct.estoque,
      createdAt: dbProduct.created_at,
      updatedAt: dbProduct.updated_at
    }
  }

  // Converter produto do frontend para formato do banco
  private static convertToDatabase(product: Partial<Product>): Partial<DatabaseProduct> {
    return {
      id: product.id,
      nome: product.name,
      preco: product.price,
      descricao: product.description,
      categoria: product.category,
      imagem: product.image,
      estoque: product.stock
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
        throw new Error(`Erro na API: ${response.status}`)
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
      // Não retornar fallback, lançar erro para que o componente mostre erro
      throw error
    }
  }

  // GET /api/produtos/[id] - Buscar produto por ID
  static async getById(id: string): Promise<Product | null> {
    try {
      console.log('🌐 Buscando produto por ID:', id)
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      const dbProduct = await response.json()
      return this.convertFromDatabase(dbProduct)
    } catch (error) {
      console.error('❌ Erro ao buscar produto por ID:', error)
      throw error
    }
  }

  // POST /api/produtos - Criar novo produto
  static async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      console.log('🌐 Criando produto:', product)
      
      const dbProduct = this.convertToDatabase(product)
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbProduct)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao criar produto:', errorText)
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      const createdProduct = await response.json()
      return this.convertFromDatabase(createdProduct)
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error)
      throw error
    }
  }

  // PUT /api/produtos/[id] - Atualizar produto
  static async update(id: string, product: Partial<Product>): Promise<Product> {
    try {
      console.log('🌐 Atualizando produto:', id, product)
      
      const dbProduct = this.convertToDatabase(product)
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbProduct)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao atualizar produto:', errorText)
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      const updatedProduct = await response.json()
      return this.convertFromDatabase(updatedProduct)
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error)
      throw error
    }
  }

  // DELETE /api/produtos/[id] - Deletar produto
  static async delete(id: string): Promise<void> {
    try {
      console.log('🌐 Deletando produto:', id)
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao deletar produto:', errorText)
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      console.log('✅ Produto deletado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error)
      throw error
    }
  }
}

// Exportar tipos para uso em outros arquivos
export type { Product, DatabaseProduct }