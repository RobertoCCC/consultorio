import { z } from "zod";

/**
 * Schema do formulario de servico.
 * priceEur (string) e convertido para priceCents pela server action.
 */
export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto (mínimo 2 caracteres)")
    .max(120, "Nome demasiado longo"),

  description: z
    .string()
    .trim()
    .max(500, "Descricao demasiado longa")
    .optional(),

  durationMinutes: z.coerce
    .number({ message: "Duração tem de ser um numero" })
    .int("Duração tem de ser um número inteiro")
    .min(5, "Duração minima 5 minutos")
    .max(480, "Duração máxima 8 horas (480 min)"),

  priceEur: z.coerce
    .number({ message: "Preço inválido" })
    .min(0, "Preço não pode ser negativo")
    .max(100000, "Preço demasiado alto"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
