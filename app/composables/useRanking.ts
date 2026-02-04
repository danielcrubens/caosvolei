export const useRanking = () => {
  // Buscar ranking anual
  const buscarRankingAnual = async (ano: number) => {
    try {
      const ranking = await $fetch(`/api/ranking/${ano}`)
      return { success: true, ranking }
    } catch (error: any) {
      console.error('Erro ao buscar ranking:', error)
      return { success: false, error }
    }
  }

  // Buscar estatísticas detalhadas de um jogador
  const buscarEstatisticasJogador = async (nomeJogador: string, ano?: number) => {
    try {
      const params = new URLSearchParams()
      if (ano) params.append('ano', String(ano))

      const estatisticas = await $fetch(`/api/jogadores/${encodeURIComponent(nomeJogador)}/estatisticas?${params.toString()}`)
      return { success: true, estatisticas }
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error)
      return { success: false, error }
    }
  }

  // Calcular sequência de vitórias de um jogador
  const calcularSequencia = async (nomeJogador: string, ano: number) => {
    try {
      const sequencia = await $fetch(`/api/jogadores/${encodeURIComponent(nomeJogador)}/sequencia/${ano}`)
      return { success: true, sequencia }
    } catch (error: any) {
      console.error('Erro ao calcular sequência:', error)
      return { success: false, error }
    }
  }

  // Buscar ranking completo com ordenação correta
  const buscarRankingCompleto = async (ano: number) => {
    try {
      const ranking = await $fetch(`/api/ranking/${ano}`)
      return { success: true, ranking }
    } catch (error: any) {
      console.error('Erro ao buscar ranking completo:', error)
      return { success: false, error, ranking: [] }
    }
  }

  // Buscar ranking de um mês específico
  const buscarRankingPorMes = async (ano: number, mes: number) => {
    try {
      const ranking = await $fetch(`/api/ranking/${ano}/${mes}`)
      return { success: true, ranking }
    } catch (error: any) {
      console.error('Erro ao buscar ranking por mês:', error)
      return { success: false, error, ranking: [] }
    }
  }

  // Buscar todos os jogadores únicos
  const buscarTodosJogadores = async () => {
    try {
      const jogadores = await $fetch('/api/jogadores')
      return { success: true, jogadores }
    } catch (error: any) {
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
