import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PatientForm } from "@/components/patient-form";
import { verifySession } from "@/lib/dal";

export default async function NovoPacientePage() {
  await verifySession();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/pacientes" />}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Novo paciente
        </h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados do paciente. Apenas o nome e obrigatório.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PatientForm />
        </CardContent>
      </Card>
    </div>
  );
}
