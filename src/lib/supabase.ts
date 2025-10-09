import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          brand: string
          category: 'tenis' | 'camiseta-time' | 'society' | 'chuteira' | 'bolsa'
          price: number
          rating: number
          colors: Color[]
          selected_color_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand: string
          category: 'tenis' | 'camiseta-time' | 'society' | 'chuteira' | 'bolsa'
          price: number
          rating: number
          colors: Color[]
          selected_color_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          category?: 'tenis' | 'camiseta-time' | 'society' | 'chuteira' | 'bolsa'
          price?: number
          rating?: number
          colors?: Color[]
          selected_color_id?: string
          updated_at?: string
        }
      }
      site_config: {
        Row: {
          id: string
          key: string
          value: any
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
          updated_at?: string
        }
      }
    }
  }
}

export interface Color {
  id: string
  name: string
  hex: string
  image: string
}

export interface Product {
  id: string
  name: string
  brand: string
  category: 'tenis' | 'camiseta-time' | 'society' | 'chuteira' | 'bolsa'
  price: number
  rating: number
  colors: Color[]
  selected_color_id: string
  created_at?: string
  updated_at?: string
}