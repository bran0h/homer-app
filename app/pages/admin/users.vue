<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">{{ $t("admin.users.title") }}</h1>
    <p v-if="!data || data.length === 0" class="text-gray-500">
      No users found.
    </p>
    <p v-if="error" class="text-red-500">
      Error loading users: {{ error.message }}
    </p>
    <UTable :data="data" :columns="columns" />
  </div>
</template>

<script lang="ts" setup>
import { UButton } from "#components";
import type { TableColumn } from "@nuxt/ui";
import { DateTime } from "luxon";
import type { VNode } from "vue";

const client = useSupabaseClient<Database>();
const { t, locale } = useI18n();
const toast = useToast();

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
type UserWithRoles = Profile & {
  user_roles: UserRole[];
};

const { data, error, refresh } = useAsyncData<UserWithRoles[]>(async () => {
  const { data, error } = await client
    .from("profiles")
    .select("*, user_roles(*)");
  if (error) {
    throw error;
  }
  return data;
});

const shortUid = (uid: string) => {
  return `${uid.slice(0, 4)}...${uid.slice(-4)}`;
};

const addUserRole = async (user: UserWithRoles, role: UserRole["role"]) => {
  const { error } = await client
    .from("user_roles")
    .insert([{ user_id: user.id, role }])
    .select();
  if (error) {
    toast.add({
      title: t("admin.users.addError", { role }),
      color: "error",
      duration: 5000,
    });
    return;
  }
  toast.add({
    title: t("admin.users.addSuccess", { role }),
    color: "success",
    duration: 5000,
  });
  await refresh();
};

const removeAllUserRoles = async (user: UserWithRoles) => {
  const { error } = await client
    .from("user_roles")
    .delete()
    .eq("user_id", user.id);
  if (error) {
    toast.add({
      title: t("admin.users.removeError"),
      color: "error",
      duration: 5000,
    });
    return;
  }
  toast.add({
    title: t("admin.users.removeSuccess"),
    color: "success",
    duration: 5000,
  });
  await refresh();
};

const renderUserActions = (user: UserWithRoles) => {
  if (user.id === useSupabaseUser().value?.id) {
    return [];
  }
  const isAdmin =
    user.user_roles.findIndex((role) => role.role === "admin") !== -1;
  if (isAdmin) {
    return h(
      UButton,
      {
        class: "cursor-pointer",
        color: "secondary",
        size: "sm",
        onClick: async () => removeAllUserRoles(user),
      },
      () => t("admin.users.remove")
    );
  }
  const actions: VNode[] = [];

  const isMember =
    user.user_roles.findIndex((role) => role.role === "member") !== -1;
  const isHost =
    user.user_roles.findIndex((role) => role.role === "host") !== -1;
  if (!isMember && !isHost) {
    actions.push(
      h(
        UButton,
        {
          class: "cursor-pointer",
          color: "primary",
          size: "sm",
          onClick: async () => addUserRole(user, "member"),
        },
        () => t("admin.users.addMember")
      )
    );
    actions.push(
      h(
        UButton,
        {
          class: "cursor-pointer",
          color: "primary",
          size: "sm",
          onClick: async () => addUserRole(user, "host"),
        },
        () => t("admin.users.addHost")
      )
    );
  }
  if (isMember || isHost) {
    actions.push(
      h(
        UButton,
        {
          class: "cursor-pointer",
          color: "secondary",
          size: "sm",
          onClick: async () => removeAllUserRoles(user),
        },
        () => t("admin.users.remove")
      )
    );

    actions.push(
      h(
        UButton,
        {
          class: "cursor-pointer",
          color: "warning",
          size: "sm",
          onClick: async () => addUserRole(user, "admin"),
        },
        () => t("admin.users.addAdmin")
      )
    );
  }
  return h("div", { class: "flex gap-2" }, actions);
};

const handleRoleChip = (role: string) => {
  if (role === "admin") {
    return h(
      "span",
      {
        class:
          "bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded",
      },
      t("admin.users.adminRole")
    );
  }
  if (role === "member") {
    return h(
      "span",
      {
        class:
          "bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded",
      },
      t("admin.users.memberRole")
    );
  }
  return h(
    "span",
    {
      class:
        "bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded",
    },
    t("admin.users.hostRole")
  );
};

const columns = computed<TableColumn<UserWithRoles>[]>(() => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => h("p", shortUid(row.original.id)),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "user_roles",
    header: t("admin.users.roles"),
    cell: ({ row }) =>
      h(
        "div",
        { class: "flex  gap-2" },
        row.original.user_roles.map(({ role }) => handleRoleChip(role))
      ),
  },
  {
    accessorKey: "created_at",
    header: t("admin.users.createdAt"),
    cell: ({ row }) =>
      h(
        "p",
        { class: "text-sm" },
        DateTime.fromISO(row.original.created_at).toLocaleString(
          DateTime.DATETIME_MED,
          {
            locale: locale.value,
          }
        )
      ),
  },
  {
    header: t("admin.users.actions"),
    cell: ({ row }) => renderUserActions(row.original),
  },
]);
</script>

<style></style>
