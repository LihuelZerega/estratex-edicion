---
name: editar-mes
description: Pipeline de edición de reels de Estratex con HyperFrames. Usar cuando el editor arrastra la carpeta de un mes (ej. "Octubre", con subcarpetas DD-MM-AAAA y clips DD-MM-AAAA-01.mp4…) y escribe "Edita estos videos del mes de <Mes> de <cliente>", y para todo el ida y vuelta posterior ("en el reel del 08-10 …", "aprobado 08-10", "renderizá los aprobados", "compartí el 08-10").
---

# /editar-mes

El mismo pipeline para todos los clientes. Lo único que cambia es el contexto (`CLIENTE.md`, `ESTILO.md`, `frame.md`). El resultado es **un proyecto de HyperFrames por reel**, con link de revisión en el Studio y un `REVISION.md`. Se renderiza **solo** lo que el editor aprobó.

Rutas del plugin (relativas a este archivo): `../../base/`, `../../templates/`, `../../clientes/`.

## Reglas
- Los crudos del editor **no se tocan**: ni se mueven, ni se renombran, ni se pisan. Se copian al proyecto.
- El mensaje es el del guion aprobado. La edición **no reescribe** el guion, y los textos en pantalla van **literales**.
- Precedencia, de menor a mayor: `ESTILO-BASE` → `ESTILO.md` del cliente → `CLIENTE.md` (devoluciones) → `notas.txt` del reel → lo que pida el editor en el chat. Las reglas **[fija]** del ESTILO-BASE no se pisan. Toda excepción queda anotada en `REVISION.md`.
- No se escribe en la plataforma. No se publica nada fuera de la PC sin que el editor lo pida para un reel puntual.
- No se renderiza sin "aprobado" del editor y con el checklist sin ✗ (o con la excepción autorizada por escrito).
- El plugin tiene un **hook guardián** que hace cumplir lo anterior aunque se intente saltear:
  - bloquea escribir, mover o borrar dentro de `<Mes>/<DD-MM-AAAA>/`;
  - bloquea modificar los archivos del plugin;
  - bloquea `hyperframes render` si `REVISION.md` (en la raíz del proyecto) no está `aprobado`/`renderizado` o tiene ✗ sin `render_con_pendientes`;
  - pide confirmación antes de `hyperframes publish`.

  Si el hook bloquea algo, explicarle al editor el motivo que devolvió. Nunca buscar otra forma de hacer lo mismo (otro comando, un script, renombrar carpetas).

## 0. Arranque
1. Comprobar herramientas: `npx hyperframes doctor` y `ffprobe -version`. Si falla algo, decir qué instalar y parar.
2. `npx hyperframes usage --json`. Si queda poco uso del plan, avisar cuántos reels entran razonablemente y proponer arrancar por los más próximos a publicarse.
3. Resolver **cliente**, **mes** (`YYYY-MM`) y **carpeta del cliente** igual que `/contexto-cliente` (con `../../clientes/clientes.json`). La carpeta arrastrada es la del mes; su padre es la del cliente. Si la carpeta del mes no está dentro de una carpeta de cliente conocida, pedir que la ubiquen en `Estratex-Edicion/<cliente>/` antes de seguir.
4. Leer `<cliente>/_contexto/CLIENTE.md`. Correr `/contexto-cliente` primero si:
   - no existe;
   - su `mes` es otro;
   - su `plugin_version` no coincide con `../../.claude-plugin/plugin.json`;
   - su `estilo_version` no coincide con la de `../../clientes/<slug>/ESTILO.md`.

## 1. Preflight (siempre, antes de editar)
Recorrer la carpeta del mes y armar esta tabla, una fila por subcarpeta y otra por cada reel del plan que no tenga carpeta:

| Reel | Post del plan | Clips | Material | VO | Estado |
|---|---|---|---|---|---|

Chequeos:
- **Nombre** `DD-MM-AAAA` o `DD-MM-AAAA-A/B`. Se cruza con `reels` de `_contexto/contexto.json` por fecha (y letra), y la ficha completa se lee de la sección 4 de `CLIENTE.md`.
- **Clips** `DD-MM-AAAA-NN.mp4|mov`: numeración sin saltos ni duplicados. `ffprobe` de cada uno: ancho, alto, rotación, fps, duración, si tiene audio.
- `vo.mp3|wav` si el post tiene "Voz en Off" en servicios. `notas.txt` si existe: leerlo y resumirlo.

Clasificación:
- 🔴 **No se edita** hasta resolverlo: carpeta sin post ese día, ningún clip legible, numeración con saltos o duplicados (preguntar cuál es el orden).
- ❓ **Necesita una decisión del editor** antes de editar ese reel. Se pregunta una vez por reel, en la misma tabla:
  - `guion_estructurado: false`: ¿el texto es voz en off o son placas?
  - alerta de **incoherencia** entre la idea o el caption y el guion: ¿se edita lo que dice el guion? Es lo que se grabó.
  - "Sin guion": ¿qué cuenta el reel?

  La respuesta se anota en el `BRIEF.md` de ese reel (§ Notes).
- 🟡 **Se edita con aviso**: planificación no aprobada (se estaría editando un guion que puede cambiar), clip horizontal o de otra resolución (se reencuadra a 9:16), clip sin audio, falta VO requerida (se edita con el audio de cámara y se avisa), fps mezclados.
- ℹ **Informativo**: posts Reel del plan sin carpeta (no hay material todavía).

Mostrar la tabla y los faltantes de `CLIENTE.md` § 9 que afecten la edición (logo, fuentes). **Esperar la confirmación del editor** ("dale", "sí", o qué corregir). Si el editor arregla carpetas, volver a correr el preflight.

## 2. Cargar el estilo
- `../../base/ESTILO-BASE.md` y `../../clientes/<slug>/ESTILO.md`.
- Look aprobado, en este orden: `<cliente>/_proyectos/<YYYY-MM>/_look/frame.md` (de este mes) → `../../clientes/<slug>/frame.md` (del plugin) → ninguno.
- Modo (`modo_edicion` de `CLIENTE.md`):
  - **ESTABLECIDO**: se sigue `ESTILO.md` y el look existente. Una sola versión por reel.
  - **NUEVO**: el **reel piloto** sale en 2 variantes (abajo). Las demás se hacen con la que elija el editor.

## 3. Reel piloto
El primer reel 🟢/🟡 por fecha. Si este mes ya tiene `_look/frame.md`, no hay piloto: ir directo al paso 4.

Para el piloto (y después para cada reel):
1. **Proyecto**: `npx hyperframes init "<cliente>/_proyectos/<YYYY-MM>/<DD-MM-AAAA>" --non-interactive --example=blank --skill=general-video`.
2. **BRIEF.md** en la raíz del proyecto, desde `../../templates/BRIEF.template.md`, con los datos del reel en `CLIENTE.md`. Con `BRIEF.md` presente, HyperFrames no hace preguntas de intención y entra directo a `/general-video`.
3. **Material**: copiar los clips (en orden), `vo.*`, logo y fuentes de `_assets/` al proyecto, como pida el workflow.
4. **Diseño**: si hay look, copiar ese `frame.md`. Si no, escribir uno con `/hyperframes-creative` (design spec) usando solo colores HEX y fuentes del manual (`CLIENTE.md` § 2) y lo que diga `ESTILO.md`.
5. **Transcripción**: `npx hyperframes transcribe` sobre la VO o sobre los clips. Sirve para cortar silencios y muletillas, ubicar el hook y generar subtítulos.
6. **Armado** con `/hyperframes` → `/general-video`, y los dominios que pida cada cosa:
   - cortes y orden: `/hyperframes-core`, `references/creator-editing-recipes.md`;
   - punch-ins y reencuadres: `/hyperframes-keyframes`;
   - mezcla, ducking y loudness: `/hyperframes-audio`;
   - música, SFX y subtítulos: `/media-use`, primero `_assets/`;
   - transiciones o efectos con nombre: `/hyperframes-registry` antes de hacerlos a mano.

   Mapeo: guion hablado en orden HOOK → DESARROLLO → CIERRE, clips en el orden de numeración, textos en pantalla literales en el momento en que se dice lo que acompañan, y "Visual:" como guía de plano y efecto. Cierre con CTA y logo según el estilo.
7. **QA**: `npx hyperframes check` y snapshots (`npx hyperframes snapshot`) en el hook, a mitad del desarrollo y en el cierre. Completar `REVISION.md`, en la raíz del proyecto (al lado de `hyperframes.json`), desde `../../templates/REVISION.template.md` con el checklist de `../../base/QA-CHECKLIST.md` (niveles 1 y 2). Corregir todo lo que se pueda corregir antes de mostrar.
8. **Revisión**: `npx hyperframes preview --background`. Verificar que el link responde y pasárselo al editor junto con: duración, snapshots, ✗ pendientes, devoluciones previas y cómo se respetaron, y excepciones.

**Modo NUEVO, dos variantes**: el mismo reel en `<DD-MM-AAAA>` (variante A, sobria: cortes secos, subtítulos simples, música suave) y `<DD-MM-AAAA>-varB` (variante B, dinámica: más punch-ins, transiciones de bloque, SFX). Las dos dentro del manual de marca. Presentarlas lado a lado y preguntar cuál sigue. La no elegida queda marcada "descartada" en su `REVISION.md`, no se borra.

**Cuando el editor aprueba el piloto**: copiar el `frame.md` aprobado a `<cliente>/_proyectos/<YYYY-MM>/_look/frame.md` y congelar la receta con `/media-use` → `scripts/recipe.mjs freeze --name <slug>-reel`. Desde acá todos los reels del mes usan ese look.

## 4. El resto de los reels
Para cada reel 🟢/🟡 que falte, en orden de fecha: pasos 1 a 7 de arriba, con el `_look/frame.md` y `recipe.mjs use --name <slug>-reel`. Se pueden armar todos seguidos y presentar al final una tabla:

| Reel | Duración | Link Studio | ✗ pendientes | Estado |
|---|---|---|---|---|

## 5. Ida y vuelta con el editor
- **"en el reel del 08-10 <cambio>"**: edición puntual en ese proyecto. Es un "specific edit" de HyperFrames, no un proyecto nuevo. Después: `check`, snapshots, actualizar `REVISION.md` (nueva fila en Rondas) y el mismo link.
- Si el cambio contradice `ESTILO.md` o una devolución del cliente, avisarlo en una línea y hacerlo igual si el editor lo confirma. Queda como excepción.
- Si el editor pide el mismo tipo de cambio en 2 o más reels, preguntar si se aplica a todos los del mes (y actualizar `_look/frame.md`).
- **"aprobado 08-10"**: `estado: aprobado` en `REVISION.md` y ✓ en "el editor revisó".
- **"renderizá igual el 08-10"** (con ✗ abiertos): solo si lo escribe el editor. Anotar su motivo en `render_con_pendientes` de `REVISION.md` y recién ahí renderizar.
- **"renderizá los aprobados"** (o "renderizá el 08-10"): para cada aprobado sin ✗ abierto, `npx hyperframes render` a `renders/<slug>-<DD-MM-AAAA>.mp4`. Después medir loudness (`ffmpeg -i <mp4> -af ebur128=peak=true -f null -`), completar el nivel 1 y poner `estado: renderizado` y la ruta. Si queda fuera de rango, corregir la mezcla y volver a renderizar.
- **"compartí el 08-10"**: `npx hyperframes publish` (privado). Antes, confirmar con el editor que se sube a HeyGen. Si el proyecto pesa más de 200 MB, generar proxies livianos de los clips para esa publicación. Guardar la URL en `REVISION.md`.

## 6. Cierre de la tanda
Tabla del mes: reels renderizados, en revisión, bloqueados y sin material. Si están todos renderizados, sugerir `/cerrar-mes <cliente>`.
