import { z } from "zod";

/**
 * Schema de validacao do formulario de paciente.
 * Validacao apenas; normalizacao ("" -> null, parse de datas, strip de
 * espacos no NIF) e feita pela server action depois do parse.
 */
export const patientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto (minimo 2 caracteres)")
    .max(120, "Nome demasiado longo"),

  email: z
    .string()
    .trim()
    .max(120, "Email demasiado longo")
    .email("Email invalido")
    .or(z.literal(""))
    .optional(),

  phone: z.string().trim().max(40, "Telefone demasiado longo").optional(),

  birthDate: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Data invalida (formato YYYY-MM-DD)")
    .optional(),

  nif: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^(\d{9})?$/, "NIF tem de ter 9 digitos"))
    .optional(),

  address: z.string().trim().max(200, "Morada demasiado longa").optional(),

  notes: z.string().trim().max(1000, "Notas demasiado longas").optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;
