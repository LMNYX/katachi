<script setup lang="ts">
import { ref } from 'vue'
import Topbar from './components/Topbar.vue'
import FontsBrowser from './components/FontsBrowser.vue'

const filterText = ref('')
const handleFilterChange = (newFilter: string) => {
  filterText.value = newFilter
}
</script>

<template>
  <Topbar @update:filter="handleFilterChange" />
  <FontsBrowser :filter="filterText" />
</template>
