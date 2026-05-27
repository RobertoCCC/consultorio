import Link from "next/link";
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { Calendar, Receipt, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatCents, formatDateTime } from "@/lib/formatters";

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

export default async function DashboardPage() {
  await verifySession();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    appointmentsToday,
    appointmentsTodayPending,
    totalPatients,
    monthRevenue,
    pendingInvoices,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        startsAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.appointment.count({
      where: {
        startsAt: { gte: todayStart, lte: todayEnd },
        status: "SCHEDULED",
      },
    }),
    prisma.patient.count(),
    prisma.invoice.aggregate({
      _sum: { totalCents: true },
      where: {
        status: "PAID",
        issuedAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.invoice.count({ where: { status: "ISSUED" } }),
    prisma.appointment.findMany({
      where: { startsAt: { gte: now }, status: "SCHEDULED" },
      orderBy: { startsAt: "asc" },
      take: 6,
      include: {
        patient: { select: { id: true, name: true } },
        service: { select: { name: true } },
        staff: { select: { name: true } },
      },
    }),
  ]);

  const monthRevenueCents = monthRevenue._sum.totalCents ?? 0;

  const stats = [
    {
      label: "Marcacoes hoje",
      value: String(appointmentsToday),
      hint: `${appointmentsTodayPending} por confirmar`,
      icon: Calendar,
    },
    {
      label: "Pacientes",
      value: String(totalPatients),
      hint: "Total na ficha",
      icon: Users,
      href: "/pacientes",
    },
    {
      label: "Receita do mes",
      value: formatCents(monthRevenueCents),
      hint: "Faturas pagas",
      icon: TrendingUp,
    },
    {
      label: "Faturas pendentes",
      value: String(pendingInvoices),
      hint: "Por receber",
      icon: Receipt,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Visao geral do consultorio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Inner = (
            <Card
              className={
                stat.href
                  ? "transition-colors hover:border-foreground/20"
                  : undefined
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {Inner}
            </Link>
          ) : (
            <div key={stat.label}>{Inner}</div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proximas marcacoes</CardTitle>
          <CardDescription>
            Lista das marcacoes agendadas a partir de agora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Sem marcacoes agendadas.
            </p>
          ) : (
            <ul className="divide-y -mx-6">
              {upcomingAppointments.map((app) => (
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
                    <span className="text-xs text-muted-foreground truncate">
                      {app.service.name} • {app.staff.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {formatDateTime(app.startsAt)}
                    </span>
                    <Badge variant={statusVariant[app.status]}>
                      {statusLabel[app.status]}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
