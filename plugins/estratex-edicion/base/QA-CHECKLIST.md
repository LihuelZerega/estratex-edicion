# Checklist de QA por reel

Claude lo completa en el `REVISION.md` de cada reel **antes** de mostrar el link del Studio. Cada ítem es ✓ / ✗ / N/A con una línea de evidencia (tiempo, archivo o valor). Un ✗ bloquea el render salvo que el editor escriba explícitamente "renderizá igual 08-10" y el motivo quede anotado.

## Nivel 1: técnico (automático)
- [ ] `npx hyperframes check` sin errores.
- [ ] 1080×1920, 30 fps.
- [ ] Duración dentro del rango (`ESTILO.md` o, si no dice nada, `ESTILO-BASE` § 1).
- [ ] Nada importante fuera de las zonas seguras (revisado en los snapshots).
- [ ] Sin frames negros ni congelados no buscados.
- [ ] Loudness −14 LUFS ±1, true peak ≤ −1 dBTP (si todavía no se renderizó, se mide en el render y se completa ahí).

## Nivel 2: contra el contexto (automático, explicado)
- [ ] Orden HOOK → DESARROLLO → CIERRE + CTA respetado.
- [ ] Textos en pantalla **idénticos** a "TEXTOS EN PANTALLA" del guion (pegar ambos si hay diferencia).
- [ ] Ninguna `avoid_word` en subtítulos ni textos (o, si el manual trae una pauta de tono, ningún recurso que la contradiga).
- [ ] Sin rótulos inventados: si el guion no trae textos en pantalla, solo subtítulos + hook + CTA literales.
- [ ] Decisiones del preflight (❓) aplicadas según `BRIEF.md`.
- [ ] Solo colores HEX y fuentes del manual; ningún `avoid_color`.
- [ ] Logo correcto (archivo de `_assets/`) y CTA presentes en el cierre.
- [ ] Cada devolución de edición previa del cliente (sección 7 de `CLIENTE.md`) con su línea "cómo se respetó".
- [ ] Todos los clips usados, o descartados con motivo.
- [ ] Excepciones a `ESTILO.md` listadas con su motivo (`notas.txt` o pedido del editor).
- [ ] Música: origen anotado (`_assets/`, `media-use`, o "se agrega en la app").

## Nivel 3: humano y de resultado
- [ ] El editor revisó en el Studio y escribió "aprobado <fecha>".
- [ ] Render hecho y archivo en `renders/`.
- [ ] (Después, en la plataforma) aprobación del cliente: `graphics_status`. El `/contexto-cliente` del mes siguiente lo levanta solo.
