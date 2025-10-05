import { z } from "zod";

export const ParamKey = z.enum([
  "T2M",
  "T2M_MAX",
  "T2M_MIN",
  "PRECTOTCORR",
  "WS2M",
  "WD2M",
  "RH2M",
  "T2MWET",
  "IMERG_PRECLIQUID_PROB",
  "CLRSKY_SFC_SW_DWN",
]);

const MeasurementUncertainty = z
  .object({
    margin_of_error: z.number(),
    confidence_interval_width: z.number(),
    confidence_level: z.string().regex(/^\d{2,3}%$/), // e.g., "95%"
  })
  .strict();
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

export const WeatherData = z
  .object({
    probabilities: z
      .object({
        very_hot: pct, // > 35°C
        very_cold: pct, // < -10°C
        very_windy: pct, // > 10 m/s
        very_wet: pct, // > 10 mm/day
        very_uncomfortable: pct, // > 80% RH
      })
      .strict(),

    predicted_values: z
      .object({
        T2M: z.number(), // °C
        T2M_MAX: z.number(), // °C
        T2M_MIN: z.number(), // °C
        PRECTOTCORR: z.number(), // mm/day
        WS2M: z.number(), // m/s
        WD2M: z.number().min(0).max(360), // degrees
        RH2M: z.number().min(0).max(100), // %
        T2M_trend: z.number(), // °C (derived)
        feeling: Feeling,
        precipitation: z.boolean(),
        air_quality: airQuality, // 0–10
      })
      .strict(),

    confidence: z
      .object({
        T2M: Confidence,
        T2M_MAX: Confidence,
        T2M_MIN: Confidence,
        PRECTOTCORR: Confidence,
        WS2M: Confidence,
        WD2M: Confidence,
        RH2M: Confidence,
        T2MWET: Confidence,
        IMERG_PRECLIQUID_PROB: Confidence,
        CLRSKY_SFC_SW_DWN: Confidence,
      })
      .strict(),

    /** ✅ New block */
    uncertainty: z
      .object({
        predicted_values: z
          .object({
            T2M: MeasurementUncertainty,
            T2M_MAX: MeasurementUncertainty,
            T2M_MIN: MeasurementUncertainty,
            PRECTOTCORR: MeasurementUncertainty,
            WS2M: MeasurementUncertainty,
            WD2M: MeasurementUncertainty,
            RH2M: MeasurementUncertainty,
            T2MWET: MeasurementUncertainty,
            IMERG_PRECLIQUID_PROB: MeasurementUncertainty,
            CLRSKY_SFC_SW_DWN: MeasurementUncertainty,
          })
          .strict(),
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
            T2M_MIN: nonNegInt,
            PRECTOTCORR: nonNegInt,
            WS2M: nonNegInt,
            WD2M: nonNegInt,
            RH2M: nonNegInt,
            T2MWET: nonNegInt,
            IMERG_PRECLIQUID_PROB: nonNegInt,
            CLRSKY_SFC_SW_DWN: nonNegInt,
          })
          .strict(),

        parameters_requested: z.array(ParamKey).nonempty(),

        target_date: targetDate, // "MM/DD"
        target_month: z.number().int().min(1).max(12),
        target_day: z.number().int().min(1).max(31),
        tolerance_days: z.number().int().min(0),
      })
      .strict(),
  })
  .strict();

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