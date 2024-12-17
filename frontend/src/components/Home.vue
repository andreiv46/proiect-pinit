<script setup lang='ts'>
import Button from 'primevue/button'
import router from '../router/router.ts'
import {useAuthStore} from '../store/auth.store.ts'

const authStore = useAuthStore()

async function logout() {
  await authStore.logOut()
  await router.push('/login')
}

async function displayCurrentUser() {
  console.log(authStore.getCurrentUser)
}

</script>

<template>
  <Button label='Log out' icon='pi pi-user' @click='logout'/>
  <Button label='Current user' icon='pi pi-user' @click='displayCurrentUser'/>
</template>