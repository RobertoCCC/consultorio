import { CheckCircle2, UserX, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatus } from "@/lib/actions/appointment";
import type { AppointmentStatusValue } from "@/lib/validations/appointment";

/**
 * Server component com forms inline -- não precisa de JS no cliente.
 * Mostra acoes contextuais consoante o status actual da marcação.
 */
export function AppointmentStatusActions({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: AppointmentStatusValue;
}) {
  if (status === "SCHEDULED") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <StatusForm
          id={appointmentId}
          newStatus="COMPLETED"
          label="Marcar concluida"
          icon={<CheckCircle2 className="h-4 w-4" />}
          variant="default"
        />
        <StatusForm
          id={appointmentId}
          newStatus="NO_SHOW"
          label="Faltou"
          icon={<UserX className="h-4 w-4" />}
          variant="outline"
        />
        <StatusForm
          id={appointmentId}
          newStatus="CANCELLED"
          label="Cancelar"
          icon={<XCircle className="h-4 w-4" />}
          variant="outline"
        />
      </div>
    );
  }

  // Para qualquer estado nao-agendado, permitir voltar a SCHEDULED.
  return (
    <StatusForm
      id={appointmentId}
      newStatus="SCHEDULED"
      label="Re-agendar"
      icon={<RotateCcw className="h-4 w-4" />}
      variant="outline"
    />
  );
}

function StatusForm({
  id,
  newStatus,
  label,
  icon,
  variant,
}: {
  id: string;
  newStatus: AppointmentStatusValue;
  label: string;
  icon: React.ReactNode;
  variant: "default" | "outline";
}) {
  return (
    <form action={updateAppointmentStatus.bind(null, id, newStatus)}>
      <Button type="submit" variant={variant} size="sm">
        {icon}
        {label}
      </Button>
    </form>
  );
}
