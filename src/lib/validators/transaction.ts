import { z } from "zod";
import { isDate } from "@/lib/dates";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], { message: "Elige gasto o ingreso" }),
  amount: z
    .string()
    .trim()
    .transform((s) => Number(s.replace(",", ".")))
    .pipe(
      z
        .number({ message: "Monto inválido" })
        .positive("El monto debe ser mayor a 0")
        .max(9_999_999.99, "Monto demasiado grande"),
    ),
  occurred_on: z.string().refine(isDate, "Fecha inválida"),
  account_id: z.string().uuid("Elige un medio de pago"),
  category_id: z.string().uuid().optional().or(z.literal("")),
  note: z.string().trim().max(200, "Máximo 200 caracteres").optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
