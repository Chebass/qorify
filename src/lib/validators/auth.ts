import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Ingresa un correo válido");

export const passwordSchema = z
  .string()
  .min(10, "Mínimo 10 caracteres")
  .max(72, "Máximo 72 caracteres")
  .regex(/[a-z]/, "Incluye una minúscula")
  .regex(/[A-Z]/, "Incluye una mayúscula")
  .regex(/[0-9]/, "Incluye un número");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña").max(72),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Ingresa tu nombre").max(60),
  email: emailSchema,
  password: passwordSchema,
});
