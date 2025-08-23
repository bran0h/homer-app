import type {
  CreateItemDTO,
  InventoryItemStatus,
  ItemWithRelations,
  UpdateItemDTO,
} from "~~/shared/types/fridge";

export const useItemsService = () => {
  const client = useSupabaseClient<Database>();

  const getItems = async (filters?: {
    status?: InventoryItemStatus;
    category?: string;
    tag?: string;
    search?: string;
  }) => {
    let query = client
      .from("inventory_items")
      .select(
        `
        *,
        inventory_item_categories(
          inventory_categories(*)
        ),
        inventory_item_tags(
          inventory_tags(*)
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ItemWithRelations[];
  };

  const getItem = async (id: string) => {
    const { data, error } = await client
      .from("inventory_items")
      .select(
        `
        *,
        inventory_item_categories(
          inventory_categories(*)
        ),
        inventory_item_tags(
          inventory_tags(*)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ItemWithRelations;
  };

  const createItem = async (item: CreateItemDTO) => {
    const { data, error } = await client
      .from("inventory_items")
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateItem = async (id: string, item: UpdateItemDTO) => {
    const { data, error } = await client
      .from("inventory_items")
      .update(item)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteItem = async (id: string) => {
    const { error } = await client
      .from("inventory_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  };

  // Item-Category relationship management
  const addItemToCategory = async (itemId: string, categoryId: string) => {
    const { data, error } = await client
      .from("inventory_item_categories")
      .insert({ item_id: itemId, category_id: categoryId })
      .select();

    if (error) throw error;
    return data;
  };

  const removeItemFromCategory = async (itemId: string, categoryId: string) => {
    const { error } = await client
      .from("inventory_item_categories")
      .delete()
      .eq("item_id", itemId)
      .eq("category_id", categoryId);

    if (error) throw error;
  };

  // Item-Tag relationship management
  const addTagToItem = async (itemId: string, tagId: string) => {
    const { data, error } = await client
      .from("inventory_item_tags")
      .insert({ item_id: itemId, tag_id: tagId })
      .select();

    if (error) throw error;
    return data;
  };

  const removeTagFromItem = async (itemId: string, tagId: string) => {
    const { error } = await client
      .from("inventory_item_tags")
      .delete()
      .eq("item_id", itemId)
      .eq("tag_id", tagId);

    if (error) throw error;
  };

  // Helper methods for bulk operations
  const removeAllCategoriesFromItem = async (itemId: string) => {
    const { error } = await client
      .from("inventory_item_categories")
      .delete()
      .eq("item_id", itemId);

    if (error) throw error;
  };

  const removeAllTagsFromItem = async (itemId: string) => {
    const { error } = await client
      .from("inventory_item_tags")
      .delete()
      .eq("item_id", itemId);

    if (error) throw error;
  };

  return {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    addItemToCategory,
    removeItemFromCategory,
    addTagToItem,
    removeTagFromItem,
    removeAllCategoriesFromItem,
    removeAllTagsFromItem,
  };
};
