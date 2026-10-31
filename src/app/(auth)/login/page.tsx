import { AuthForm } from "../auth-form";
import { login } from "../actions";

export default function LoginPage() {
  return (
    <div className="page-enter rounded-card border border-white/15 bg-surface/75 p-5 shadow-2xl backdrop-blur-xl [animation-delay:200ms]">
      <h1 className="mb-4 font-display text-xl font-semibold">Entra a tu Qorify</h1>
      <AuthForm mode="login" action={login} />
    </div>
  );
}
