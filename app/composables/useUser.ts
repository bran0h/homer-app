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
  const isMember = computed(() => roles.value?.includes("member"));
  const isHost = computed(() => roles.value?.includes("host"));

  // Permission checks
  const canEditFridge = computed(() => isAdmin.value || isMember.value);
  const canViewFridge = computed(
    () => isAdmin.value || isMember.value || isHost.value
  );

  return {
    roles,
    rolesError,
    user,
    isAdmin,
    isMember,
    isHost,
    canEditFridge,
    canViewFridge,
    rolesStatus,
  };
};
