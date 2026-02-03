export const useJogos = () => {
  const supabase = useSupabaseClient()

  // Registrar um novo jogo com jogadores
  const registrarJogo = async (data: string, timeVencedor: string, jogadores: string[]) => {
    try {
      // 1. Inserir o jogo
      const { data: jogo, error: jogoError } = await supabase
        .from('jogos')
        .insert({
          data,
          time_vencedor: timeVencedor
        })
        .select()
        .single()

      if (jogoError) throw jogoError

      // 2. Inserir os jogadores (participações)
      const participacoes = jogadores
        .filter(j => j.trim() !== '') // Remove vazios
        .map(jogador => ({
          jogo_id: jogo.id,
          nome_jogador: jogador.trim()
        }))

      const { error: participacoesError } = await supabase
        .from('participacoes')
        .insert(participacoes)

      if (participacoesError) throw participacoesError

      return { success: true, jogo }
    } catch (error) {
      console.error('Erro ao registrar jogo:', error)
      return { success: false, error }
    }
  }

  // Buscar todos os jogos (com paginação)
  const buscarJogos = async (ano?: number, limite: number = 50) => {
    try {
      let query = supabase
        .from('jogos')
        .select(`
          id,
          data,
          time_vencedor,
          participacoes (
            nome_jogador
          )
        `)
        .order('data', { ascending: false })
        .limit(limite)

      // Filtrar por ano se fornecido
      if (ano) {
        const inicioAno = `${ano}-01-01`
        const fimAno = `${ano}-12-31`
        query = query.gte('data', inicioAno).lte('data', fimAno)
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, jogos: data }
    } catch (error) {
      console.error('Erro ao buscar jogos:', error)
      return { success: false, error }
    }
  }

  // Buscar jogo específico por ID
  const buscarJogoPorId = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('jogos')
        .select(`
          id,
          data,
          time_vencedor,
          participacoes (
            nome_jogador
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return { success: true, jogo: data }
    } catch (error) {
      console.error('Erro ao buscar jogo:', error)
      return { success: false, error }
    }
  }

  // Deletar jogo (cascade deleta participações)
  const deletarJogo = async (id: number) => {
    try {
      const { error } = await supabase
        .from('jogos')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar jogo:', error)
      return { success: false, error }
    }
  }

  return {
    registrarJogo,
    buscarJogos,
    buscarJogoPorId,
    deletarJogo
  }
}