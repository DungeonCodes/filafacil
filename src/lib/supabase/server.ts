import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL.');
  }

  return supabaseUrl;
}

function getSupabaseServerKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!serviceRoleKey && !anonKey) {
    throw new Error('Supabase não configurado: defina SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return serviceRoleKey ?? anonKey!;
}

export function createSupabaseServerClient() {
  return createClient(getSupabaseUrl(), getSupabaseServerKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
