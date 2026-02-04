import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  // Criar cliente Supabase no servidor com credenciais privadas
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )

  const ano = query.ano ? Number(query.ano) : undefined
  const limite = query.limite ? Number(query.limite) : 50

  let supabaseQuery = supabase
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

  if (ano) {
    const inicioAno = `${ano}-01-01`
    const fimAno = `${ano}-12-31`
    supabaseQuery = supabaseQuery.gte('data', inicioAno).lte('data', fimAno)
  }

  const { data, error } = await supabaseQuery

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return data
})
