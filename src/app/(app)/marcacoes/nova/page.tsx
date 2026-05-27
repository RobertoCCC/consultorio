import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentForm } from "@/components/appointment-form";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

type SearchParams = Promise<{ patientId?: string }>;

export default async function NovaMarcacaoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await verifySession();
  const { patientId } = await searchParams;

  const [patients, services, staff] = await Promise.all([
    prisma.patient.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, durationMinutes: true },
    }),
    prisma.user.findMany({
      where: { OR: [{ role: "DOCTOR" }, { role: "ADMIN" }] },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/marcacoes" />}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Nova marcacao
        </h2>
        <p className="text-sm text-muted-foreground">
          Seleccione paciente, servico e staff. A duracao e preenchida
          automaticamente a partir do servico.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <AppointmentForm
            patients={patients}
            services={services}
            staff={staff}
            presetPatientId={patientId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
