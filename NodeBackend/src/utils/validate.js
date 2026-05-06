// utils/validate.js
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const createDeviceSchema = z.object({
  device_code: z
    .string()
    .min(1, "device_code is required")
    .max(50)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "device_code must be alphanumeric, underscores or hyphens only",
    ),
  location: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

export const updateDeviceSchema = z
  .object({
    location: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
  })
  .refine(
    (data) => data.location !== undefined || data.description !== undefined,
    {
      message: "Nothing to update",
    },
  );

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = new Error("Validation failed");
      err.status = 400;
      err.errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return next(err);
    }
    req.body = result.data;
    next();
  };
}
