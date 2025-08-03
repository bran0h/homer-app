<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <img
      src="/images/logo.png"
      width="100"
      height="100"
      alt="Homer Logo"
      class="mb-4"
    />
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">{{ $t("index.title") }}</h1>
      <h2 class="text-lg font-semibold mb-2">{{ $t("index.description") }}</h2>
      <p class="mb-6">{{ $t("index.loginPrompt") }}</p>
      <UButton class="w-full justify-center cursor-pointer" @click="login">
        {{ $t("index.login") }}
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "unauthorized",
});

const supabase = useSupabaseClient();
const toast = useToast();
const { t } = useI18n();
const login = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  });

  if (error) {
    console.error("Login failed:", error);
    toast.add({
      title: t("login.error"),
      description: error.message,
      color: "error",
    });
  }
};
</script>
