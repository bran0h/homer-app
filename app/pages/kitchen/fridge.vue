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
          class="cursor-pointer"
        />

        <USelect
          v-model="selectedCategory"
          :items="categoryOptions"
          :placeholder="$t('kitchen.fridge.filters.allCategories')"
          class="w-48 cursor-pointer"
        />

        <UButton
          v-if="canEditFridge"
          icon="i-heroicons-plus"
          color="primary"
          class="cursor-pointer"
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
        :data="filteredItems"
        :loading="itemsStatus === 'pending'"
        :empty-state="{
          icon: 'i-heroicons-inbox',
          label: $t('kitchen.fridge.table.noItems'),
          description: $t('kitchen.fridge.table.noItemsDescription'),
        }"
      />
    </div>

    <!-- Add Item Modal -->
    <KitchenAddItemModal
      v-model:open="showAddItemModal"
      @item-added="handleItemAdded"
    />

    <!-- Edit Item Modal -->
    <KitchenEditItemModal
      v-model:open="showEditItemModal"
      :item="selectedItem"
      @item-updated="handleItemUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <UModal
      v-model:open="showDeleteConfirmModal"
      :title="$t('kitchen.fridge.confirm.deleteTitle')"
      :description="
        $t('kitchen.fridge.confirm.deleteDescription', {
          name: itemToDelete?.name || '',
        })
      "
    >
      <template #footer="{ close }">
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            class="cursor-pointer"
            variant="soft"
            @click="close"
          >
            {{ $t("kitchen.fridge.confirm.deleteCancel") }}
          </UButton>
          <UButton
            color="error"
            :loading="isDeletingItem"
            class="cursor-pointer"
            @click="confirmDelete"
          >
            {{ $t("kitchen.fridge.confirm.deleteConfirm") }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { UButton } from "#components";
import type { TableColumn } from "@nuxt/ui";
import { useInventoryService } from "~/services/useInventoryService";
import type { ItemWithRelations } from "~~/shared/types/fridge";

// Composables
const { categories, stats, itemsStatus, filterItems, refreshItems } =
  useInventory();
const inventoryService = useInventoryService();
const { canEditFridge } = useUser();
const toast = useToast();

// Reactive filters
const searchQuery = ref("");
const selectedStatus = ref("");
const selectedCategory = ref("");
const showAddItemModal = ref(false);
const showEditItemModal = ref(false);
const selectedItem = ref<ItemWithRelations>();
const showDeleteConfirmModal = ref(false);
const itemToDelete = ref<ItemWithRelations>();
const isDeletingItem = ref(false);

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

// Item management functions
const editItem = (row: ItemWithRelations) => {
  selectedItem.value = row;
  showEditItemModal.value = true;
};

const deleteItem = (item: ItemWithRelations) => {
  itemToDelete.value = item;
  showDeleteConfirmModal.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;

  isDeletingItem.value = true;
  try {
    await inventoryService.deleteItem(itemToDelete.value.id);
    toast.add({
      title: t("kitchen.fridge.success.itemDeleted"),
      color: "success",
    });
    await refreshItems();
    showDeleteConfirmModal.value = false;
    itemToDelete.value = undefined;
  } catch {
    toast.add({
      title: t("kitchen.fridge.errors.deleteFailed"),
      color: "error",
    });
  } finally {
    isDeletingItem.value = false;
  }
};

const handleItemAdded = async () => {
  await refreshItems();
  showAddItemModal.value = false;
};

const handleItemUpdated = async () => {
  await refreshItems();
  showEditItemModal.value = false;
  selectedItem.value = undefined;
};

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
    cell: ({ row }) => `${row.original.quantity} ${row.original.unit}`,
  },
  {
    accessorKey: "status",
    header: t("kitchen.fridge.table.status"),
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.original.status;
      return h(
        "span",
        { class: `text-${status}` },
        t(`kitchen.fridge.status.${snakeToCamelCase(status)}`)
      );
    },
  },
  {
    accessorKey: "expiration_date",
    header: t("kitchen.fridge.table.expires"),
    enableSorting: true,
  },
  ...(canEditFridge.value
    ? ([
        {
          header: t("kitchen.fridge.table.actions"),
          cell: ({ row }) => {
            return h("div", { class: "flex gap-2" }, [
              h(UButton, {
                icon: "i-heroicons-pencil",
                variant: "ghost",
                color: "neutral",
                class: "cursor-pointer",
                size: "sm",
                onClick: () => editItem(row.original),
              }),
              h(UButton, {
                icon: "i-heroicons-trash",
                variant: "ghost",
                color: "error",
                class: "cursor-pointer",
                size: "sm",
                onClick: () => deleteItem(row.original),
              }),
            ]);
          },
        },
      ] as TableColumn<ItemWithRelations>[])
    : []),
]);
</script>
<style>
.text-in_stock {
  color: #16a34a; /* Green */
}
.text-low_stock {
  color: #f59e0b; /* Yellow */
}
.text-out_of_stock {
  color: #dc2626; /* Red */
}
.text-expired {
  color: #9ca3af; /* Gray */
}
</style>
