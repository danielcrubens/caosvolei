import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const nomeJogador = decodeURIComponent(getRouterParam(event, 'nome'))
  const ano = Number(getRouterParam(event, 'ano'))

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  const { data, error } = await supabase
    .rpc('calcular_sequencia_vitorias', {
      p_nome_jogador: nomeJogador,
      p_ano: ano
    })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return data
})
