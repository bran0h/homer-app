export const useUser = () => {
  const user = useSupabaseUser();
  const client = useSupabaseClient<Database>();

  const {
    data: roles,
    error: rolesError,
    status: rolesStatus,
  } = useAsyncData(
    async () => {
      if (!user.value) return [];
      const { data: userRolesRaw, error } = await client
        .from("user_roles")
        .select("role")
        .eq("user_id", user.value!.id);

      if (error) {
        throw error;
      }

      return userRolesRaw?.map((role) => role.role) || [];
    },
    {
      watch: [user],
    }
  );

  const isAdmin = computed(() => {
    return roles.value?.includes("admin");
  });

  return {
    roles,
    rolesError,
    user,
    isAdmin,
    rolesStatus,
  };
};
