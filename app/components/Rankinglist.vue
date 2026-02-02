<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      
      <div class="flex gap-2 items-center">
        <label class="font-medium text-zinc-600 text-base">Período:</label>
        <select
          v-model="periodoSelecionado"
          @change="carregarRanking"
          class="h-10 px-4 border border-zinc-600 rounded-lg outline-none text-sm placeholder:text-zinc-600 hover:border-zinc-600 "
        >
          <option class="text-zinc-600" value="todos">Todos os mesês</option>
          <option class="text-zinc-600"
            v-for="periodo in periodosDisponiveis"
            :key="periodo.chave"
            :value="periodo.chave"
          >
            {{ periodo.nome }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="loading"
      class="text-center py-12 text-zinc-700 font-bold"
    >
      Carregando ranking...
    </div>

    <div
      v-else-if="!ranking.length"
      class="card text-center py-12"
    >
      <p class=" font-medium text-zinc-600 ">
        Nenhum jogo registrado {{ periodoSelecionado !== 'todos' ? 'no período selecionado' : '' }}
      </p>
      <p class="text-sm text-zinc-600 mt-2">
        Registre o primeiro jogo para começar o ranking!
      </p>
    </div>
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="(jogador, index) in rankingComPosicoes"
        :key="jogador.nome_jogador"
        class="ranking-item flex items-center rounded-lg border border-stone-300 p-4 shadow-lg"
      >
        <span class="text-3xl mr-4">
          <template v-if="jogador.posicao <= 3">
            {{ ['🏆', '🥈', '🥉'][jogador.posicao - 1] }}
          </template>
          <template v-else>
            🤡
          </template>
        </span>

        <span
          class="font-display text-4xl min-w-[80px] text-center"
          :class="{
            'text-yellow-500 drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]': jogador.posicao === 1,
            'text-gray-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]': jogador.posicao === 2,
            'text-orange-600 drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]': jogador.posicao === 3,
            'text-zinc-600': jogador.posicao > 3
          }"
        >
          {{ jogador.posicao }}º
        </span>

        <div class="flex-1">
          <div class="font-bold text-zinc-600 text-xl mb-1">
            {{ capitalizarNome(jogador.nome_jogador) }}
          </div>
        </div>

        <div class="text-center text-zinc-600 mr-5">
          <div class="font-display xl:text-3xl">
            {{ jogador.total_vitorias }}
          </div>
          <div class="text-xs uppercase tracking-wider text-zinc-600">
            vitória{{ jogador.total_vitorias !== 1 ? 's' : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const { buscarRankingCompleto, buscarRankingPorMes } = useRanking()

const nomesMeses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const periodoSelecionado = ref<string>('todos')
const periodosDisponiveis = ref<Array<{chave: string, nome: string}>>([])
const ranking = ref<any[]>([])
const loading = ref(false)

const rankingComPosicoes = computed(() => {
  const resultado: any[] = []
  let posicaoAtual = 1
  
  ranking.value.forEach((jogador, index) => {
    if (index > 0 && jogador.total_vitorias === ranking.value[index - 1].total_vitorias) {
      resultado.push({
        ...jogador,
        posicao: resultado[index - 1].posicao
      })
    } else {
      posicaoAtual = index + 1
      resultado.push({
        ...jogador,
        posicao: posicaoAtual
      })
    }
  })
  
  return resultado
})

const capitalizarNome = (nome: string) => {
  if (!nome) return ''
  return nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase()
}

const carregarPeriodosDisponiveis = async () => {
  const supabase = useSupabaseClient()
  
  try {
    const { data: jogos, error } = await supabase
      .from('jogos')
      .select('data')
      .order('data', { ascending: false })
    
    if (!error && jogos && jogos.length > 0) {
      const periodosSet = new Set<string>()
      
      jogos.forEach(jogo => {
        const data = new Date(jogo.data + 'T00:00:00')
        const mes = data.getMonth() + 1 
        const ano = data.getFullYear()
        const chave = `${ano}-${String(mes).padStart(2, '0')}`
        periodosSet.add(chave)
      })
      
      const periodos = Array.from(periodosSet)
        .sort((a, b) => a.localeCompare(b))
        .map(chave => {
          const [ano, mes] = chave.split('-')
          const mesNum = parseInt(mes)
          return {
            chave,
            nome: nomesMeses[mesNum - 1] 
          }
        })
      
      periodosDisponiveis.value = periodos
      
      if (periodos.length > 0 && periodoSelecionado.value === 'todos') {
        periodoSelecionado.value = periodos[periodos.length - 1].chave
      }
      
      console.log('📅 Períodos disponíveis:', periodos)
    } else {
      periodosDisponiveis.value = []
      periodoSelecionado.value = 'todos'
    }
  } catch (error) {
    console.error('Erro ao carregar períodos:', error)
    periodosDisponiveis.value = []
    periodoSelecionado.value = 'todos'
  }
}

const carregarRanking = async () => {
  loading.value = true
  console.log('🔄 Carregando ranking para período:', periodoSelecionado.value)
  
  let resultado
  
  if (periodoSelecionado.value === 'todos') {
    const anoAtual = new Date().getFullYear()
    resultado = await buscarRankingCompleto(anoAtual)
  } else {
    const [ano, mes] = periodoSelecionado.value.split('-')
    resultado = await buscarRankingPorMes(parseInt(ano), parseInt(mes))
  }
  
  if (resultado.success) {
    ranking.value = resultado.ranking || []
    console.log('✅ Ranking carregado:', ranking.value.length, 'jogadores')
  } else {
    console.error('❌ Erro ao carregar ranking:', resultado.error)
    ranking.value = []
  }
  
  loading.value = false
}

onMounted(async () => {
  await carregarPeriodosDisponiveis()
  await carregarRanking()
})

defineExpose({
  recarregar: async () => {
    await carregarPeriodosDisponiveis()
    await carregarRanking()
  }
})
</script>