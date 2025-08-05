import { useUserService } from "../services/useUserService";

export const useUser = () => {
  const user = useSupabaseUser();
  const userService = useUserService();

  const {
    data: roles,
    error: rolesError,
    status: rolesStatus,
  } = useAsyncData(async () => userService.getUserRoles(), {
    watch: [user],
  });

  const isAdmin = computed(() => roles.value?.includes("admin"));

  return {
    roles,
    rolesError,
    user,
    isAdmin,
    rolesStatus,
  };
};
