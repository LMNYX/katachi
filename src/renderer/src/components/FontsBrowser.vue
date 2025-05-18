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

async function copyInfo(id: number, dataType: string): any
{
  console.log(id, dataType)
  if (dataType in fonts.value[id])
    return await navigator.clipboard.writeText(fonts.value[id][dataType])

  switch (dataType) {
    case 'css':
      return await navigator.clipboard.writeText(`font-family: '${fonts.value[id].fontNames.family}';\nfont-style: ${fonts.value[id].style.style};\nfont-weight: ${fonts.value[id].style.weight};`)
    default:
      return false
  }
}

onMounted(() => {
  ipcGetSystemFonts()
})
</script>
<template>
  <div class="fonts">
    <span>{{ fonts.length }} fonts {{ _fonts }}</span>
    <div class="listing">
      <div v-for="(font, index) in fonts" :key="index" :data-id="index">
        <div class="topright">
          <button style="cursor: copy" @click="copyInfo(index, 'path')">path</button>
          <button style="cursor: copy" @click="copyInfo(index, 'css')">css</button>
          <button>...</button>
        </div>
        <span class="font-name">{{ font.fontNames.fullname }}</span>
        <span
          :style="{
            fontFamily: font.fontNames.family,
            fontStyle: font.style.style,
            fontWeight: font.style.weight
          }"
          class="font-example"
          >The quick brown fox jumps over the lazy dog.</span
        >
      </div>
    </div>
  </div>
</template>
