'use client'

import { useState, useEffect } from 'react'
import { ProductService } from '@/lib/productService'

interface Produto {
  id: string
  nome: string
  marca: string
  preco: number
  descricao: string
  imagem_url: string
  estoque: number
  categorias: string[]
}

export function ProductList() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    try {
      setLoading(true)
      const data = await ProductService.getAll()
      setProdutos(data)
    } catch (err) {
      setError('Erro ao carregar produtos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando produtos...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {produtos.map((produto) => (
        <div key={produto.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold">{produto.nome}</h3>
            <p className="text-gray-600">{produto.marca}</p>
            <p className="text-xl font-bold text-green-600">R$ {produto.preco.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">{produto.descricao}</p>
            <p className="text-sm text-gray-500">Estoque: {produto.estoque}</p>
          </div>
        </div>
      ))}
    </div>
  )
}