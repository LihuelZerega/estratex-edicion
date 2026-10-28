---
cliente: "<company_name>"
client_id: "<uuid>"
carpeta: "<nombre de carpeta en Estratex-Edicion>"
mes: "<YYYY-MM>"
mes_nombre: "<Octubre 2026>"
generado_el: "<YYYY-MM-DD HH:mm>"
plugin_version: "<versión de estratex-edicion>"
estilo_version: <número `version` del ESTILO.md del cliente>
estilo_estado: "<sin-relevar | borrador | relevado>"
meses_con_aprobados: <n, contando el mes editado>
historial: "<ESTABLECIDO | NUEVO>"
modo_edicion: "<ESTABLECIDO | NUEVO>"
---

<!-- Generado por /contexto-cliente. NO editar a mano: se pisa cada mes.
     Lo que quieras que perdure va en ESTILO.md (vía /cerrar-mes). -->

# <company_name> · <mes_nombre>

> **Modo de edición: <modo_edicion>.** <Una línea: por qué. Ej.: "Historial ESTABLECIDO (5 meses con aprobados) pero ESTILO.md sin relevar → se edita como NUEVO: 2 variantes en el reel piloto.">

## 1. Identidad
- **Persona de marca:** …
- **Tono:** …
- **Emociones a transmitir:** …
- **Palabras que la representan:** …
- **Palabras PROHIBIDAS (`avoid_words`):** … ← se verifican en subtítulos y textos (o "sin palabras concretas")
- **Pauta de tono a evitar:** <si avoid_words es una frase y no una lista> ← la QA la aplica por criterio
- **Misión / valores / visión:** …
- **Slogan · descripción corta:** …

## 2. Visual
- **Colores (HEX):** `#……` principal (o "(primero del manual)"), `#……`, …
- **Colores a evitar:** …
- **Fuentes:** principal `…`; otras: … · texto libre del manual, si lo hay: "…" · nombres a buscar en `_assets/fuentes/`: …
- **Logo:** <url de la plataforma> · archivo local esperado: `_assets/logo.*`
- **Referencias visuales:** …
- **Redes y contacto (para CTA):** IG …, TikTok …, WhatsApp …, web …

## 3. Audiencia y objetivos
- **Audiencia ideal:** …
- **Problema principal que resuelve:** …
- **Producto principal / diferenciales:** …
- **Objetivos:** …

## 4. Plan del mes: reels a editar
Una ficha por reel, en orden de `publish_date`. Se cruzan por fecha con las carpetas `DD-MM-AAAA`.

### <DD-MM-AAAA> · <estado planificación> / <estado gráfica>
- **post_id:** `<uuid>`
- **Idea:** <copy>
- **Servicios:** <required_services>
- **⚠ Incoherencia:** <solo si idea/caption y guion hablan de cosas distintas: qué dice cada uno>
- **GUION (voz en off):**
  > **HOOK:** "<literal>"
  >
  > **DESARROLLO:** "<literal>"
  >
  > **CIERRE:** "<literal>"
- **TEXTOS EN PANTALLA (literales):** <lista, o "— (el guion no trae)">
- **Visual:** <literal, o "—">
- **Copy final (caption):** <primera frase … frase final, sin hashtags; completo en la plataforma>
- **Devolución vigente sobre este post:** <graphics_rejection_reason / correction_request si hay, si no "—">

## 5. Historial aprobado (últimos 3 meses)
Para mantener continuidad de mensaje y no repetir hooks. Máximo 15.
| Mes | Fecha | Idea | Hook (1.ª frase del guion) | Gráfica |
|---|---|---|---|---|

## 6. Devoluciones de edición del cliente ← LO MÁS IMPORTANTE
Rechazos y correcciones de la fase de gráfica/edición, de la más nueva a la más vieja. Cada una tiene que tener su "cómo se respetó" en el `REVISION.md` de los reels.
| Fecha | Formato | Post (idea) | Devolución literal |
|---|---|---|---|

**Patrones detectados:** <2–4 líneas que resumen lo que se repite. Ej.: "pidió 3 veces subtítulos más grandes".>

<!-- Si no hay devoluciones: borrar la tabla y los patrones, y dejar solo la frase de la skill. Lo mismo en la sección 7. -->

## 7. Devoluciones de planificación
| Fecha | Idea | Devolución literal |
|---|---|---|

## 8. Notas internas
- **Calidad (`quality_notes`):** …
- **Notas del cliente (`client_notes`, general):** …
- **Memoria de Tex sobre el cliente:** …

## 9. Faltantes
Lo que falta para editar bien. **No se inventa: se consigue.**
- [ ] …
