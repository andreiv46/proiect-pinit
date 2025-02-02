<script setup lang="ts">
import {useRoute} from "vue-router";
import {nextTick, onMounted, ref} from "vue";
import {deleteFileFromPost, deletePost, getUserPostById, Post, updatePost, uploadPostFiles} from "../api/post.api.ts";
import {useToast} from "primevue/usetoast";
import {
  Button,
  Carousel,
  ConfirmDialog,
  FileUpload,
  FileUploadSelectEvent,
  FloatLabel,
  InputText,
  Message,
  MultiSelect,
  ToggleButton,
  useConfirm
} from "primevue"
import * as L from "leaflet"
import {Marker} from "leaflet"
import {Timestamp} from "firebase/firestore";
import router from "../router/router.ts";

interface PostFile {
  url: string;
  type: string;
}

defineProps(['id'])
const confirm = useConfirm()
const route = useRoute()
const toast = useToast()
const post = ref<Post | null>(null)
const uploadedFiles = ref<File[]>([])
const selectedMarker = ref<Marker | null>(null)
const editPostMap = ref()
const title = ref<string>('')
const description = ref<string>('')
const categories = ref<Array<{ name: string }>>([])
const isPublic = ref<boolean>(false)
const postFiles = ref<PostFile[]>([])

const categoryOptions = [
  {name: "Sports"},
  {name: "Entertainment"},
  {name: "News"},
  {name: "Technology"},
  {name: "Lifestyle"},
  {name: "Events"},
  {name: "Nature"},
  {name: "Education"},
  {name: "Community"},
  {name: "Art & Culture"},
  {name: "Business"},
  {name: "Science"},
  {name: "Social Issues"},
  {name: "Technology & Innovation"},
  {name: "Local Communities"},
]

onMounted(async () => {
  console.log('da ma daa')
  try {
    const postId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    console.log(postId)
    const postResponse = await getUserPostById(postId as string)
    post.value = postResponse.data
    console.log(post.value)

    await nextTick(() => {
      if (post.value) {
        initializeMap(post.value.location.latitude, post.value.location.longitude)
        title.value = post.value.title
        description.value = post.value.description
        categories.value = post.value.categories
            .map((category: string) => {
              return categoryOptions.find(option => option.name === category) || null
            })
            .filter((category): category is { name: string } => category !== null)
        isPublic.value = post.value.visibility === "public"
        postFiles.value = post.value.files
      }

      toast.add({severity: 'success', summary: 'Post fetched successfully', life: 3000})
    })
  } catch (error) {
    toast.add({severity: 'error', summary: 'Failed to fetch post', life: 3000})
    console.error(error)
  }
})

function initializeMap(lat: number, lng: number) {
  editPostMap.value = L.map('map').setView([lat, lng], 14)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(editPostMap.value)

  selectedMarker.value = L.marker([lat, lng]).addTo(editPostMap.value)
  editPostMap.value.on('click', onMapClick)
}

function onMapClick(e: any) {
  if (selectedMarker.value !== null) {
    editPostMap.value.removeLayer(selectedMarker.value)
  }

  selectedMarker.value = L.marker(e.latlng)
      .addTo(editPostMap.value)
}

function onFileUpload(event: FileUploadSelectEvent) {
  uploadedFiles.value = event.files
}

async function onCancel() {
  await router.push('/userposts')
}

function dateFormat(date: Timestamp) {
  const options = {day: '2-digit', month: '2-digit', year: 'numeric'}
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(date._seconds * 1000))
}

function onDeleteFileConfirmation(fileUrl: string) {
  if (!post.value?.files.length) return

  if (post.value.files.length === 1) {
    confirm.require({
      message: 'The post will be permanently deleted',
      header: `Delete post`,
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
      accept: async () => {
        try {
          await deletePost(post.value?.id!)
          toast.add({
            severity: 'info',
            summary: 'Confirmed',
            detail: `Post ${post.value?.title} deleted`,
            life: 3000
          })
          confirm.close()
          setInterval(async () => {
            await router.push("/userposts")
          }, 1000)
        } catch (error) {
          toast.add({severity: 'error', summary: 'Failed to delete post', life: 3000})
          console.error(error)
        }
      },
      reject: () => {
        confirm.close()
      }
    })
  } else {
    confirm.require({
      message: 'The file will be permanently deleted',
      header: `Delete file`,
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
      accept: async () => {
        try {
          await deleteFileFromPost(post.value?.id!, fileUrl)
          toast.add({severity: 'success', summary: 'File deleted successfully', life: 3000})
          postFiles.value = postFiles.value.filter((file: { url: string }) => file.url !== fileUrl)
          console.log(fileUrl)
          confirm.close()
        } catch (error) {
          toast.add({severity: 'error', summary: 'Failed to delete file', life: 3000})
          console.error(error)
        }
      },
      reject: () => {
        confirm.close()
      }
    })
  }
}

async function onSaveChanges() {
  if (selectedMarker.value === null) {
    toast.add({severity: 'error', summary: 'Please select a location on the map.', life: 3000})
    return
  }

  if (title.value.length < 3) {
    toast.add({severity: 'error', summary: 'Title must be at least 3 characters long.', life: 3000})
    return
  }

  if (description.value.length < 1) {
    toast.add({severity: 'error', summary: 'Description is required.', life: 3000})
    return
  }

  if (categories.value.length === 0) {
    toast.add({severity: 'error', summary: 'Please select at least one category.', life: 3000})
    return
  }

  if (uploadedFiles.value.length + postFiles.value.length > 5) {
    toast.add({severity: 'error', summary: 'You can upload at most 5 files.', life: 3000})
    return
  }

  const updatePostDTO = {
    title: title.value,
    description: description.value,
    categories: categories.value.map(category => category.name),
    isPublic: isPublic.value,
    location: {
      latitude: selectedMarker.value?.getLatLng().lat!,
      longitude: selectedMarker.value?.getLatLng().lng!
    }
  }

  try {
    console.log(updatePostDTO)
    await updatePost(post.value?.id!, updatePostDTO)
    toast.add({severity: 'success', summary: 'Post updated successfully', life: 3000})

    if (uploadedFiles.value.length > 0) {
      const data = new FormData()
      uploadedFiles.value.forEach((file) => {
        data.append('files', file)
      })

      const uploadResponse = await uploadPostFiles(data, post.value?.id!)
      toast.add({severity: 'success', summary: 'Files uploaded successfully', life: 3000})
      console.log(uploadResponse.data)
    }

    await router.push("/userposts")

  } catch (error) {
    toast.add({severity: 'error', summary: 'Failed to update post', life: 3000})
    console.error(error)
  }
}

</script>

<template>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""/>
  <div class="flex items-center justify-center flex-col mb-12 mt-4">
    <div class="flex flex-col justify-center items-center gap-4 mb-12">
      <i class="pi pi-map-marker text-yellow-500" style="font-size: 6rem"></i>
      <h1 class="text-7xl font-bold text-sky-800">Edit {{ post?.title }}</h1>
      <!--      <p class="text-sm font-bold">Posted on {{ dateFormat(post?.createdAt!) }}</p>-->
      <p class="text-sm font-bold">{{ post?.likes! - post?.dislikes! }} upvotes</p>
    </div>
    <div class="flex flex-col gap-4 w-full lg:w-5/12 sm:w-72">
      <div class="flex flex-col gap-1">
        <Carousel v-if="postFiles.length" :value="postFiles" :num-visible="1" :num-scroll="1">
          <template #item="slotProps">
            <div class="flex flex-col justify-center items-center align-center h-full">
              <img alt="dabber" v-if="slotProps.data.type.startsWith('image')"
                   :src="slotProps.data.url"
                   class="max-h-96 object-contain rounded-lg"/>
              <video v-else-if="slotProps.data.type.startsWith('video')" controls
                     class="max-h-96 object-contain rounded-lg">
                <source :src="slotProps.data.url" :type="slotProps.data.type"/>
                Your browser does not support the video tag.
              </video>
              <ConfirmDialog></ConfirmDialog>
              <Button severity="danger" icon="pi pi-trash" class="mt-2" outlined
                      @click="onDeleteFileConfirmation(slotProps.data.url)"></Button>
            </div>
          </template>
        </Carousel>
      </div>
      <div class="flex flex-col gap-1">
        <FloatLabel variant="in">
          <InputText v-model="title" name="title" type="text" fluid/>
          <label for="title">Title</label>
        </FloatLabel>
        <Message v-if="title.length < 3" severity="error" size="small" variant="simple">
          Title must be at least 3 characters long.
        </Message>
      </div>
      <div class="flex flex-col gap-1">
        <FloatLabel variant="in">
          <InputText v-model="description" name="description" type="text" fluid/>
          <label for="description">Description</label>
        </FloatLabel>
        <Message v-if="description.length < 1" severity="error" size="small" variant="simple">
          Description is required.
        </Message>
      </div>
      <div class="flex flex-col gap-1">
        <MultiSelect v-model="categories" name="categories" :options="categoryOptions" optionLabel="name" filter
                     display="chip"
                     placeholder="Categories"
                     size="large"
                     :maxSelectedLabels="3" class="w-full"/>
        <Message v-if="categories.length === 0" severity="error" size="small" variant="simple">
          Please select at least one category.
        </Message>
      </div>
      <div class="flex flex-col gap-1">
        <!--        #a1a1aa-->
        <label for="fileUpload" class="font-bold mb-2 text-[#a1a1aa]">Visibility</label>
        <ToggleButton v-model="isPublic" name="isPublic" class="w-full" onLabel="Public" offLabel="Private"
                      onIcon="pi pi-lock-open"
                      offIcon="pi pi-lock"/>
      </div>
      <div class="flex flex-col gap-1">
        <label for="map" class="font-bold mb-2 text-[#a1a1aa]">Select Location on Map</label>
        <div class="flex flex-row h-[50vh] w-full justify-center">
          <div id="map" class="w-full z-0"></div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label for="fileUpload" class="font-bold mb-2 text-[#a1a1aa]">Add more images or videos</label>
        <div class="card">
          <FileUpload :multiple="true"
                      id="fileUpload"
                      :show-upload-button="false"
                      :show-cancel-button="false"
                      @select="onFileUpload"
                      class="w-full"
                      :choose-button-props="{ class: 'p-button-secondary w-full'}"
                      accept="image/*, video/*" :maxFileSize="2000000">
            <template #empty>
              <div class="flex justify-center items-center">
                <i class="pi pi-cloud-upload" style="font-size: 6rem"></i>
              </div>
            </template>
          </FileUpload>
        </div>
      </div>
      <div class="flex flex-row gap-2 mt-5">
        <Button class="w-1/2" severity="primary" label="Save changes" @click="onSaveChanges"/>
        <Button class="w-1/2" severity="danger" label="Cancel" @click="onCancel"/>
      </div>
    </div>
  </div>
</template>
