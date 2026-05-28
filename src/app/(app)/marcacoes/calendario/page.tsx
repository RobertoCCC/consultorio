import Link from "next/link";
import { addDays, addMinutes, subDays } from "date-fns";
import { List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppointmentsCalendar } from "@/components/appointments-calendar";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export default async function CalendarioMarcaçõesPage() {
  await verifySession();

  const now = new Date();
  const start = subDays(now, 30);
  const end = addDays(now, 90);

  const appointments = await prisma.appointment.findMany({
    where: { startsAt: { gte: start, lte: end } },
    include: {
      patient: { select: { name: true } },
      service: { select: { name: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const events = appointments.map((a) => ({
    id: a.id,
    title: `${a.patient.name} • ${a.service.name}`,
    start: a.startsAt.toISOString(),
    end: addMinutes(a.startsAt, a.durationMinutes).toISOString(),
    status: a.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Calendario de marcacoes
          </h2>
          <p className="text-sm text-muted-foreground">
            {events.length}{" "}
            {events.length === 1 ? "marcação" : "marcações"} de {" "}
            {start.toLocaleDateString("pt-PT")} a {" "}
            {end.toLocaleDateString("pt-PT")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/marcacoes" />}
          >
            <List className="h-4 w-4" />
            Ver lista
          </Button>
          <Button render={<Link href="/marcacoes/nova" />}>
            <Plus className="h-4 w-4" />
            Nova marcação
          </Button>
        </div>
      </div>

      <Legend />

      <Card className="p-4 md:p-6">
        <AppointmentsCalendar events={events} />
      </Card>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 flex-wrap text-xs">
      <LegendItem color="#3b82f6" label="Agendada" />
      <LegendItem color="#10b981" label="Concluída" />
      <LegendItem color="#9ca3af" label="Cancelada" />
      <LegendItem color="#f59e0b" label="Faltou" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
