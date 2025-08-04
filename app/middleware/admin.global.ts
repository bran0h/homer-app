export default defineNuxtRouteMiddleware((to) => {
  const { isAdmin } = useUser();
  if (to.path.startsWith("/admin") && !isAdmin.value) {
    return navigateTo(`/?error=unauthorized`, {
      replace: true,
    });
  }
});
