import type {
  CreateCategoryDTO,
  CreateItemDTO,
  CreateTagDTO,
  UpdateCategoryDTO,
  UpdateItemDTO,
  UpdateTagDTO,
} from "~~/shared/types/fridge";

export const useInventoryService = () => {
  const client = useSupabaseClient<Database>();
  const _user = useSupabaseUser();

  // Items
  const getItems = async (filters?: {
    status?: Database["public"]["Enums"]["item_status"];
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

  const getCategories = async () => {
    const { data, error } = await client
      .from("inventory_categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  };

  const getTags = async () => {
    const { data, error } = await client
      .from("inventory_tags")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
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

  const createCategory = async (category: CreateCategoryDTO) => {
    const { data, error } = await client
      .from("inventory_categories")
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCategory = async (id: string, category: UpdateCategoryDTO) => {
    const { data, error } = await client
      .from("inventory_categories")
      .update(category)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await client
      .from("inventory_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
  };

  const createTag = async (tag: CreateTagDTO) => {
    const { data, error } = await client
      .from("inventory_tags")
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTag = async (id: string, tag: UpdateTagDTO) => {
    const { data, error } = await client
      .from("inventory_tags")
      .update(tag)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTag = async (id: string) => {
    const { error } = await client.from("inventory_tags").delete().eq("id", id);

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
    // Items
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,

    // Categories
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Tags
    getTags,
    createTag,
    updateTag,
    deleteTag,

    // Relationships
    addItemToCategory,
    removeItemFromCategory,
    addTagToItem,
    removeTagFromItem,

    // Bulk operations
    removeAllCategoriesFromItem,
    removeAllTagsFromItem,
  };
};
