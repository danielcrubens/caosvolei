<template>
  <div class="card">
    <div
      v-if="showSuccess"
      class="bg-green-500 text-white px-4 py-4 border-3 mb-5 font-bold animate-slide-down"
    >
      ✓ Jogo registrado com sucesso!
    </div>

    <div
      v-if="error"
      class="bg-red-500 text-white px-4 py-4 border-3 mb-5 font-bold"
    >
      ❌ {{ error }}
    </div>

    <form class="text-zinc-600" @submit.prevent="handleSubmit">
      <div class="mb-6 ">
        <label
          class="flex items-center gap-2 font-bold text-sm tracking-wider mb-2"
        >
          <Calendar :size="15" color="#52525c" /> Data do Jogo
        </label>
        <input
          v-model="form.data"
          type="date"
          required
          class="w-full h-12 px-4 border border-zinc-600 rounded-lg outline-none text-sm placeholder:text-zinc-600"
        />
      </div>

      <div class="mb-6">
        <label class="flex items-center gap-2 font-bold text-sm tracking-wider mb-2"
>
             <Trophy  :size="15" color="#52525c"/>  Nome do Time Vencedor
        </label>
        <input
          v-model="form.timeVencedor"
          type="text"
          placeholder="Ex: Spikers, Net Ninjas..."
          required
          class="w-full h-12 px-4 border border-zinc-600 rounded-lg outline-none text-sm placeholder:text-zinc-600 hover:border-zinc-600 "
        />
      </div>

      <div class="mb-6">
        <label class="flex items-center gap-2 font-bold text-sm tracking-wider mb-2">
          <Users   :size="15" color="#52525c" /> Jogadores do Time Vencedor (mínimo 4)
        </label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div v-for="i in 6" :key="i" class="relative">
            <input
              v-model="form.jogadores[i - 1]"
              type="text"
              :placeholder="`Jogador ${i}`"
              :required="i <= 4"
              class="w-full h-12 px-4 border border-zinc-600 rounded-lg outline-none text-sm placeholder:text-zinc-600 "
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="group relative inline-block text-sm font-medium text-blue-600 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span
          class="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-[#317ef2] transition-transform group-hover:translate-x-0 group-hover:translate-y-0"
        ></span>

        <span
          class="relative flex items-center justify-center gap-2 border border-current bg-white px-8 py-3"
        >
          <Save v-if="!loading" :size="18" />
          <Loader2 v-else :size="18" class="animate-spin" />
          {{ loading ? "Salvando..." : "Salvar Resultado" }}
        </span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Save, Loader2, Calendar, Trophy, Users } from "lucide-vue-next";

const { registrarJogo } = useJogos();

const form = ref({
  data: new Date().toISOString().split("T")[0],
  timeVencedor: "",
  jogadores: ["", "", "", "", "", ""],
});

const loading = ref(false);
const showSuccess = ref(false);
const error = ref("");

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";

  const jogadoresValidos = form.value.jogadores
    .filter((j) => j.trim() !== "")
    .map(j => {
      const nome = j.trim();
      return nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
    });

  if (jogadoresValidos.length < 4) {
    error.value = "É necessário no mínimo 4 jogadores!";
    loading.value = false;
    return;
  }

  const resultado = await registrarJogo(
    form.value.data,
    form.value.timeVencedor,
    jogadoresValidos,
  );

  loading.value = false;

  if (resultado.success) {
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);

    form.value.timeVencedor = "";
    form.value.jogadores = ["", "", "", "", "", ""];
    form.value.data = new Date().toISOString().split("T")[0];

    emit("jogoRegistrado");
  } else {
    error.value = "Erro ao salvar jogo. Tente novamente.";
  }
};

const emit = defineEmits(["jogoRegistrado"]);
</script>