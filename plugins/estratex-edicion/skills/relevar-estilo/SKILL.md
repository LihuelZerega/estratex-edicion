---
name: relevar-estilo
description: Releva el estilo de edición de un cliente de Estratex (hoy "en la cabeza" del editor) y produce un borrador de ESTILO.md para el plugin. Usar con "/relevar-estilo <cliente>", o cuando /contexto-cliente marca un cliente con historial ESTABLECIDO y ESTILO.md sin relevar.
---

# /relevar-estilo

Convierte lo que el editor sabe de un cliente en un `ESTILO.md` escrito. Hasta que ese archivo esté `relevado`, el cliente se edita en modo NUEVO.

## Pasos
1. Resolver el cliente con `../../clientes/clientes.json` y leer `../../clientes/<slug>/ESTILO.md` (lo que ya haya), `../../base/ESTILO-BASE.md` y, si existe, `<cliente>/_contexto/CLIENTE.md` (devoluciones y manual).
2. **Reels de referencia.** Pedir al editor 2 o 3 reels ya publicados y aprobados del cliente (arrastrar los MP4). Para cada uno:
   - `ffprobe` (duración, fps);
   - transcripción (`npx hyperframes transcribe`);
   - frames cada 0,5 s con ffmpeg, para medir el ritmo de corte (cambios de plano por segundo), ver el estilo y la posición de los subtítulos, las transiciones y el cierre.
   Resumir lo observado en una tabla por reel. Son **hechos medidos**, no opiniones.
3. **Entrevista.** Una pregunta por mensaje, con la observación del paso 2 como respuesta propuesta ("en los 3 reels el corte es cada ~2 s, ¿es la regla?"). Saltear lo que ya esté claro. Las preguntas, en orden:
   1. Duración típica y tope.
   2. Cómo arranca el hook.
   3. Ritmo de corte y jump cuts.
   4. Subtítulos: si lleva, estilo, tamaño, posición, resaltado.
   5. Tipografías y colores en pantalla (dentro del manual).
   6. Transiciones permitidas.
   7. Transiciones y efectos prohibidos.
   8. Punch-ins y zooms.
   9. Otros recursos (stickers, flechas, overlays).
   10. Música: género, energía, ejemplos, si se agrega en la app.
   11. SFX.
   12. Cierre: logo y CTA.
   13. Qué pidió corregir el cliente alguna vez que no esté en la plataforma.
   14. Qué no hay que hacer nunca.
   15. Algo que diferencie a este cliente de los demás.
4. Escribir `ESTILO.md` con `../../templates/ESTILO.template.md`: `estado: borrador`, `version` + 1, `relevado_por` y `actualizado`, y una fila nueva en el Changelog. Solo lo que el editor confirmó o lo que se midió; lo demás queda vacío (sale del ESTILO-BASE).
5. Guardarlo **como propuesta** en `<cliente>/_contexto/ESTILO.propuesto.md`, nunca directo en el plugin. Decirle al editor que el responsable lo revisa, lo pasa a `estado: relevado` y lo sube al plugin. A partir de esa versión, el cliente se edita como ESTABLECIDO (si su historial lo es).
