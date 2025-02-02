<script setup lang='ts'>
import {ref} from 'vue'
import {InputGroup, InputGroupAddon, InputText, Menubar, Badge} from 'primevue'
import {useAuthStore} from '../../store/auth.store.ts'
import router from '../../router/router.ts'
import NavBarProfile from "./NavBarProfile.vue";
import Button from "primevue/button";

const items = ref([
  {
    label: 'Posts',
    icon: 'pi pi-map',
    command: async () => {
      await router.push('/map')
    }
  },
])
const authStore = useAuthStore()

async function toHome() {
  await router.push('/')
}

async function goToSignIn(){
  await router.push('/login')
}

</script>

<template>
  <div class='card sticky top-0 z-50'>
    <Menubar :model='items'>
      <template #start>
        <img @click='toHome' src='/ecopin.svg'
             class='mx-auto fill-teal-600 dark:fill-teal-400 h-12 hover:cursor-pointer' alt='Logo'/>
      </template>
      <template #item='{ item, props, hasSubmenu, root }'>
        <a v-ripple class='flex items-center' v-bind='props.action'>
          <i :class='item.icon'/>
          <span>{{ item.label }}</span>
          <Badge v-if='item.badge' :class="{ 'ml-auto': !root, 'ml-2': root }" :value='item.badge'/>
          <span v-if='item.shortcut'
                class='ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1'>
            {{ item.shortcut }}
          </span>
          <i v-if='hasSubmenu'
             :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"/>
        </a>
      </template>
      <template #end>
        <div class='flex items-center gap-2'>
          <NavBarProfile v-if="authStore.getIsAuthenticated"/>
          <Button v-else class="w-2/5" severity="success" label='Log in' icon='pi pi-sign-in' @click='goToSignIn'/>
        </div>
      </template>
    </Menubar>
  </div>
</template>
