import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentForm } from "@/components/appointment-form";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

type Params = Promise<{ id: string }>;

export default async function EditarMarcacaoPage({
  params,
}: {
  params: Params;
}) {
  await verifySession();
  const { id } = await params;

  const [appointment, patients, services, staff] = await Promise.all([
    prisma.appointment.findUnique({ where: { id } }),
    prisma.patient.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.service.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, durationMinutes: true },
    }),
    prisma.user.findMany({
      where: { OR: [{ role: "DOCTOR" }, { role: "ADMIN" }] },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!appointment) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/marcacoes/${appointment.id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Editar marcacao
        </h2>
        <p className="text-sm text-muted-foreground">
          Actualize os dados da marcacao.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <AppointmentForm
            appointment={appointment}
            patients={patients}
            services={services}
            staff={staff}
          />
        </CardContent>
      </Card>
    </div>
  );
}
