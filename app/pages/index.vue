<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <ClientOnly>
      <DashboardWeatherCard class="flex-1" />
      <template #fallback>
        <UCard class="flex-1">
          <USkeleton class="flex-1" />
        </UCard>
      </template>
    </ClientOnly>
    <DashboardCalendarCard class="flex-1" />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

onMounted(() => {
  if (route.query["error"] === "unauthorized") {
    toast.add({
      title: t("auth.unauthorizedError"),
      description: t("auth.unauthorizedErrorDescription"),
      color: "error",
      duration: 5000,
    });
  }
});
</script>
