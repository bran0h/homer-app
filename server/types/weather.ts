interface WeatherCoordinates {
  lon: number;
  lat: number;
}

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

interface WindData {
  speed: number;
  deg: number;
  gust?: number;
}

interface RainData {
  "1h"?: number;
  "3h"?: number;
}

interface SnowData {
  "1h"?: number;
  "3h"?: number;
}

interface CloudData {
  all: number;
}

interface SystemData {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface WeatherApiResponse {
  coord: WeatherCoordinates;
  weather: WeatherCondition[];
  base: string;
  main: MainWeatherData;
  visibility: number;
  wind: WindData;
  rain?: RainData;
  snow?: SnowData;
  clouds: CloudData;
  dt: number;
  sys: SystemData;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}
