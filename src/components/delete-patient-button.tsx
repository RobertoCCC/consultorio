"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePatient } from "@/lib/actions/patient";

export function DeletePatientButton({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePatient(patientId);
        // redirect() server-side faz a navegacao; este toast aparece se
        // algo correr mal antes do redirect.
      } catch (error) {
        // NEXT_REDIRECT e re-lancado pelo Next; ignorar.
        if (
          error instanceof Error &&
          error.message.includes("NEXT_REDIRECT")
        ) {
          return;
        }
        toast.error("Falha ao apagar paciente");
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
          Apagar
        </Button>
      } />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar paciente?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem a certeza que quer apagar <strong>{patientName}</strong>? Esta
            ação apaga também todas as marcacoes deste paciente e não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "A apagar..." : "Apagar paciente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
