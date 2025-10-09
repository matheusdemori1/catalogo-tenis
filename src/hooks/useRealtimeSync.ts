import { useState, useEffect } from 'react'

// Hook para sincronização em tempo real entre abas
export function useRealtimeSync<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    // Carregar valor inicial do localStorage
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setValue(JSON.parse(stored))
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }

    // Listener para mudanças no localStorage (sincronização entre abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Erro ao sincronizar dados:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  const updateValue = (newValue: T | ((prev: T) => T)) => {
    const updatedValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value)
      : newValue
    
    setValue(updatedValue)
    localStorage.setItem(key, JSON.stringify(updatedValue))
    
    // Disparar evento customizado para sincronização na mesma aba
    window.dispatchEvent(new CustomEvent(`${key}-updated`, { 
      detail: updatedValue 
    }))
  }

  return [value, updateValue] as const
}

// Hook para configurações do site
export function useSiteConfig() {
  const [config, setConfig] = useRealtimeSync('novita-site-config', {
    siteName: 'Novita',
    siteDescription: 'Seu catálogo esportivo online',
    heroTitle: 'Encontre o produto perfeito',
    heroSubtitle: 'Explore nossa coleção completa de produtos esportivos com design moderno e qualidade garantida',
    heroImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&h=600&fit=crop',
    whatsappNumber: '5518981100463',
    primaryColor: '#2563eb',
    secondaryColor: '#0891b2'
  })

  return [config, setConfig] as const
}

// Hook para produtos com sincronização
export function useProducts() {
  const initialProducts = [
    {
      id: '1',
      name: 'Air Max 270',
      brand: 'Nike',
      category: 'tenis' as const,
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
      category: 'tenis' as const,
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
    {
      id: '3',
      name: 'Camisa Brasil 2024',
      brand: 'Nike',
      category: 'camiseta-time' as const,
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
      category: 'camiseta-time' as const,
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
    {
      id: '5',
      name: 'Camisa Society Premium',
      brand: 'Nike',
      category: 'society' as const,
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
      category: 'society' as const,
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
    {
      id: '7',
      name: 'Mercurial Vapor 15',
      brand: 'Nike',
      category: 'chuteira' as const,
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
      category: 'chuteira' as const,
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
    {
      id: '9',
      name: 'Mochila Brasília',
      brand: 'Nike',
      category: 'bolsa' as const,
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
      category: 'bolsa' as const,
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

  return useRealtimeSync('novita-products', initialProducts)
}