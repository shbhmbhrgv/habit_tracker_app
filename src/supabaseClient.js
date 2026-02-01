import { createClient } from '@supabase/supabase-js'
import { config } from './config'

const supabaseUrl = config.supabaseUrl
const supabaseAnonKey = config.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase Environment Variables! Check your .env file or Vercel project settings.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
