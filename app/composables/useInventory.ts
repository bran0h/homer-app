import { useCategoriesService } from "~/services/useCategoriesService";
import { useItemsService } from "~/services/useItemsService";
import { useTagsService } from "~/services/useTagsService";
import type {
  InventoryItemStatus,
  ItemWithRelations,
} from "~~/shared/types/fridge";

export const useInventory = () => {
  // Items
  const itemsService = useItemsService();
  const {
    data: items,
    error: itemsError,
    status: itemsStatus,
    refresh: refreshItems,
  } = useAsyncData("inventory-items", async () => itemsService.getItems());

  // Categories
  const categoriesService = useCategoriesService();
  const {
    data: categories,
    error: categoriesError,
    status: categoriesStatus,
    refresh: refreshCategories,
  } = useAsyncData("inventory-categories", async () =>
    categoriesService.getCategories()
  );

  // Tags
  const tagsService = useTagsService();
  const {
    data: tags,
    error: tagsError,
    status: tagsStatus,
    refresh: refreshTags,
  } = useAsyncData("inventory-tags", async () => tagsService.getTags());

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

    // Refresh functions
    refreshItems,
    refreshCategories,
    refreshTags,
  };
};
