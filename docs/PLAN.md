# Qorify — Plan del proyecto (finanzas personales/familiares, web + móvil)

## Context
Sebastián quiere una app web responsive/instalable en el celular para sus finanzas personales y las de algunos familiares. Requisitos clave: costo casi cero (planes gratuitos), seguridad fuerte (cuentas, tokens, contraseñas cifradas), diseño moderno y fluido con temas claro/oscuro, y un login con paisaje del Perú (costa, sierra, selva) que cambia según la hora y la ubicación, idealmente animado. Referencias: pantalla de bienvenida con paisaje ilustrado, moodboard morado/durazno/naranja, y estructura de pantallas tipo "Finora Finance".
Decisiones ya tomadas: **nombre Qorify** (Qori = oro en quechua + "-ify"), **Next.js + Supabase**, **auth gestionada (Supabase Auth)**, **MVP = núcleo financiero + login animado**.
Primer paso al aprobar: crear la carpeta `C:\sebas\qorify` (el workspace está fuera de git; se hará `git init` dentro de la carpeta nueva).

## 1. Stack y infraestructura (todo en plan gratuito)
| Capa | Elección | Por qué / límite gratuito |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind + shadcn/ui | PWA instalable; mejor ecosistema de animación web |
| Animación | Motion (Framer Motion), CSS/SVG, Lottie para detalles, View Transitions API | Transiciones fluidas; respetar `prefers-reduced-motion` |
| Gráficos | Recharts (o visx) | Barras semanales/mensuales, dona por categoría, líneas de pronóstico |
| Backend/BD | Supabase (Postgres + Auth + RLS + Storage) | Free: ~500 MB BD, 1 GB storage. **Se pausa tras ~1 semana sin uso** → ping programado (GitHub Actions cron) |
| Hosting | Vercel Hobby (alternativa: Cloudflare Pages) | Gratis para uso personal; da headers de geolocalización por IP |
| Correo | Resend free (SMTP custom en Supabase) | El SMTP por defecto de Supabase tiene límites muy bajos |
| Rate limit | Upstash Redis free | Limitar login/acciones sensibles |
| CI | GitHub Actions + Dependabot | Tests, lint, backups, keep-alive |
| PWA | Serwist/next-pwa + manifest | Instalable en Android/iOS, offline básico, atajo "agregar gasto" |
Costo esperado: **S/ 0** (dominio propio opcional ~US$10/año; se puede usar `*.vercel.app`).
Nota Flutter: descartado; web con Next.js da más control de animaciones y una sola base de código para web y celular (PWA).

## 2. Seguridad (prioridad alta)
- **Supabase Auth**: contraseñas con hash (bcrypt) gestionado por el servicio; JWT de vida corta + refresh token rotativo; sesión en cookies httpOnly vía `@supabase/ssr` (nada de tokens en localStorage).
- **Row Level Security en TODAS las tablas**: `user_id = auth.uid()` (o pertenencia a un hogar). Es la defensa principal; tests automáticos de que el usuario A no puede leer datos de B.
- **2FA (TOTP)** opcional/recomendado; verificación de correo obligatoria; política de contraseñas + chequeo de contraseñas filtradas.
- Clave `service_role` solo en servidor, nunca en el cliente ni en `NEXT_PUBLIC_*`.
- Validación con Zod en todas las Server Actions/Route Handlers; CSP estricta, HSTS, headers de seguridad en `next.config`.
- Rate limiting (Upstash) en login, registro, reset y compartir informes.
- **Cifrado de campos sensibles**: texto libre (notas, descripciones, comercio) con AES-GCM a nivel de app; montos y fechas quedan en claro para poder agregar/consultar.
- Informes compartidos: enlaces firmados, de solo lectura, con expiración y revocables.
- Registro de auditoría (inicios de sesión, cambios sensibles), exportar y borrar mis datos (alineado con la Ley 29733 de Protección de Datos Personales de Perú).
- Backups: `pg_dump` programado en GitHub Actions hacia almacenamiento cifrado; secretos solo en variables de entorno/Actions.

## 3. Modelo de datos (esbozo)
`profiles` · `households` + `household_members` (roles: owner/editor/viewer) · `accounts` (medios de pago: efectivo, tarjeta, Yape, Plin, banco) · `categories` (jerárquicas, con icono/color) · `transactions` (tipo ingreso/gasto/transferencia, monto `numeric(12,2)`, moneda PEN/USD, fecha, cuenta, categoría, nota cifrada, etiquetas, `recurring_id`) · `recurring_rules` (gastos/ingresos fijos) · `budgets` (por categoría y periodo) · `goals` (metas de ahorro) · `shared_reports` (token, alcance, expiración) · `audit_log`.
Todas con `user_id`/`household_id`, `created_at`, RLS y índices por (user, fecha).

## 4. Módulos y fases
**Fase 0 — Cimientos**: crear `C:\sebas\qorify`, `git init`, Next.js + Tailwind + shadcn, proyecto Supabase, migraciones SQL versionadas, CI, variables de entorno, tokens de diseño.
**Fase 1 — MVP (lo acordado)**
- Login/registro/recuperar contraseña/2FA + **pantalla de inicio con paisaje animado**.
- Perfil (nombre, moneda, tema, región preferida).
- Ingresos y gastos (alta rápida en <5 s), categorías, medios de pago.
- Dashboard: saldo, gasto del mes, barras semanales, dona por categoría, actividad reciente.
- Estadísticas por semana/mes/año, filtros por categoría y medio de pago.
- Tema claro/oscuro (+ automático), diseño mobile-first con navegación inferior.
**Fase 1.5 — Biometría nivel 1**: tabla `passkeys` + desbloqueo biométrico por dispositivo (WebAuthn), gestión de dispositivos en Ajustes. (Nivel 2, login sin contraseña, entra en Fase 2.)
**Fase 2 — Planificación**: gastos/ingresos fijos mensuales (generación automática), presupuestos con alertas (80 %/100 %), informes exportables (PDF/CSV) y compartibles por enlace, pronóstico simple (promedio móvil + recurrentes proyectados; sin ML).
**Fase 3 — Familia y extras**: hogares compartidos con roles, metas de ahorro, deudas/préstamos y "dividir gasto", adjuntar boleta (foto), importar CSV de bancos, notificaciones push web, modo offline con sincronización.
**Ideas candidatas (a evaluar luego)**: detector de suscripciones, patrimonio neto, multimoneda con tipo de cambio, captura por voz, OCR de boletas, widget "resumen del día", insights automáticos ("gastaste 16 % menos en comida"), modo "privado" que oculta montos.
Para recortar si hace falta: pronósticos, OCR y push van al final.

## 5. Diseño
- **Paleta (moodboard)**: `#120E28` (fondo oscuro), `#5349C2` (primario), `#B48BF1` (acento/lila), `#F2C382` (durazno), `#EE7755` (CTA/alerta). Definidos como tokens CSS (`--bg`, `--surface`, `--primary`, …) con dos juegos: **oscuro** (base del moodboard) y **claro** (fondo crema tipo Finora, texto `#120E28`, mismos acentos). Verificar contraste AA y colores de gráficos accesibles en ambos temas.
- **Estructura de pantallas** (inspirada en Finora): Inicio (saldo + acciones rápidas + gráfico semanal + actividad) · Movimientos (lista con filtros) · botón central "+" · Estadísticas · Cuentas/medios de pago · Presupuestos/Metas · Perfil/Ajustes.
- Tipografía moderna (p. ej. Plus Jakarta Sans/Sora para títulos); tarjetas redondeadas, glassmorphism sutil, gradientes morado→durazno; micro-interacciones (contadores animados, transiciones compartidas entre pantallas).

## 5b. Correos personalizados (pendiente)
Plantillas de Supabase Auth (confirmación, recuperación, cambio de correo) con la marca Qorify: HTML con paleta del moodboard, en español, editadas en Authentication → Emails → Templates. Remitente propio vía SMTP de Resend (límites gratuitos mucho mayores que el SMTP por defecto de Supabase). Sin dominio propio, Resend solo permite enviar desde su dominio de pruebas, por lo que el remitente personalizado completo queda condicionado a tener dominio; el diseño de la plantilla sí se puede personalizar ya.

## 6. Login con paisaje del Perú (pieza diferenciadora)
- **3 regiones × momentos del día** (amanecer, día, atardecer, noche) = 12 escenas, como capas SVG (cielo, sol/luna, nubes, montañas, primer plano, fauna/elementos):
  - Costa: mar Pacífico, acantilados, palmeras/pelícanos. Sierra: nevados, andenes, llamas. Selva: río, dosel, neblina, guacamayos.
- Animación: cielo con gradiente interpolado según la hora real (continuo, no a saltos), sol/luna recorriendo un arco, nubes a la deriva, estrellas titilando, parallax suave con el movimiento del dedo/mouse; pausa con `prefers-reduced-motion`.
- **Detección de región**, en este orden: (1) preferencia guardada, (2) geolocalización del navegador con permiso, procesada en el dispositivo (lat/lon → región natural con un mapa simplificado embebido), (3) cabecera de geolocalización por IP de Vercel (departamento → región), (4) por defecto Costa/Lima. No se envía ni guarda la ubicación antes del login.
- **Ajuste del usuario (Perfil → Apariencia)**: modo de paisaje = *Automático por ubicación* (por defecto) · *Región fija* (Costa/Sierra/Selva) · *Aleatorio* (una región al azar en cada visita). Se guarda en `profiles.landscape_mode`/`landscape_region`, y también en localStorage para que el login (antes de autenticarse) lo respete en ese dispositivo.
- Hora: hora local del dispositivo; amanecer/atardecer con SunCalc o horas fijas (~6:00/18:00, Perú está cerca del ecuador).
- Riesgo: la ilustración es lo más largo. Estrategia: motor de escenas + 1 región completa primero (Sierra), luego Costa y Selva; estilo plano con gradientes como la referencia.

## 6b. Biometría (huella / Face ID / Windows Hello) vía WebAuthn
Se usa WebAuthn (passkeys): el biométrico solo desbloquea una llave guardada en el dispositivo; la huella nunca sale del equipo. Funciona en Chrome/Android, Safari/iOS (incluida la PWA instalada), Windows Hello y Touch ID; requiere HTTPS.
- **Nivel 1 (esfuerzo bajo, Fase 1.5)**: "Desbloqueo biométrico": el usuario inicia sesión una vez con correo+contraseña, activa la huella en ese dispositivo y luego la app se desbloquea con biometría (la sesión sigue en cookie; WebAuthn actúa como bloqueo local al abrir la app).
- **Nivel 2 (esfuerzo medio, Fase 2)**: passkey como inicio de sesión real sin contraseña. Verificación del servidor con `@simplewebauthn/server`, tabla `passkeys` (credential_id, public_key, counter, user_id, RLS) y emisión de sesión Supabase desde el servidor tras verificar la firma. Supabase Auth no trae passkeys como login listo para usar (confirmar el estado actual de la doc antes de implementar), por eso se integra a mano.
- **Decisión**: se usa el dominio gratuito de Vercel (`*.vercel.app`), sin comprar dominio. El *rpId* de WebAuthn queda atado a ese dominio; si más adelante se cambia a un dominio propio, las passkeys registradas se invalidan y cada dispositivo deberá volver a activar la biometría (aceptado, el rpId se lee de una variable de entorno `NEXT_PUBLIC_RP_ID` para facilitar el cambio).
- Cuidados:  mantener siempre contraseña + 2FA como respaldo; permitir revocar dispositivos desde Ajustes; limitar intentos con Upstash.

## 7. Estructura propuesta de carpeta
```
C:\sebas\qorify\
  src\app\(auth)\login …   src\app\(app)\{inicio,movimientos,estadisticas,cuentas,presupuestos,perfil}
  src\components\{ui,charts,landscape}   src\lib\{supabase,crypto,validators,region}
  supabase\migrations\*.sql   supabase\seed.sql
  tests\{e2e,rls}   docs\PLAN.md   .github\workflows\
```

## 8. Verificación
- `npm run dev` y revisión en navegador (viewport móvil 375 px y escritorio), temas claro/oscuro, `prefers-reduced-motion`.
- Pruebas RLS: dos usuarios de prueba; ninguno lee/escribe datos del otro (tests SQL/Playwright).
- Playwright e2e: registro → login → crear gasto → ver en dashboard → exportar.
- Escenas del login: forzar hora y región por query param de desarrollo (`?t=21&r=selva`) para ver las 12 combinaciones.
- Lighthouse (PWA, rendimiento, accesibilidad ≥ 90), cabeceras de seguridad, `npm audit`.
- Instalación como PWA en un celular real (Android/iOS) y prueba de red lenta.

## Orden de trabajo tras aprobar
1. Crear carpeta `qorify`, guardar este plan en `docs/PLAN.md`, `git init`.
2. Scaffolding Next.js + tokens de diseño + Supabase (esquema + RLS).
3. Auth + login animado (Sierra primero).
4. CRUD de movimientos + dashboard/estadísticas.
5. Pulir temas, PWA, pruebas; luego Fase 2.
