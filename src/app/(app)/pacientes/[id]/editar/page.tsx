import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PatientForm } from "@/components/patient-form";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

type Params = Promise<{ id: string }>;

export default async function EditarPacientePage({
  params,
}: {
  params: Params;
}) {
  await verifySession();
  const { id } = await params;

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/pacientes/${patient.id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Editar {patient.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Atualize os dados do paciente.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PatientForm patient={patient} />
        </CardContent>
      </Card>
    </div>
  );
}
