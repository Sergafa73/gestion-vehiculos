# Gestión de vehículos

Aplicación web (PWA) para controlar vehículos: repostajes, kilómetros, gastos, reparaciones, mantenimientos y documentación.
Tecnología: React + Vite, base de datos y login en Supabase, publicación en GitHub Pages.

## Estado actual (entrega 1)
- Registro e inicio de sesión.
- Gestión de vehículos (añadir, editar, eliminar con confirmación, foto).
- Panel con la ficha del vehículo activo.
- Menú lateral en PC, barra inferior en móvil, modo claro/oscuro, instalable como app.
- Los demás apartados aparecen en el menú y se construyen en las siguientes entregas.

## Publicar (resumen; la guía detallada está en el chat)
1. Sube el contenido de esta carpeta al repositorio de GitHub (rama `main`).
2. En GitHub: Settings → Secrets and variables → Actions → New repository secret:
   - `VITE_SUPABASE_URL` = Project URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = clave pública (anon / publishable) de Supabase
3. En GitHub: Settings → Pages → Source: **GitHub Actions**.
4. En Supabase: Authentication → URL Configuration → Site URL = `https://TUUSUARIO.github.io/NOMBRE-REPO/`
5. La web se publica sola cada vez que subes cambios.

## Base de datos
El script `supabase/esquema.sql` ya debe estar ejecutado en tu proyecto de Supabase.
