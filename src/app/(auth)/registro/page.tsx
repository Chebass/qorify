import { AuthForm } from "../auth-form";
import { AuthCard, Brand } from "../brand";
import { register } from "../actions";

export default function RegisterPage() {
  return (
    <AuthCard>
      <Brand tagline="Ordena tus gastos en minutos" />
      <AuthForm mode="register" action={register} />
    </AuthCard>
  );
}
