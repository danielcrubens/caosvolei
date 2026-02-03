<template>
  <div class="min-h-screen relative overflow-x-hidden bg-[#fffbf6]">
    <div class="bg-orb-top" />
    <div class="bg-orb-bottom" />

    <ModalSenha
      :mostrar="mostrarModalSenha"
      @fechar="mostrarModalSenha = false"
      @senha-correta="desbloquearFormulario"
    />

    <div class="max-w-6xl mx-auto px-5 py-10 relative z-10">
      <header class="text-center pb-4 animate-slide-down">
        <Text3d
          children="Caos no Volêi"
          :speed="1.8"
          :enable-shadows="true"
          :enable-on-hover="false"
        />
      </header>

      <div class="flex gap-4 xl:pb-4 pb-10 justify-center flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selecionarTab(tab.id)"
          class="inline-block rounded-sm px-2 py-3 text-sm font-medium cursor-pointer transition-all"
          :class="
            tabAtiva === tab.id
              ? 'border border-[#317ef2] bg-[#317ef2] text-white'
              : 'border border-[#317ef2] text-[#317ef2] hover:bg-[#317ef2] hover:text-white'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="animate-fade-in">
        <div v-show="tabAtiva === 'registro'" class="relative">
          <FormRegistro
            :class="{ 'pointer-events-none': !formularioDesbloqueado }"
            @jogo-registrado="handleJogoRegistrado"
          />
        </div>

        <div v-show="tabAtiva === 'ranking'">
          <RankingList ref="rankingRef" />
        </div>

        <div v-show="tabAtiva === 'historico'">
          <HistoricoTimeline
            ref="historicoRef"
            :mostar-delete="true"
            @jogo-removido="handleJogoRemovido"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RankingList from "../components/RankingList.vue";
import HistoricoTimeline from "../components/Historicotimeline.vue";
import ModalSenha from "../components/ModalSenha.vue";
import Text3d from "../components/Text3d.vue";

const tabs = [
  { id: "registro", label: "Registrar Jogo" },
  { id: "ranking", label: "Ranking" },
  { id: "historico", label: "Histórico" },
];

const tabAtiva = ref("ranking");
const formularioDesbloqueado = ref(false);
const mostrarModalSenha = ref(false);
const rankingRef = ref();
const historicoRef = ref();

const selecionarTab = (tabId: string) => {
  console.log('🔄 [INDEX] Tab selecionada:', tabId)
  if (tabId === "registro" && !formularioDesbloqueado.value) {
    console.log('🔒 [INDEX] Formulário bloqueado, mostrando modal de senha')
    mostrarModalSenha.value = true;
    return;
  }
  console.log('✅ [INDEX] Tab alterada de', tabAtiva.value, 'para', tabId)
  tabAtiva.value = tabId;

  // Log para verificar se os refs estão disponíveis
  console.log('📌 [INDEX] rankingRef disponível:', !!rankingRef.value)
  console.log('📌 [INDEX] historicoRef disponível:', !!historicoRef.value)
};

const desbloquearFormulario = () => {
  formularioDesbloqueado.value = true;
  tabAtiva.value = "registro";
};

const handleJogoRegistrado = () => {
  console.log('🎮 [INDEX] Jogo registrado, recarregando componentes')
  if (rankingRef.value) {
    console.log('🔄 [INDEX] Recarregando ranking')
    rankingRef.value.recarregar();
  } else {
    console.warn('⚠️ [INDEX] rankingRef não disponível')
  }
  if (historicoRef.value) {
    console.log('🔄 [INDEX] Recarregando histórico')
    historicoRef.value.recarregar();
  } else {
    console.warn('⚠️ [INDEX] historicoRef não disponível')
  }
  tabAtiva.value = "historico";
};

const handleJogoRemovido = () => {
  console.log('🗑️ [INDEX] Jogo removido, recarregando ranking')
  if (rankingRef.value) {
    console.log('🔄 [INDEX] Recarregando ranking')
    rankingRef.value.recarregar();
  } else {
    console.warn('⚠️ [INDEX] rankingRef não disponível')
  }
};

useHead({
  title: "VolleyTrack - Sistema de Ranking de Vôlei",
  meta: [
    {
      name: "description",
      content:
        "Sistema para acompanhar e rankear jogadores de vôlei recreativo",
    },
  ],
});

onMounted(() => {
  console.log('🚀 [INDEX] Página montada - Tab inicial:', tabAtiva.value)
  console.log('📌 [INDEX] Refs disponíveis:', {
    ranking: !!rankingRef.value,
    historico: !!historicoRef.value
  })
})
</script>
