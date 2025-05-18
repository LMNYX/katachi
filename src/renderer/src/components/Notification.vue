<template>
  <transition name="slide-up" @after-leave="removeSelf">
    <div v-if="visible" class="notification">
      <slot />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)

// Show notification and hide after 3 seconds
onMounted(() => {
  visible.value = true
  setTimeout(() => {
    visible.value = false
  }, 3000)
})

// Emits event to parent or can remove itself from DOM if managed by parent
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const removeSelf = () => {
  //
}
</script>

<style scoped>
.notification {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #323232;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.2);
  font-weight: 500;
  max-width: 90%;
  text-align: center;
  z-index: 9999;
}

/* Transition for sliding up from bottom */
.slide-up-enter-from {
  opacity: 0;
  transform: translate(-50%, 100%);
}
.slide-up-enter-active {
  transition: all 0.3s ease;
}
.slide-up-enter-to {
  opacity: 1;
  transform: translate(-50%, 0);
}
.slide-up-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 100%);
}
</style>
