import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceForm } from "@/components/service-form";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

type Params = Promise<{ id: string }>;

export default async function EditarServiçoPage({
  params,
}: {
  params: Params;
}) {
  await verifySession();
  const { id } = await params;

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/servicos/${service.id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Editar {service.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Atualize os dados do serviço.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ServiceForm service={service} />
        </CardContent>
      </Card>
    </div>
  );
}
