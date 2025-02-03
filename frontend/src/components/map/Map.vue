<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import {LatLngTuple, Marker} from 'leaflet';
import {onMounted, ref, toRaw} from "vue";
import {Avatar, Button, Carousel, Chip, Drawer, Message, MultiSelect, SelectButton} from "primevue"
import Select from 'primevue/select'
import {dislikePost, getPublicPosts, likePost, Post, removeVote} from "../../api/post.api.ts"
import {useToast} from "primevue/usetoast"
import {Timestamp} from "firebase/firestore";
import {useCategoryStore} from "../../store/category.store.ts";
import {useAuthStore} from "../../store/auth.store.ts";

const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const periodFilterOptions = [
  {name: "Today"},
  {name: "This week"},
  {name: "This month"},
  {name: "This year"},
  {name: "All time"},
]

const toast = useToast()
const currentLocation = ref<GeolocationPosition | null>(null)
const initialMap = ref();
const posts = ref<Post[]>([])
const visibleRight = ref(false)
const visibleLeft = ref(false)
const markers = ref<Marker[]>([])
const selectedPost = ref<Post | null>(null)
const selectedCategoriesFilter = ref<[] | null>(null)
const selectedPeriodFilter = ref<{ name: string } | null>({name: "All time"})
const selectedLikeFilter = ref(null)
const likeFilterOptions = ref(["liked", "disliked"])

onMounted(async () => {
  try {
    if (!categoryStore.categories.length) {
      await categoryStore.fetchCategories()
    }
    const postsResponse = await getPublicPosts()
    posts.value = postsResponse.data
    toast.add({severity: 'success', summary: 'Post fetched successfully', life: 3000})
    console.log(posts.value)
  } catch (error) {
    toast.add({severity: 'error', summary: 'Failed to fetch posts', life: 3000})
    console.error(error)
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setCurrentPosition, () => initializeMap(posts.value))
    console.log(currentLocation.value)
  } else {
    console.log("nu este suportata geolocatia")
    initializeMap(posts.value)
  }

  posts.value.forEach(post => {
    console.log('HERERER')
    console.log(post, post.userVotes[authStore.getCurrentUser?.uid])
  })
})

function setCurrentPosition(position: GeolocationPosition) {
  console.log(
      "Latitude: " + position.coords.latitude +
      "Longitude: " + position.coords.longitude
  )
  currentLocation.value = position
  initializeMap(posts.value)
}

function initializeMap(posts: Post[]) {
  initialMap.value = L.map('map').setView([currentLocation.value?.coords.latitude || 44.448, currentLocation.value?.coords.longitude || 26.098], 14)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(initialMap.value)

  markers.value = []
  drawMarkers(posts)
}

function drawMarkers(posts: Post[]) {
  posts.forEach(post => {
    const marker = L.marker([post.location.latitude, post.location.longitude] as LatLngTuple)
        .addTo(toRaw(initialMap.value))
        .on('click', () => {
          selectedPost.value = post
          visibleRight.value = true
        })
        .bindTooltip(post.title)
    markers.value.push(marker)
  })
}

function clearMarkers() {
  if (!initialMap.value) return
  markers.value.forEach(marker => {
    if (initialMap.value.hasLayer(marker)) {
      initialMap.value.removeLayer(marker);
    }
  });
  markers.value = []
}

function applyFilters() {
  let filteredPosts = [...posts.value]

  if (selectedCategoriesFilter.value && selectedCategoriesFilter.value.length > 0) {
    const selectedCategories = selectedCategoriesFilter.value.map(c => c.name);
    filteredPosts = filteredPosts.filter(post =>
        selectedCategories.every(category => post.categories.includes(category))
    );
  }

  if (selectedPeriodFilter.value) {
    const now = new Date();
    let cutoffDate = new Date();

    console.log('here', selectedPeriodFilter.value)

    switch (selectedPeriodFilter.value.name) {
      case "Today":
        cutoffDate.setHours(0, 0, 0, 0)
        break;
      case "This week":
        cutoffDate.setDate(now.getDate() - 7)
        break;
      case "This month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break;
      case "This year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break;
      case "All time":
        cutoffDate = new Date(0)
        break;
    }

    filteredPosts = filteredPosts.filter(post => new Date(post.createdAt._seconds * 1000) >= cutoffDate)

    if (selectedLikeFilter.value === "liked") {
      filteredPosts = filteredPosts.filter(post => post.userVotes[authStore.getCurrentUser?.uid] === "like")
    } else if (selectedLikeFilter.value === "disliked") {
      filteredPosts = filteredPosts.filter(post => post.userVotes[authStore.getCurrentUser?.uid] === "dislike")
    }
  }

  clearMarkers()
  drawMarkers(filteredPosts)
}

function clearFilters() {
  if (selectedCategoriesFilter.value === null && selectedPeriodFilter.value === null) return
  selectedCategoriesFilter.value = null
  selectedLikeFilter.value = null
  selectedPeriodFilter.value = {name: "All time"}
  clearMarkers()
  drawMarkers(posts.value)
}

function onDrawerHide() {
  selectedPost.value = null;
}

function openFilter() {
  visibleLeft.value = true;
}

function dateFormat(date: Timestamp) {
  const options = {day: '2-digit', month: '2-digit', year: 'numeric'}
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(date._seconds * 1000))
}

async function handleLike(post: Post) {
  if (post.userVotes[authStore.getCurrentUser?.uid!] === "like") {
    await removeVote(post.id);
    post.userVotes[authStore.getCurrentUser?.uid!] = undefined;
    post.likes--;
  } else {
    await likePost(post.id);
    if (post.userVotes[authStore.getCurrentUser?.uid!] === "dislike") {
      post.dislikes--;
    }
    post.userVotes[authStore.getCurrentUser?.uid!] = "like";
    post.likes++;
  }
}

async function handleDislike(post: Post) {
  if (post.userVotes[authStore.getCurrentUser?.uid!] === "dislike") {
    await removeVote(post.id);
    post.userVotes[authStore.getCurrentUser?.uid!] = undefined;
    post.dislikes--;
  } else {
    await dislikePost(post.id);
    if (post.userVotes[authStore.getCurrentUser?.uid!] === "like") {
      post.likes--;
    }
    post.userVotes[authStore.getCurrentUser?.uid!] = "dislike";
    post.dislikes++;
  }
}
</script>

<template>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""/>
  <div class="relative flex flex-row h-[90vh]">
    <Drawer class="!w-full md:!w-80 lg:!w-[40rem]" v-model:visible="visibleLeft"
            position="left" @hide="onDrawerHide">
      <template #header>
        <div class="flex items-center gap-2">
          <span class="font-bold text-6xl">Filter posts</span>
        </div>
      </template>
      <div class="flex flex-col gap-5">
        <MultiSelect name="categories" :options="categoryStore.categories" optionLabel="name" filter display="chip"
                     v-model="selectedCategoriesFilter"
                     placeholder="Categories"
                     size="large"
                     :maxSelectedLabels="3" class="w-full"/>
        <div class="card flex justify-center">
          <Select v-model="selectedPeriodFilter" :options="periodFilterOptions" optionLabel="name"
                  placeholder="Select a period"
                  class="w-full"/>
        </div>
        <div class="card flex justify-center">
          <SelectButton v-model="selectedLikeFilter" :options="likeFilterOptions"/>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center gap-2">
          <Button label="Apply filters" @click="applyFilters" icon="pi pi-filter" class="flex-auto" outlined></Button>
          <Button label="Clear filters" @click="clearFilters" icon="pi pi-filter-slash" class="flex-auto"
                  severity="danger" text></Button>
        </div>
      </template>
    </Drawer>
    <Button
        severity="secondary"
        icon="pi pi-search"
        @click="openFilter"
        class="absolute top left lg:top-auto lg:left-auto lg:right lg:bottom lg:relative lg:w-1/12"
    />
    <div id="map" class="w-full z-0"></div>
  </div>
  <Drawer class="!w-full md:!w-80 lg:!w-[40rem]" v-model:visible="visibleRight"
          position="right" @hide="onDrawerHide">
    <template #header>
      <div class="flex flex-col  ">
        <div class="flex items-center gap-2">
          <Avatar image="https://primefaces.org/cdn/primevue/images/organization/walter.jpg"/>
          <span class="font-bold">{{ selectedPost?.user }}</span>
        </div>
        <span>Posted on {{ dateFormat(selectedPost?.createdAt) }}</span>
      </div>
    </template>
    <div class="flex flex-col gap-5">
      <p class="font-bold text-6xl break-words">{{ selectedPost?.title }}</p>
      <div class="flex flex-row gap-2">
        <Chip class="select-none" v-for="category in selectedPost?.categories" :label="category"/>
      </div>
      <div v-if="selectedPost?.userID !== authStore.getCurrentUser?.uid" class="grid grid-cols-1 gap-2 mb-6 w-full">
        <div class="flex flex-row gap-2">
          <Button
              class="w-full"
              icon="pi pi-thumbs-up"
              :label="selectedPost?.likes.toString()"
              outlined
              @click="handleLike(selectedPost!)"
          />
          <Button
              class="w-full"
              :label="selectedPost?.dislikes.toString()"
              icon="pi pi-thumbs-down"
              outlined
              @click="handleDislike(selectedPost!)"
          />
        </div>
        <Message v-if="selectedPost?.userVotes[authStore.getCurrentUser?.uid] === 'like'"
                 severity="info">
          You liked this post
        </Message>
        <Message v-if="selectedPost?.userVotes[authStore.getCurrentUser?.uid] === 'dislike'"
                 severity="error">
          You disliked this post
        </Message>
      </div>
    </div>
    <Carousel v-if="selectedPost?.files?.length" :value="selectedPost.files" :num-visible="1" :num-scroll="1">
      <template #item="slotProps">
        <div class="flex justify-center align-center h-full">
          <img alt="dabber" v-if="slotProps.data.type.startsWith('image')"
               :src="slotProps.data.url"
               class="max-h-96 object-contain rounded-lg"/>
          <video v-else-if="slotProps.data.type.startsWith('video')" controls
                 class="max-h-96 object-contain rounded-lg">
            <source :src="slotProps.data.url" :type="slotProps.data.type"/>
            Your browser does not support the video tag.
          </video>
        </div>
      </template>
    </Carousel>
    <p>{{ selectedPost?.description }}</p>
  </Drawer>
</template>