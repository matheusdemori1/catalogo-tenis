"use client"

import { useState, useEffect } from 'react'
import { Search, User, Star, MessageCircle, X, Plus, Edit, Trash2, Check } from 'lucide-react'

// Tipos de dados
interface Color {
  id: string
  name: string
  hex: string
  image: string
}

interface Product {
  id: string
  name: string
  brand: string // Mudança: agora aceita qualquer string
  category: 'tenis' | 'camiseta-time' | 'society' | 'chuteira' | 'bolsa'
  price: number
  rating: number
  colors: Color[]
  selectedColorId: string
}

// Dados iniciais
const initialProducts: Product[] = [
  // Tênis
  {
    id: '1',
    name: 'Air Max 270',
    brand: 'Nike',
    category: 'tenis',
    price: 0,
    rating: 4.8,
    selectedColorId: '1-1',
    colors: [
      {
        id: '1-1',
        name: 'Preto/Branco',
        hex: '#000000',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
      },
      {
        id: '1-2',
        name: 'Branco/Azul',
        hex: '#ffffff',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
      },
      {
        id: '1-3',
        name: 'Vermelho',
        hex: '#dc2626',
        image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=400&fit=crop'
      }
    ]
  },
  {
    id: '2',
    name: 'Ultraboost 22',
    brand: 'Adidas',
    category: 'tenis',
    price: 0,
    rating: 4.9,
    selectedColorId: '2-1',
    colors: [
      {
        id: '2-1',
        name: 'Preto',
        hex: '#000000',
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop'
      },
      {
        id: '2-2',
        name: 'Branco',
        hex: '#ffffff',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
      }
    ]
  },
  // Camisetas de Time
  {
    id: '3',
    name: 'Camisa Brasil 2024',
    brand: 'Nike',
    category: 'camiseta-time',
    price: 0,
    rating: 4.7,
    selectedColorId: '3-1',
    colors: [
      {
        id: '3-1',
        name: 'Amarelo',
        hex: '#FFD700',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'
      },
      {
        id: '3-2',
        name: 'Azul',
        hex: '#0066CC',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
      }
    ]
  },
  {
    id: '4',
    name: 'Camisa Argentina 2024',
    brand: 'Adidas',
    category: 'camiseta-time',
    price: 0,
    rating: 4.8,
    selectedColorId: '4-1',
    colors: [
      {
        id: '4-1',
        name: 'Azul/Branco',
        hex: '#87CEEB',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
      }
    ]
  },
  // Society
  {
    id: '5',
    name: 'Camisa Society Premium',
    brand: 'Nike',
    category: 'society',
    price: 0,
    rating: 4.5,
    selectedColorId: '5-1',
    colors: [
      {
        id: '5-1',
        name: 'Preto',
        hex: '#000000',
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop'
      },
      {
        id: '5-2',
        name: 'Branco',
        hex: '#ffffff',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop'
      }
    ]
  },
  {
    id: '6',
    name: 'Camisa Society Clássica',
    brand: 'Adidas',
    category: 'society',
    price: 0,
    rating: 4.4,
    selectedColorId: '6-1',
    colors: [
      {
        id: '6-1',
        name: 'Azul Marinho',
        hex: '#000080',
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop'
      }
    ]
  },
  // Chuteiras
  {
    id: '7',
    name: 'Mercurial Vapor 15',
    brand: 'Nike',
    category: 'chuteira',
    price: 0,
    rating: 4.9,
    selectedColorId: '7-1',
    colors: [
      {
        id: '7-1',
        name: 'Verde/Preto',
        hex: '#00FF00',
        image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400&h=400&fit=crop'
      },
      {
        id: '7-2',
        name: 'Laranja',
        hex: '#FF4500',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop'
      }
    ]
  },
  {
    id: '8',
    name: 'Predator Edge',
    brand: 'Adidas',
    category: 'chuteira',
    price: 0,
    rating: 4.8,
    selectedColorId: '8-1',
    colors: [
      {
        id: '8-1',
        name: 'Preto/Vermelho',
        hex: '#000000',
        image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400&h=400&fit=crop'
      }
    ]
  },
  // Bolsas
  {
    id: '9',
    name: 'Mochila Brasília',
    brand: 'Nike',
    category: 'bolsa',
    price: 0,
    rating: 4.6,
    selectedColorId: '9-1',
    colors: [
      {
        id: '9-1',
        name: 'Preto',
        hex: '#000000',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
      },
      {
        id: '9-2',
        name: 'Azul',
        hex: '#0066CC',
        image: 'https://images.unsplash.com/photo-1581605669-fcdf81165afa?w=400&h=400&fit=crop'
      }
    ]
  },
  {
    id: '10',
    name: 'Bolsa Esportiva Classic',
    brand: 'Adidas',
    category: 'bolsa',
    price: 0,
    rating: 4.5,
    selectedColorId: '10-1',
    colors: [
      {
        id: '10-1',
        name: 'Cinza',
        hex: '#808080',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
      }
    ]
  }
]

const categoryNames = {
  'tenis': 'Tênis',
  'camiseta-time': 'Camisetas de Time',
  'society': 'Society',
  'chuteira': 'Chuteiras',
  'bolsa': 'Bolsas'
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [selectedCategory, setSelectedCategory] = useState<'all' | Product['category']>('all')
  const [selectedBrand, setSelectedBrand] = useState<'all' | string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Obter marcas únicas dos produtos
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand))).sort()

  // Carregar dados do localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('novita-products')
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts)
      setProducts(parsed)
      setFilteredProducts(parsed)
    }
  }, [])

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('novita-products', JSON.stringify(products))
  }, [products])

  // Filtrar produtos
  useEffect(() => {
    let filtered = products
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryNames[product.category].toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedBrand, searchTerm])

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAdmin(true)
      setShowLogin(false)
      setPassword('')
    } else {
      alert('Senha incorreta!')
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
  }

  const selectColor = (productId: string, colorId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, selectedColorId: colorId }
        : product
    ))
  }

  const getWhatsAppMessage = (product: Product) => {
    const selectedColor = product.colors.find(c => c.id === product.selectedColorId)
    const categoryName = categoryNames[product.category]
    return `Olá! Gostaria de saber mais sobre ${categoryName.toLowerCase()} *${product.name}* da ${product.brand}, na cor ${selectedColor?.name}.`
  }

  const openWhatsApp = (product: Product) => {
    const message = encodeURIComponent(getWhatsAppMessage(product))
    window.open(`https://wa.me/5518981100463?text=${message}`, '_blank')
  }

  const deleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== id))
    }
  }

  const deleteColor = (productId: string, colorId: string) => {
    const product = products.find(p => p.id === productId)
    if (product && product.colors.length <= 1) {
      alert('Não é possível excluir a única cor do produto. Exclua o produto inteiro se necessário.')
      return
    }
    
    if (confirm('Tem certeza que deseja excluir esta cor?')) {
      setProducts(prev => prev.map(product => {
        if (product.id === productId) {
          const newColors = product.colors.filter(c => c.id !== colorId)
          return {
            ...product,
            colors: newColors,
            selectedColorId: product.selectedColorId === colorId ? newColors[0]?.id || '' : product.selectedColorId
          }
        }
        return product
      }))
    }
  }

  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    const id = Date.now().toString()
    setProducts(prev => [...prev, { ...newProduct, id }])
    setShowAddProduct(false)
  }

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
    setEditingProduct(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Novita
              </h1>
              <span className="text-sm text-gray-600 hidden sm:block">Seu catálogo esportivo online</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAdmin ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 font-medium">Admin</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&h=600&fit=crop"
              alt="Produtos esportivos"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-cyan-800/60"></div>
          </div>
          
          <div className="relative text-center py-20 px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Encontre o produto
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent"> perfeito</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explore nossa coleção completa de produtos esportivos com design moderno e qualidade garantida
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Todos
          </button>
          {Object.entries(categoryNames).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as Product['category'])}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedCategory === key
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedBrand === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Todas as Marcas
            </button>
            {uniqueBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedBrand === brand
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const selectedColor = product.colors.find(c => c.id === product.selectedColorId)
            
            return (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img
                    src={selectedColor?.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-blue-600 rounded-lg">
                      {categoryNames[product.category]}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">{product.brand}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{product.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">Cores:</span>
                    <div className="flex gap-1">
                      {product.colors.map((color) => (
                        <div key={color.id} className="relative">
                          <button
                            onClick={() => selectColor(product.id, color.id)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              color.id === product.selectedColorId
                                ? 'border-blue-600 scale-110'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteColor(product.id, color.id)
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 transition-colors flex items-center justify-center"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-600">
                      Consulte o preço
                    </span>
                    <button
                      onClick={() => openWhatsApp(product)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 text-sm font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          </div>
        )}
      </main>

      {/* WhatsApp Float Button */}
      <button
        onClick={() => window.open('https://wa.me/5518981100463?text=Olá! Gostaria de mais informações sobre os produtos da Novita.', '_blank')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Login Administrativo</h3>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={handleLogin}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onSave={editingProduct ? updateProduct : addProduct}
          onClose={() => {
            setShowAddProduct(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

// Componente para formulário de produtos
function ProductForm({ 
  product, 
  onSave, 
  onClose 
}: { 
  product: Product | null
  onSave: (product: any) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    category: product?.category || 'tenis' as Product['category'],
    price: product?.price || 0,
    rating: product?.rating || 5,
    colors: product?.colors || [{ id: '1', name: 'Preto', hex: '#000000', image: '' }]
  })

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { 
        id: Date.now().toString(), 
        name: '', 
        hex: '#000000', 
        image: '' 
      }]
    }))
  }

  const updateColor = (index: number, field: keyof Color, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === index ? { ...color, [field]: value } : color
      )
    }))
  }

  const removeColor = (index: number) => {
    if (formData.colors.length <= 1) {
      alert('É necessário ter pelo menos uma cor')
      return
    }
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.colors.length === 0) {
      alert('Adicione pelo menos uma cor')
      return
    }
    
    if (!formData.brand.trim()) {
      alert('Digite o nome da marca')
      return
    }
    
    const productData = {
      ...formData,
      selectedColorId: formData.colors[0].id,
      ...(product && { id: product.id })
    }
    
    onSave(productData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">
            {product ? 'Editar Produto' : 'Adicionar Produto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Ex: Nike, Adidas, Puma, etc."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Product['category'] }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(categoryNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avaliação</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 5 }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Cores</label>
              <button
                type="button"
                onClick={addColor}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar Cor
              </button>
            </div>

            <div className="space-y-3">
              {formData.colors.map((color, index) => (
                <div key={color.id} className="flex gap-3 items-center p-3 border border-gray-200 rounded-xl">
                  <input
                    type="text"
                    placeholder="Nome da cor"
                    value={color.name}
                    onChange={(e) => updateColor(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColor(index, 'hex', e.target.value)}
                    className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="URL da imagem"
                    value={color.image}
                    onChange={(e) => updateColor(index, 'image', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {product ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}