"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { serviceSchema } from "@/lib/validations/service";

type ServiceFormValues = {
  name: string;
  description: string;
  durationMinutes: string;
  priceEur: string;
  active: string;
};

export type ServiceFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  values?: ServiceFormValues;
};

function formToValues(formData: FormData): ServiceFormValues {
  return {
    name: (formData.get("name") as string) ?? "",
    description: (formData.get("description") as string) ?? "",
    durationMinutes: (formData.get("durationMinutes") as string) ?? "",
    priceEur: (formData.get("priceEur") as string) ?? "",
    active: formData.has("active") ? "on" : "",
  };
}

export async function createService(
  _prev: ServiceFormState | undefined,
  formData: FormData,
): Promise<ServiceFormState> {
  await verifySession();

  const raw = formToValues(formData);
  const parsed = serviceSchema.safeParse({
    name: raw.name,
    description: raw.description,
    durationMinutes: raw.durationMinutes,
    priceEur: raw.priceEur,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Verifique os campos.",
      values: raw,
    };
  }

  const data = parsed.data;
  const service = await prisma.service.create({
    data: {
      name: data.name,
      description: data.description && data.description !== "" ? data.description : null,
      durationMinutes: data.durationMinutes,
      priceCents: Math.round(data.priceEur * 100),
      active: formData.has("active"),
    },
  });

  revalidatePath("/servicos");
  redirect(`/servicos/${service.id}`);
}

export async function updateService(
  id: string,
  _prev: ServiceFormState | undefined,
  formData: FormData,
): Promise<ServiceFormState> {
  await verifySession();

  const raw = formToValues(formData);
  const parsed = serviceSchema.safeParse({
    name: raw.name,
    description: raw.description,
    durationMinutes: raw.durationMinutes,
    priceEur: raw.priceEur,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Verifique os campos.",
      values: raw,
    };
  }

  const data = parsed.data;
  await prisma.service.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description && data.description !== "" ? data.description : null,
      durationMinutes: data.durationMinutes,
      priceCents: Math.round(data.priceEur * 100),
      active: formData.has("active"),
    },
  });

  revalidatePath("/servicos");
  revalidatePath(`/servicos/${id}`);
  redirect(`/servicos/${id}`);
}

function isFkConstraintError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: unknown }).code === "P2003"
  );
}

export async function deleteService(id: string): Promise<void> {
  await verifySession();
  try {
    await prisma.service.delete({ where: { id } });
  } catch (e) {
    if (isFkConstraintError(e)) {
      throw new Error("FK_CONSTRAINT");
    }
    throw e;
  }
  revalidatePath("/servicos");
  redirect("/servicos");
}
