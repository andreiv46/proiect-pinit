<script setup lang='ts'>
import PrimeButton from 'primevue/button'
import {useAuthStore} from '../store/auth.store.ts'
import {onMounted} from 'vue'

const authStore = useAuthStore()

function displayUser() {
  console.log(authStore.getCurrentUser)
}

onMounted(async () => {
  await authStore.onLogInWithEmailLinkRedirect()
})
</script>

<template>
  <PrimeButton @click='displayUser'>Display User</PrimeButton>
</template>