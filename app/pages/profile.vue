<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-2xl font-bold mb-4">{{ $t("profile.title") }}</h1>
    <div class="flex flex-col gap-2">
      <label for="email" class="text-sm font-medium">
        {{ $t("profile.email") }}
      </label>
      <input
        id="email"
        v-model="user!.email"
        type="email"
        class="border rounded p-2"
        readonly
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const user = useSupabaseUser();
</script>
