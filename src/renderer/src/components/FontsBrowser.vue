<script setup lang="ts">
import { ref, onMounted } from 'vue'

const fonts = ref<string[]>([])
const loading = ref(true)

const ipcGetSystemFonts = async (): Promise<void> => {
  setTimeout(async () => {
    fonts.value = await window.electron.ipcRenderer.invoke('get-system-fonts')
    loading.value = false
    console.log(fonts.value)
  }, 555)
}

onMounted(() => {
  ipcGetSystemFonts()
})
</script>
<template>
  <div class="fonts">
    <span>{{ fonts.length }} fonts {{ _fonts }}</span>
    <div class="listing">
      <div v-for="(font, index) in fonts" :key="index">
        <span
          :style="{
            fontFamily: font.fontNames.family,
            fontStyle: font.style.style,
            fontWeight: font.style.weight
          }"
          >{{ font.fontNames.fullname }}</span
        >
      </div>
    </div>
  </div>
</template>
