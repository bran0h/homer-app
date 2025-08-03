<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold mb-4">Logging out...</h1>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "unauthorized",
});

const supabase = useSupabaseClient();
const toast = useToast();
const { t } = useI18n();

const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout failed:", error);
    toast.add({
      title: t("logout.error"),
      description: error.message,
      color: "error",
    });
  } else {
    navigateTo("/login");
  }
};

onMounted(() => {
  logout();
});
</script>
