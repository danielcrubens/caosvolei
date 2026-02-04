import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  const { data, timeVencedor, jogadores } = body

  if (!data || !timeVencedor || !jogadores) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados incompletos'
    })
  }

  // 1. Inserir o jogo
  const { data: jogo, error: jogoError } = await supabase
    .from('jogos')
    .insert({
      data,
      time_vencedor: timeVencedor
    })
    .select()
    .single()

  if (jogoError) {
    throw createError({
      statusCode: 400,
      statusMessage: jogoError.message
    })
  }

  // 2. Inserir os jogadores (participações)
  const participacoes = jogadores
    .filter((j: string) => j.trim() !== '')
    .map((jogador: string) => ({
      jogo_id: jogo.id,
      nome_jogador: jogador.trim()
    }))

  const { error: participacoesError } = await supabase
    .from('participacoes')
    .insert(participacoes)

  if (participacoesError) {
    throw createError({
      statusCode: 400,
      statusMessage: participacoesError.message
    })
  }

  return { success: true, jogo }
})
