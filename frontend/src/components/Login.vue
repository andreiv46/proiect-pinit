<script setup>
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';

import { ref } from 'vue';

const checked1 = ref(true);
</script>

<template>
  <div class="bg-gradient-to-r from-teal-500 to-cyan-400 px-6 py-20 md:px-12 lg:px-20">
    <div class="bg-white dark:bg-slate-800 p-6 shadow-lg rounded-lg w-full lg:w-6/12 mx-auto">
      <div class="text-center mb-4">
        <img src="../../public/ecopin.svg" class="mx-auto fill-teal-600 dark:fill-teal-400 h-40"  alt=""/>
        <div class="text-teal-700 dark:text-teal-100 text-3xl font-medium mb-4">Welcome Back</div>
        <span class="text-slate-500 dark:text-slate-400 font-medium leading-normal">Don't have an account?</span>
        <a class="font-medium no-underline ml-2 text-teal-600 cursor-pointer hover:text-teal-500">Create today!</a>
      </div>

      <div>

        <label for="email1" class="text-slate-800 dark:text-slate-200 font-medium mb-2 block">Email</label>
        <InputText id="email1" type="text" placeholder="Email address" class="w-full mb-4 border-teal-400" />

        <label for="password1" class="text-slate-800 dark:text-slate-200 font-medium mb-2 block">Password</label>
        <InputText id="password1" type="password" placeholder="Password" class="w-full mb-4 border-teal-400" />

        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center">
            <Checkbox id="rememberme1" v-model="checked1" :binary="true" class="mr-2 text-teal-600" />
            <label for="rememberme1" class="text-slate-800 dark:text-slate-200">Remember me</label>
          </div>
          <a class="font-medium no-underline ml-2 text-teal-600 text-right cursor-pointer hover:text-teal-500">Forgot password?</a>
        </div>

        <Button label="Sign In" icon="pi pi-user" class="w-full bg-teal-600 hover:bg-teal-500 text-white" />
      </div>
    </div>
  </div>
</template>
