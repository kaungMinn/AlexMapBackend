import { Types } from "mongoose";
import { z } from "zod";

const latLonSchema = z.object({
    lat: z.number({
      required_error: "Latitude is required",
      invalid_type_error: "Latitude must be a number"
    })
    .min(-90, { message: "Latitude must be between -90 and 90" })
    .max(90, { message: "Latitude must be between -90 and 90" }),
    
    lon: z.number({
      required_error: "Longitude is required",
      invalid_type_error: "Longitude must be a number"
    })
    .min(-180, { message: "Longitude must be between -180 and 180" })
    .max(180, { message: "Longitude must be between -180 and 180" })
  });


  export const latSchema = z.union([
    z.string()
      .trim()
      .regex(/^-?\d{1,3}(\.\d+)?$/)
      .transform(Number)
      .pipe(z.number().min(-90).max(90)),
    z.number().min(-90).max(90)
  ]);

  export const lonSchema =  z.union([
    z.string()
      .trim()
      .regex(/^-?\d{1,3}(\.\d+)?$/)
      .transform(Number)
      .pipe(z.number().min(-180).max(180)),
    z.number().min(-180).max(180)
  ]);

export const nodeValidation = z.object({
    _id: z.string().optional(),
    name: z.string().min(1, "Location name is required"),
    displayName: z.string().min(1, "Location dispaly name is required"),
    desc: z.string().optional(),
    lat: latSchema,
    lon: lonSchema,
});

