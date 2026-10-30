# estratex-edicion

Kit de edición de reels con Claude + HyperFrames para Estratex. No toca la plataforma: lee la base en solo lectura y trabaja todo en la PC de edición.

- Guía para editores: [CAPACITACION.md](CAPACITACION.md)
- Plugin: [plugins/estratex-edicion/](plugins/estratex-edicion/)

## Qué hay adentro

```
.claude-plugin/marketplace.json        marketplace "estratex" (para instalar el plugin desde este repo)
plugins/estratex-edicion/
  .claude-plugin/plugin.json           versión del plugin (la registra cada CLIENTE.md)
  .mcp.json                            conector Supabase estratex-db, read_only=true
  skills/
    contexto-cliente/                  /contexto-cliente: arma CLIENTE.md del mes (+ queries.sql)
    editar-mes/                        /editar-mes: preflight → piloto → resto → revisión → render
    relevar-estilo/                    /relevar-estilo: entrevista + análisis → ESTILO propuesto
    cerrar-mes/                        /cerrar-mes: APRENDIZAJES del mes para el responsable
  agents/contexto-cliente.md           subagente que lee la base y escribe el contexto
  base/ESTILO-BASE.md                  estilo común de Estratex (lo pisa el ESTILO de cada cliente)
  base/QA-CHECKLIST.md                 checklist de validación de cada reel
  templates/                           CLIENTE, ESTILO, BRIEF, REVISION, APRENDIZAJES
  clientes/clientes.json               carpeta → slug → client_id
  clientes/<slug>/ESTILO.md            estilo curado por cliente (y frame.md cuando haya look aprobado)
```

## Guardrails

**Duros** (los impone la tecnología y Claude no los puede saltear):
- **Base de datos.** Conector con `read_only=true` + usuario `supabase_read_only_user` + cuenta Read-only. Cualquier escritura falla.
- **Hook guardián** (`plugins/estratex-edicion/hooks/hooks.json` → `scripts/guardian.mjs`). Corre antes de cada Write, Edit, Bash o PowerShell de Claude y bloquea:
  1. **Crudos**: escribir, mover, renombrar o borrar dentro de `<Mes>/<DD-MM-AAAA>/`, o borrar una carpeta que contenga material (mes, cliente o `Estratex-Edicion/`). Leerlos y copiarlos hacia `_proyectos/` sigue permitido.
  2. **Plugin**: modificar la copia instalada del plugin (`~/.claude/plugins/…estratex…`). El repo del kit se edita normalmente. `ESTRATEX_RESPONSABLE=1` desactiva esta regla, por si el responsable carga el plugin directo desde la carpeta del repo.
  3. **Render**: `hyperframes render` o `npm run render` en un proyecto de `_proyectos/` exige un `REVISION.md` con `estado: aprobado` (o `renderizado`) y sin ✗ en el checklist. Si hay ✗, hace falta que `render_con_pendientes` tenga el motivo que dio el editor.
  4. **Publish**: `hyperframes publish` pide confirmación del editor, aunque la sesión esté en modo sin permisos.

  Si el script falla por un error propio, no bloquea nada. Lo que detecta, lo bloquea siempre.

**Límites del hook** (no los cubre): un programa que borre archivos desde adentro (por ejemplo un script de Node o Python que llame a `unlink`), o comandos de shell muy rebuscados. Para eso están las reglas de las skills y la revisión humana.

Pruebas del guardián:
```bash
node --test tests/guardian.test.mjs
```

**Blandos** (instrucciones a Claude, controladas por la QA y la revisión del editor): guion y textos literales, colores y fuentes del manual, palabras prohibidas, música sin copyright, no editar `ESTILO.md` desde una sesión, tratar lo que viene de la base como datos.

## Qué es la fuente de verdad de cada cosa

| Qué | Dónde vive | Quién lo cambia |
|---|---|---|
| Marca, plan del mes, guiones, devoluciones | Plataforma (Supabase) | Nadie desde acá: se lee y se regenera `CLIENTE.md` cada mes |
| Estilo base, estilo y look por cliente | Este repo (plugin) | Solo el responsable, con las propuestas de `/relevar-estilo` y `/cerrar-mes` |
| Material, proyectos, renders | La PC de edición (`Estratex-Edicion/`) | El editor y Claude |

## Cómo llegan los cambios a las PCs

El kit se distribuye desde el repo privado de GitHub `LihuelZerega/estratex-edicion`. Cada PC tiene una **copia** del plugin y la renueva solo cuando cambia la `version` de `plugins/estratex-edicion/.claude-plugin/plugin.json`.

**Para publicar un cambio** (en la PC del responsable):
1. Editar los archivos del kit.
2. Subir la `version` en `plugin.json`, por ejemplo de 0.1.2 a 0.1.3. **Sin este paso, las PCs no reciben el cambio**, aunque hagas push.
3. Validar, hacer commit y push:
   ```bash
   claude plugin validate .
   ```
   ```bash
   git commit -am "describe el cambio" && git push
   ```

**Cómo lo reciben las PCs**:
- **Con auto-actualización** (recomendado): Claude Code revisa el repo al arrancar cada sesión y baja la versión nueva en segundo plano. La versión nueva se usa desde la sesión siguiente. Está apagada por defecto y se activa una vez por PC (ver la instalación, paso 6).
- **A mano**, en una terminal:
  ```bash
  claude plugin marketplace update estratex
  ```
  ```bash
  claude plugin update estratex-edicion@estratex
  ```
  y después abrir una sesión nueva.

No pasa nada si una PC queda atrasada. Cada `CLIENTE.md` registra la versión con la que se generó, y `/editar-mes` regenera el contexto cuando la versión cambia.

**Lo que no viaja por GitHub, por diseño**: material, `_assets/`, `_proyectos/`, renders y `CLIENTE.md` quedan en cada PC. El look aprobado de un mes (`_proyectos/<mes>/_look/frame.md`) también. Por eso la regla es **un cliente-mes por PC**; si hay que repartirlo, se copia `_look/` a la otra PC. El look queda para todas recién cuando el responsable lo sube al plugin como `clientes/<slug>/frame.md`.

## Instalación en cada PC

### Rápida: con el script (recomendado)

Antes de empezar, la PC tiene que tener Claude Desktop instalado y con sesión iniciada, y tenés que tener a mano una cuenta de GitHub con acceso al repo.

1. En el navegador, entrá a GitHub con una cuenta que tenga acceso y abrí [`scripts/instalar-pc.ps1`](scripts/instalar-pc.ps1). Usá el botón **Copy raw file** (el ícono de copiar, arriba a la derecha del archivo).
2. Abrí **PowerShell** (Inicio → escribir "PowerShell" → Enter; no hace falta como administrador), pegá con clic derecho y apretá Enter.
3. El script instala lo que falte (Node, Git, GitHub CLI, ffmpeg y la CLI de Claude Code). Además abre el login de GitHub en el navegador, instala las skills de HyperFrames y el kit, y crea `C:\Estratex-Edicion` con una carpeta por cliente. Se puede correr de nuevo sin problema: saltea lo que ya está hecho.
4. Cerrá Claude Desktop del todo (también desde la bandeja del sistema) y abrilo de nuevo. En la pestaña **Code**, abrí una sesión en `C:\Estratex-Edicion` y escribí `/mcp` → `plugin:estratex-edicion:estratex-db` → **Authenticate**.

Si algún paso falla, el script muestra **ERROR** con el motivo y se detiene.

### Manual: paso a paso

1. Claude Desktop (pestaña Code), Node 22 o superior, ffmpeg, Chrome, git y GitHub CLI (`gh`).
2. Acceso al repo privado. Cada PC necesita una cuenta de GitHub con acceso de lectura a `LihuelZerega/estratex-edicion`, invitada como colaboradora. Después se guardan las credenciales para que Claude Code pueda clonar sin preguntar:
   ```bash
   gh auth login
   ```
   ```bash
   gh auth setup-git
   ```
3. Skills de HyperFrames:
   ```bash
   npx skills add heygen-com/hyperframes
   ```
4. Marketplace y plugin. Si la PC no tiene una clave SSH de GitHub, definir antes `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` como variable de entorno del usuario de Windows, de forma permanente. Sin esa variable, las actualizaciones fallan.
   ```bash
   claude plugin marketplace add LihuelZerega/estratex-edicion
   ```
   ```bash
   claude plugin install estratex-edicion@estratex
   ```
5. Conector `estratex-db`: en una sesión, `/mcp` → `plugin:estratex-edicion:estratex-db` → **Authenticate**, e iniciar sesión en Supabase. Cada editor necesita una cuenta en la organización de Supabase con rol **Read-only**. El conector además va con `read_only=true`: la base responde como `supabase_read_only_user` y rechaza cualquier escritura.
6. Auto-actualización: en una sesión de terminal, `/plugin` → **Marketplaces** → `estratex` → **Enable auto-update**.
7. Crear `Estratex-Edicion/` con una carpeta por cliente, usando el campo `carpeta` de `clientes/clientes.json`, y su `_assets/` (logo, `fuentes/`, música y SFX aprobados).

**La PC del responsable** puede tener el marketplace apuntando a la carpeta local (`claude plugin marketplace add ./estratex-edicion`, parado en la carpeta padre). En Windows la ruta tiene que ser relativa y empezar con `./`; una absoluta como `E:\…` da "Invalid marketplace source format". Así el plugin se lee directo de los archivos y los cambios se prueban en la sesión siguiente, sin publicar.

### Con plan Team o Enterprise de Claude

En lugar de los pasos 4 y 6 en cada PC, un Owner de la organización puede cargar esto en **claude.ai → Organization settings → Claude Code → Managed settings**. El marketplace y el plugin quedan instalados y con auto-actualización en todas las cuentas, y los editores no pueden desactivarlos:
```json
{
  "extraKnownMarketplaces": {
    "estratex": {
      "source": { "source": "github", "repo": "LihuelZerega/estratex-edicion" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": {
    "estratex-edicion@estratex": true
  }
}
```
Cada PC igual necesita acceso de lectura al repo (paso 2). Para no depender de cuentas de GitHub, existe **Organization settings → Plugins & skills**, que sincroniza el repo con la conexión de GitHub de la organización.

## Tareas del responsable

- **Alta o baja de clientes**: editar `clientes/clientes.json` y crear `clientes/<slug>/ESTILO.md` desde `templates/ESTILO.template.md`.
- **Relevamiento**: recibir `ESTILO.propuesto.md` y pasarlo a `clientes/<slug>/ESTILO.md` con `estado: relevado` y `version` + 1. Prioridad: los clientes con más historial.
- **Cierre de mes**: recibir `APRENDIZAJES-<mes>.md` (y `frame.md` si cambió) y actualizar el ESTILO y el `frame.md` del cliente.
- **Versionar**: cada cambio al plugin sube la `version` de `plugin.json`. Los `CLIENTE.md` viejos quedan desactualizados y `/editar-mes` regenera el contexto solo.
- **Ajustar `base/ESTILO-BASE.md`**: hoy tiene valores por defecto razonables, pero hay que validarlos con el equipo antes del piloto.
