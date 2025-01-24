<script setup lang='ts'>
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import {useToast} from 'primevue/usetoast'
import Toast from 'primevue/toast'

import {ref, watch} from 'vue'
import {useAuthStore} from '../store/auth.store.ts'
import router from '../router/router.ts'
import {Message, FloatLabel} from "primevue";

const toast = useToast()
const authStore = useAuthStore()

const emailInput = ref<string>('')
const passwordInput = ref<string>('')
const nameInput = ref<string>('')
const usernameMessage = ref<string>('')
const usernameSeverity = ref<string>('')

async function toLogin() {
  await router.push('/login')
}

async function register() {
  await authStore.register({email: emailInput.value, name: nameInput.value, password: passwordInput.value})
  if (authStore.getIsAuthenticated) {
    toast.add({severity: 'success', summary: 'User has been successfully registered!', life: 3000, closable: true})
    const token = await authStore.getCurrentUser?.getIdToken()
    const refreshToken = authStore.getCurrentUser?.refreshToken
    if (token && refreshToken) {
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
    }
  } else {
    toast.add({
      severity: 'error',
      summary: 'Couldn\'t register',
      detail: 'Please try again later!',
      life: 3000,
      closable: true
    })
  }
}
</script>

<template>
  <Toast/>
  <div class='px-6 py-20 md:px-12 lg:px-20'>
    <div class='bg-white dark:bg-slate-800 p-6 shadow-lg rounded-lg w-full lg:w-6/12 mx-auto'>
      <div class='text-center mb-4'>
        <img src='/ecopin.svg' class='mx-auto fill-teal-600 dark:fill-teal-400 h-40' alt=''/>
        <div class='text-teal-700 dark:text-teal-100 text-3xl font-medium mb-4'>Let's get started!</div>
        <span class='text-slate-500 dark:text-slate-400 font-medium leading-normal'>Already have an account?</span>
        <span @click='toLogin' class='font-medium no-underline ml-2 text-teal-600 cursor-pointer hover:text-teal-500'>Sign in!</span>
      </div>
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <FloatLabel variant="in">
            <InputText v-model='nameInput' id='name' type='text' class='w-full' />
            <label for="name">Username</label>
          </FloatLabel>
          <Message
              v-if="usernameMessage"
              :severity="usernameSeverity"
              size="small"
              variant="simple"
          >
            {{ usernameMessage }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <FloatLabel variant="in">
            <InputText v-model='emailInput' id='email' type='text' class='w-full'/>
            <label for="email">Email</label>
          </FloatLabel>
          <!--        <Message v-if="" severity="error" size="small" variant="simple">-->
          <!--          {{ }}-->
          <!--        </Message>-->
        </div>
        <div class="flex flex-col gap-1">
          <FloatLabel variant="in">
            <InputText v-model='passwordInput' id='password' type='password' class='w-full'/>
            <label for="password">Password</label>
          </FloatLabel>
        </div>
        <Button @click='register' label='Sign In' icon='pi pi-user'
                class='w-full bg-teal-600 hover:bg-teal-500 text-white mt-6'/>
      </div>
    </div>
  </div>
</template>
