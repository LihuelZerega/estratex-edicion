---
documento: ESTILO-BASE
version: 0.1.0
estado: borrador — valores por defecto a validar por el responsable de edición
---

# Estilo base de edición Estratex (reels)

Esto es lo que se aplica a **todos** los clientes. El `ESTILO.md` de cada cliente puede pisar cualquier punto; lo que no diga, sale de acá. Las reglas marcadas **[fija]** no las pisa nadie: son de formato y de calidad, no de gusto.

## 1. Formato de salida
- **[fija]** 1080×1920 (9:16), 30 fps, MP4 H.264 + AAC 48 kHz.
- Duración: la del guion hablado. 65–90 palabras ≈ 20–35 s. Tope 60 s salvo que el post diga otra cosa.
- **[fija]** Zonas seguras (Instagram/TikTok): nada importante en los 220 px de arriba, los 420 px de abajo ni los 120 px de la derecha. Subtítulos y textos en pantalla viven entre esas zonas.

## 2. Estructura (siempre la del guion)
El guion viene en `design_notes` con **HOOK → DESARROLLO → CIERRE + CTA**. La edición respeta ese orden.
- **Hook (0–1,5 s):** arranca en movimiento o en la frase más fuerte. Sin logo, sin fundido desde negro, sin "hola". El texto del hook aparece en el primer segundo.
- **Desarrollo:** un plano por idea; cambio de plano cada 1,5–3 s.
- **Cierre:** CTA del guion en texto + logo en los últimos 1,5–2 s.

## 3. Ritmo y cortes
- Cortar silencios de más de 0,35 s y muletillas ("eh", "este", repeticiones) con jump cuts.
- Ningún plano estático de más de 4 s: si el material lo obliga, punch-in (110–120 %) o reencuadre lento.
- Punch-in en las palabras de énfasis del guion, no al azar.
- Los clips se usan en el orden de numeración. Si un clip no sirve (desenfocado, repetido, mala toma), se descarta y se anota el motivo en `REVISION.md`.

## 4. Subtítulos
- Siempre, salvo que `ESTILO.md` diga lo contrario. Transcriptos del audio real, no del guion: si el talento dijo otra cosa, manda lo que dijo.
- Bloques de 2–4 palabras, máximo 2 líneas.
- Fuente: `main_font` del manual (o la primera de `fonts`). Palabra clave resaltada con el color principal de la marca.
- Legibilidad **[fija]**: contorno o sombra que asegure contraste sobre cualquier fondo.
- Posición: entre el 55 % y el 70 % del alto, dentro de la zona segura.

## 5. Textos en pantalla
- **[fija]** Se copian **literales** de la sección "TEXTOS EN PANTALLA" del guion. No se reescriben, no se corrigen, no se agregan emojis. Si hay un error evidente, se marca en `REVISION.md` y se pregunta.
- Máximo 6 palabras por línea; colores y fuentes solo del manual.
- **Si el guion no trae "TEXTOS EN PANTALLA"** (pasa seguido): no se inventan rótulos. Van los subtítulos, más el texto del hook y el del CTA, tomados **literales** de la primera frase hablada y de la frase de CTA del cierre. Cualquier otro rótulo lo tiene que pedir el editor o estar en el `ESTILO.md`.

## 6. Transiciones y efectos
- Por defecto: **corte seco**.
- Permitidas solo en cambio de bloque (hook → desarrollo → cierre): whip pan, zoom-through o match cut. Máximo 3 por reel.
- Antes de armar un efecto a mano, buscarlo en el catálogo de HyperFrames (`/hyperframes-registry`).
- Prohibido: transiciones de plantilla (cubo, página, estrellas), glitch o efectos de moda que no estén en el `ESTILO.md` del cliente.

## 7. Sonido
- Voz/diálogo siempre por encima de todo.
- Música: instrumental, sin voz, con la energía que pida el `ESTILO.md`. Por debajo de la voz con ducking (≈ −20 a −24 dB respecto de la VO).
- SFX: sutiles. Whoosh en transiciones, pop en la aparición de textos clave. Nunca más fuerte que la voz.
- **[fija]** Loudness final: −14 LUFS integrado, true peak ≤ −1 dBTP.
- **[fija]** No se embebe música con copyright. Si el reel va con un audio en tendencia de Instagram, se edita con una guía y se marca "MÚSICA SE AGREGA EN LA APP" en `REVISION.md`.

## 8. Color e imagen
- Corrección básica: exposición, balance de blancos y contraste parejos entre clips del mismo reel.
- Sin LUT ni looks fuertes salvo que el `ESTILO.md` los pida.
- No usar colores de `avoid_colors` en gráficos ni textos.

## 9. Marca
- Logo solo en el cierre (salvo `ESTILO.md`). Desde `_assets/` del cliente; si no está, se marca como faltante y se pide. **[fija]** Nunca redibujar ni "aproximar" un logo.
- **[fija]** Fuentes y colores solo los del manual de marca. Si la fuente no está en `_assets/fuentes/`, se avisa y se usa la alternativa que indique el responsable, nunca una elegida al azar.
- **[fija]** Ninguna palabra de `avoid_words` en subtítulos ni textos. Si el talento la dijo, se avisa al editor. Si el manual trae una **pauta de tono** en lugar de palabras, no se agregan a la edición recursos que la contradigan (por ejemplo, urgencia o "últimos lugares" cuando la pauta es "nada que demuestre desesperación").

## 10. Lo que nunca se hace
- Marcas de agua, stock genérico que no esté aprobado, contenido inventado (datos, precios, promesas) que no esté en el guion.
- Cambiar el mensaje del guion aprobado. La edición cuenta el guion; no lo reescribe.
