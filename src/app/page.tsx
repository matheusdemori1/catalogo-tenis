"use client"

import { useState, useEffect } from 'react'
import { Search, User, Star, MessageCircle, X, Plus, Edit, Trash2, Check, Settings, Upload, Palette, Sparkles, ShoppingBag, ChevronLeft, ChevronRight, Mail, Lock, Zap } from 'lucide-react'
import { useProducts, useSiteConfig } from '@/hooks/useRealtimeSync'
import { supabase } from '@/lib/supabase'

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
  brand: string
  category: 'tenis' | 'camiseta-time' | 'society' | 'chuteira' | 'bolsa'
  price: number
  rating: number
  colors: Color[]
  selectedColorId: string
}

const categoryNames = {
  'tenis': 'Tênis',
  'camiseta-time': 'Camisetas de Time',
  'society': 'Society',
  'chuteira': 'Chuteiras',
  'bolsa': 'Bolsas'
}

// Imagens profissionais de esportes e tênis para o carrossel
const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop',
    alt: 'Tênis esportivos modernos'
  },
  {
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=600&fit=crop',
    alt: 'Tênis de corrida profissionais'
  },
  {
    url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&h=600&fit=crop',
    alt: 'Calçados esportivos premium'
  },
  {
    url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&h=600&fit=crop',
    alt: 'Tênis de alta performance'
  },
  {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop',
    alt: 'Equipamentos esportivos'
  }
]

export default function Home() {
  const { products, setProducts, addProduct, updateProduct, deleteProduct, loading, error } = useProducts()
  const [siteConfig, setSiteConfig] = useSiteConfig()
  
  // Garantir que products seja sempre um array
  const safeProducts: Product[] = Array.isArray(products) ? products : []
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(safeProducts)
  const [selectedCategory, setSelectedCategory] = useState<'all' | Product['category']>('all')
  const [selectedBrand, setSelectedBrand] = useState<'all' | string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showSiteConfig, setShowSiteConfig] = useState(false)
  const [imageModal, setImageModal] = useState<{ src: string; alt: string } | null>(null)
  
  // Estado para o carrossel de imagens
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Obter marcas únicas dos produtos - garantir que products seja array
  const uniqueBrands = Array.from(new Set(safeProducts.map(p => p.brand))).sort()

  // Carrossel automático de imagens
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 4000) // Troca a cada 4 segundos

    return () => clearInterval(interval)
  }, [])

  // Filtrar produtos
  useEffect(() => {
    // Garantir que products seja sempre um array
    const currentProducts: Product[] = Array.isArray(products) ? products : []
    let filtered = currentProducts
    
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

  // Verificar se usuário já está logado ao carregar a página
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setIsAdmin(true)
          console.log('✅ Usuário já autenticado:', session.user.email)
        }
      }
    }
    checkAuthStatus()
  }, [])

  const handleLogin = async () => {
    if (!supabase) {
      alert('Supabase não configurado. Configure as variáveis de ambiente.')
      return
    }

    if (!loginData.email || !loginData.password) {
      alert('Por favor, preencha email e senha.')
      return
    }

    setLoginLoading(true)
    
    try {
      console.log('🔐 Tentando fazer login com:', loginData.email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) {
        console.error('❌ Erro no login:', error.message)
        alert(`Erro no login: ${error.message}`)
        return
      }

      if (data.user) {
        console.log('✅ Login realizado com sucesso:', data.user.email)
        setIsAdmin(true)
        setShowLogin(false)
        setLoginData({ email: '', password: '' })
        alert('Login realizado com sucesso!')
      }
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error)
      alert('Erro inesperado. Tente novamente.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Erro no logout:', error.message)
      } else {
        console.log('✅ Logout realizado com sucesso')
      }
    }
    setIsAdmin(false)
  }

  const selectColor = (productId: string, colorId: string) => {
    setProducts((prev: Product[]) => {
      const currentProducts: Product[] = Array.isArray(prev) ? prev : []
      return currentProducts.map(product => 
        product.id === productId 
          ? { ...product, selectedColorId: colorId }
          : product
      )
    })
  }

  const getWhatsAppMessage = (product: Product) => {
    const selectedColor = product.colors.find(c => c.id === product.selectedColorId)
    const categoryName = categoryNames[product.category]
    return `Olá! Gostaria de saber mais sobre ${categoryName.toLowerCase()} *${product.name}* da ${product.brand}, na cor ${selectedColor?.name}.`
  }

  const openWhatsApp = (product: Product) => {
    const message = encodeURIComponent(getWhatsAppMessage(product))
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${message}`, '_blank')
  }

  const handleDeleteProduct = async (id: string) => {
    console.log('🗑️ Iniciando exclusão do produto:', id)
    
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      console.log('❌ Exclusão cancelada pelo usuário')
      return
    }

    try {
      console.log('🔄 Excluindo produto via API...')
      const success = await deleteProduct(id)
      
      if (success) {
        console.log('✅ Produto excluído com sucesso!')
        // Forçar atualização da lista
        window.location.reload()
      } else {
        console.log('❌ Falha ao excluir produto')
        alert('Erro ao excluir produto. Verifique sua conexão com o banco de dados.')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir produto:', error)
      alert('Erro ao excluir produto. Verifique sua conexão com o banco de dados.')
    }
  }

  const deleteColor = (productId: string, colorId: string) => {
    const safeProducts: Product[] = Array.isArray(products) ? products : []
    const product = safeProducts.find(p => p.id === productId)
    if (product && product.colors.length <= 1) {
      alert('Não é possível excluir a única cor do produto. Exclua o produto inteiro se necessário.')
      return
    }
    
    if (confirm('Tem certeza que deseja excluir esta cor?')) {
      setProducts((prev: Product[]) => {
        const currentProducts: Product[] = Array.isArray(prev) ? prev : []
        return currentProducts.map(product => {
          if (product.id === productId) {
            const newColors = product.colors.filter(c => c.id !== colorId)
            return {
              ...product,
              colors: newColors,
              selectedColorId: product.selectedColorId === colorId ? newColors[0]?.id || '' : product.selectedColorId
            }
          }
          return product
        })
      })
    }
  }

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      console.log('➕ Adicionando produto:', newProduct)
      const result = await addProduct(newProduct)
      if (result) {
        console.log('✅ Produto adicionado com sucesso')
        setShowAddProduct(false)
        // Forçar atualização da lista
        window.location.reload()
      } else {
        throw new Error('Falha ao adicionar produto')
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error)
      alert('Erro ao adicionar produto. Verifique sua conexão com o banco de dados.')
    }
  }

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      console.log('✏️ Atualizando produto:', updatedProduct)
      const result = await updateProduct(updatedProduct.id, updatedProduct)
      if (result) {
        console.log('✅ Produto atualizado com sucesso')
        setEditingProduct(null)
        // Forçar atualização da lista
        window.location.reload()
      } else {
        throw new Error('Falha ao atualizar produto')
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error)
      alert('Erro ao atualizar produto. Verifique sua conexão com o banco de dados.')
    }
  }

  const openImageModal = (src: string, alt: string) => {
    setImageModal({ src, alt })
  }

  const closeImageModal = () => {
    setImageModal(null)
  }

  // Navegação manual do carrossel
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header Profissional */}
      <header className="bg-black/95 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-40 shadow-2xl shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              {/* Nova Logo Premium */}
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  {/* Logo principal com design moderno */}
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40 transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
                    {/* Efeito de brilho interno */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl"></div>
                    
                    {/* Ícone principal */}
                    <div className="relative z-10 flex items-center justify-center">
                      <Zap className="w-7 h-7 text-white transform rotate-12" />
                    </div>
                    
                    {/* Partículas decorativas */}
                    <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping"></div>
                  </div>
                  
                  {/* Badge de destaque */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-bounce">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  
                  {/* Anel de energia */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-orange-400/30 animate-pulse group-hover:border-orange-400/60 transition-colors"></div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                    {siteConfig.siteName}
                  </h1>
                  <p className="text-sm text-gray-400 font-medium hidden sm:block">{siteConfig.siteDescription}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAdmin ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowSiteConfig(true)}
                    className="p-3 text-gray-400 hover:text-orange-400 hover:bg-gray-800 rounded-xl transition-all duration-200"
                    title="Configurações do Site"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <div className="flex items-center space-x-2 bg-green-900/50 px-3 py-2 rounded-xl border border-green-800">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-300 font-semibold">Admin</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-900/20 px-3 py-2 rounded-xl transition-all duration-200 font-medium"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="p-3 text-gray-400 hover:text-orange-400 hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                  title="Login Administrativo"
                >
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section com Carrossel */}
        <div className="relative mb-12 overflow-hidden rounded-3xl group">
          <div className="relative h-96 md:h-[500px]">
            {/* Imagens do carrossel */}
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-gray-900/80 to-slate-900/70"></div>
              </div>
            ))}
            
            {/* Controles do carrossel */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'bg-orange-500 scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Conteúdo sobreposto */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 uppercase tracking-wider">
                ENCONTRE SEU
                <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  ESTILO PERFEITO
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-medium">
                Descubra nossa coleção premium de produtos esportivos com qualidade internacional
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
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
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedBrand === 'all'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
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
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
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
              <div key={product.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden group border border-gray-700/50">
                <div className="relative">
                  <img
                    src={selectedColor?.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => openImageModal(selectedColor?.image || '', product.name)}
                  />
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setEditingProduct(product)
                        }}
                        className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        title="Editar produto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('🖱️ Clique no botão deletar capturado para produto:', product.id, product.name)
                          handleDeleteProduct(product.id)
                        }}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-xs font-medium text-orange-400 rounded-lg">
                      {categoryNames[product.category]}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-400">{product.brand}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-400">{product.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3">{product.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-400">Cores:</span>
                    <div className="flex gap-1">
                      {product.colors.map((color) => (
                        <div key={color.id} className="relative">
                          <button
                            onClick={() => selectColor(product.id, color.id)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              color.id === product.selectedColorId
                                ? 'border-orange-500 scale-110 shadow-lg shadow-orange-500/50'
                                : 'border-gray-600 hover:border-gray-500'
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
                    <span className="text-lg font-medium text-gray-400">
                      Consulte o preço
                    </span>
                    <button
                      onClick={() => openWhatsApp(product)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-green-500/25"
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
            <p className="text-gray-400 text-lg">Nenhum produto encontrado</p>
          </div>
        )}
      </main>

      {/* WhatsApp Float Button */}
      <button
        onClick={() => window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=Olá! Gostaria de mais informações sobre os produtos da ${siteConfig.siteName}.`, '_blank')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={imageModal.src}
              alt={imageModal.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Login Modal com Email e Senha */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-6 h-6 text-orange-400" />
                Login Administrativo
              </h3>
              <button
                onClick={() => {
                  setShowLogin(false)
                  setLoginData({ email: '', password: '' })
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
                    disabled={loginLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && !loginLoading && handleLogin()}
                    disabled={loginLoading}
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    Entrar
                  </>
                )}
              </button>

              <div className="text-center pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Use suas credenciais do Supabase para acessar o painel administrativo
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site Configuration Modal */}
      {showSiteConfig && (
        <SiteConfigModal
          config={siteConfig}
          onSave={setSiteConfig}
          onClose={() => setShowSiteConfig(false)}
        />
      )}

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
          onClose={() => {
            setShowAddProduct(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

// Componente para configurações do site
function SiteConfigModal({ 
  config, 
  onSave, 
  onClose 
}: { 
  config: any
  onSave: (config: any) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState(config)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Settings className="w-6 h-6" />
            Configurações do Site
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Site</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
              <input
                type="text"
                value={formData.siteDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, siteDescription: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp (com código do país)</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="5518981100463"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
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
    
    // Validar URLs das imagens
    for (const color of formData.colors) {
      if (!color.image.trim()) {
        alert(`Adicione uma URL de imagem para a cor "${color.name}"`)
        return
      }
      if (!color.name.trim()) {
        alert('Todas as cores devem ter um nome')
        return
      }
    }
    
    const productData = {
      ...formData,
      selectedColorId: formData.colors[0].id,
      ...(product && { id: product.id })
    }
    
    console.log('📝 Enviando dados do produto:', productData)
    onSave(productData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {product ? 'Editar Produto' : 'Adicionar Produto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Marca *</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Ex: Nike, Adidas, Puma, etc."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Product['category'] }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
              >
                {Object.entries(categoryNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Avaliação</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 5 }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">Cores *</label>
              <button
                type="button"
                onClick={addColor}
                className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar Cor
              </button>
            </div>

            <div className="space-y-3">
              {formData.colors.map((color, index) => (
                <div key={color.id} className="flex gap-3 items-center p-3 bg-gray-700 border border-gray-600 rounded-xl">
                  <input
                    type="text"
                    placeholder="Nome da cor *"
                    value={color.name}
                    onChange={(e) => updateColor(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                    required
                  />
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColor(index, 'hex', e.target.value)}
                    className="w-12 h-10 bg-gray-600 border border-gray-500 rounded-lg cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="URL da imagem *"
                    value={color.image}
                    onChange={(e) => updateColor(index, 'image', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                    required
                  />
                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
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
              className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2"
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