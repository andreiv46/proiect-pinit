<script setup lang="ts">

import {nextTick, onMounted, ref, toRaw} from "vue";
import {getUserPosts, Post} from "../api/post.api.ts";
import {useToast} from "primevue/usetoast";
import {
  Button,
  Carousel,
  Chip,
  Column,
  ConfirmDialog,
  DataTable,
  IconField,
  InputIcon,
  InputText,
  Tag,
  useConfirm
} from "primevue"
import {FilterMatchMode} from '@primevue/core/api'
import {Timestamp} from "firebase/firestore";
import * as L from "leaflet";
import {LatLngTuple} from "leaflet";

const posts = ref<Post[]>([])
const toast = useToast()
const postMap = ref()
const selectedPost = ref()
const confirm = useConfirm()

const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS},
});

onMounted(async () => {
  try {
    const postsResponse = await getUserPosts()
    posts.value = postsResponse.data
    toast.add({severity: 'success', summary: 'Post fetched successfully', life: 3000})
    console.log(posts.value)
  } catch (error) {
    toast.add({severity: 'error', summary: 'Failed to fetch posts', life: 3000})
    console.error(error)
  }
})

function dateFormat(date: Timestamp) {
  const options = {day: '2-digit', month: '2-digit', year: 'numeric'}
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(date._seconds * 1000))
}

function getSeverity(post: Post) {
  switch (post.visibility) {
    case "private":
      return "info"
    case "public":
      return "success"
    default:
      return undefined
  }
}

function onSort(event: any) {
  console.log('here')
  if (event.sortField === "upvotes") {
    posts.value.sort((a, b) => {
      const upvotesA = a.likes - a.dislikes
      const upvotesB = b.likes - b.dislikes
      return event.sortOrder * (upvotesA - upvotesB)
    })
  }
  if (event.sortField === "createdAt") {
    console.log('here 2')
    posts.value.sort((a, b) => {
      const dateA = a.createdAt._seconds * 1000
      const dateB = b.createdAt._seconds * 1000
      return event.sortOrder * (dateA - dateB)
    });
  }
}

function onRowSelect(event: any) {
  console.log("Row Selected:", event.data.id)
  selectedPost.value = event.data
}

function onRowUnselect(event: any) {
  console.log("Row Unselected:", event.data.id)
  selectedPost.value = null
}

const expandedRows = ref<Post[]>([])

function onRowExpand(event: any) {
  console.log("Row Expanded:", event.data.id)
  const post = posts.value.find(post => post.id === event.data.id)
  if (!post) return
  nextTick(() => {
    setTimeout(() => {
      initializeMap(post)
    }, 200)
  })
}

function onRowCollapse(event: any) {
  console.log("Row Collapsed:", event.data.id)
}

function initializeMap(post: Post) {
  console.log('initializing map', post.id)
  const mapId = `map-${post.id}`
  const mapContainer = document.getElementById(mapId)

  if (!mapContainer) {
    console.error(`Map container not found for post: ${post.id}`)
    return;
  }

  if (postMap.value?.[post.id]) {
    postMap.value[post.id].remove()
  }

  const newMap = postMap.value = L.map(mapId).setView([post.location.latitude || 44.448, post.location.longitude || 26.098], 14)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(postMap.value)

  L.marker([post.location.latitude, post.location.longitude] as LatLngTuple)
      .addTo(toRaw(postMap.value))
      .bindTooltip(post.title)

  postMap.value = {...postMap.value, [post.id]: newMap}
}

function onDeleteConfirmation() {
  confirm.require({
    message: 'The post will be permanently deleted',
    header: `Delete ${selectedPost.value.title}`,
    icon: 'pi pi-info-circle',
    rejectLabel: 'Cancel',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: () => {
      toast.add({severity: 'info', summary: 'Confirmed', detail: `Post ${selectedPost.value.title} deleted`, life: 3000});
    },
    // reject: () => {
    //   toast.add({severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000});
    // }
  });
}

</script>

<template>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""/>
  <div class="flex justify-center">
    <div class="card mt-4 w-11/12">
      <DataTable :value="posts" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
                 dataKey="id"
                 tableStyle="min-width: 50rem" @sort="onSort"
                 :filters="filters"
                 removable-sort
                 show-gridlines
                 :selection="selectedPost" selection-mode="single" @rowSelect="onRowSelect" @rowUnselect="onRowUnselect"
                 :expandedRows="expandedRows"
                 @rowExpand="onRowExpand"
                 @rowCollapse="onRowCollapse"
                 :globalFilterFields="['title', 'description']">
        <template #header>
          <div class="flex justify-between">
            <div>
              <ConfirmDialog></ConfirmDialog>
              <Button label="New" icon="pi pi-plus" class="mr-2" outlined/>
              <Button label="Delete" icon="pi pi-trash" severity="danger" outlined :disabled="!selectedPost"
                      @click="onDeleteConfirmation"/>
            </div>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search"/>
            </IconField>
          </div>
        </template>
        <template #empty> No posts found.</template>
        <template #loading> Loading posts data. Please wait.</template>
        <Column expander style="width: 5rem"/>
        <Column field="createdAt" header="Date" sortable>
          <template #body="slotProps">
            {{ dateFormat(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column field="title" header="Title" sortable></Column>
        <Column field="description" header="Description"></Column>
        <Column header="Categories">
          <template #body="slotProps">
            <div class="grid grid-cols-2 gap-2">
              <Chip class="select-none flex justify-center align-center" v-for="category in slotProps.data.categories"
                    :label="category"/>
            </div>
          </template>
        </Column>
        <Column field="upvotes" header="Upvotes" sortable>
          <template #body="slotProps">
            {{ slotProps.data.likes - slotProps.data.dislikes }}
          </template>
        </Column>
        <Column field="visibility" header="Visibility" sortable>
          <template #body="slotProps">
            <Tag class="min-w-20 select-none" :value="slotProps.data.visibility"
                 :severity="getSeverity(slotProps.data)"/>
          </template>
        </Column>
        <template #expansion="slotProps">
          <div class="grid grid-cols-2 gap-2">
            <Carousel v-if="slotProps.data.files?.length" :value="slotProps.data.files" :num-visible="1"
                      :num-scroll="1">
              <template #item="slotProps">
                <div class="flex justify-center">
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
            <div :id="'map-' + slotProps.data.id" class="w-full"></div>
          </div>
        </template>
        <template #footer> In total there are {{ posts ? posts.length : 0 }} posts.</template>
      </DataTable>
    </div>
  </div>
</template>