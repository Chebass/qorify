import { redirect } from "next/navigation";

// El proxy redirige a /login si no hay sesión.
export default function Home() {
  redirect("/inicio");
}
