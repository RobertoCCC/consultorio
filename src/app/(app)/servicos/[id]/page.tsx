import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Pencil,
  Tag,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteServiceButton } from "@/components/delete-service-button";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatCents, formatDateTime } from "@/lib/formatters";

type Params = Promise<{ id: string }>;

const statusLabel: Record<string, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Concluida",
  CANCELLED: "Cancelada",
  NO_SHOW: "Faltou",
};

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SCHEDULED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  NO_SHOW: "outline",
};

export default async function ServicoDetailPage({
  params,
}: {
  params: Params;
}) {
  await verifySession();
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      _count: { select: { appointments: true } },
    },
  });

  if (!service) notFound();

  const [completedCount, recentAppointments, revenueAgg] = await Promise.all([
    prisma.appointment.count({
      where: { serviceId: id, status: "COMPLETED" },
    }),
    prisma.appointment.findMany({
      where: { serviceId: id },
      orderBy: { startsAt: "desc" },
      take: 6,
      include: {
        patient: { select: { id: true, name: true } },
        staff: { select: { name: true } },
      },
    }),
    prisma.invoiceLine.aggregate({
      _sum: { lineTotalCents: true },
      where: {
        serviceId: id,
        invoice: { status: "PAID" },
      },
    }),
  ]);

  const totalRevenueCents = revenueAgg._sum.lineTotalCents ?? 0;

  const kpis = [
    {
      label: "Marcacoes totais",
      value: String(service._count.appointments),
      icon: Calendar,
    },
    {
      label: "Concluidas",
      value: String(completedCount),
      icon: Wrench,
    },
    {
      label: "Receita gerada",
      value: formatCents(totalRevenueCents),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/servicos" />}
        >
          <ArrowLeft className="h-4 w-4" />
          Servicos
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/servicos/${service.id}/editar`} />}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <DeleteServiceButton
            serviceId={service.id}
            serviceName={service.name}
          />
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {service.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {service.description ?? "Sem descricao."}
          </p>
        </div>
        <Badge variant={service.active ? "secondary" : "outline"}>
          {service.active ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duracao
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {service.durationMinutes}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                min
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Preco
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {formatCents(service.priceCents)}
            </div>
          </CardContent>
        </Card>

        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {k.label}
              </CardTitle>
              <k.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Marcacoes recentes
          </CardTitle>
          <CardDescription>
            Ultimas {recentAppointments.length} marcacoes deste servico
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Sem marcacoes para este servico.
            </p>
          ) : (
            <ul className="divide-y -mx-6">
              {recentAppointments.map((app) => (
                <li
                  key={app.id}
                  className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <Link
                      href={`/pacientes/${app.patient.id}`}
                      className="font-medium hover:underline truncate"
                    >
                      {app.patient.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(app.startsAt)} • {app.staff.name}
                    </span>
                  </div>
                  <Badge variant={statusVariant[app.status]}>
                    {statusLabel[app.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
