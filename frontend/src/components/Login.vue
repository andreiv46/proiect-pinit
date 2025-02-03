<script setup lang='ts'>
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'

import {onMounted, ref} from 'vue'
import router from '../router/router.ts'
import {useAuthStore} from '../store/auth.store.ts'
import {useToast} from 'primevue/usetoast'
import {FloatLabel} from "primevue";

const emailOnlyChecked = ref<boolean>(false)
const emailInput = ref<string>('')
const passwordInput = ref<string>('')

const toast = useToast()
const authStore = useAuthStore()

async function toRegister() {
  await router.push('/register')
}

onMounted(async () => {
  const signInChannel = new BroadcastChannel('sigin_channel')
  signInChannel.onmessage = async (message) => {
    if (message.data.type === 'SIGNIN_SUCCESSFUL') {
      await router.push('/userposts')
    }
  }
})

async function handleLogin() {
  if (emailOnlyChecked.value) {
    window.localStorage.setItem('emailForSignIn', emailInput.value)
    const result = await authStore.logInWithEmailLink(emailInput.value)
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'The sign in link has been sent to your email account!',
        life: 3000,
        closable: true
      })
      await router.push('/userposts')
    } else {
      toast.add({
        severity: 'error',
        summary: 'Couldn\'t sign in',
        detail: result.errorMessage,
        life: 3000,
        closable: true
      })
    }
  } else {
    const result = await authStore.logInWithEmailAndPassword({
      email: emailInput.value,
      password: passwordInput.value
    })
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'You have successfully signed in!',
        life: 3000,
        closable: true
      })
      await router.push('/userposts')
    } else {
      toast.add({
        severity: 'error',
        summary: 'Couldn\'t sign in',
        detail: result.errorMessage,
        life: 3000,
        closable: true
      })
    }
  }
}

</script>

<template>
  <!--  bg-gradient-to-r from-teal-500 to-cyan-400-->
  <!--  <Toast/>-->
  <div class='px-6 py-20 md:px-12 lg:px-20'>
    <div class='bg-white dark:bg-slate-800 p-6 shadow-lg rounded-lg w-full lg:w-6/12 mx-auto'>
      <div class='text-center mb-4'>
        <img src='/ecopin.svg' class='mx-auto fill-teal-600 dark:fill-teal-400 h-40' alt=''/>
        <div class='text-teal-700 dark:text-teal-100 text-3xl font-medium mb-4'>Welcome Back</div>
        <span class='text-slate-500 dark:text-slate-400 font-medium leading-normal'>Don't have an account?</span>
        <span @click='toRegister'
              class='font-medium no-underline ml-2 text-teal-600 cursor-pointer hover:text-teal-500'>Sign up!</span>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-1">
          <FloatLabel variant="in">
            <InputText v-model='emailInput' id='email' type='text' class='w-full'/>
            <label for="email">Email</label>
          </FloatLabel>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="in">
            <InputText v-if='!emailOnlyChecked' v-model='passwordInput' id='password' type='password'
                       class='w-full'/>
            <label v-if="!emailOnlyChecked" for="password">Password</label>
          </FloatLabel>
        </div>

        <div class='flex items-center justify-between mb-6'>
          <div class='flex items-center'>
            <Checkbox id='emailOnlyChecked' v-model='emailOnlyChecked' :binary='true' class='mr-2 text-teal-600'/>
            <label for='emailOnlyChecked' class='text-slate-800 dark:text-slate-200'>Sign in without password</label>
          </div>
          <a class='font-medium no-underline ml-2 text-teal-600 text-right cursor-pointer hover:text-teal-500'>Forgot
            password?</a>
        </div>
        <Button @click='handleLogin' label='Sign In' icon='pi pi-user'
                class='w-full bg-teal-600 hover:bg-teal-500 text-white'/>
      </div>
    </div>
  </div>
</template>
