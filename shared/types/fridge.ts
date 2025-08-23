import type { Database } from "./supabase.types";

// Generated types from Supabase
export type InventoryItem =
  Database["public"]["Tables"]["inventory_items"]["Row"];
export type InventoryCategory =
  Database["public"]["Tables"]["inventory_categories"]["Row"];
export type InventoryTag =
  Database["public"]["Tables"]["inventory_tags"]["Row"];
export type _InventoryItemHistory =
  Database["public"]["Tables"]["inventory_item_history"]["Row"];

export type ItemWithRelations = InventoryItem & {
  inventory_item_categories: {
    inventory_categories: InventoryCategory;
  }[];
  inventory_item_tags: {
    inventory_tags: InventoryTag;
  }[];
};

export type InventoryItemStatus = Database["public"]["Enums"]["item_status"];

export type InventoryItemUnit =
  | "pieces"
  | "kilogram"
  | "gram"
  | "liter"
  | "mililiter"
  | "table_spoon"
  | "tea_spoon";

export type CreateItemDTO =
  Database["public"]["Tables"]["inventory_items"]["Insert"];

export type UpdateItemDTO =
  Database["public"]["Tables"]["inventory_items"]["Update"];

export type CreateCategoryDTO =
  Database["public"]["Tables"]["inventory_categories"]["Insert"];

export type UpdateCategoryDTO =
  Database["public"]["Tables"]["inventory_categories"]["Update"];

export type CreateTagDTO =
  Database["public"]["Tables"]["inventory_tags"]["Insert"];

export type UpdateTagDTO =
  Database["public"]["Tables"]["inventory_tags"]["Update"];
