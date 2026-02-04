import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  const { data, error } = await supabase
    .from('jogos')
    .select('data')
    .order('data', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return data?.map(j => j.data) || []
})
