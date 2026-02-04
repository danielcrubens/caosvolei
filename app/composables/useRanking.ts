export const useRanking = () => {
  const supabase = useSupabaseClient()

  // Buscar ranking anual
  const buscarRankingAnual = async (ano: number) => {
    try {
      const { data, error } = await supabase
        .from('ranking_anual')
        .select('*')
        .eq('ano', ano)
        .order('total_vitorias', { ascending: false })
        .order('nome_jogador', { ascending: true }) // Ordem alfabética apenas para empates

      if (error) throw error

      return { success: true, ranking: data || [] }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error)
      return { success: false, error }
    }
  }

  // Buscar estatísticas detalhadas de um jogador
  const buscarEstatisticasJogador = async (nomeJogador: string, ano?: number) => {
    try {
      let query = supabase
        .from('estatisticas_jogadores')
        .select('*')
        .eq('nome_jogador', nomeJogador)

      if (ano) {
        query = query.eq('ano', ano)
      }

      const { data, error } = await query.single()

      if (error) throw error

      return { success: true, estatisticas: data }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return { success: false, error }
    }
  }

  // Calcular sequência de vitórias de um jogador
  const calcularSequencia = async (nomeJogador: string, ano: number) => {
    try {
      const { data, error } = await supabase
        .rpc('calcular_sequencia_vitorias', {
          p_nome_jogador: nomeJogador,
          p_ano: ano
        })

      if (error) throw error

      return { success: true, sequencia: data }
    } catch (error) {
      console.error('Erro ao calcular sequência:', error)
      return { success: false, error }
    }
  }

  // Buscar ranking completo com ordenação correta
  const buscarRankingCompleto = async (ano: number) => {
    try {
      const { ranking, success } = await buscarRankingAnual(ano)

      if (!success || !ranking) {
        return { success: false, ranking: [] }
      }

      // Ordenar APENAS por número de vitórias (decrescente)
      // Em caso de empate, manter ordem alfabética
      const rankingOrdenado = ranking.sort((a, b) => {
        // Critério principal: número de vitórias (maior primeiro)
        if (a.total_vitorias !== b.total_vitorias) {
          return b.total_vitorias - a.total_vitorias
        }

        // Critério de desempate: ordem alfabética
        return a.nome_jogador.localeCompare(b.nome_jogador)
      })

      return { success: true, ranking: rankingOrdenado }
    } catch (error) {
      console.error('Erro ao buscar ranking completo:', error)
      return { success: false, error, ranking: [] }
    }
  }

  // Buscar ranking de um mês específico
  const buscarRankingPorMes = async (ano: number, mes: number) => {
    try {
      // Buscar todos os jogos do mês
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

      if (jogosError) throw jogosError

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
          // Ordenar por vitórias (maior primeiro)
          if (a.total_vitorias !== b.total_vitorias) {
            return b.total_vitorias - a.total_vitorias
          }
          // Empate: ordem alfabética
          return a.nome_jogador.localeCompare(b.nome_jogador)
        })

      return { success: true, ranking }
    } catch (error) {
      console.error('Erro ao buscar ranking por mês:', error)
      return { success: false, error, ranking: [] }
    }
  }

  // Buscar todos os jogadores únicos
  const buscarTodosJogadores = async () => {
    try {
      const { data, error } = await supabase
        .from('participacoes')
        .select('nome_jogador')
        .order('nome_jogador')

      if (error) throw error

      // Remover duplicatas
      const jogadoresUnicos = [...new Set(data?.map(p => p.nome_jogador) || [])]

      return { success: true, jogadores: jogadoresUnicos }
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error)
      return { success: false, error }
    }
  }

  return {
    buscarRankingAnual,
    buscarEstatisticasJogador,
    calcularSequencia,
    buscarRankingCompleto,
    buscarRankingPorMes,
    buscarTodosJogadores
  }
}