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

export function AdminPanel() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    marca: '',
    preco: '',
    descricao: '',
    imagem_url: '',
    estoque: '',
    categorias: ''
  })

  useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    try {
      setLoading(true)
      const data = await ProductService.getAll()
      setProdutos(data)
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const produtoData = {
        nome: formData.nome,
        marca: formData.marca,
        preco: parseFloat(formData.preco),
        descricao: formData.descricao,
        imagem_url: formData.imagem_url,
        estoque: parseInt(formData.estoque),
        categorias: formData.categorias.split(',').map(c => c.trim())
      }

      if (editingId) {
        await ProductService.update(editingId, produtoData)
      } else {
        await ProductService.create(produtoData)
      }

      resetForm()
      loadProdutos()
    } catch (err) {
      console.error('Erro ao salvar produto:', err)
    }
  }

  const handleEdit = (produto: Produto) => {
    setEditingId(produto.id)
    setFormData({
      nome: produto.nome,
      marca: produto.marca,
      preco: produto.preco.toString(),
      descricao: produto.descricao,
      imagem_url: produto.imagem_url,
      estoque: produto.estoque.toString(),
      categorias: produto.categorias.join(', ')
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await ProductService.delete(id)
        loadProdutos()
      } catch (err) {
        console.error('Erro ao excluir produto:', err)
      }
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      nome: '',
      marca: '',
      preco: '',
      descricao: '',
      imagem_url: '',
      estoque: '',
      categorias: ''
    })
  }

  if (loading) {
    return <div className="text-center py-8">Carregando painel administrativo...</div>
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Painel Administrativo</h2>

      {/* Formulário */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">
          {editingId ? 'Editar Produto' : 'Adicionar Produto'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <input
              type="text"
              value={formData.marca}
              onChange={(e) => setFormData({...formData, marca: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preço</label>
            <input
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData({...formData, preco: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estoque</label>
            <input
              type="number"
              value={formData.estoque}
              onChange={(e) => setFormData({...formData, estoque: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Imagem URL</label>
            <input
              type="url"
              value={formData.imagem_url}
              onChange={(e) => setFormData({...formData, imagem_url: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Categorias (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.categorias}
              onChange={(e) => setFormData({...formData, categorias: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Produtos Cadastrados</h3>
        <div className="space-y-4">
          {produtos.map((produto) => (
            <div key={produto.id} className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center space-x-4">
                <img
                  src={produto.imagem_url}
                  alt={produto.nome}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h4 className="font-semibold">{produto.nome}</h4>
                  <p className="text-gray-600">{produto.marca} - R$ {produto.preco.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Estoque: {produto.estoque}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(produto)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(produto.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}