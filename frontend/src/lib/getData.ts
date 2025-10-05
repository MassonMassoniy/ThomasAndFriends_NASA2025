import { z } from "zod";

export const ParamKey = z.enum(["T2M", "T2M_MAX", "PRECTOTCORR", "WS2M", "RH2M"]);
export type ParamKey = z.infer<typeof ParamKey>;

export const Confidence = z.enum(["low", "medium", "high"]);
export type Confidence = z.infer<typeof Confidence>;

export const Feeling = z.enum(["Hot", "Cold"]);
export type Feeling = z.infer<typeof Feeling>;

/** helpers */
const pct = z.number().min(0).max(100);                // percentage (0–100)
const nonNegInt = z.number().int().min(0);             // count ≥ 0
const airQuality = z.number().int().min(0).max(10);    // 0–10 inclusive
const lat = z.number().min(-90).max(90);
const lon = z.number().min(-180).max(180);

/** "MM/DD" with leading zero optional on month/day (e.g., 7/5 or 07/05) */
const targetDate = z
  .string()
  .regex(/^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])$/, 'Expected "MM/DD"');

const WeatherData = z.object({
probabilities: z
    .object({
      very_hot: pct,
      very_cold: pct,
      very_windy: pct,
      very_wet: pct,
      very_uncomfortable: pct,
    })
    .strict(),

  predicted_values: z
    .object({
      T2M: z.number(),           // °C
      T2M_MAX: z.number(),       // °C
      T2M_MIN: z.number(),       // °C
      PRECTOTCORR: z.number(),   // mm/day
      WS2M: z.number(),          // m/s
      RH2M: z.number().min(0).max(100), // %
      feeling: Feeling,
      precipitation: z.boolean(), 
      air_quality: airQuality,   // 0–10
    })
    .strict(),

  confidence: z
    .object({
      T2M: Confidence,
      T2M_MAX: Confidence,
      PRECTOTCORR: Confidence,
      WS2M: Confidence,
      RH2M: Confidence,
    })
    .strict(),

  metadata: z
    .object({
      location: z
        .object({
          longitude: lon,
          latitude: lat,
        })
        .strict(),

      data_points_used: z
        .object({
          T2M: nonNegInt,
          T2M_MAX: nonNegInt,
          PRECTOTCORR: nonNegInt,
          WS2M: nonNegInt,
          RH2M: nonNegInt,
        })
        .strict(),

      parameters_requested: z.array(ParamKey).nonempty(),

      target_date: targetDate,
      target_month: z.number().int().min(1).max(12),
      target_day: z.number().int().min(1).max(31),
      tolerance_days: z.number().int().min(0),
    })
    .strict(),
}).strict();

export type WeatherData = z.infer<typeof WeatherData>;

// gets the json file from api and validates it
// return
// date: String YYYYMMDD
export async function getWeatherData(latitude: number, longitude: number, date: string) {
    const result = await fetch('/api/getWeather?latitude=${latitude}&longitude=${longitude}&date=${date}', {
        next: { revalidate: 360000, tags: ["weather"]},
    });

    const json = await result.json;
    return WeatherData.parse(json);
}