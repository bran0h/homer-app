<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-2">
          {{ $t("kitchen.fridge.title") }}
        </h1>
        <p class="text-gray-600">{{ $t("kitchen.fridge.description") }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="flex gap-4">
        <div class="p-4 rounded-lg shadow-sm border">
          <div class="text-2xl font-bold text-green-600">{{ stats.total }}</div>
          <div class="text-sm text-gray-500">
            {{ $t("kitchen.fridge.stats.totalItems") }}
          </div>
        </div>
        <div class="p-4 rounded-lg shadow-sm border">
          <div class="text-2xl font-bold text-yellow-600">
            {{ stats.lowStock }}
          </div>
          <div class="text-sm text-gray-500">
            {{ $t("kitchen.fridge.stats.lowStock") }}
          </div>
        </div>
        <div class="p-4 rounded-lg shadow-sm border">
          <div class="text-2xl font-bold text-red-600">{{ stats.expired }}</div>
          <div class="text-sm text-gray-500">
            {{ $t("kitchen.fridge.stats.expired") }}
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 p-4 rounded-lg shadow-sm border">
      <div class="flex gap-4 items-center">
        <UInput
          v-model="searchQuery"
          :placeholder="$t('kitchen.fridge.search.placeholder')"
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
        />

        <USelect
          v-model="selectedStatus"
          :items="statusOptions"
          :placeholder="$t('kitchen.fridge.filters.allStatus')"
        />

        <USelect
          v-model="selectedCategory"
          :items="categoryOptions"
          :placeholder="$t('kitchen.fridge.filters.allCategories')"
          class="w-48"
        />

        <UButton
          icon="i-heroicons-plus"
          color="primary"
          @click="showAddItemModal = true"
        >
          {{ $t("kitchen.fridge.addItem") }}
        </UButton>
      </div>
    </div>

    <!-- Items Table -->
    <div class="rounded-lg shadow-sm border">
      <UTable
        :columns="columns"
        :rows="filteredItems"
        :loading="itemsStatus === 'pending'"
        :empty-state="{
          icon: 'i-heroicons-inbox',
          label: $t('kitchen.fridge.table.noItems'),
          description: $t('kitchen.fridge.table.noItemsDescription'),
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

// Composables
const { categories, stats, itemsStatus, filterItems } = useInventory();
const { isAdmin } = useUser();

// Check if user can edit (admin or member)
const isMember = computed(() => {
  // Add role check logic here once user roles are available
  return true; // Placeholder
});

// Reactive filters
const searchQuery = ref("");
const selectedStatus = ref("");
const selectedCategory = ref("");
const showAddItemModal = ref(false);

// Filter options
const statusOptions = computed(() => [
  { label: t("kitchen.fridge.status.all"), value: "all" },
  { label: t("kitchen.fridge.status.inStock"), value: "in_stock" },
  { label: t("kitchen.fridge.status.lowStock"), value: "low_stock" },
  { label: t("kitchen.fridge.status.outOfStock"), value: "out_of_stock" },
  { label: t("kitchen.fridge.status.expired"), value: "expired" },
]);

const categoryOptions = computed(() => [
  { label: t("kitchen.fridge.categories.all"), value: "all" },
  ...(categories.value?.map((cat) => ({
    label: cat.name,
    value: cat.id,
  })) || []),
]);

// Filtered items
const filteredItems = computed(() => {
  return filterItems({
    search: searchQuery.value,
    status: selectedStatus.value,
    category: selectedCategory.value,
  });
});

// Table columns
const { t } = useI18n();
const columns = computed<TableColumn<ItemWithRelations>[]>(() => [
  {
    accessorKey: "name",
    header: t("kitchen.fridge.table.name"),
    enableSorting: true,
  },
  {
    accessorKey: "quantity",
    header: t("kitchen.fridge.table.quantity"),
    enableSorting: true,
  },
  {
    accessorKey: "unit",
    header: t("kitchen.fridge.table.unit"),
  },
  {
    accessorKey: "status",
    header: t("kitchen.fridge.table.status"),
    enableSorting: true,
  },
  {
    accessorKey: "expiration_date",
    header: t("kitchen.fridge.table.expires"),
    enableSorting: true,
  },
  ...(isAdmin.value || isMember.value
    ? [
        {
          accessorKey: "actions",
          header: t("kitchen.fridge.table.actions"),
        },
      ]
    : []),
]);
</script>
