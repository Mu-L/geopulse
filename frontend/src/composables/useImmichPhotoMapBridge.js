import { nextTick, ref } from 'vue'

export const useImmichPhotoMapBridge = ({
  mapRef,
  photosSectionRef,
  focusZoom = 16,
  shouldScrollToMap = true
} = {}) => {
  const photosForMap = ref([])

  const resetPhotosForMap = () => {
    photosForMap.value = []
  }

  const handlePhotosChange = (photos) => {
    photosForMap.value = Array.isArray(photos) ? photos : []
  }

  const handleMapPhotoClick = (payload) => {
    const photos = Array.isArray(payload?.photos) ? payload.photos : []
    if (photos.length === 0) {
      return
    }

    const initialIndex = Math.max(0, payload?.initialIndex || 0)
    photosSectionRef?.value?.openPhotoViewer?.(photos, initialIndex)
  }

  const handlePhotoShowOnMap = async (photo) => {
    if (!photo || typeof photo.latitude !== 'number' || typeof photo.longitude !== 'number') {
      return
    }

    const mapComponent = mapRef?.value
    if (!mapComponent) {
      return
    }

    if (shouldScrollToMap && mapComponent.$el?.scrollIntoView) {
      mapComponent.$el.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
      await nextTick()
    }

    if (typeof mapComponent.focusOnPhoto === 'function') {
      mapComponent.focusOnPhoto(photo, focusZoom)
      return
    }

    mapComponent.focusOnCoordinates?.(photo.latitude, photo.longitude, focusZoom)
  }

  return {
    photosForMap,
    resetPhotosForMap,
    handlePhotosChange,
    handleMapPhotoClick,
    handlePhotoShowOnMap
  }
}
