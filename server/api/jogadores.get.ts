import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  const { data, error } = await supabase
    .from('participacoes')
    .select('nome_jogador')
    .order('nome_jogador')

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  // Remover duplicatas
  const jogadoresUnicos = [...new Set(data?.map(p => p.nome_jogador) || [])]

  return jogadoresUnicos
})
