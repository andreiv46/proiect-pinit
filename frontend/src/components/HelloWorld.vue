<script setup lang="ts">
import { ref } from 'vue'
import {authService} from "../firebase/firebase.auth.ts";
import Login from "./Login.vue";

defineProps<{ msg: string }>()

const emailInput = ref<string>("")
const passwordInput = ref<string>("")

function register(e: Event){
  e.preventDefault()
  console.log(emailInput.value, passwordInput.value)
  authService.register({email: emailInput.value, password: passwordInput.value, name: "Ion"})
}

function showCurrentUser(){
  console.log(authService.getCurrentUser())
  console.log(authService.getCurrentUser()?.emailVerified)
}

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>

    <input type="text" placeholder="Introdu emailul" v-model="emailInput" >
    <br>
    <input type="password" placeholder="Introdu parola" v-model="passwordInput">
    <br>
    <button @click="register">Register</button>
    <br>
    <button @click="showCurrentUser">Current user</button>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
  <Login />
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
