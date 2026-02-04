export const useJogos = () => {
  // Registrar um novo jogo com jogadores
  const registrarJogo = async (data: string, timeVencedor: string, jogadores: string[]) => {
    try {
      const response = await $fetch('/api/jogos', {
        method: 'POST',
        body: {
          data,
          timeVencedor,
          jogadores
        }
      })

      return { success: true, jogo: (response as any).jogo }
    } catch (error: any) {
      console.error('Erro ao registrar jogo:', error)
      return { success: false, error }
    }
  }

  // Buscar todos os jogos (com paginação)
  const buscarJogos = async (ano?: number, limite: number = 50) => {
    try {
      const params = new URLSearchParams()
      if (ano) params.append('ano', String(ano))
      params.append('limite', String(limite))

      const data = await $fetch(`/api/jogos?${params.toString()}`)
      return { success: true, jogos: data }
    } catch (error: any) {
      console.error('Erro ao buscar jogos:', error)
      return { success: false, error }
    }
  }

  // Buscar datas dos jogos (para timeline)
  const buscarDatasJogos = async () => {
    try {
      const data = await $fetch('/api/jogos/datas')
      return { success: true, datas: data }
    } catch (error: any) {
      console.error('Erro ao buscar datas:', error)
      return { success: false, error }
    }
  }

  // Buscar jogo específico por ID
  const buscarJogoPorId = async (id: number) => {
    try {
      const jogo = await $fetch(`/api/jogos/${id}`)
      return { success: true, jogo }
    } catch (error: any) {
      console.error('Erro ao buscar jogo:', error)
      return { success: false, error }
    }
  }

  // Deletar jogo (cascade deleta participações)
  const deletarJogo = async (id: number) => {
    try {
      await $fetch(`/api/jogos/${id}`, {
        method: 'DELETE'
      })
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao deletar jogo:', error)
      return { success: false, error }
    }
  }

  return {
    registrarJogo,
    buscarJogos,
    buscarDatasJogos,
    buscarJogoPorId,
    deletarJogo
  }
}
