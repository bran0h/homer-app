<template>
  <div class="p-4 flex flex-col gap-4">
    <div class="flex items-center justify-between z-10">
      <div
        class="flex items-center space-x-2 cursor-pointer"
        @click="navigateTo('/')"
      >
        <img src="/images/logo.png" width="32" height="32" alt="Homer Logo" />
        <h1 class="text-lg font-bold">Homer</h1>
      </div>
      <div class="hidden md:block">
        <UNavigationMenu
          content-orientation="vertical"
          :items="items"
          class="justify-center"
          :ui="{
            content: 'bg-black',
          }"
        />
      </div>
      <!-- Side menu -->
      <div class="md:hidden">
        <Icon
          name="i-lucide-menu"
          class="text-2xl cursor-pointer"
          @click="sideMenuDisplayed = !sideMenuDisplayed"
        />
        <Transition
          name="fade"
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-300"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <!-- Bg -->
          <div
            v-if="sideMenuDisplayed"
            class="fixed inset-0 z-50 bg-black/50"
            @click="sideMenuDisplayed = false"
          >
            <!-- Side bar -->
            <div
              class="fixed top-0 right-0 z-50 w-64 h-full bg-accented shadow-lg p-4"
              @click.stop
            >
              <UNavigationMenu
                :ui="{
                  linkLabel: 'text-white',
                  linkLeadingIcon: 'text-white',
                  arrow: 'text-white',
                  childList: 'text-white',
                  content: 'bg-accented',
                }"
                orientation="vertical"
                :items="items"
                @close="sideMenuDisplayed = false"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>
    <slot />
  </div>
</template>
<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const { t, locale, setLocale } = useI18n();

const sideMenuDisplayed = ref(false);
const { isAdmin } = useUser();

const items = computed<NavigationMenuItem[]>(() => {
  const paths: (NavigationMenuItem | undefined)[] = [
    {
      label: t("navigation.kitchen"),
      icon: "i-lucide-chef-hat",
      active: route.path.startsWith("/kitchen"),
      type: "trigger",
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
    isAdmin.value
      ? {
          label: t("navigation.admin"),
          icon: "i-lucide-shield-check",
          type: "trigger",
          active: route.path.startsWith("/admin"),
          children: [
            {
              label: t("navigation.users"),
              icon: "i-lucide-users",
              to: "/admin/users",
              active: route.path === "/admin/users",
            },
          ],
        }
      : undefined,
    {
      label: t("navigation.options"),
      type: "trigger",
      icon: "i-lucide-settings",
      children: [
        {
          label: t("navigation.profile"),
          icon: "i-lucide-user",
          to: "/profile",
          active: route.path === "/profile",
        },
        {
          label: t(`navigation.changeTo${locale.value === "sk" ? "En" : "Sk"}`),
          icon: "i-lucide-globe",
          onClick: () => setLocale(locale.value === "sk" ? "en" : "sk"),
        },
        {
          label: t("navigation.logout"),
          icon: "i-lucide-log-out",
          to: "/logout",
          active: route.path === "/logout",
        },
      ],
    },
    {
      label: "GitHub",
      icon: "i-simple-icons-github",
      to: "https://github.com/bran0h/homer-ui",
      target: "_blank",
    },
  ];
  return paths.filter((item): item is NavigationMenuItem => item !== undefined);
});
</script>
