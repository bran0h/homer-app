<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold mb-4">Waiting for confirmation...</h1>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
definePageMeta({
  layout: "unauthorized",
});

watch(
  user,
  () => {
    if (user.value) {
      // Redirect to protected page
      return navigateTo("/");
    }
  },
  { immediate: true }
);
</script>
