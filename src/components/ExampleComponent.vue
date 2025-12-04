<template>
  <div class="card bg-base-200 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">{{ title }}</h2>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Example Component',
  message: 'This is an example component',
})
</script>
