<template>
  <UCard class="flex-1">
    <template #header>
      <div class="flex items-center space-x-2">
        <Icon name="i-lucide-calendar" class="text-yellow-500" />
        <h2 class="text-lg font-bold">{{ $t("dashboard.calendar.title") }}</h2>
      </div>
    </template>
    <UCalendar v-model="value" readonly />
    <template #footer>
      <p v-if="status === 'success'" class="text-end">
        {{ $t("dashboard.calendar.nameday") }}: {{ data?.name }}
      </p>
    </template>
  </UCard>
</template>
<script lang="ts" setup>
import { CalendarDate } from "@internationalized/date";
import { DateTime } from "luxon";

const today = DateTime.now();

const value = ref(
  new CalendarDate(today.year, today.month, today.day)
) as Ref<CalendarDate>;

const { data, status } = useFetch(
  `/api/calendar/nameday?date=${value.value.toString()}`
);
</script>
