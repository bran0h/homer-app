<template>
  <UModal
    v-model:open="isOpen"
    :title="$t('kitchen.fridge.modal.editItem')"
    :description="$t('kitchen.fridge.modal.editItemDescription')"
    class="sm:max-w-2xl"
    @update:open="handleClose"
  >
    <template #body>
      <UForm :state="editItem" class="space-y-4" @submit="handleEditItem">
        <!-- Name -->
        <UFormField
          :label="$t('kitchen.fridge.form.name')"
          name="name"
          required
        >
          <UInput
            v-model="editItem.name"
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
            v-model="editItem.description"
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
          >
            <UInput
              v-model.number="editItem.quantity"
              type="number"
              min="0"
              step="0.1"
            />
          </UFormField>

          <UFormField :label="$t('kitchen.fridge.form.unit')" name="unit">
            <USelect
              v-model="editItem.unit"
              :items="unitOptions"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Min Quantity -->
        <UFormField
          :label="$t('kitchen.fridge.form.minQuantity')"
          name="min_quantity"
        >
          <UInput
            v-model.number="editItem.min_quantity"
            type="number"
            min="0"
            step="0.1"
            :placeholder="$t('kitchen.fridge.form.minQuantityPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <!-- Status -->
        <UFormField :label="$t('kitchen.fridge.form.status')" name="status">
          <USelect
            v-model="editItem.status"
            :items="statusFormOptions"
            class="w-full"
          />
        </UFormField>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField
            :label="$t('kitchen.fridge.form.purchaseDate')"
            name="purchase_date"
          >
            <UInput v-model="editItem.purchase_date" type="date" />
          </UFormField>

          <UFormField
            :label="$t('kitchen.fridge.form.expirationDate')"
            name="expiration_date"
          >
            <UInput v-model="editItem.expiration_date" type="date" />
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
            v-model="editItem.notes"
            :placeholder="$t('kitchen.fridge.form.notesPlaceholder')"
            :rows="2"
            class="w-full"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end gap-3">
        <UButton
          color="neutral"
          class="cursor-pointer"
          variant="soft"
          @click="close"
        >
          {{ $t("kitchen.fridge.modal.cancel") }}
        </UButton>
        <UButton
          color="primary"
          class="cursor-pointer"
          :loading="isSubmitting"
          @click="handleEditItem"
        >
          {{ $t("kitchen.fridge.modal.update") }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useItemsService } from "~/services/useItemsService";
import { useTagsService } from "~/services/useTagsService";
import type { ItemWithRelations } from "~~/shared/types/fridge";

// Props
interface Props {
  open: boolean;
  item?: ItemWithRelations;
}

// Emits
interface Emits {
  (e: "update:open", value: boolean): void;
  (e: "item-updated"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { categories, tags } = useInventory();
const toast = useToast();
const { t } = useI18n();

// Local state
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const isSubmitting = ref(false);

// Form data
const editItem = ref({
  id: "",
  name: "",
  description: "",
  quantity: 0,
  unit: "pieces",
  min_quantity: undefined as number | undefined,
  status: "in_stock" as "in_stock" | "low_stock" | "out_of_stock" | "expired",
  purchase_date: "",
  expiration_date: "",
  notes: "",
});

const selectedCategories = ref<{ label: string; value: string }[]>([]);
const selectedTags = ref<{ label: string; value: string }[]>([]);

// Form options
const statusFormOptions = computed(() => [
  { label: t("kitchen.fridge.status.inStock"), value: "in_stock" },
  { label: t("kitchen.fridge.status.lowStock"), value: "low_stock" },
  { label: t("kitchen.fridge.status.outOfStock"), value: "out_of_stock" },
  { label: t("kitchen.fridge.status.expired"), value: "expired" },
]);

const unitOptions = computed(() => [
  { label: t("kitchen.fridge.units.pieces"), value: "pieces" },
  { label: t("kitchen.fridge.units.kilogram"), value: "kilogram" },
  { label: t("kitchen.fridge.units.gram"), value: "gram" },
  { label: t("kitchen.fridge.units.liter"), value: "liter" },
  { label: t("kitchen.fridge.units.mililiter"), value: "mililiter" },
  { label: t("kitchen.fridge.units.tableSpoon"), value: "table_spoon" },
  { label: t("kitchen.fridge.units.teaSpoon"), value: "tea_spoon" },
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
const tagsService = useTagsService();
const onCreateTag = async (newTagValue: string) => {
  try {
    // Save new tag to the service
    const newTag = await tagsService.createTag({
      name: newTagValue,
    });

    // Add to selected tags
    selectedTags.value.push({
      label: newTag.name,
      value: newTag.id,
    });
  } catch {
    toast.add({
      title: t("kitchen.fridge.errors.tagCreateFailed"),
      color: "error",
    });
  }
};

// Populate form with item data
const populateForm = (item: ItemWithRelations) => {
  editItem.value = {
    id: item.id,
    name: item.name,
    description: item.description || "",
    quantity: item.quantity || 0,
    unit: item.unit || "pieces",
    min_quantity: item.min_quantity || undefined,
    status: item.status,
    purchase_date: item.purchase_date || "",
    expiration_date: item.expiration_date || "",
    notes: item.notes || "",
  };

  // Populate selected categories from the relations
  selectedCategories.value =
    item.inventory_item_categories?.map((rel) => ({
      label: rel.inventory_categories.name,
      value: rel.inventory_categories.id,
    })) || [];

  // Populate selected tags from the relations
  selectedTags.value =
    item.inventory_item_tags?.map((rel) => ({
      label: rel.inventory_tags.name,
      value: rel.inventory_tags.id,
    })) || [];
};

// Reset form
const resetForm = () => {
  editItem.value = {
    id: "",
    name: "",
    description: "",
    quantity: 0,
    unit: "pieces",
    min_quantity: undefined,
    status: "in_stock",
    purchase_date: "",
    expiration_date: "",
    notes: "",
  };
  selectedCategories.value = [];
  selectedTags.value = [];
};

// Handle form submission
const itemsService = useItemsService();
const handleEditItem = async () => {
  if (!editItem.value.name.trim()) {
    toast.add({
      title: t("kitchen.fridge.errors.nameRequired"),
      color: "error",
    });
    return;
  }

  if (!editItem.value.id) {
    toast.add({
      title: t("kitchen.fridge.errors.itemNotFound"),
      color: "error",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    // Prepare the item data, converting empty strings to null for optional date fields
    const itemData = {
      name: editItem.value.name,
      description: editItem.value.description || null,
      quantity: editItem.value.quantity,
      unit: editItem.value.unit, // Unit is required now, so don't convert to null
      min_quantity: editItem.value.min_quantity,
      status: editItem.value.status,
      purchase_date: editItem.value.purchase_date || null,
      expiration_date: editItem.value.expiration_date || null,
      notes: editItem.value.notes || null,
    };

    // Update the item
    await itemsService.updateItem(editItem.value.id, itemData);

    // Update categories (remove old ones and add new ones)
    // This is a simplified approach - in production you'd want to be more efficient
    await itemsService.removeAllCategoriesFromItem(editItem.value.id);
    for (const category of selectedCategories.value) {
      await itemsService.addItemToCategory(editItem.value.id, category.value);
    }

    // Update tags
    await itemsService.removeAllTagsFromItem(editItem.value.id);
    for (const tag of selectedTags.value) {
      await itemsService.addTagToItem(editItem.value.id, tag.value);
    }

    toast.add({
      title: t("kitchen.fridge.success.itemUpdated"),
      color: "success",
    });

    emit("item-updated");
    handleClose();
  } catch {
    toast.add({
      title: t("kitchen.fridge.errors.updateFailed"),
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Handle modal close
const handleClose = () => {
  emit("update:open", false);
  resetForm();
};

// Watch for item prop changes to populate form
watch(
  () => props.item,
  (item) => {
    if (item && props.open) {
      populateForm(item);
    }
  },
  { immediate: true }
);

// Reset form when modal opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.item) {
      populateForm(props.item);
    } else if (!isOpen) {
      resetForm();
    }
  }
);
</script>
