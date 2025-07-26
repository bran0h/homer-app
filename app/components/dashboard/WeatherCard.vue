<template>
  <UCard>
    <template #header>
      <div class="flex items-center space-x-2">
        <Icon :name="weatherIcon" class="text-yellow-500" />
        <h2 class="text-lg font-bold">{{ $t("dashboard.weather.title") }}</h2>
      </div>
    </template>
    <div class="p-4 flex flex-col items-center justify-center flex-1">
      <div v-if="isSupported">
        <!-- Handle loading -->
        <div v-if="!data" class="text-center">
          <p>{{ $t("dashboard.weather.loading") }}</p>
        </div>
        <!-- Display info about weather in my location -->
        <h2 class="text-4xl my-4 font-bold text-center">{{ data?.name }}</h2>
        <p v-if="data?.rain" class="text-center">
          {{ $t("dashboard.weather.rain") }}: {{ data.rain["1h"] || 0 }} mm
        </p>
        <template v-if="data?.main">
          <p class="text-center">
            {{ $t("dashboard.weather.temperature") }}: {{ data.main.temp }} °C
          </p>
          <p class="text-center">
            {{ $t("dashboard.weather.humidity") }}: {{ data.main.humidity }}%
          </p>
          <p class="text-center">
            {{ $t("dashboard.weather.windSpeed") }}: {{ data.wind.speed }} m/s
          </p>
          <p class="text-center">
            {{ $t("dashboard.weather.pressure") }}: {{ data.main.pressure }} hPa
          </p>
        </template>
      </div>
      <div v-else-if="error" class="text-red-500 text-center">
        {{ $t("dashboard.weather.error") }}: {{ error.message }}
      </div>
      <div v-else class="text-red-500 text-center">
        {{ $t("dashboard.weather.geolocationNotSupported") }}
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const { isSupported, error, coords } = useGeolocation();
const { data, execute } = useFetch(
  () =>
    `/api/weather?lat=${coords.value.latitude}&lon=${coords.value.longitude}`,
  {
    immediate: false,
  }
);

watch([isSupported, coords], ([supported, coordinates]) => {
  if (supported && coordinates) {
    execute();
  }
});

const weatherIcon = computed(() => {
  if (!data.value || !data.value.weather || data.value.weather.length === 0) {
    return "i-lucide-sun";
  }
  const condition = data.value.weather[0]?.main.toLowerCase();
  switch (condition) {
    case "clear":
      return "i-lucide-sun";
    case "clouds":
      return "i-lucide-cloud";
    case "rain":
      return "i-lucide-cloud-rain";
    case "snow":
      return "i-lucide-snowflake";
    default:
      return "i-lucide-sun";
  }
});
</script>
