import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Stethoscope className="h-4 w-4" />
            </div>
            Consultório
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Gestão simples para consultorios, clínicas e escritórios
          </h2>
          <p className="max-w-md text-muted-foreground">
            Marcações, ficha de cliente, catálogo de serviços e faturação.
            tudo num só sítio, pensado para PMEs portuguesas.
          </p>
        </div>
      </div>
    </div>
  );
}
