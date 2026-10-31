import { AuthForm } from "../auth-form";
import { login } from "../actions";

export default function LoginPage() {
  return (
    <div className="page-enter rounded-3xl border border-white/20 bg-surface/80 p-6 shadow-[0_30px_60px_-24px_rgb(10_8_36/0.6)] backdrop-blur-xl [animation-delay:200ms]">
      <h1 className="font-display text-2xl font-semibold">Entra a tu Qorify</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Tus finanzas, claras y seguras.</p>
      <AuthForm mode="login" action={login} />
    </div>
  );
}
