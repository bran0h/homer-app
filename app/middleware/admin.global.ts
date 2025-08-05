import { useUserService } from "~/services/useUserService";

export default defineNuxtRouteMiddleware(async (to) => {
  const userService = useUserService();
  const roles = await userService.getUserRoles();
  if (to.path.startsWith("/admin") && !roles.includes("admin")) {
    return navigateTo(`/?error=unauthorized`, {
      replace: true,
    });
  }
});
