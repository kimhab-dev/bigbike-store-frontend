<template>
  <img
    :src="displayUrl"
    :alt="alt || 'Product image'"
    :class="imgClass"
    @error="onImgError"
  />
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '@/api/axios';

const props = defineProps({
  src: {
    type: [String, Object],
    default: null,
  },
  alt: {
    type: String,
    default: 'Product motorcycle',
  },
  imgClass: {
    type: String,
    default: 'bike-thumb',
  },
  fallback: {
    type: String,
    default: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300&auto=format&fit=crop&q=80',
  },
});

const displayUrl = ref(props.fallback);
const hasFailed = ref(false);

// Global in-memory Blob URL cache to prevent re-fetching the same image
const blobCache = window._productImageBlobCache || (window._productImageBlobCache = new Map());

const resolveImage = async () => {
  hasFailed.value = false;
  let raw = props.src;

  if (!raw) {
    displayUrl.value = props.fallback;
    return;
  }

  // If passed an object like { image: '...' }
  if (typeof raw === 'object') {
    raw = raw.image || raw.imageUrl || raw.photo || raw.avatar || raw.path || raw.filepath || raw.filename;
    if (!raw && Array.isArray(props.src?.images) && props.src.images.length > 0) {
      raw = props.src.images[0];
    }
  }

  if (!raw || typeof raw !== 'string') {
    displayUrl.value = props.fallback;
    return;
  }

  // If data URI or external Unsplash image
  if (raw.startsWith('data:') || raw.startsWith('blob:') || raw.includes('unsplash.com')) {
    displayUrl.value = raw;
    return;
  }

  // Format path relative to backend
  let cleanPath = raw.replace(/^\//, '');
  
  // Strip http://localhost:3000 if already present in string
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  if (cleanPath.startsWith(apiBase)) {
    cleanPath = cleanPath.replace(apiBase, '').replace(/^\//, '');
  }

  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/products/${cleanPath}`;
  }

  // Check cache
  if (blobCache.has(cleanPath)) {
    displayUrl.value = blobCache.get(cleanPath);
    return;
  }

  // Fetch as Blob via Axios to bypass NestJS Helmet NotSameOrigin policy
  try {
    const response = await api.get(`/${cleanPath}`, {
      responseType: 'blob',
    });
    const blobUrl = URL.createObjectURL(response.data);
    blobCache.set(cleanPath, blobUrl);
    displayUrl.value = blobUrl;
  } catch (err) {
    // If blob fetch fails, fallback to direct URL
    displayUrl.value = `${apiBase}/${cleanPath}`;
  }
};

const onImgError = () => {
  if (!hasFailed.value) {
    hasFailed.value = true;
    displayUrl.value = props.fallback;
  }
};

watch(
  () => props.src,
  () => {
    resolveImage();
  },
  { immediate: true }
);
</script>

<style scoped>
img {
  display: block;
  object-fit: cover;
}
</style>
