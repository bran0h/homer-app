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
    <UModal
      v-model:open="showAddItemModal"
      :title="$t('kitchen.fridge.modal.addItem')"
      class="sm:max-w-2xl"
    >
      <template #body>
        <UForm :state="newItem" class="space-y-4" @submit="handleAddItem">
          <!-- Name -->
          <UFormField
            :label="$t('kitchen.fridge.form.name')"
            name="name"
            required
          >
            <UInput
              v-model="newItem.name"
              :placeholder="$t('kitchen.fridge.form.namePlaceholder')"
              required
              class="w-full"
            />
          </UFormField>

          <!-- Description -->
          <UFormField
            :label="$t('kitchen.fridge.form.description')"
            name="description"
          >
            <UTextarea
              v-model="newItem.description"
              :placeholder="$t('kitchen.fridge.form.descriptionPlaceholder')"
              :rows="3"
              class="w-full"
            />
          </UFormField>

          <!-- Quantity and Unit -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              :label="$t('kitchen.fridge.form.quantity')"
              name="quantity"
              required
            >
              <UInput
                v-model.number="newItem.quantity"
                type="number"
                min="0"
                step="0.1"
                required
              />
            </UFormField>

            <UFormField :label="$t('kitchen.fridge.form.unit')" name="unit">
              <UInput
                v-model="newItem.unit"
                :placeholder="$t('kitchen.fridge.form.unitPlaceholder')"
              />
            </UFormField>
          </div>

          <!-- Min Quantity -->
          <UFormField
            :label="$t('kitchen.fridge.form.minQuantity')"
            name="min_quantity"
          >
            <UInput
              v-model.number="newItem.min_quantity"
              type="number"
              min="0"
              step="0.1"
              :placeholder="$t('kitchen.fridge.form.minQuantityPlaceholder')"
              class="w-full"
            />
          </UFormField>

          <!-- Status -->
          <UFormField
            :label="$t('kitchen.fridge.form.status')"
            name="status"
            required
          >
            <USelect
              v-model="newItem.status"
              :items="statusFormOptions"
              required
              class="w-full"
            />
          </UFormField>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              :label="$t('kitchen.fridge.form.purchaseDate')"
              name="purchase_date"
            >
              <UInput v-model="newItem.purchase_date" type="date" />
            </UFormField>

            <UFormField
              :label="$t('kitchen.fridge.form.expirationDate')"
              name="expiration_date"
            >
              <UInput v-model="newItem.expiration_date" type="date" />
            </UFormField>
          </div>

          <!-- Categories -->
          <UFormField
            :label="$t('kitchen.fridge.form.categories')"
            name="categories"
          >
            <USelectMenu
              v-model="selectedCategories"
              :items="availableCategories"
              multiple
              :placeholder="$t('kitchen.fridge.form.categoriesPlaceholder')"
              class="w-full"
            />
          </UFormField>

          <!-- Tags -->
          <UFormField :label="$t('kitchen.fridge.form.tags')" name="tags">
            <USelectMenu
              v-model="selectedTags"
              :items="availableTags"
              multiple
              create-item
              :placeholder="$t('kitchen.fridge.form.tagsPlaceholder')"
              class="w-full"
              @create="onCreateTag"
            />
          </UFormField>

          <!-- Notes -->
          <UFormField :label="$t('kitchen.fridge.form.notes')" name="notes">
            <UTextarea
              v-model="newItem.notes"
              :placeholder="$t('kitchen.fridge.form.notesPlaceholder')"
              :rows="2"
              class="w-full"
            />
          </UFormField>
        </UForm>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="soft" @click="close">
            {{ $t("kitchen.fridge.modal.cancel") }}
          </UButton>
          <UButton
            color="primary"
            :loading="isSubmitting"
            @click="handleAddItem"
          >
            {{ $t("kitchen.fridge.modal.save") }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { useInventoryService } from "~/services/useInventoryService";

// Composables
const { categories, stats, itemsStatus, tags, filterItems } = useInventory();
const inventoryService = useInventoryService();
const { isAdmin } = useUser();
const toast = useToast();

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

// Form data
const isSubmitting = ref(false);
const newItem = ref({
  name: "",
  description: "",
  quantity: 0,
  unit: "",
  min_quantity: null as number | null,
  status: "in_stock" as "in_stock" | "low_stock" | "out_of_stock" | "expired",
  purchase_date: "",
  expiration_date: "",
  notes: "",
});
const selectedCategories = ref<{ label: string; value: string }[]>([]);
const selectedTags = ref<{ label: string; value: string }[]>([]);

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

// Form options
const statusFormOptions = computed(() => [
  { label: t("kitchen.fridge.status.inStock"), value: "in_stock" },
  { label: t("kitchen.fridge.status.lowStock"), value: "low_stock" },
  { label: t("kitchen.fridge.status.outOfStock"), value: "out_of_stock" },
  { label: t("kitchen.fridge.status.expired"), value: "expired" },
]);

const availableCategories = computed(
  () =>
    categories.value?.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })) || []
);

const availableTags = computed(() => {
  return (
    tags.value?.map((tag) => ({
      label: tag.name,
      value: tag.id,
    })) || []
  );
});

// Handle creating new tags
const onCreateTag = async (newTagValue: string) => {
  // Save new tag to the service (if needed)
  const newTag = await inventoryService.createTag({
    name: newTagValue,
  });

  // Add to available tags for future use
  availableTags.value.push({
    label: newTag.name,
    value: newTag.id,
  });

  // Add to selected tags
  selectedTags.value.push({
    label: newTag.name,
    value: newTag.id,
  });
};

// Reset form
const resetForm = () => {
  newItem.value = {
    name: "",
    description: "",
    quantity: 0,
    unit: "",
    min_quantity: null,
    status: "in_stock",
    purchase_date: "",
    expiration_date: "",
    notes: "",
  };
  selectedCategories.value = [];
  selectedTags.value = [];
};

// Handle form submission
const handleAddItem = async () => {
  if (!newItem.value.name.trim()) {
    toast.add({
      title: t("kitchen.fridge.errors.nameRequired"),
      color: "error",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    // Create the item (we'll implement this with the service later)
    const item = await inventoryService.createItem(newItem.value);
    for (const category of selectedCategories.value) {
      await inventoryService.addItemToCategory(item.id, category.value);
    }
    for (const tag of selectedTags.value) {
      await inventoryService.addTagToItem(item.id, tag.value);
    }
    // For now, just show success and close modal
    toast.add({
      title: t("kitchen.fridge.success.itemAdded"),
      color: "success",
    });

    showAddItemModal.value = false;
    resetForm();
  } catch {
    toast.add({
      title: t("kitchen.fridge.errors.createFailed"),
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
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
const columns = computed(() => [
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
