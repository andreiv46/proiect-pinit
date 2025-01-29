<script setup lang="ts">

import {Post} from "../../api/post.api.ts";

const props = defineProps<{
  post: Post
}>()

</script>

<template>
  <div>
    <h3>{{ props.post.title }}</h3>
    <p>{{ props.post.description }}</p>
  </div>
</template>