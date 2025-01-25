<script setup lang='ts'>
import {Toast} from 'primevue'
import NavBar from './components/navbar/NavBar.vue'
</script>

<template>
  <NavBar />
  <main>
    <RouterView/>
    <Toast position="bottom-right" />
  </main>
</template>