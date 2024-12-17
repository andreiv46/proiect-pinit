<script setup lang='ts'>
import {Toast} from 'primevue'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main>
    <RouterView/>
  </main>
  <Toast position='top-left' group='tl' />
</template>