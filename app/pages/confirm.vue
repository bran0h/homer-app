<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold mb-4">Waiting for confirmation...</h1>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "unauthorized",
});

const { rolesError, roles, user, rolesStatus } = useUser();
const { t } = useI18n();
const toast = useToast();

watch([roles, rolesError, user] as const, async ([roles, error, user]) => {
  if (!user || rolesStatus.value === "pending") {
    return;
  }
  if (error) {
    console.error("Error fetching user roles:", error);
    toast.add({
      title: t("auth.unauthorizedError"),
      color: "error",
      duration: 5000,
    });
    navigateTo("/logout");
    return;
  }
  if (!roles || roles.length === 0) {
    console.error("User has no roles assigned.");
    toast.add({
      title: t("auth.unauthorizedError"),
      color: "error",
      duration: 5000,
    });
    navigateTo("/logout");
    return;
  }
  navigateTo("/");
});
</script>
