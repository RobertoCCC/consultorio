import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceForm } from "@/components/service-form";
import { verifySession } from "@/lib/dal";

export default async function NovoServicoPage() {
  await verifySession();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/servicos" />}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Novo servico</h2>
        <p className="text-sm text-muted-foreground">
          Adiciona um servico ao catalogo (consulta, exame, tratamento...).
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ServiceForm />
        </CardContent>
      </Card>
    </div>
  );
}
