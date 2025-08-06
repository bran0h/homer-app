<template>
  <UModal
    v-model:open="isOpen"
    :title="$t('admin.categories.modal.addCategory')"
    :description="$t('admin.categories.modal.addCategoryDescription')"
  >
    <template #body>
      <UForm :state="newCategory" class="space-y-4" @submit="handleAddCategory">
        <!-- Name -->
        <UFormField
          :label="$t('admin.categories.form.name')"
          name="name"
          required
        >
          <UInput
            v-model="newCategory.name"
            :placeholder="$t('admin.categories.form.namePlaceholder')"
            required
            class="w-full"
          />
        </UFormField>

        <!-- Description -->
        <UFormField
          :label="$t('admin.categories.form.description')"
          name="description"
        >
          <UTextarea
            v-model="newCategory.description"
            :placeholder="$t('admin.categories.form.descriptionPlaceholder')"
            :rows="2"
            class="w-full"
          />
        </UFormField>

        <!-- Color -->
        <UFormField :label="$t('admin.categories.form.color')" name="color">
          <UInput
            v-model="newCategory.color"
            type="color"
            :placeholder="$t('admin.categories.form.colorPlaceholder')"
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
          {{ $t("admin.categories.modal.cancel") }}
        </UButton>
        <UButton
          color="primary"
          class="cursor-pointer"
          :loading="isSubmitting"
          @click="handleAddCategory"
        >
          {{ $t("admin.categories.modal.save") }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useInventoryService } from "~/services/useInventoryService";
import type { CreateCategoryDTO } from "~~/shared/types/fridge";

// Props
interface Props {
  open: boolean;
}

// Emits
interface Emits {
  (e: "update:open", value: boolean): void;
  (e: "category-added"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const inventoryService = useInventoryService();
const toast = useToast();
const { t } = useI18n();

// Local state
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const isSubmitting = ref(false);

// Form data
const newCategory = reactive<CreateCategoryDTO>({
  name: "",
  description: "",
  color: "#3B82F6",
});

const handleAddCategory = async () => {
  if (!newCategory.name.trim()) {
    toast.add({
      title: t("admin.categories.errors.nameRequired"),
      color: "error",
    });
    return;
  }

  isSubmitting.value = true;
  try {
    await inventoryService.createCategory(newCategory);
    toast.add({
      title: t("admin.categories.success.categoryAdded"),
      color: "success",
    });
    emit("category-added");
    handleClose();
  } catch {
    toast.add({
      title: t("admin.categories.errors.createFailed"),
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  newCategory.name = "";
  newCategory.description = "";
  newCategory.color = "#3B82F6";
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
