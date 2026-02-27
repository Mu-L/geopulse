<template>
  <BaseCard :title="title" class="immich-photos-map-card">
    <div class="immich-photos-map-container">
      <MapContainer
        ref="mapContainerRef"
        :map-id="mapId"
        :center="mapCenter"
        :zoom="mapZoom"
        :map-options="mapOptions"
        :show-controls="false"
        @map-ready="handleMapReady"
      />
    </div>
  </BaseCard>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import BaseCard from '@/components/ui/base/BaseCard.vue'
import { MapContainer } from '@/components/maps'
import { usePhotoMapMarkers } from '@/composables/usePhotoMapMarkers'
import '@/styles/photo-map-markers.css'

const props = defineProps({
  title: {
    type: String,
    default: 'Photo Map'
  },
  photos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['photo-click'])

const mapContainerRef = ref(null)
const map = ref(null)
const hasAutoCentered = ref(false)

const mapId = `immich-photos-map-${Math.random().toString(36).slice(2, 11)}`
const mapOptions = {
  tap: false
}
const {
  clearPhotoMarkers,
  clearFocusMarker,
  renderPhotoMarkers: renderMapPhotoMarkers,
  focusOnCoordinates: focusOnMapCoordinates,
  focusOnPhoto: focusOnMapPhoto
} = usePhotoMapMarkers({ emit })

const photosWithCoordinates = computed(() => props.photos.filter((photo) => {
  return typeof photo?.latitude === 'number' && typeof photo?.longitude === 'number'
}))

const mapCenter = computed(() => {
  const photos = photosWithCoordinates.value
  if (photos.length === 0) {
    return [20, 0]
  }

  const total = photos.reduce((acc, photo) => {
    acc.lat += photo.latitude
    acc.lng += photo.longitude
    return acc
  }, { lat: 0, lng: 0 })

  return [total.lat / photos.length, total.lng / photos.length]
})

const mapZoom = computed(() => {
  return photosWithCoordinates.value.length > 0 ? 5 : 2
})

const handleMapBackgroundClick = () => {
  clearFocusMarker()
}

const handleMapReady = (mapInstance) => {
  map.value = mapInstance
  map.value.on('click', handleMapBackgroundClick)
  nextTick(() => {
    renderPhotoMarkers()
  })
}

const renderPhotoMarkers = () => {
  if (!map.value) {
    return
  }

  const groups = renderMapPhotoMarkers(map.value, props.photos)
  if (groups.length === 0) {
    hasAutoCentered.value = false
    return
  }

  const bounds = []
  groups.forEach((group) => {
    bounds.push([group.latitude, group.longitude])
  })

  if (!hasAutoCentered.value) {
    if (bounds.length === 1) {
      map.value.setView(bounds[0], 12)
    } else {
      map.value.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
    }
    hasAutoCentered.value = true
  }
}

const focusOnCoordinates = (latitude, longitude, zoom = 16) => {
  focusOnMapCoordinates(map.value, latitude, longitude, zoom)
}

const focusOnPhoto = (photo, zoom = 16) => {
  focusOnMapPhoto(map.value, photo, zoom)
}

watch(
  () => props.photos,
  () => {
    nextTick(() => {
      renderPhotoMarkers()
    })
  },
  { deep: false }
)

onBeforeUnmount(() => {
  clearPhotoMarkers()
  if (map.value) {
    map.value.off('click', handleMapBackgroundClick)
  }
  clearFocusMarker()
})

defineExpose({
  focusOnCoordinates,
  focusOnPhoto
})
</script>

<style scoped>
.immich-photos-map-card {
  margin-bottom: var(--gp-spacing-xl);
}

.immich-photos-map-container {
  width: 100%;
  height: 400px;
  border-radius: var(--gp-radius-medium);
  overflow: hidden;
}

@media (max-width: 768px) {
  .immich-photos-map-container {
    height: 300px;
  }
}
</style>
