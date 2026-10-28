---
workflow: general-video
flow: automation
storyboard: no
message: "<la idea del post (copy) en una frase>"
destination: instagram-reels
aspect: 1080x1920
language: es
audience: "<audiencia ideal del manual, en una línea>"
length: "<duración estimada a partir del guion, ej. 28s>"
---

<!-- Lo escribe /editar-mes después de `npx hyperframes init`. HyperFrames lo lee como
     brief confirmado y no hace preguntas de intención. -->

## Intent

Reel de <cliente> para publicar el <DD-MM-AAAA>. Edita material grabado (no se inventan visuales): cuenta el guion aprobado en orden HOOK → DESARROLLO → CIERRE + CTA. Contexto del cliente en `<ruta>/_contexto/CLIENTE.md`; estilo en el `ESTILO.md` del plugin y `ESTILO-BASE.md`. Modo de edición: <ESTABLECIDO | NUEVO>.

## Assets

- <ruta>/<DD-MM-AAAA>-01.mp4 — clip 1, va primero
- <ruta>/<DD-MM-AAAA>-02.mp4 — clip 2
- <ruta>/vo.mp3 — voz en off (si existe)
- <ruta cliente>/_assets/logo.* — logo para el cierre
- <ruta cliente>/_assets/fuentes/ — fuentes del manual

## Customizations

- Subtítulos según ESTILO (fuente <…>, resaltado <#HEX>).
- Textos en pantalla literales: <lista>.
- Cierre: CTA "<…>" + logo.
- <excepciones de notas.txt o del editor>

## Notes

- Guion literal (voz en off): "<…>"
- Visual: <línea Visual: del guion>
- Devoluciones del cliente a respetar: <lista corta>
- Prohibido: <avoid_words>, <avoid_colors>, música con copyright embebida.
