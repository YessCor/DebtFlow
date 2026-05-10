# Archivos privados (recomendación)

Guía para crear/modificar `.gitignore` y mantener fuera del repositorio información sensible.

## Ignorar
- `.env`, `.env.*` (incluye `.env.local`, `.env.production`, etc.)
- `node_modules/`, `.next/` (build)
- Carpetas de sandbox/infra que no deben versionarse

## Secretos típicos
- `*.key`, `*.pem`, `*.crt`, `*.pfx`
- Credenciales/JSON sensibles (si usas service accounts)
  - `serviceAccount*.json`
  - `*.serviceaccount*.json`

> Nota: no incluimos `.env` en el repo; solo se versionan los ejemplos (si decides agregarlos), por ejemplo `.env.example`.

