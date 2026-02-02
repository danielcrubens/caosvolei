<template>
  <div class="min-h-screen p-10">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">🔍 Página de Teste - Debug</h1>
      
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <h2 class="text-xl font-bold mb-4">Testes Automáticos</h2>
        <button 
          @click="executarTestes"
          class="bg-blue-500 text-white px-6 py-3 rounded font-bold"
        >
          🚀 Executar Todos os Testes
        </button>
      </div>

      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <h2 class="text-xl font-bold mb-4">Resultados:</h2>
        <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">{{ resultados }}</pre>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Instruções:</h2>
        <ol class="list-decimal list-inside space-y-2">
          <li>Clique no botão "Executar Todos os Testes"</li>
          <li>Veja os resultados acima</li>
          <li>Copie e cole os resultados para análise</li>
          <li>Abra também o Console (F12) para ver logs detalhados</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const resultados = ref('')

const executarTestes = async () => {
  resultados.value = '🔄 Executando testes...\n\n'
  
  try {
    // Teste 1: Ver jogos
    resultados.value += '📊 TESTE 1: Buscar todos os jogos\n'
    const { data: jogos, error: jogosError } = await supabase
      .from('jogos')
      .select('*')
      .order('data', { ascending: false })
    
    console.log('Teste 1 - Jogos:', { jogos, jogosError })
    resultados.value += `Total de jogos: ${jogos?.length || 0}\n`
    if (jogosError) resultados.value += `❌ Erro: ${JSON.stringify(jogosError)}\n`
    if (jogos && jogos.length > 0) {
      resultados.value += `Primeiro jogo: ${jogos[0].data} - ${jogos[0].time_vencedor}\n`
    }
    resultados.value += '\n'

    // Teste 2: Ver anos dos jogos
    resultados.value += '📅 TESTE 2: Anos dos jogos registrados\n'
    const anosUnicos = [...new Set(jogos?.map(j => new Date(j.data).getFullYear()))]
    resultados.value += `Anos com jogos: ${anosUnicos.join(', ')}\n\n`

    // Teste 3: Ver participações
    resultados.value += '👥 TESTE 3: Buscar participações\n'
    const { data: participacoes, error: partError } = await supabase
      .from('participacoes')
      .select('*')
    
    console.log('Teste 3 - Participações:', { participacoes, partError })
    resultados.value += `Total de participações: ${participacoes?.length || 0}\n`
    if (partError) resultados.value += `❌ Erro: ${JSON.stringify(partError)}\n`
    resultados.value += '\n'

    // Teste 4: Ver ranking_anual (todos os anos)
    resultados.value += '🏆 TESTE 4: Buscar ranking_anual (TODOS os anos)\n'
    const { data: rankingTodos, error: rankingTodosError } = await supabase
      .from('ranking_anual')
      .select('*')
      .order('ano', { ascending: false })
    
    console.log('Teste 4 - Ranking Todos:', { rankingTodos, rankingTodosError })
    resultados.value += `Total de registros: ${rankingTodos?.length || 0}\n`
    if (rankingTodosError) resultados.value += `❌ Erro: ${JSON.stringify(rankingTodosError)}\n`
    if (rankingTodos && rankingTodos.length > 0) {
      resultados.value += `Anos no ranking: ${[...new Set(rankingTodos.map(r => r.ano))].join(', ')}\n`
      resultados.value += `Primeiros 3 registros:\n`
      rankingTodos.slice(0, 3).forEach(r => {
        resultados.value += `  - ${r.nome_jogador}: ${r.total_vitorias} vitórias (${r.ano})\n`
      })
    }
    resultados.value += '\n'

    // Teste 5: Ver ranking_anual para 2025
    resultados.value += '🏆 TESTE 5: Buscar ranking_anual ANO 2025\n'
    const { data: ranking2025, error: ranking2025Error } = await supabase
      .from('ranking_anual')
      .select('*')
      .eq('ano', 2025)
    
    console.log('Teste 5 - Ranking 2025:', { ranking2025, ranking2025Error })
    resultados.value += `Total para 2025: ${ranking2025?.length || 0}\n`
    if (ranking2025Error) resultados.value += `❌ Erro: ${JSON.stringify(ranking2025Error)}\n`
    resultados.value += '\n'

    // Teste 6: Ver ranking_anual para 2024
    resultados.value += '🏆 TESTE 6: Buscar ranking_anual ANO 2024\n'
    const { data: ranking2024, error: ranking2024Error } = await supabase
      .from('ranking_anual')
      .select('*')
      .eq('ano', 2024)
    
    console.log('Teste 6 - Ranking 2024:', { ranking2024, ranking2024Error })
    resultados.value += `Total para 2024: ${ranking2024?.length || 0}\n`
    if (ranking2024Error) resultados.value += `❌ Erro: ${JSON.stringify(ranking2024Error)}\n`
    resultados.value += '\n'

    // Teste 7: Buscar jogos com participações (como o histórico faz)
    resultados.value += '📋 TESTE 7: Buscar jogos COM participações (query do histórico)\n'
    const { data: jogosCompletos, error: jogosCompletosError } = await supabase
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
      .limit(5)
    
    console.log('Teste 7 - Jogos Completos:', { jogosCompletos, jogosCompletosError })
    resultados.value += `Total retornado: ${jogosCompletos?.length || 0}\n`
    if (jogosCompletosError) resultados.value += `❌ Erro: ${JSON.stringify(jogosCompletosError)}\n`
    if (jogosCompletos && jogosCompletos.length > 0) {
      resultados.value += `Exemplo do primeiro jogo:\n`
      const jogo = jogosCompletos[0]
      resultados.value += `  Data: ${jogo.data}\n`
      resultados.value += `  Time: ${jogo.time_vencedor}\n`
      resultados.value += `  Jogadores: ${jogo.participacoes?.length || 0}\n`
      if (jogo.participacoes && jogo.participacoes.length > 0) {
        resultados.value += `  Nomes: ${jogo.participacoes.map((p: any) => p.nome_jogador).join(', ')}\n`
      }
    }
    resultados.value += '\n'

    // Resumo final
    resultados.value += '=' .repeat(50) + '\n'
    resultados.value += '📊 RESUMO:\n'
    resultados.value += '=' .repeat(50) + '\n'
    resultados.value += `✅ Jogos cadastrados: ${jogos?.length || 0}\n`
    resultados.value += `✅ Anos com dados: ${anosUnicos.join(', ')}\n`
    resultados.value += `✅ Participações: ${participacoes?.length || 0}\n`
    resultados.value += `✅ Registros no ranking (todos): ${rankingTodos?.length || 0}\n`
    resultados.value += `✅ Registros no ranking 2025: ${ranking2025?.length || 0}\n`
    resultados.value += `✅ Registros no ranking 2024: ${ranking2024?.length || 0}\n`
    
    // Diagnóstico
    resultados.value += '\n🔍 DIAGNÓSTICO:\n'
    if (!jogos || jogos.length === 0) {
      resultados.value += '❌ PROBLEMA: Nenhum jogo cadastrado!\n'
    } else if (!rankingTodos || rankingTodos.length === 0) {
      resultados.value += '❌ PROBLEMA: View ranking_anual não está retornando dados!\n'
      resultados.value += '   Pode ser problema de permissões (RLS)\n'
    } else if (anosUnicos.length > 0 && ranking2025?.length === 0 && ranking2024?.length === 0) {
      resultados.value += '⚠️  PROBLEMA: Anos selecionados no app não correspondem aos dados!\n'
      resultados.value += `   Jogos estão nos anos: ${anosUnicos.join(', ')}\n`
      resultados.value += `   Mas o app está buscando 2024 ou 2025\n`
    } else {
      resultados.value += '✅ Dados parecem estar OK! Problema pode ser no frontend.\n'
    }

  } catch (error) {
    resultados.value += `\n❌ ERRO GERAL: ${error}\n`
    console.error('Erro nos testes:', error)
  }
}

useHead({
  title: 'Debug - VolleyTrack'
})
</script>