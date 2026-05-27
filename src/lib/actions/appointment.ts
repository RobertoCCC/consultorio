"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import {
  appointmentSchema,
  type AppointmentStatusValue,
  APPOINTMENT_STATUSES,
} from "@/lib/validations/appointment";

type AppointmentFormValues = {
  patientId: string;
  serviceId: string;
  staffId: string;
  startsAt: string;
  durationMinutes: string;
  notes: string;
};

export type AppointmentFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  values?: AppointmentFormValues;
};

function formToValues(formData: FormData): AppointmentFormValues {
  return {
    patientId: (formData.get("patientId") as string) ?? "",
    serviceId: (formData.get("serviceId") as string) ?? "",
    staffId: (formData.get("staffId") as string) ?? "",
    startsAt: (formData.get("startsAt") as string) ?? "",
    durationMinutes: (formData.get("durationMinutes") as string) ?? "",
    notes: (formData.get("notes") as string) ?? "",
  };
}

export async function createAppointment(
  _prev: AppointmentFormState | undefined,
  formData: FormData,
): Promise<AppointmentFormState> {
  await verifySession();

  const raw = formToValues(formData);
  const parsed = appointmentSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Verifique os campos.",
      values: raw,
    };
  }

  const data = parsed.data;
  const appointment = await prisma.appointment.create({
    data: {
      startsAt: new Date(data.startsAt),
      durationMinutes: data.durationMinutes,
      status: "SCHEDULED",
      patientId: data.patientId,
      serviceId: data.serviceId,
      staffId: data.staffId,
      notes: data.notes && data.notes !== "" ? data.notes : null,
    },
  });

  revalidatePath("/marcacoes");
  revalidatePath("/dashboard");
  redirect(`/marcacoes/${appointment.id}`);
}

export async function updateAppointment(
  id: string,
  _prev: AppointmentFormState | undefined,
  formData: FormData,
): Promise<AppointmentFormState> {
  await verifySession();

  const raw = formToValues(formData);
  const parsed = appointmentSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Verifique os campos.",
      values: raw,
    };
  }

  const data = parsed.data;
  await prisma.appointment.update({
    where: { id },
    data: {
      startsAt: new Date(data.startsAt),
      durationMinutes: data.durationMinutes,
      patientId: data.patientId,
      serviceId: data.serviceId,
      staffId: data.staffId,
      notes: data.notes && data.notes !== "" ? data.notes : null,
    },
  });

  revalidatePath("/marcacoes");
  revalidatePath(`/marcacoes/${id}`);
  revalidatePath("/dashboard");
  redirect(`/marcacoes/${id}`);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatusValue,
): Promise<void> {
  await verifySession();
  if (!APPOINTMENT_STATUSES.includes(status)) {
    throw new Error("Status invalido");
  }
  await prisma.appointment.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/marcacoes");
  revalidatePath(`/marcacoes/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteAppointment(id: string): Promise<void> {
  await verifySession();
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/marcacoes");
  revalidatePath("/dashboard");
  redirect("/marcacoes");
}
