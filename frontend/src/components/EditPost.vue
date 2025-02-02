<script setup lang="ts">

import {useRoute} from "vue-router";
import {onMounted} from "vue";

const route = useRoute()

onMounted(() => {
  console.log(route.params.id)
})

</script>

<template>

</template>