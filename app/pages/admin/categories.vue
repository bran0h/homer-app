<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-2">
          {{ $t("admin.categories.title") }}
        </h1>
        <p class="text-gray-600">{{ $t("admin.categories.description") }}</p>
      </div>

      <UButton
        icon="i-heroicons-plus"
        color="primary"
        @click="showAddCategoryModal = true"
      >
        {{ $t("admin.categories.addCategory") }}
      </UButton>
    </div>

    <!-- Categories Table -->
    <div class="rounded-lg shadow-sm border">
      <UTable
        :columns="columns"
        :data="categories"
        :loading="categoriesStatus === 'pending'"
        :empty-state="{
          icon: 'i-heroicons-folder',
          label: $t('admin.categories.table.noCategories'),
          description: $t('admin.categories.table.noCategoriesDescription'),
        }"
      />
    </div>

    <!-- Add Category Modal -->
    <AdminAddCategoryModal
      v-model:open="showAddCategoryModal"
      @category-added="handleCategoryAdded"
    />

    <!-- Edit Category Modal -->
    <AdminEditCategoryModal
      v-model:open="showEditCategoryModal"
      :category="selectedCategory || undefined"
      @category-updated="handleCategoryUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <UModal
      v-model:open="showDeleteConfirmModal"
      :title="$t('admin.categories.confirm.deleteTitle')"
      :description="
        $t('admin.categories.confirm.deleteDescription', {
          name: categoryToDelete?.name || '',
        })
      "
    >
      <template #footer="{ close }">
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="soft" @click="close">
            {{ $t("admin.categories.confirm.deleteCancel") }}
          </UButton>
          <UButton
            color="error"
            :loading="isDeletingCategory"
            @click="confirmDelete"
          >
            {{ $t("admin.categories.confirm.deleteConfirm") }}
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
import type { InventoryCategory } from "~~/shared/types/fridge";

// Composables
const inventoryService = useInventoryService();
const toast = useToast();
const { t } = useI18n();

// Reactive state
const showAddCategoryModal = ref(false);
const showEditCategoryModal = ref(false);
const showDeleteConfirmModal = ref(false);
const selectedCategory = ref<InventoryCategory | null>(null);
const categoryToDelete = ref<InventoryCategory | null>(null);
const isDeletingCategory = ref(false);

// Data fetching
const {
  data: categories,
  status: categoriesStatus,
  refresh: refreshCategories,
} = useAsyncData("admin-categories", () => inventoryService.getCategories());

// Check if category is used in items
const checkCategoryUsage = async (categoryId: string) => {
  try {
    const items = await inventoryService.getItems();
    return items.some((item) =>
      item.inventory_item_categories?.some(
        (ic) => ic.inventory_categories?.id === categoryId
      )
    );
  } catch {
    return false;
  }
};

// Category management functions
const openEditModal = (category: InventoryCategory) => {
  selectedCategory.value = category;
  showEditCategoryModal.value = true;
};

const openDeleteModal = async (category: InventoryCategory) => {
  const isUsed = await checkCategoryUsage(category.id);
  if (isUsed) {
    toast.add({
      title: t("admin.categories.errors.categoryInUse"),
      description: t("admin.categories.errors.categoryInUseDescription"),
      color: "error",
    });
    return;
  }

  categoryToDelete.value = category;
  showDeleteConfirmModal.value = true;
};

// Event handlers for modal components
const handleCategoryAdded = async () => {
  await refreshCategories();
  showAddCategoryModal.value = false;
};

const handleCategoryUpdated = async () => {
  await refreshCategories();
  showEditCategoryModal.value = false;
  selectedCategory.value = null;
};

const confirmDelete = async () => {
  if (!categoryToDelete.value) return;

  isDeletingCategory.value = true;
  try {
    await inventoryService.deleteCategory(categoryToDelete.value.id);
    toast.add({
      title: t("admin.categories.success.categoryDeleted"),
      color: "success",
    });
    await refreshCategories();
    showDeleteConfirmModal.value = false;
    categoryToDelete.value = null;
  } catch {
    toast.add({
      title: t("admin.categories.errors.deleteFailed"),
      color: "error",
    });
  } finally {
    isDeletingCategory.value = false;
  }
};

// Table columns
const columns = computed<TableColumn<InventoryCategory>[]>(() => [
  {
    accessorKey: "name",
    header: t("admin.categories.table.name"),
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: t("admin.categories.table.description"),
  },
  {
    accessorKey: "color",
    header: t("admin.categories.table.color"),
    cell: ({ row }) => {
      return h("div", { class: "flex items-center gap-2" }, [
        h("div", {
          class: "w-4 h-4 rounded",
          style: { backgroundColor: row.original.color || "#3B82F6" },
        }),
        h("span", row.original.color || "#3B82F6"),
      ]);
    },
  },
  {
    accessorKey: "created_at",
    header: t("admin.categories.table.createdAt"),
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return h("span", date.toLocaleDateString());
    },
  },
  {
    header: t("admin.categories.table.actions"),
    cell: ({ row }) => {
      return h("div", { class: "flex gap-2" }, [
        h(UButton, {
          icon: "i-heroicons-pencil",
          variant: "ghost",
          color: "neutral",
          size: "sm",
          onClick: () => openEditModal(row.original),
        }),
        h(UButton, {
          icon: "i-heroicons-trash",
          variant: "ghost",
          color: "error",
          size: "sm",
          onClick: () => openDeleteModal(row.original),
        }),
      ]);
    },
  },
]);
</script>
