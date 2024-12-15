<script setup lang="ts">
import {Toast} from "primevue";
</script>

<template>
  <Toast position="top-left" group="tl" />
  <main>
    <RouterView/>
  </main>
</template>