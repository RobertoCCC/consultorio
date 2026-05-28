import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  StickyNote,
  User,
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
import { Separator } from "@/components/ui/separator";
import { DeletePatientButton } from "@/components/delete-patient-button";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import {
  ageFromBirthDate,
  dash,
  formatCents,
  formatDate,
  formatDateTime,
  formatNIF,
} from "@/lib/formatters";

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

const invoiceStatusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  ISSUED: "Emitida",
  PAID: "Paga",
  VOID: "Anulada",
};

export default async function PacienteDetailPage({
  params,
}: {
  params: Params;
}) {
  await verifySession();
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { startsAt: "desc" },
        take: 5,
        include: {
          service: { select: { name: true } },
          staff: { select: { name: true } },
        },
      },
      invoices: {
        orderBy: { issuedAt: "desc" },
        take: 5,
      },
    },
  });

  if (!patient) notFound();

  const age = ageFromBirthDate(patient.birthDate);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/pacientes" />}
        >
          <ArrowLeft className="h-4 w-4" />
          Pacientes
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/pacientes/${patient.id}/editar`} />}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <DeletePatientButton
            patientId={patient.id}
            patientName={patient.name}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {patient.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Paciente desde {formatDate(patient.createdAt)}
          {age !== null ? ` • ${age} anos` : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Informacao</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="NIF"
              value={
                <span className="font-mono">{formatNIF(patient.nif)}</span>
              }
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Data nascimento"
              value={formatDate(patient.birthDate)}
            />
            <Separator />
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={dash(patient.email)}
            />
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Telefone"
              value={dash(patient.phone)}
            />
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Morada"
              value={dash(patient.address)}
            />
            {patient.notes ? (
              <>
                <Separator />
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <StickyNote className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">
                      Notas
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">
                    {patient.notes}
                  </p>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Marcações recentes
              </CardTitle>
              <CardDescription>
                Últimas {patient.appointments.length} marcacoes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patient.appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  Sem marcações ainda.
                </p>
              ) : (
                <ul className="divide-y -mx-6">
                  {patient.appointments.map((app) => (
                    <li
                      key={app.id}
                      className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{app.service.name}</span>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Faturas
              </CardTitle>
              <CardDescription>
                Últimas {patient.invoices.length} faturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patient.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  Sem faturas emitidas.
                </p>
              ) : (
                <ul className="divide-y -mx-6">
                  {patient.invoices.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium font-mono text-xs">
                          {inv.number}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(inv.issuedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tabular-nums font-medium">
                          {formatCents(inv.totalCents)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {invoiceStatusLabel[inv.status]}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
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
