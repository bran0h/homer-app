import { ofetch } from "ofetch";
import { z } from "zod";
import type { WeatherApiResponse } from "~~/server/types";

const validator = z.object({
  lat: z.string(),
  lon: z.string(),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const props = await getValidatedQuery(event, validator.parse);

  const response = await ofetch<WeatherApiResponse>(
    `https://api.openweathermap.org/data/2.5/weather?lat=${props.lat}&lon=${props.lon}&appid=${config.weatherKey}&units=metric`
  );
  return response;
});
