<script setup lang="ts">
import {Avatar, Popover} from "primevue"
import {ref} from "vue";
import router from "../../router/router.ts";
import Button from "primevue/button";
import {useAuthStore} from '../../store/auth.store.ts'

const authStore = useAuthStore()

async function logout() {
  await authStore.logOut()
  await router.push('/login')
}

const op = ref()

function toggle(event: Event) {
  op.value.toggle(event)
}

</script>

<template>
  <Avatar @click="toggle"
          class="hover:cursor-pointer"
          size="normal"
          image='https://primefaces.org/cdn/primevue/images/organization/walter.jpg'/>

  <Popover ref="op">
    <div class="flex flex-col gap-4 w-auto items-center justify-center">
      <Avatar size="xlarge"
              image='https://primefaces.org/cdn/primevue/images/organization/walter.jpg'/>
      <div class="flex flex-col items-center justify-center ">
        <span class="font-medium">#{{authStore.getCurrentUser?.displayName}}</span>
        <span class="text-sm text-surface-500 dark:text-surface-400">{{
            authStore.getCurrentUser?.email
          }}</span>
      </div>
      <Button class="w-full" severity="info" label='Profile' icon='pi pi-user' outlined/>
      <Button class="w-full" severity="danger" label='Log out' icon='pi pi-sign-out' @click='logout' outlined/>
    </div>
  </Popover>
</template>