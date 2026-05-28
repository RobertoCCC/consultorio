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
import { deleteService } from "@/lib/actions/service";

export function DeleteServiceButton({
  serviceId,
  serviceName,
}: {
  serviceId: string;
  serviceName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteService(serviceId);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("NEXT_REDIRECT")
        ) {
          return;
        }
        if (error instanceof Error && error.message === "FK_CONSTRAINT") {
          toast.error(
            "Este servico tem marcacoes ou faturas associadas. Marca como inativo em vez de apagar.",
          );
          return;
        }
        toast.error("Falha ao apagar serviço");
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
            Apagar
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar serviço?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem a certeza que quer apagar <strong>{serviceName}</strong>? Se o
            servico tiver marcacoes ou faturas associadas a operacao falha
            - marque como inativo em alternativa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "A apagar..." : "Apagar serviço"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
