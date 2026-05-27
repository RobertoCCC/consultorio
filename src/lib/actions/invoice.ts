"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export async function markInvoicePaid(id: string): Promise<void> {
  await verifySession();
  await prisma.invoice.update({
    where: { id },
    data: { status: "PAID" },
  });
  revalidatePath("/faturacao");
  revalidatePath(`/faturacao/${id}`);
  revalidatePath("/dashboard");
}

export async function voidInvoice(id: string): Promise<void> {
  await verifySession();
  await prisma.invoice.update({
    where: { id },
    data: { status: "VOID" },
  });
  revalidatePath("/faturacao");
  revalidatePath(`/faturacao/${id}`);
  revalidatePath("/dashboard");
}

export async function issueInvoice(id: string): Promise<void> {
  await verifySession();
  await prisma.invoice.update({
    where: { id },
    data: { status: "ISSUED" },
  });
  revalidatePath("/faturacao");
  revalidatePath(`/faturacao/${id}`);
  revalidatePath("/dashboard");
}
