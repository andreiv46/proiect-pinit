<script setup lang="ts">
import {Form, FormSubmitEvent} from '@primevue/forms'
import {zodResolver} from '@primevue/forms/resolvers/zod'
import {z} from "zod"
import {onMounted, ref} from "vue"
import {useToast} from "primevue/usetoast"
import {
  Button,
  FileUpload,
  FileUploadSelectEvent,
  FloatLabel,
  InputText,
  Message,
  MultiSelect,
  ToggleButton,
} from "primevue"
import * as L from "leaflet"
import {Marker} from "leaflet"

const toast = useToast()
const uploadedFiles = ref<File[]>([])
const selectedMarker = ref<Marker | null>(null)
const addPostMap = ref()
const currentLocation = ref<GeolocationPosition | null>(null)

export interface Coordinate {
  latitude: number,
  longitude: number
}

interface AddPostFormDTO {
  title: string,
  description: string,
  categories: [],
  isPublic: boolean,
}

interface CreatePostDTO {
  title: string,
  description: string,
  categories: string[],
  isPublic: boolean,
  location: Coordinate,
  files: File[],
}

const initialValues = ref<AddPostFormDTO>({
  title: '',
  description: '',
  categories: [],
  isPublic: false,
})

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

const resolver = ref(zodResolver(
    z.object({
      title: z.string()
          .min(1, {message: 'Title is required.'})
          .min(3, {message: 'Title must be at least 3 characters long.'}),
      description: z.string()
          .min(1, {message: 'Description is required.'}),
      categories: z
          .array(
              z.object({
                name: z.string().min(1, 'Category is required.')
              })
          )
          .min(1, 'Select at least one category'),
      isPublic: z.boolean(),
    })
))

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setCurrentPosition, () => initializeMap())
    console.log(currentLocation.value)
  } else {
    console.log("nu este suportata geolocatia")
    initializeMap()
  }
})

function setCurrentPosition(position: GeolocationPosition) {
  console.log(
      "Latitude: " + position.coords.latitude +
      "Longitude: " + position.coords.longitude
  )
  currentLocation.value = position
  initializeMap()
}

function initializeMap() {
  addPostMap.value = L.map('map').setView([currentLocation.value?.coords.latitude || 44.448, currentLocation.value?.coords.longitude || 26.098], 14)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(addPostMap.value)
  addPostMap.value.on('click', onMapClick)
}

function onMapClick(e: any) {
  console.log(selectedMarker.value?.getLatLng().lat)
  console.log(selectedMarker.value?.getLatLng().lng)

  if (selectedMarker.value !== null) {
    addPostMap.value.removeLayer(selectedMarker.value)
  }

  selectedMarker.value = L.marker(e.latlng)
      .addTo(addPostMap.value)
}

function onFileUpload(event: FileUploadSelectEvent) {
  uploadedFiles.value = event.files
  console.log('Uploaded files:', uploadedFiles.value)
}

function onFormSubmit(e: FormSubmitEvent) {
  if (e.valid) {
    toast.add({severity: 'success', summary: 'Form is submitted.', life: 3000})
    const formData: AddPostFormDTO = e.values as AddPostFormDTO
    console.log(formData.title)
    console.log(formData.description)
    console.log(formData.categories)
    console.log(formData.isPublic)
    console.log(uploadedFiles.value)
    return
  }
}
</script>

<template>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""/>
  <div class="flex items-center justify-center flex-col mb-12">
    <div class="flex flex-col justify-center items-center gap-1">
      <i class="pi pi-map-marker text-yellow-500" style="font-size: 6rem"></i>
      <h1 class="text-7xl font-bold mb-12 text-sky-800">Add a New Post</h1>
    </div>
    <Form v-slot="$form" :initialValues :resolver="resolver" @submit="onFormSubmit"
          validate-on-blur
          class="flex flex-col gap-4 w-full sm:w-72 lg:w-5/12">
      <div class="flex flex-col gap-1">
        <FloatLabel variant="in">
          <InputText name="title" type="text" fluid/>
          <label for="title">Title</label>
        </FloatLabel>
        <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">
          {{ $form.title.error.message }}
        </Message>
      </div>
      <div class="flex flex-col gap-1">
        <FloatLabel variant="in">
          <InputText name="description" type="text" fluid/>
          <label for="description">Description</label>
        </FloatLabel>
        <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">
          {{ $form.description.error.message }}
        </Message>
      </div>
      <div class="flex flex-col gap-1">
        <MultiSelect name="categories" :options="categoryOptions" optionLabel="name" filter display="chip"
                     placeholder="Categories"
                     size="large"
                     :maxSelectedLabels="3" class="w-full"/>
        <Message v-if="$form.categories?.invalid" severity="error" size="small" variant="simple">{{
            $form.categories.error?.message
          }}
        </Message>
      </div>
      <div class="flex flex-col gap-1">
        <!--        #a1a1aa-->
        <label for="fileUpload" class="font-bold mb-2 text-[#a1a1aa]">Visibility</label>
        <ToggleButton name="isPublic" class="w-full" onLabel="Public" offLabel="Private" onIcon="pi pi-lock-open"
                      offIcon="pi pi-lock"/>
      </div>
      <div class="flex flex-col gap-1">
        <label for="map" class="font-bold mb-2 text-[#a1a1aa]">Select Location on Map</label>
        <div class="flex flex-row h-[50vh] w-full justify-center">
          <div id="map" class="w-full z-0"></div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label for="fileUpload" class="font-bold mb-2 text-[#a1a1aa]">Upload Images</label>
        <div class="card">
          <FileUpload :multiple="true"
                      id="fileUpload"
                      :show-upload-button="false"
                      :show-cancel-button="false"
                      @select="onFileUpload"
                      class="w-full"
                      :choose-button-props="{ class: 'p-button-secondary w-full'}"
                      accept="image/*, video/*" :maxFileSize="500000">
            <template #empty>
              <div class="flex justify-center items-center">
                <i class="pi pi-cloud-upload" style="font-size: 6rem"></i>
              </div>
            </template>
          </FileUpload>
        </div>
      </div>
      <div class="flex flex-row gap-2 mt-5">
        <Button class="w-1/2" type="submit" severity="primary" label="Submit"/>
        <Button class="w-1/2" severity="danger" label="Cancel"/>
      </div>
    </Form>
  </div>
</template>
