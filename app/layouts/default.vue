<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const { t } = useI18n();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t("navigation.kitchen"),
    icon: "i-lucide-chef-hat",
    active: route.path.startsWith("/kitchen"),
    children: [
      {
        label: t("navigation.fridge"),
        icon: "i-lucide-refrigerator",
        to: "/kitchen/fridge",
        active: route.path === "/kitchen/fridge",
      },
      {
        label: t("navigation.recipes"),
        icon: "i-lucide-book",
        to: "/kitchen/recipes",
        active: route.path === "/kitchen/recipes",
      },
      {
        label: t("navigation.shoppingList"),
        icon: "i-lucide-shopping-cart",
        to: "/kitchen/shopping-list",
        active: route.path === "/kitchen/shopping-list",
      },
      {
        label: t("navigation.mealPlan"),
        icon: "i-lucide-utensils",
        to: "/kitchen/meal-plan",
        active: route.path === "/kitchen/meal-plan",
      },
    ],
  },
  {
    label: t("navigation.calendar"),
    icon: "i-lucide-calendar",
    to: "/calendar",
    active: route.path.startsWith("/calendar"),
  },
  {
    label: "GitHub",
    icon: "i-simple-icons-github",
    to: "https://github.com/bran0h/homer-ui",
    target: "_blank",
  },
]);
</script>

<template>
  <div class="p-4 flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div
        class="flex items-center space-x-2 cursor-pointer"
        @click="navigateTo('/')"
      >
        <img src="/images/logo.png" width="32" height="32" alt="Homer Logo" />
        <h1 class="text-lg font-bold">Homer</h1>
      </div>
      <UNavigationMenu :items="items" class="justify-center" />
    </div>
    <slot />
  </div>
</template>
