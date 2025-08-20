import SunCalc from 'suncalc';
import { fetchWeatherApi } from "openmeteo";

export interface MarineDataPoint {
  time: Date;
  tideHeight: number | null;
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

export async function getMarineData(latitude: number, longitude: number) {
  const params = {
    latitude,
    longitude,
    hourly: [
      "sea_level_height_msl",
      "wave_height",
      "wave_direction",
      "wave_period"
    ],
    timezone: "auto",
    forecast_days: 2
  };

  const url = "https://marine-api.open-meteo.com/v1/marine";
  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const hourly = response.hourly();

  const hours = (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval();
  const times = [...Array(hours)].map((_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000));

  const tideHeights = hourly.variables(0)?.valuesArray() || [];
  const waveHeights = hourly.variables(1)?.valuesArray() || [];
  const waveDirections = hourly.variables(2)?.valuesArray() || [];
  const wavePeriods = hourly.variables(3)?.valuesArray() || [];

  const marineData: MarineDataPoint[] = times.map((time, i) => ({
    time,
    tideHeight: tideHeights[i] ?? null,
    waveHeight: waveHeights[i] ?? null,
    waveDirection: waveDirections[i] ?? null,
    wavePeriod: wavePeriods[i] ?? null,
  }));

  // ✅ Replace daily API call with SunCalc
  const today = new Date();
  const sun = SunCalc.getTimes(today, latitude, longitude);
  const sunTimes: SunTimes = {
    sunrise: sun.sunrise,
    sunset: sun.sunset,
  };

  return { marineData, sunTimes };
}
