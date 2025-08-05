export const useUserService = () => {
  const user = useSupabaseUser();
  const client = useSupabaseClient<Database>();

  const getUserRoles = async () => {
    if (!user.value) return [];
    const { data: userRolesRaw, error } = await client
      .from("user_roles")
      .select("role")
      .eq("user_id", user.value!.id);

    if (error) {
      throw error;
    }

    return userRolesRaw?.map((role) => role.role) || [];
  };

  return {
    user,
    getUserRoles,
  };
};
