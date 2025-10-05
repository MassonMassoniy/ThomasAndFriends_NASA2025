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

export const WeatherData = z.object({
  probabilities: z.object({
    very_hot: pct,
    very_cold: pct,
    very_windy: pct,
    very_wet: pct,
    very_uncomfortable: pct,
  }).strict(),

  predicted_values: z.object({
    T2M: z.number(),
    T2M_MAX: z.number(),
    T2M_MIN: z.number(),
    PRECTOTCORR: z.number(),
    WS2M: z.number(),
    WD2M: z.number().min(0).max(360),
    RH2M: z.number().min(0).max(100),
    T2M_trend: z.number(),
    feeling: Feeling,
    precipitation: z.boolean(),
    air_quality: airQuality,

    // ✅ add the new ones seen in your JSON
    T2MWET: z.number(),
    IMERG_PRECLIQUID_PROB: z.number(),   // (often -999 sentinel is fine; it’s still a number)
    CLRSKY_SFC_SW_DWN: z.number(),
  }).strict(),

  confidence: z.object({
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
  }).strict(),

  uncertainty: z.object({
    predicted_values: z.object({
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
    }).strict(),
  }).strict(),

  metadata: z.object({
    location: z.object({
      longitude: lon,
      latitude: lat,
    }).strict(),

    data_points_used: z.object({
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
    }).strict(),

    parameters_requested: z.array(z.enum([
      "T2M","T2M_MAX","T2M_MIN","PRECTOTCORR","WS2M","WD2M","RH2M",
      "T2MWET","IMERG_PRECLIQUID_PROB","CLRSKY_SFC_SW_DWN"
    ])).nonempty(),

    // // ✅ accept new format
    // target_date: z.string,
    // target_month: z.number().int().min(1).max(12),
    // target_day: z.number().int().min(1).max(31),
    // tolerance_days: z.number().int().min(0),

    // ✅ seen in your JSON
    derived_parameters: z.array(z.string()).default([]).optional(),
  }),

  // ✅ if your root sometimes contains weather_conditions, allow it (optional)
  weather_conditions: z.any().optional(),
});

export type WeatherData = z.infer<typeof WeatherData>;

// gets the json file from api and validates it
// return
// date: String YYYYMMDD
export async function getWeatherData(latitude: number, longitude: number, date: string) {
    const result = await fetch(`https://drmy-server-fast.tail8afd19.ts.net/api/getWeather?latitude=${latitude}&longitude=${longitude}&date=${date}`, {
        next: { revalidate: 360000, tags: ["weather"]},
    });
    console.log(await result)
    const json = await result.json();
    console.log(json);
    return WeatherData.parse(json);
}