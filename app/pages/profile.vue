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
      <!-- User role -->
      <label for="role" class="text-sm font-medium">
        {{ $t("profile.role") }}
      </label>
      <!-- Display chips with roles in container -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="role in roles"
          :key="role"
          class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded"
        >
          {{ role }}
        </span>
      </div>
      <!-- Display error message -->
      <div v-if="rolesError" class="text-red-500 text-sm">
        {{ $t("profile.error") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { rolesError, roles, user } = useUser();
</script>
