<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="fechar"
  >
    <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
      <!-- Header -->
      <div class="text-center mb-6">
        <LockKeyhole class="m-auto mb-3" :size="24" color="#52525c" />

        <h2 class="text-2xl font-medium text-zinc-600 mb-2">
          {{ titulo }}
        </h2>
        <p class="text-sm text-zinc-600">
          {{ descricao }}
        </p>
      </div>

      <div v-if="infoExtra" class="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4 text-left">
        <p class="text-sm font-medium  text-zinc-600 mb-1">
           Data: <span class="font-normal">{{ infoExtra.data }}</span>
        </p>
        <p class="text-sm font-medium text-zinc-600">
           Time: <span class="font-normal">{{ infoExtra.time }}</span>
        </p>
      </div>

      <div
        v-if="erro"
        class="bg-red-500 text-white px-4 py-3 rounded-lg mb-4 text-sm font-medium"
      >
        ❌ {{ erro }}
      </div>

      <!-- Form -->
      <form @submit.prevent="verificarSenha">
        <div class="mb-6">
          <label class="block text-sm font-medium text-zinc-600 mb-2">
            Senha
          </label>
          <input
            v-model="senhaDigitada"
            type="password"
            placeholder="Digite a senha"
            required
            autofocus
          />
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            @click="fechar"
            class="cursor-pointer flex-1 px-4 py-3 border-2 border-zinc-300 text-zinc-600 font-medium rounded-lg hover:bg-zinc-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="carregando"
            class="cursor-pointer flex-1 px-4 py-3 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :class="tipo === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#317ef2] hover:bg-[#2868d9]'"
          >
            {{ carregando ? 'Verificando...' : textoBotao }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LockKeyhole } from 'lucide-vue-next';

const props = defineProps<{
  mostrar: boolean
  tipo?: 'registro' | 'delete'
  infoExtra?: {
    data: string
    time: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'fechar'): void
  (e: 'senha-correta'): void
}>()

const supabase = useSupabaseClient()
const senhaDigitada = ref('')
const erro = ref('')
const carregando = ref(false)

// Textos dinâmicos baseados no tipo
const titulo = computed(() => {
  return props.tipo === 'delete' ? 'Deletar Jogo' : 'Anfitrião'
})

const descricao = computed(() => {
  return props.tipo === 'delete' 
    ? 'Esta ação é irreversível. Digite a senha para confirmar.'
    : 'Digite a senha para registrar o time vencedor da rodada'
})

const textoBotao = computed(() => {
  return props.tipo === 'delete' ? 'Deletar' : 'Desbloquear'
})

const verificarSenha = async () => {
  if (!senhaDigitada.value.trim()) {
    erro.value = 'Por favor, digite a senha'
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    // Buscar senha do banco
    const { data, error } = await supabase
      .from('configuracoes')
      .select('senha_registro')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('Erro ao buscar senha:', error)
      erro.value = 'Erro ao verificar senha. Tente novamente.'
      carregando.value = false
      return
    }

    // Verificar senha
    if (senhaDigitada.value === data.senha_registro) {
      emit('senha-correta')
      fechar()
    } else {
      erro.value = 'Senha incorreta'
      senhaDigitada.value = ''
    }
  } catch (error) {
    console.error('Erro:', error)
    erro.value = 'Erro ao verificar senha. Tente novamente.'
  }

  carregando.value = false
}

const fechar = () => {
  senhaDigitada.value = ''
  erro.value = ''
  emit('fechar')
}

// Limpar erro quando o modal é aberto
watch(() => props.mostrar, (novoValor) => {
  if (novoValor) {
    erro.value = ''
    senhaDigitada.value = ''
  }
})
</script>