"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { patientSchema, type PatientInput } from "@/lib/validations/patient";

export type PatientFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  values?: {
    name?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    nif?: string;
    address?: string;
    notes?: string;
  };
};

function formToValues(formData: FormData): PatientFormState["values"] {
  return {
    name: (formData.get("name") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    phone: (formData.get("phone") as string) ?? "",
    birthDate: (formData.get("birthDate") as string) ?? "",
    nif: (formData.get("nif") as string) ?? "",
    address: (formData.get("address") as string) ?? "",
    notes: (formData.get("notes") as string) ?? "",
  };
}

/** Vazios -> null; datas -> Date. Para passar directamente ao Prisma. */
function normalize(data: PatientInput) {
  return {
    name: data.name,
    email: data.email && data.email !== "" ? data.email : null,
    phone: data.phone && data.phone !== "" ? data.phone : null,
    birthDate:
      data.birthDate && data.birthDate !== ""
        ? new Date(data.birthDate)
        : null,
    nif: data.nif && data.nif !== "" ? data.nif : null,
    address: data.address && data.address !== "" ? data.address : null,
    notes: data.notes && data.notes !== "" ? data.notes : null,
  };
}

export async function createPatient(
  _prev: PatientFormState | undefined,
  formData: FormData,
): Promise<PatientFormState> {
  await verifySession();

  const raw = formToValues(formData);
  const parsed = patientSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Verifique os campos.",
      values: raw,
    };
  }

  const patient = await prisma.patient.create({
    data: normalize(parsed.data),
  });

  revalidatePath("/pacientes");
  redirect(`/pacientes/${patient.id}`);
}

export async function updatePatient(
  id: string,
  _prev: PatientFormState | undefined,
  formData: FormData,
): Promise<PatientFormState> {
  await verifySession();

  const raw = formToValues(formData);
  const parsed = patientSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Verifique os campos.",
      values: raw,
    };
  }

  await prisma.patient.update({
    where: { id },
    data: normalize(parsed.data),
  });

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
  redirect(`/pacientes/${id}`);
}

export async function deletePatient(id: string): Promise<void> {
  await verifySession();
  await prisma.patient.delete({ where: { id } });
  revalidatePath("/pacientes");
  redirect("/pacientes");
}
