# Estado del kit · 28-10-2026

Resumen para retomar el trabajo en otra PC o sesión. En una sesión nueva: **"Leé ESTADO.md y README.md del kit y seguimos con los pendientes"**.

## Qué es y por qué está armado así

Pipeline único para que los editores de Estratex editen reels de los clientes con Claude + HyperFrames. El flujo es el mismo para todos los clientes; lo que cambia es el contexto de cada uno. **No se toca la plataforma**: el kit es un plugin de Claude Code aparte, en este repo privado (`LihuelZerega/estratex-edicion`).

## Decisiones tomadas (no reabrir sin motivo)

| Tema | Decisión |
|---|---|
| Input | `Estratex-Edicion/<cliente>/<Mes>/<DD-MM-AAAA>/<DD-MM-AAAA>-NN.mp4`. 1 carpeta de fecha = 1 reel = `publish_date` del post Reel. El número de clip es el orden en el video. Si un día tiene dos reels: `-A` y `-B` |
| Almacenamiento | Local en cada PC. GitHub solo distribuye el kit, no el material |
| Contexto | `/contexto-cliente` corre una vez por mes desde la sesión, con el conector de Supabase en solo lectura, y genera `_contexto/CLIENTE.md` + `contexto.json` (índice de reels). Nadie escribe en la base |
| Estilo | No existía escrito. Se releva con `/relevar-estilo`. `ESTILO.md` y `frame.md` de cada cliente los cambia solo el responsable, en este repo |
| Nuevo / establecido | ESTABLECIDO = 3 o más meses de ciclo distintos con posts aprobados (contando el mes editado) **y** `ESTILO.md` en estado `relevado`. Si no, NUEVO: el reel piloto sale en 2 variantes |
| Reel piloto | El primer reel define el look del mes (`_proyectos/<mes>/_look/frame.md`); el resto lo reutiliza. Regla: **un cliente-mes por PC** |
| Output | Proyecto HyperFrames por reel + link del Studio + `REVISION.md` con checklist. Se renderiza solo lo aprobado |
| Distribución | Repo privado. Las PCs reciben un cambio solo si sube la `version` de `plugin.json` |

## Lo que está hecho y probado

- **Plugin v0.1.3**: 4 skills (`contexto-cliente`, `editar-mes`, `relevar-estilo`, `cerrar-mes`), un subagente, el conector `estratex-db`, estilo base, checklist, plantillas, 24 clientes activos en `clientes.json` (todos con `ESTILO.md` sin relevar) y la guía para editores.
- **Conector de solo lectura** comprobado: la base responde como `supabase_read_only_user` y rechaza hasta una tabla temporal.
- **`/contexto-cliente` con Atelier, Octubre 2026**: corrido dos veces y comparado contra la base. Coincide: 6 reels, modo NUEVO, alertas en el 14-10 y el 22-10. Con lo que salió de esas corridas se corrigieron unos 20 puntos de las instrucciones.
- **Instalación desde GitHub**: probada en una configuración aislada. Clona, instala y actualiza.
- **Hook guardián** (`scripts/guardian.mjs`): 9 grupos de pruebas pasan (`node --test tests/guardian.test.mjs`). También probado como proceso con eventos por stdin.

## Lo que NO está probado

- **El hook dentro de una sesión real de Claude.** Prueba pendiente en la oficina: en una sesión abierta en `<workspace>/Atelier`, pedir "Creá el archivo Octubre/01-10-2026/prueba-hook.txt con el texto 'hola' usando la tool Write. Si se bloquea, copiá el motivo." Tiene que responder "Bloqueado: … crudos…" y el archivo no tiene que existir.
- **`/editar-mes` completo** (preflight, piloto, HyperFrames, revisión, render): falta material real. Siguiente prueba: clips reales de Atelier en `Octubre/01-10-2026/`.
- **`/relevar-estilo` y `/cerrar-mes`**: no se corrieron nunca.
- **Si el hook se respeta en modo "saltear permisos"**: la documentación no lo dice claro. Hay que probarlo, y en la capacitación pedir siempre el modo normal.

## Pendientes

**Mañana, en la oficina**
1. Instalar el kit en las 3 PCs (README, "Instalación en cada PC"). Antes: cuenta de GitHub de la oficina con permiso de lectura al repo.
2. Probar el hook (arriba).
3. Cuentas de Supabase Read-only para quien vaya a usar el kit.

**Antes del piloto**
4. Validar `base/ESTILO-BASE.md` con el equipo: hoy tiene valores por defecto que propuso Claude.
5. Relevar el estilo de los clientes con más historial (`/relevar-estilo`) y pasar los `ESTILO.md` a `relevado`.
6. Cargar `_assets/` por cliente: logo en PNG o SVG y archivos de fuentes. El manual de marca casi nunca trae las fuentes.
7. **Atelier, en la plataforma**: el 22-10 tiene la idea de depilación pero el guion de tratamientos faciales; el 14-10 tiene un guion que no se distingue entre voz en off y placas; el logo es un .jpg; falta la fuente Safira.
8. Probar `/editar-mes` de punta a punta con un reel real.

**Piloto**
9. Un mes, 2 clientes (uno con historial y otro sin), 1 o 2 editores. Medir minutos por reel, rondas y % aprobado por el cliente en la primera vuelta. Ajustar el estilo base y la capacitación antes de pasar a los 24 clientes.

## Datos útiles

- Proyecto Supabase: `jpxsxjuawnepnfvsugko` (producción, única base).
- Formatos de guion reales en `design_notes`: "GUION (voz en off)", "VO – HOOK/DESARROLLO/CIERRE" (a veces mal escrito, como "GVO"), "GANCHO/…", "Teleprompter", texto corrido y "." (vacío). `/contexto-cliente` los contempla todos.
- Hay pocas devoluciones de edición cargadas en la base, y muchas son de Historias. Por eso el `ESTILO.md` y los aprendizajes de cada mes pesan más que el historial.
- En Windows, un marketplace local se agrega con una ruta relativa: `./estratex-edicion`.
- La carpeta `_prueba/` (con datos reales de Atelier) está fuera de git y existe solo en la PC de casa.
