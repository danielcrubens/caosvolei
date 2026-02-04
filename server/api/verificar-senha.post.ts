import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { senha } = body

  if (!senha) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Senha não fornecida'
    })
  }

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  const { data, error } = await supabase
    .from('configuracoes')
    .select('senha_registro')
    .eq('id', 1)
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  const correta = senha === data?.senha_registro

  return { correta }
})
