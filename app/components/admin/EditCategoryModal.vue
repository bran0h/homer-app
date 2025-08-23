<template>
  <UModal
    v-model:open="isOpen"
    :title="$t('admin.categories.modal.editCategory')"
    :description="$t('admin.categories.modal.editCategoryDescription')"
  >
    <template #body>
      <UForm
        :state="editCategory"
        class="space-y-4"
        @submit="handleEditCategory"
      >
        <!-- Name -->
        <UFormField
          :label="$t('admin.categories.form.name')"
          name="name"
          required
        >
          <UInput
            v-model="editCategory.name"
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
            v-model="editCategory.description"
            :placeholder="$t('admin.categories.form.descriptionPlaceholder')"
            :rows="2"
            class="w-full"
          />
        </UFormField>

        <!-- Color -->
        <UFormField :label="$t('admin.categories.form.color')" name="color">
          <UInput
            v-model="editCategory.color"
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
          @click="handleEditCategory"
        >
          {{ $t("admin.categories.modal.update") }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useCategoriesService } from "~/services/useCategoriesService";
import type {
  InventoryCategory,
  UpdateCategoryDTO,
} from "~~/shared/types/fridge";

// Props
interface Props {
  open: boolean;
  category?: InventoryCategory;
}

// Emits
interface Emits {
  (e: "update:open", value: boolean): void;
  (e: "category-updated"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const toast = useToast();
const { t } = useI18n();

// Local state
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const isSubmitting = ref(false);

// Form data
const categoryService = useCategoriesService();
const editCategory = reactive<UpdateCategoryDTO>({
  name: "",
  description: "",
  color: "",
});

const handleEditCategory = async () => {
  if (!editCategory.name?.trim()) {
    toast.add({
      title: t("admin.categories.errors.nameRequired"),
      color: "error",
    });
    return;
  }

  if (!props.category) {
    toast.add({
      title: t("admin.categories.errors.categoryNotFound"),
      color: "error",
    });
    return;
  }

  isSubmitting.value = true;
  try {
    await categoryService.updateCategory(props.category.id, editCategory);
    toast.add({
      title: t("admin.categories.success.categoryUpdated"),
      color: "success",
    });
    emit("category-updated");
    handleClose();
  } catch {
    toast.add({
      title: t("admin.categories.errors.updateFailed"),
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Populate form with category data
const populateForm = (category: InventoryCategory) => {
  editCategory.name = category.name;
  editCategory.description = category.description || "";
  editCategory.color = category.color || "#3B82F6";
};

// Reset form
const resetForm = () => {
  editCategory.name = "";
  editCategory.description = "";
  editCategory.color = "";
};

// Handle modal close
const handleClose = () => {
  emit("update:open", false);
  resetForm();
};

// Watch for category changes
watch(
  () => props.category,
  (category) => {
    if (category && props.open) {
      populateForm(category);
    }
  },
  { immediate: true }
);

// Reset form when modal opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.category) {
      populateForm(props.category);
    } else if (!isOpen) {
      resetForm();
    }
  }
);
</script>
