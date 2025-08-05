import type {
  CreateCategoryDTO,
  CreateItemDTO,
  CreateTagDTO,
  InventoryItemStatus,
  ItemWithRelations,
  UpdateCategoryDTO,
  UpdateItemDTO,
  UpdateTagDTO,
} from "~~/shared/types/fridge";
import { useInventoryService } from "../services/useInventoryService";

export const useInventory = () => {
  const inventoryService = useInventoryService();

  // Items
  const {
    data: items,
    error: itemsError,
    status: itemsStatus,
    refresh: refreshItems,
  } = useAsyncData("inventory-items", async () => inventoryService.getItems());

  const {
    data: categories,
    error: categoriesError,
    status: categoriesStatus,
    refresh: refreshCategories,
  } = useAsyncData("inventory-categories", async () =>
    inventoryService.getCategories()
  );

  const {
    data: tags,
    error: tagsError,
    status: tagsStatus,
    refresh: refreshTags,
  } = useAsyncData("inventory-tags", async () => inventoryService.getTags());

  // Computed helpers
  const itemsGroupedByCategory = computed(() => {
    if (!items.value || !categories.value) return {};

    const grouped: Record<string, ItemWithRelations[]> = {};

    categories.value.forEach((category) => {
      grouped[category.name] =
        items.value?.filter((item) =>
          item.inventory_item_categories?.some(
            (ic) => ic.inventory_categories.id === category.id
          )
        ) || [];
    });

    // Add uncategorized items
    const uncategorized =
      items.value?.filter(
        (item) =>
          !item.inventory_item_categories ||
          item.inventory_item_categories.length === 0
      ) || [];

    if (uncategorized.length > 0) {
      grouped["Uncategorized"] = uncategorized;
    }

    return grouped;
  });

  const itemsByStatus = computed(() => {
    if (!items.value) return {};

    return items.value.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = [];
      }
      acc[item.status].push(item);
      return acc;
    }, {} as Record<InventoryItemStatus, ItemWithRelations[]>);
  });

  const lowStockItems = computed(() => {
    if (!items.value) return [];
    return items.value.filter(
      (item) =>
        (item.quantity !== null &&
          item.min_quantity !== null &&
          item.quantity <= item.min_quantity) ||
        item.status === "low_stock" ||
        item.status === "out_of_stock"
    );
  });

  const expiringSoonItems = computed(() => {
    if (!items.value) return [];
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return items.value.filter((item) => {
      if (!item.expiration_date) return false;
      const expirationDate = new Date(item.expiration_date);
      return expirationDate <= sevenDaysFromNow && expirationDate >= new Date();
    });
  });

  // Stats
  const stats = computed(() => {
    if (!items.value)
      return { total: 0, lowStock: 0, expired: 0, outOfStock: 0 };

    return {
      total: items.value.length,
      lowStock: items.value.filter((item) => item.status === "low_stock")
        .length,
      expired: items.value.filter((item) => item.status === "expired").length,
      outOfStock: items.value.filter((item) => item.status === "out_of_stock")
        .length,
    };
  });

  // Actions
  const createItem = async (item: CreateItemDTO) => {
    const newItem = await inventoryService.createItem(item);
    await refreshItems();
    return newItem;
  };

  const updateItem = async (id: string, item: UpdateItemDTO) => {
    const updatedItem = await inventoryService.updateItem(id, item);
    await refreshItems();
    return updatedItem;
  };

  const deleteItem = async (id: string) => {
    await inventoryService.deleteItem(id);
    await refreshItems();
  };

  const createCategory = async (category: CreateCategoryDTO) => {
    const newCategory = await inventoryService.createCategory(category);
    await refreshCategories();
    return newCategory;
  };

  const updateCategory = async (id: string, category: UpdateCategoryDTO) => {
    const updatedCategory = await inventoryService.updateCategory(id, category);
    await refreshCategories();
    return updatedCategory;
  };

  const deleteCategory = async (id: string) => {
    await inventoryService.deleteCategory(id);
    await refreshCategories();
  };

  const createTag = async (tag: CreateTagDTO) => {
    const newTag = await inventoryService.createTag(tag);
    await refreshTags();
    return newTag;
  };

  const updateTag = async (id: string, tag: UpdateTagDTO) => {
    const updatedTag = await inventoryService.updateTag(id, tag);
    await refreshTags();
    return updatedTag;
  };

  const deleteTag = async (id: string) => {
    await inventoryService.deleteTag(id);
    await refreshTags();
  };

  const filterItems = (filters: {
    status?: string;
    category?: string;
    search?: string;
  }) => {
    return (
      items.value?.filter((item) => {
        if (
          filters.status &&
          filters.status !== "all" &&
          item.status !== filters.status
        )
          return false;
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(searchTerm);
          const matchesDescription = item.description
            ?.toLowerCase()
            .includes(searchTerm);
          if (!matchesName && !matchesDescription) return false;
        }
        if (filters.category && filters.category !== "all") {
          const hasCategory = item.inventory_item_categories?.some(
            (ic) => ic.inventory_categories.id === filters.category
          );
          if (!hasCategory) return false;
        }
        return true;
      }) || []
    );
  };

  return {
    // Data
    items,
    categories,
    tags,

    // Error states
    itemsError,
    categoriesError,
    tagsError,

    // Loading states
    itemsStatus,
    categoriesStatus,
    tagsStatus,

    // Computed data
    itemsGroupedByCategory,
    itemsByStatus,
    lowStockItems,
    expiringSoonItems,
    stats,

    // Actions
    createItem,
    updateItem,
    deleteItem,
    createCategory,
    updateCategory,
    deleteCategory,
    createTag,
    updateTag,
    deleteTag,

    // Refresh functions
    refreshItems,
    refreshCategories,
    refreshTags,

    // Utilities
    filterItems,
  };
};
