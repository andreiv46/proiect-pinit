<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import {LatLngTuple, Marker} from 'leaflet';
import {onMounted, ref} from "vue";
import {Drawer} from "primevue";
import Button from "primevue/button";

interface Location {
  name: string,
  coordinates: LatLngTuple,
  description: string
}

const currentLocation = ref<GeolocationPosition | null>(null)
const initialMap = ref();
const locations: Location[] = [
  {
    name: "Big Ben",
    coordinates: [51.5007, -0.1246],
    description: "Big Ben is the nickname for the Great Bell of the clock at the north end of the Palace of Westminster."
  },
  {
    name: "London Eye",
    coordinates: [51.5033, -0.1196],
    description: "The London Eye is a giant Ferris wheel on the South Bank of the River Thames."
  },
  {
    name: "Tower of London",
    coordinates: [51.5081, -0.0759],
    description: "The Tower of London is a historic castle located on the north bank of the River Thames in central London."
  },
  {
    name: "British Museum",
    coordinates: [51.5194, -0.127],
    description: "The British Museum is a public institution dedicated to human history, art, and culture."
  }
];
const visibleRight = ref(false);
const markers = ref<Marker[]>([])
const selectedLocation = ref<Location | null>(null)

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getCurrentPosition, () => initializeMap())
    console.log(currentLocation.value)
  } else {
    console.log("nu este suportata geolocatia")
    initializeMap()
  }
})

function getCurrentPosition(position: GeolocationPosition) {
  console.log(
      "Latitude: " + position.coords.latitude +
      "Longitude: " + position.coords.longitude
  )
  currentLocation.value = position
  initializeMap()
}

function initializeMap() {
  initialMap.value = L.map('map').setView([currentLocation.value?.coords.latitude || 44.448, currentLocation.value?.coords.longitude || 26.098], 14)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(initialMap.value)

  locations.forEach(location => {
    const marker = L.marker(location.coordinates as LatLngTuple)
        .addTo(initialMap.value)
        .on('click', async () => {
          setTimeout(() => {
            console.log("da ma daa")
            selectedLocation.value = location
          }, 1000)
          visibleRight.value = true
        })
    markers.value.push(marker)
  });
}

function onDrawerHide() {
  selectedLocation.value = null;
}

</script>

<template>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""/>
  <div class="flex flex-row h-[80vh] justify-center">
    <div id="map" class=" w-4/5 z-0"></div>
    <Button label='Add' icon='pi pi-user' @click=''/>
  </div>
  <Drawer class="!w-full md:!w-80 lg:!w-[40rem]" v-model:visible="visibleRight" :header="selectedLocation?.name"
          position="right" @hide="onDrawerHide">
    <p>{{ selectedLocation?.description }}</p>
  </Drawer>
</template>