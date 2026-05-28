import { redirect } from "next/navigation";

// Proxy redireciona utilizadores não autenticados para /login.
// Autenticados vao para o dashboard.
export default function RootPage() {
  redirect("/dashboard");
}
