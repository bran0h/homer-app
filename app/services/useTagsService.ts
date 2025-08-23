import type { CreateTagDTO, UpdateTagDTO } from "~~/shared/types/fridge";

export const useTagsService = () => {
  const client = useSupabaseClient<Database>();

  const getTags = async () => {
    const { data, error } = await client
      .from("inventory_tags")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
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

  return {
    getTags,
    createTag,
    updateTag,
    deleteTag,
  };
};
