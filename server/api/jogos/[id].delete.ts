import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  const { error } = await supabase
    .from('jogos')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return { success: true }
})
