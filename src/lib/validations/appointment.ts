import { z } from "zod";

const cuid = z
  .string()
  .min(1, "Campo obrigatório")
  .regex(/^c[a-z0-9]{20,}$/, "ID inválido");

export const appointmentSchema = z.object({
  patientId: cuid,
  serviceId: cuid,
  staffId: cuid,

  // HTML datetime-local input: "YYYY-MM-DDTHH:mm"
  startsAt: z
    .string()
    .min(1, "Data e hora obrigatorias")
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,
      "Data ou hora inválida",
    ),

  durationMinutes: z.coerce
    .number({ message: "Duração inválida" })
    .int("Duração tem de ser um número inteiro")
    .min(5, "Duração minima 5 minutos")
    .max(480, "Duração máxima 8 horas"),

  notes: z.string().trim().max(1000, "Notas demasiado longas").optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const APPOINTMENT_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type AppointmentStatusValue = (typeof APPOINTMENT_STATUSES)[number];
