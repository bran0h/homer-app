export const filterItems = (
  items: ItemWithRelations[],
  filters: {
    status?: string;
    category?: string;
    search?: string;
  }
) => {
  return (
    items?.filter((item) => {
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
