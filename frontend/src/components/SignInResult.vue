<script setup lang="ts">
import PrimeButton from "primevue/button"
import {authService} from "../firebase/firebase.auth.ts";
import {onMounted} from "vue";

function displayUser() {
  console.log(authService.getCurrentUser())
}

onMounted(async () => {
  await authService.onSignInWithEmailLinkRedirect()
})
</script>

<template>
  <PrimeButton @click="displayUser">Display User</PrimeButton>
</template>