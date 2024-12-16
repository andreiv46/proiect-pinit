<script setup lang="ts">
import {ref} from "vue";
import {Avatar, InputGroup, InputGroupAddon, InputText, Menubar} from "primevue";
import {authService} from "../firebase/firebase.auth.ts";
import router from "../router/router.ts";

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home'
  },
  {
    label: 'Projects',
    icon: 'pi pi-search',
    badge: 3,
    items: [
      {
        label: 'Core',
        icon: 'pi pi-bolt',
        shortcut: '⌘+S'
      },
      {
        label: 'Blocks',
        icon: 'pi pi-server',
        shortcut: '⌘+B'
      },
      {
        separator: true
      },
      {
        label: 'UI Kit',
        icon: 'pi pi-pencil',
        shortcut: '⌘+U'
      }
    ]
  }
])

async function toHome() {
  await router.push("/")
}
</script>

<template>
  <div class="card sticky top-0 z-50 mb-4">
    <Menubar :model="items">
      <template #start>
        <img @click="toHome" src="/ecopin.svg"
             class="mx-auto fill-teal-600 dark:fill-teal-400 h-12 hover:cursor-pointer" alt="Logo"/>
      </template>
      <template #item="{ item, props, hasSubmenu, root }">
        <a v-ripple class="flex items-center" v-bind="props.action">
          <i :class="item.icon"/>
          <i v-if="authService.isAuthenticated.value" class="pi pi-apple"/>
          <span>{{ item.label }}</span>
          <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge"/>
          <span v-if="item.shortcut"
                class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">
            {{ item.shortcut }}
          </span>
          <i v-if="hasSubmenu"
             :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"/>
        </a>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-search"></i>
            </InputGroupAddon>
            <InputText placeholder="Search" type="text" class="w-32 sm:w-auto"/>
          </InputGroup>
          <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle"/>
        </div>
      </template>
    </Menubar>
  </div>
</template>
