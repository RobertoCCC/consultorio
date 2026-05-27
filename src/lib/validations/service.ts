import { z } from "zod";

/**
 * Schema do formulario de servico.
 * priceEur (string) e convertido para priceCents pela server action.
 */
export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto (minimo 2 caracteres)")
    .max(120, "Nome demasiado longo"),

  description: z
    .string()
    .trim()
    .max(500, "Descricao demasiado longa")
    .optional(),

  durationMinutes: z.coerce
    .number({ message: "Duracao tem de ser um numero" })
    .int("Duracao tem de ser um numero inteiro")
    .min(5, "Duracao minima 5 minutos")
    .max(480, "Duracao maxima 8 horas (480 min)"),

  priceEur: z.coerce
    .number({ message: "Preco invalido" })
    .min(0, "Preco nao pode ser negativo")
    .max(100000, "Preco demasiado alto"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
