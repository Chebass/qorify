"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import type { FormState } from "./actions";

type Props = {
  mode: "login" | "register";
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
};

const ICONS = {
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0",
  mail: "M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
};

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** Campo con icono a la izquierda; el contorno y el icono se tiñen al enfocar. */
function Field({ label, icon, trailing, hint, children }: { label: string; icon: string; trailing?: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <span className="group flex items-center gap-2.5 rounded-2xl border border-border bg-surface/70 px-3 text-muted transition focus-within:border-primary focus-within:text-primary focus-within:ring-2 focus-within:ring-primary/25">
        <Icon d={icon} />
        {children}
        {trailing}
      </span>
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

const inputClass = "min-w-0 flex-1 bg-transparent py-2.5 text-base font-normal text-text outline-none placeholder:text-muted/60";

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [show, setShow] = useState(false);
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      {isRegister && (
        <Field label="Nombre" icon={ICONS.user}>
          <input name="name" autoComplete="name" required placeholder="¿Cómo te llamamos?" className={inputClass} />
        </Field>
      )}
      <Field label="Correo" icon={ICONS.mail}>
        <input name="email" type="email" autoComplete="email" required placeholder="tu@correo.com" className={inputClass} />
      </Field>
      <Field
        label="Contraseña"
        icon={ICONS.lock}
        hint={isRegister ? "Mínimo 10 caracteres, con mayúscula, minúscula y número." : undefined}
        trailing={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={show}
            className="press -mr-2 grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-surface-2"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="2.8" />
              {show && <path d="M4 4l16 16" />}
            </svg>
          </button>
        }
      >
        <input
          name="password"
          type={show ? "text" : "password"}
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          placeholder="••••••••••"
          className={inputClass}
        />
      </Field>

      {state?.error && (
        <p role="alert" className="page-enter rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.info && (
        <p role="status" className="page-enter rounded-xl bg-success/10 px-3.5 py-2.5 text-sm text-success">
          {state.info}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary press mt-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold disabled:opacity-70"
      >
        {pending && <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {pending ? "Un momento…" : isRegister ? "Crear cuenta" : "Entrar"}
      </button>

      <p className="text-center text-sm text-muted">
        {isRegister ? "¿Ya tienes cuenta? " : "¿Aún no tienes cuenta? "}
        <Link href={isRegister ? "/login" : "/registro"} className="font-semibold text-primary hover:underline">
          {isRegister ? "Inicia sesión" : "Regístrate"}
        </Link>
      </p>
    </form>
  );
}
