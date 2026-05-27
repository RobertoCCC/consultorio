import Link from "next/link";
import { endOfDay, endOfWeek, startOfDay, startOfWeek } from "date-fns";
import { CalendarDays, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatDateTime } from "@/lib/formatters";

type SearchParams = Promise<{ status?: string; period?: string }>;

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

const ALL_STATUS = "all";
const STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const PERIODS = [
  { key: "future", label: "Futuras" },
  { key: "today", label: "Hoje" },
  { key: "week", label: "Esta semana" },
  { key: "past", label: "Passadas" },
  { key: "all", label: "Todas" },
];

function buildPeriodFilter(period: string | undefined) {
  const now = new Date();
  switch (period) {
    case "today":
      return { startsAt: { gte: startOfDay(now), lte: endOfDay(now) } };
    case "week":
      return {
        startsAt: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      };
    case "past":
      return { startsAt: { lt: now } };
    case "all":
      return {};
    case "future":
    default:
      return { startsAt: { gte: now } };
  }
}

export default async function MarcacoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await verifySession();
  const { status: statusParam, period: periodParam } = await searchParams;

  const status = statusParam ?? ALL_STATUS;
  const period = periodParam ?? "future";

  const periodFilter = buildPeriodFilter(period);
  const statusFilter =
    status !== ALL_STATUS && STATUSES.includes(status)
      ? { status: status as "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" }
      : {};

  const appointments = await prisma.appointment.findMany({
    where: { ...periodFilter, ...statusFilter },
    orderBy: { startsAt: period === "past" ? "desc" : "asc" },
    include: {
      patient: { select: { id: true, name: true } },
      service: { select: { name: true } },
      staff: { select: { name: true } },
    },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Marcacoes</h2>
          <p className="text-sm text-muted-foreground">
            {appointments.length}{" "}
            {appointments.length === 1 ? "marcacao" : "marcacoes"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            render={<Link href="/marcacoes/calendario" />}
          >
            <CalendarDays className="h-4 w-4" />
            Ver calendario
          </Button>
          <Button render={<Link href="/marcacoes/nova" />}>
            <Plus className="h-4 w-4" />
            Nova marcacao
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <FilterRow label="Periodo">
          {PERIODS.map((p) => (
            <FilterChip
              key={p.key}
              active={p.key === period}
              href={buildHref({ period: p.key, status })}
              label={p.label}
            />
          ))}
        </FilterRow>
        <FilterRow label="Estado">
          <FilterChip
            active={status === ALL_STATUS}
            href={buildHref({ period, status: ALL_STATUS })}
            label="Todos"
          />
          {STATUSES.map((s) => (
            <FilterChip
              key={s}
              active={s === status}
              href={buildHref({ period, status: s })}
              label={statusLabel[s]}
            />
          ))}
        </FilterRow>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data e hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Servico</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead className="text-right">Duracao</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  Sem marcacoes neste filtro.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((app) => (
                <TableRow key={app.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link
                      href={`/marcacoes/${app.id}`}
                      className="hover:underline tabular-nums"
                    >
                      {formatDateTime(app.startsAt)}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/pacientes/${app.patient.id}`}
                      className="hover:underline"
                    >
                      {app.patient.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {app.service.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {app.staff.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {app.durationMinutes} min
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[app.status]}>
                      {statusLabel[app.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function buildHref({
  period,
  status,
}: {
  period: string;
  status: string;
}): string {
  const sp = new URLSearchParams();
  if (period !== "future") sp.set("period", period);
  if (status !== ALL_STATUS) sp.set("status", status);
  const s = sp.toString();
  return s ? `/marcacoes?${s}` : "/marcacoes";
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs uppercase tracking-wide text-muted-foreground shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium"
          : "rounded-full bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground px-3 py-1 text-xs transition-colors"
      }
    >
      {label}
    </Link>
  );
}
