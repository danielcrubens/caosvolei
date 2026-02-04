import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const ano = Number(getRouterParam(event, 'ano'))

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  const { data, error } = await supabase
    .from('ranking_anual')
    .select('*')
    .eq('ano', ano)
    .order('total_vitorias', { ascending: false })
    .order('nome_jogador', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  // Ordenar por vitórias (decrescente) e depois alfabeticamente
  const rankingOrdenado = (data || []).sort((a, b) => {
    if (a.total_vitorias !== b.total_vitorias) {
      return b.total_vitorias - a.total_vitorias
    }
    return a.nome_jogador.localeCompare(b.nome_jogador)
  })

  return rankingOrdenado
})
