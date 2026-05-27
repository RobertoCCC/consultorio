import { z } from "zod";

const cuid = z
  .string()
  .min(1, "Campo obrigatorio")
  .regex(/^c[a-z0-9]{20,}$/, "ID invalido");

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
      "Data ou hora invalida",
    ),

  durationMinutes: z.coerce
    .number({ message: "Duracao invalida" })
    .int("Duracao tem de ser um numero inteiro")
    .min(5, "Duracao minima 5 minutos")
    .max(480, "Duracao maxima 8 horas"),

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
