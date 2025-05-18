<script setup lang="ts">
import { ref, onMounted } from 'vue'

const fonts = ref([])
const ipcGetSystemFonts = async (): Promise<void> => {
  fonts.value = await window.electron.ipcRenderer.invoke('get-system-fonts')
}
onMounted(() => {
  ipcGetSystemFonts()
})
</script>
<template>
  <div class="fonts">
    <span>{{ fonts.length }} fonts {{ _fonts }}</span>
  </div>
</template>
