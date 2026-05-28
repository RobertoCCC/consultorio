import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Pencil,
  StickyNote,
  User,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppointmentStatusActions } from "@/components/appointment-status-actions";
import { DeleteAppointmentButton } from "@/components/delete-appointment-button";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatDateTime } from "@/lib/formatters";
import type { AppointmentStatusValue } from "@/lib/validations/appointment";

type Params = Promise<{ id: string }>;

const statusLabel: Record<string, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Concluída",
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

export default async function MarcacaoDetailPage({
  params,
}: {
  params: Params;
}) {
  await verifySession();
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true, phone: true, nif: true } },
      service: { select: { id: true, name: true, priceCents: true } },
      staff: { select: { name: true } },
    },
  });

  if (!appointment) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/marcacoes" />}
        >
          <ArrowLeft className="h-4 w-4" />
          Marcações
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/marcacoes/${appointment.id}/editar`} />}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <DeleteAppointmentButton appointmentId={appointment.id} />
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Marcação de {appointment.patient.name}
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatDateTime(appointment.startsAt)} • {appointment.durationMinutes}{" "}
            min
          </p>
        </div>
        <Badge variant={statusVariant[appointment.status]}>
          {statusLabel[appointment.status]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accoes</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentStatusActions
            appointmentId={appointment.id}
            status={appointment.status as AppointmentStatusValue}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Data e hora"
              value={
                <span className="tabular-nums">
                  {formatDateTime(appointment.startsAt)}
                </span>
              }
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Duração"
              value={`${appointment.durationMinutes} min`}
            />
            <Separator />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Paciente"
              value={
                <Link
                  href={`/pacientes/${appointment.patient.id}`}
                  className="font-medium hover:underline"
                >
                  {appointment.patient.name}
                </Link>
              }
            />
            <InfoRow
              icon={<Wrench className="h-4 w-4" />}
              label="Serviço"
              value={
                <Link
                  href={`/servicos/${appointment.service.id}`}
                  className="hover:underline"
                >
                  {appointment.service.name}
                </Link>
              }
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Staff"
              value={appointment.staff.name}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointment.notes ? (
              <p className="whitespace-pre-wrap text-sm">{appointment.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem notas para esta marcação.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="grid gap-0.5 flex-1 min-w-0">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}
