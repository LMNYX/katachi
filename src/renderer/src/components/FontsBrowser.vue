<script setup lang="ts">
import { defineProps, computed, createApp, h, ref, onMounted } from 'vue'
import Notification from './Notification.vue'

const props = defineProps<{ filter: string }>()

interface FontInfo {
  fontNames: {
    family: string
    subfamily: string
    postscript: string
    fullname: string
    version: string
  }
  style: {
    style: string
    weight: number
  }
  path: string
  supportsCyrillic: boolean
  supportsJapanese: boolean
  supportsKorean: boolean
  supportsChinese: boolean
}

function spawnNotification(message: string): void {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const visible = ref(true)

  const app = createApp({
    setup() {
      setTimeout(() => {
        visible.value = false
      }, 3000)

      return () => (visible.value ? h(Notification, null, { default: () => message }) : null)
    }
  })

  const vm = app.mount(container)

  vm.$el.addEventListener('transitionend', () => {
    if (!visible.value) {
      app.unmount()
      container.remove()
    }
  })
}

const fonts = ref<FontInfo[]>([])
const loading = ref(true)

const ipcGetSystemFonts = async (): Promise<void> => {
  setTimeout(async () => {
    fonts.value = await window.electron.ipcRenderer.invoke('get-system-fonts')
    loading.value = false
    console.log(fonts.value)
  }, 555)
}

async function copyInfo(id: number, dataType: string): Promise<boolean | void> {
  console.log(id, dataType)
  spawnNotification('Copied ' + dataType)

  if (dataType in fonts.value[id]) {
    const value = fonts.value[id][dataType as keyof FontInfo]
    if (typeof value === 'string') {
      return navigator.clipboard.writeText(value)
    }
  }

  switch (dataType) {
    case 'full family name':
      return navigator.clipboard.writeText(fonts.value[id].fontNames.fullname)
    case 'css':
      return navigator.clipboard.writeText(
        `font-family: '${fonts.value[id].fontNames.family}';\nfont-style: ${fonts.value[id].style.style};\nfont-weight: ${fonts.value[id].style.weight};`
      )
    default:
      return false
  }
}

onMounted(() => {
  ipcGetSystemFonts()
})

const filteredFonts = computed<FontInfo[]>(() =>
  fonts.value.filter((font) => {
    const searchString = props.filter.toLowerCase()
    const names = font.fontNames

    return (
      names.family?.toLowerCase().includes(searchString) ||
      names.subfamily?.toLowerCase().includes(searchString) ||
      names.postscript?.toLowerCase().includes(searchString) ||
      names.fullname?.toLowerCase().includes(searchString) ||
      names.version?.toLowerCase().includes(searchString)
    )
  })
)
</script>

<template>
  <div class="fonts">
    <span class="listing-topbar">{{ filteredFonts.length }} fonts</span>
    <div class="listing">
      <div v-for="(font, index) in filteredFonts" :key="index" :data-id="index">
        <div class="topright">
          <button style="cursor: copy" @click="copyInfo(index, 'path')">path</button>
          <button style="cursor: copy" @click="copyInfo(index, 'css')">css</button>
          <button @click="spawnNotification('Not yet implemented!')">...</button>
        </div>
        <span class="font-name" @click="copyInfo(index, 'full family name')">{{
          font.fontNames.fullname
        }}</span>
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
