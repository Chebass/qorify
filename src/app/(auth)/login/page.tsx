import { AuthForm } from "../auth-form";
import { AuthCard, Brand } from "../brand";
import { login } from "../actions";

export default function LoginPage() {
  return (
    <AuthCard>
      <Brand tagline="Tus finanzas, claras y seguras" />
      <AuthForm mode="login" action={login} />
    </AuthCard>
  );
}
