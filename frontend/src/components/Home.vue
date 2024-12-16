<script setup lang="ts">
import Button from "primevue/button"
import {auth} from "../firebase/firebase.config.ts";
import {signOut} from "firebase/auth"
import router from "../router/router.ts";
import {authService} from "../firebase/firebase.auth.ts";

async function logout() {
  await signOut(auth)
      .then(() => {console.log("signed out")}, (err) => {
        console.error("sign out failed", err)
      })
  await router.push("/login")
}

async function displayCurrentUser(){
  console.log(authService.getCurrentUser())
}

</script>

<template>
  <Button label="Log out" icon="pi pi-user" @click="logout"/>
  <Button label="Current user" icon="pi pi-user" @click="displayCurrentUser"/>
</template>