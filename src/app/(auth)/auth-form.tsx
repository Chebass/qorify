"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "./actions";

type Props = {
  mode: "login" | "register";
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      {isRegister && (
        <label className="flex flex-col gap-1 text-xs">
          Nombre
          <input name="name" autoComplete="name" required className={inputClass} />
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs">
        Correo
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          className={inputClass}
        />
        {isRegister && (
          <span className="text-xs text-muted">
            Mínimo 10 caracteres, con mayúscula, minúscula y número.
          </span>
        )}
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.info && (
        <p role="status" className="text-sm text-success">
          {state.info}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast press hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Un momento…" : isRegister ? "Crear cuenta" : "Entrar"}
      </button>

      <p className="text-center text-xs text-muted">
        {isRegister ? "¿Ya tienes cuenta? " : "¿Aún no tienes cuenta? "}
        <Link
          href={isRegister ? "/login" : "/registro"}
          className="font-semibold text-primary"
        >
          {isRegister ? "Inicia sesión" : "Regístrate"}
        </Link>
      </p>
    </form>
  );
}
