import { AuthForm } from "../auth-form";
import { register } from "../actions";

export default function RegisterPage() {
  return (
    <div className="page-enter rounded-3xl border border-white/20 bg-surface/80 p-6 shadow-[0_30px_60px_-24px_rgb(10_8_36/0.6)] backdrop-blur-xl [animation-delay:200ms]">
      <h1 className="font-display text-2xl font-semibold">Crea tu cuenta</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Empieza a ordenar tus gastos en minutos.</p>
      <AuthForm mode="register" action={register} />
    </div>
  );
}
