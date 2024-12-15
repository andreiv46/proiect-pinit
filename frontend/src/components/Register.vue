<script setup lang="ts">
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import {useToast} from "primevue/usetoast";
import Toast from "primevue/toast"

import {ref} from 'vue';
import {authService} from "../firebase/firebase.auth.ts";
import router from "../router/router.ts";

const toast = useToast()

const emailInput = ref<string>("")
const passwordInput = ref<string>("")
const nameInput = ref<string>("")

async function toLogin() {
  await router.push("/login")
}

async function register() {
  await authService.register({email: emailInput.value, name: nameInput.value, password: passwordInput.value})
  if (authService.getCurrentUser() !== null) {
    toast.add({severity: "success", summary: "User has been successfully registered!", life: 3000, closable: true})
    const token = await authService.getCurrentUser()?.getIdToken()
    const refreshToken = authService.getCurrentUser()?.refreshToken
    if (token && refreshToken) {
      localStorage.setItem("token", token)
      localStorage.setItem("refreshToken", refreshToken)
    }
  } else {
    toast.add({
      severity: "error",
      summary: "Couldn't register",
      detail: "Please try again later!",
      life: 3000,
      closable: true
    })
  }
}
</script>

<template>
  <Toast/>
  <div class="px-6 py-20 md:px-12 lg:px-20">
    <div class="bg-white dark:bg-slate-800 p-6 shadow-lg rounded-lg w-full lg:w-6/12 mx-auto">
      <div class="text-center mb-4">
        <img src="/ecopin.svg" class="mx-auto fill-teal-600 dark:fill-teal-400 h-40" alt=""/>
        <div class="text-teal-700 dark:text-teal-100 text-3xl font-medium mb-4">Let's get started!</div>
        <span class="text-slate-500 dark:text-slate-400 font-medium leading-normal">Already have an account?</span>
        <span @click="toLogin" class="font-medium no-underline ml-2 text-teal-600 cursor-pointer hover:text-teal-500">Sign in!</span>
      </div>
      <div>
        <label for="name" class="text-slate-800 dark:text-slate-200 font-medium mb-2 block">Name</label>
        <InputText v-model="nameInput" id="name" type="text" placeholder="Name" class="w-full mb-4 border-teal-400"/>

        <label for="email" class="text-slate-800 dark:text-slate-200 font-medium mb-2 block">Email</label>
        <InputText v-model="emailInput" id="email" type="text" placeholder="Email address"
                   class="w-full mb-4 border-teal-400"/>

        <label for="password" class="text-slate-800 dark:text-slate-200 font-medium mb-2 block">Password</label>
        <InputText v-model="passwordInput" id="password" type="password" placeholder="Password"
                   class="w-full mb-8 border-teal-400"/>

        <Button @click="register" label="Sign In" icon="pi pi-user"
                class="w-full bg-teal-600 hover:bg-teal-500 text-white"/>
      </div>
    </div>
  </div>
</template>
