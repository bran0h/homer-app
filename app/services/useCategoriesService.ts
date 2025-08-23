import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "~~/shared/types/fridge";

export const useCategoriesService = () => {
  const client = useSupabaseClient<Database>();

  const getCategories = async () => {
    const { data, error } = await client
      .from("inventory_categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  };

  const getCategoryUsageCount = async (categoryId: string) => {
    const { data, error } = await client
      .from("inventory_item_categories")
      .select("id", { count: "exact" })
      .eq("category_id", categoryId);
    if (error) throw error;
    return data?.length || 0;
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

  return {
    getCategories,
    getCategoryUsageCount,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
