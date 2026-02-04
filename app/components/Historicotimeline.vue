<template>
  <div class="card">
    <ModalSenha
      :mostrar="mostrarModalDelete"
      tipo="delete"
      :info-extra="jogoParaDeletar"
      @fechar="fecharModalDelete"
      @senha-correta="executarDelete"
    />

    <div class="mb-8 flex gap-2 items-center">
      <label class="font-medium text-base text-zinc-600">Filtrar:</label>
      <select
        v-model="mesFiltro"
        @change="carregarHistorico"
        class="w-full h-12 px-4 border border-zinc-600 rounded-lg outline-none text-sm placeholder:text-zinc-600 hover:border-zinc-600"
      >
        <option class="text-zinc-600" value="">Todos os meses</option>
        <option class="text-zinc-600"
          v-for="mes in meses"
          :key="mes.valor"
          :value="mes.valor"
        >
          {{ mes.label }}
        </option>
      </select>
    </div>

    <div
      v-if="loading"
      class="text-center py-12 text-zinc-700 font-bold"
    >
      Carregando histórico...
    </div>

    <div
      v-else-if="!jogos.length"
      class="text-center py-12 text-zinc-700"
    >
      <p class="font-medium text-zinc-600">
        {{ mesFiltro ? `Nenhum jogo registrado em ${getNomeMes(mesFiltro)}` : 'Nenhum jogo registrado ainda' }}
      </p>
    </div>

    <div
      v-else
      class="space-y-5"
    >
      <div
        v-for="jogo in jogos"
        :key="jogo.id"
        class="relative flex h-full flex-col rounded-lg border border-stone-300 p-4 shadow-lg "
      >
        <div class="font-display text-base text-zinc-600 mb-2">
          {{ formatarData(jogo.data) }}
        </div>

        <div class="text-base flex items-center gap-2 text-zinc-600 mb-3">
          <Volleyball :size="15" color="#52525c" /> Time: {{ jogo.time_vencedor }}
        </div>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="participacao in jogo.participacoes"
            :key="participacao.nome_jogador"
            class=" px-3.5 py-1.5 border-2  text-sm text-zinc-600 font-medium"
          >
            {{ participacao.nome_jogador }}
          </span>
        </div>

        <button
          v-if="mostarDelete"
          @click="abrirModalDelete(jogo)"
          class="mt-4 text-red-500 font-medium text-base  flex items-center gap-1 cursor-pointer"
        >
          <Trash2  :size="15" color="#fb2c36  " />  Deletar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Volleyball, Trash2  } from "lucide-vue-next";
import ModalSenha from '@/components/ModalSenha.vue'

const { buscarJogos, deletarJogo } = useJogos()

const props = defineProps({
  mostarDelete: {
    type: Boolean,
    default: false
  }
})

const meses = ref<{valor: string, label: string}[]>([])
const mesFiltro = ref<string>('')
const jogos = ref<any[]>([])
const loading = ref(false)
const mostrarModalDelete = ref(false)
const jogoParaDeletar = ref<{id: number, data: string, time: string} | null>(null)

const capitalizarTexto = (texto: string) => {
  if (!texto) return ''
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}

const getNomeMes = (mesAno: string) => {
  const [ano, mes] = mesAno.split('-')
  const data = new Date(Number(ano), Number(mes) - 1, 1)
  const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long' })
  return capitalizarTexto(nomeMes)
}

const carregarMesesDisponiveis = async () => {
  const supabase = useSupabaseClient()

  try {
    const { data: jogosData, error } = await supabase
      .from('jogos')
      .select('data')
      .order('data', { ascending: false })

    if (!error && jogosData) {
      const mesesUnicos = [...new Set(
        jogosData.map(j => {
          const date = new Date(j.data + 'T00:00:00')
          const ano = date.getFullYear()
          const mes = String(date.getMonth() + 1).padStart(2, '0')
          return `${ano}-${mes}`
        })
      )].sort()

      meses.value = mesesUnicos.map(mesAno => ({
        valor: mesAno,
        label: getNomeMes(mesAno)
      }))
    }
  } catch (error) {
    const hoje = new Date()
    const anoAtual = hoje.getFullYear()
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0')
    meses.value = [
      { valor: `${anoAtual}-${mesAtual}`, label: getNomeMes(`${anoAtual}-${mesAtual}`) }
    ]
  }
}

const carregarHistorico = async () => {
  loading.value = true

  const supabase = useSupabaseClient()

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

    if (mesFiltro.value) {
      const [ano, mes] = mesFiltro.value.split('-')
      const primeiroDia = `${ano}-${mes}-01`
      const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate()
      const ultimoDiaFormatado = `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`

      query = query
        .gte('data', primeiroDia)
        .lte('data', ultimoDiaFormatado)
    }

    const { data: jogosData, error } = await query

    if (!error && jogosData) {
      jogos.value = jogosData
    } else {
      jogos.value = []
    }
  } catch (error) {
    jogos.value = []
  }

  loading.value = false
}

const formatarData = (data: string) => {
  const date = new Date(data + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const abrirModalDelete = (jogo: any) => {
  jogoParaDeletar.value = {
    id: jogo.id,
    data: formatarData(jogo.data),
    time: jogo.time_vencedor
  }
  mostrarModalDelete.value = true
}

const fecharModalDelete = () => {
  mostrarModalDelete.value = false
  jogoParaDeletar.value = null
}

const executarDelete = async () => {
  if (!jogoParaDeletar.value) return
  
  const resultado = await deletarJogo(jogoParaDeletar.value.id)
  
  if (resultado.success) {
    await carregarHistorico()
    emit('jogoRemovido')
    fecharModalDelete()
  } else {
    alert('Erro ao deletar jogo')
  }
}

onMounted(async () => {
  await carregarMesesDisponiveis()
  await carregarHistorico()
})

defineExpose({
  recarregar: async () => {
    await carregarMesesDisponiveis()
    await carregarHistorico()
  }
})

const emit = defineEmits(['jogoRemovido'])
</script>