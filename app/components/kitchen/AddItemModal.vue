<template>
  <UModal
    v-model:open="isOpen"
    :title="$t('kitchen.fridge.modal.addItem')"
    :description="$t('kitchen.fridge.modal.addItemDescription')"
    class="sm:max-w-2xl"
    @update:open="handleClose"
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
          >
            <UInput
              v-model.number="newItem.quantity"
              type="number"
              min="0"
              step="0.1"
            />
          </UFormField>

          <UFormField :label="$t('kitchen.fridge.form.unit')" name="unit">
            <USelect
              v-model="newItem.unit"
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
            v-model.number="newItem.min_quantity"
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
            v-model="newItem.status"
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
          @click="handleAddItem"
        >
          {{ $t("kitchen.fridge.modal.save") }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useItemsService } from "~/services/useItemsService";
import { useTagsService } from "~/services/useTagsService";

// Props
interface Props {
  open: boolean;
}

// Emits
interface Emits {
  (e: "update:open", value: boolean): void;
  (e: "item-added"): void;
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
const newItem = ref({
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
const tagsService = useTagsService();
// Handle creating new tags
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

// Reset form
const resetForm = () => {
  newItem.value = {
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
    // Prepare the item data, converting empty strings to null for optional date fields
    const itemData = {
      ...newItem.value,
      purchase_date: newItem.value.purchase_date || null,
      expiration_date: newItem.value.expiration_date || null,
      description: newItem.value.description || null,
      unit: newItem.value.unit, // Unit is required now, so don't convert to null
      notes: newItem.value.notes || null,
    };

    // Create the item
    const item = await itemsService.createItem(itemData);

    // Add categories
    for (const category of selectedCategories.value) {
      await itemsService.addItemToCategory(item.id, category.value);
    }

    // Add tags
    for (const tag of selectedTags.value) {
      await itemsService.addTagToItem(item.id, tag.value);
    }

    toast.add({
      title: t("kitchen.fridge.success.itemAdded"),
      color: "success",
    });

    emit("item-added");
    handleClose();
  } catch {
    toast.add({
      title: t("kitchen.fridge.errors.createFailed"),
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

// Reset form when modal opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  }
);
</script>
