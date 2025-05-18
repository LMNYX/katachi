<script setup lang="ts">
import Topbar from './components/Topbar.vue'
import FontsBrowser from './components/FontsBrowser.vue'

const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <Topbar />
  <FontsBrowser />
</template>
