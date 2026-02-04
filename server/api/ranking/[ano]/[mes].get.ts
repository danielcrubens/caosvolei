import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const ano = Number(getRouterParam(event, 'ano'))
  const mes = Number(getRouterParam(event, 'mes'))

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
  const dataFim = mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`

  const { data: jogos, error: jogosError } = await supabase
    .from('jogos')
    .select(`
      id,
      data,
      time_vencedor,
      participacoes!inner (
        nome_jogador
      )
    `)
    .gte('data', dataInicio)
    .lt('data', dataFim)

  if (jogosError) {
    throw createError({
      statusCode: 400,
      statusMessage: jogosError.message
    })
  }

  // Contar vitórias por jogador
  const vitoriasMap = new Map<string, number>()

  jogos?.forEach(jogo => {
    jogo.participacoes.forEach((p: any) => {
      const nomeJogador = p.nome_jogador
      vitoriasMap.set(nomeJogador, (vitoriasMap.get(nomeJogador) || 0) + 1)
    })
  })

  // Converter para array e ordenar
  const ranking = Array.from(vitoriasMap.entries())
    .map(([nome_jogador, total_vitorias]) => ({
      nome_jogador,
      total_vitorias,
      ano,
      mes
    }))
    .sort((a, b) => {
      if (a.total_vitorias !== b.total_vitorias) {
        return b.total_vitorias - a.total_vitorias
      }
      return a.nome_jogador.localeCompare(b.nome_jogador)
    })

  return ranking
})
