<script setup lang="ts">
import { defineEmits } from 'vue'

const emit = defineEmits(['update:filter'])

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:filter', target.value)
}
</script>

<template>
  <div class="topbar">
    <button>katachi</button>
    <input placeholder="Search fonts" @input="onInput" spellcheck="false" />
    <button class="menu-button">⋯</button>
  </div>
</template>
