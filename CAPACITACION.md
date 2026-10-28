# Cómo editar con Claude en Estratex

Una sola forma de trabajar, para todos los clientes. Lo que cambia entre clientes lo pone Claude (marca, estilo, devoluciones). Vos traés el material ordenado y decidís qué se aprueba.

## 1. Ordená el material (antes de abrir Claude)

```
Estratex-Edicion/
  Atelier/                 ← carpeta del cliente (nombre exacto de la lista)
    _assets/               ← logo, fuentes/, música y SFX aprobados (se arma una vez)
    Octubre/               ← la carpeta del mes
      08-10-2026/          ← UNA carpeta = UN reel = la fecha de publicación del plan
        08-10-2026-01.mp4  ← los clips, numerados en el orden en que van en el video
        08-10-2026-02.mp4
        vo.mp3             ← (si hay) la voz en off grabada aparte
        notas.txt          ← (si querés) indicaciones para este reel
```

Reglas:
- La fecha de la carpeta es la **fecha de publicación** del reel en la planificación. Si es otra fecha, Claude no encuentra el guion.
- Si un mismo día hay dos reels: `08-10-2026-A` y `08-10-2026-B`, en el orden en que están en la planificación.
- Los clips van numerados `-01`, `-02`, `-03`… sin saltos. El número es el **orden en el video**.
- No pongas nada más en la carpeta del mes. Los proyectos los crea Claude en `_proyectos/`.

## 2. La primera vez en tu PC
Escribí `/mcp`, elegí **estratex-db** e iniciá sesión con tu cuenta de Supabase. Es de solo lectura: sirve para que Claude lea la planificación. Se hace una sola vez.

## 3. Las frases (siempre las mismas)

| Cuándo | Qué escribís |
|---|---|
| 1 vez por mes y por cliente, antes de editar | `/contexto-cliente Atelier Octubre` |
| Para editar | Arrastrás la carpeta **Octubre** y escribís: **Edita estos videos del mes de Octubre de Atelier** |
| Para pedir un cambio | **en el reel del 08-10** + lo que querés cambiar (ej.: "en el reel del 08-10 subí los subtítulos y sacá el zoom del segundo 5") |
| Cuando está bien | **aprobado 08-10** |
| Para exportar | **renderizá los aprobados** (o "renderizá el 08-10") |
| Para que lo vea alguien desde otra PC | **compartí el 08-10** |
| Al terminar el mes | `/cerrar-mes Atelier` |
| Si el cliente todavía no tiene estilo escrito | `/relevar-estilo Atelier` |

## 4. Qué esperar en cada paso

1. **Contexto.** Claude lee la plataforma (sin tocar nada) y te muestra: si el cliente se edita como **NUEVO** o **ESTABLECIDO**, cuántos reels tiene el mes y qué falta (por ejemplo, el logo o una fuente). Conseguí lo que falta antes de editar.
2. **Preflight.** Al arrastrar la carpeta, Claude te muestra una tabla reel por reel:
   - 🟢 todo bien;
   - 🟡 se edita con un aviso;
   - ❓ necesita que decidas algo (por ejemplo, la idea dice "depilación" pero el guion habla de tratamientos faciales: ¿cuál se edita?);
   - 🔴 no se puede editar hasta que lo arregles (carpeta con fecha equivocada, clips mal numerados).

   Respondé las ❓ y escribí **"dale"**, o arreglá lo que falte y avisá.
3. **Reel piloto.** Claude edita primero un solo reel completo.
   - Cliente **NUEVO**: te muestra **dos versiones** (A sobria y B dinámica). Elegí una; esa define el estilo del mes.
   - Cliente **ESTABLECIDO**: una sola versión, con el estilo que ya tiene.
4. **El resto.** Con el look del piloto aprobado, Claude arma los demás reels y te da una tabla con un **link de revisión por reel**.
5. **Revisión.** El link abre el Studio de HyperFrames: lo podés ver y también tocar ahí mismo (texto, recortes). Cada reel trae una **REVISION.md** con el checklist: textos iguales a la planificación, colores y fuentes de la marca, devoluciones del cliente respetadas, clips descartados y por qué.
6. **Render.** Solo de lo que vos aprobaste. Los MP4 quedan en `_proyectos/<mes>/<fecha>/renders/`. Subilos a la plataforma como siempre.

## 5. Cosas a tener en cuenta
- Claude **no cambia el guion** ni los textos en pantalla: salen tal cual de la planificación. Si ves un error en el guion, se corrige en la plataforma, no en la edición.
- Si pedís algo que va contra el estilo del cliente o contra una devolución, Claude te avisa en una línea y lo hace si confirmás.
- Si pedís el mismo cambio en dos reels, Claude te pregunta si lo aplica a todos.
- Si el reel va con un audio en tendencia de Instagram, decilo. Claude no embebe música con copyright: deja marcado "la música se agrega en la app".
- Ante cualquier duda de Claude, contestá en el chat. No hace falta saber nada técnico.
