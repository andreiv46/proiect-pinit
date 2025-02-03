<script setup lang='ts'>
import Button from 'primevue/button'
import router from "../router/router.ts";

async function toUserPosts() {
  await router.push('/userposts')
}

</script>

<template>
  <div class="grid grid-cols-1 place-items-center mt-12">
    <img src='/ecopin.svg'
         class='fill-teal-600 dark:fill-teal-400 h-56' alt='Logo'/>
    <span class="font-bold text-9xl">Welcome!</span>
    <Button class="mt-12" size="large" outlined @click="toUserPosts">Let's get started!</Button>
  </div>
</template>