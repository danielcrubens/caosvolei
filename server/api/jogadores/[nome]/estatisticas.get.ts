import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const nomeJogador = decodeURIComponent(getRouterParam(event, 'nome'))
  const query = getQuery(event)
  const ano = query.ano ? Number(query.ano) : undefined

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  let supabaseQuery = supabase
    .from('estatisticas_jogadores')
    .select('*')
    .eq('nome_jogador', nomeJogador)

  if (ano) {
    supabaseQuery = supabaseQuery.eq('ano', ano)
  }

  const { data, error } = await supabaseQuery.single()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return data
})
