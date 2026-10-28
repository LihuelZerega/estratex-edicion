---
cliente: "<company_name>"
reel: "<DD-MM-AAAA>"
post_id: "<uuid>"
ronda: 1
estado: en-revision        # en-revision | aprobado | renderizado  (el hook solo deja renderizar aprobado/renderizado)
render_con_pendientes: ""  # motivo, si el editor autorizó renderizar con ✗ abiertos
studio: "<link de hyperframes preview>"
publicado: ""              # URL de hyperframes publish si se compartió
render: ""                 # ruta del MP4 final
---

# Revisión · <cliente> · <DD-MM-AAAA>

## Resumen
- Duración: <s> · Clips usados: <n>/<total> · Modo: <ESTABLECIDO | NUEVO>
- Música: <origen> · Transiciones: <lista>

## Snapshots
<rutas de snapshots: hook, mitad de desarrollo, cierre>

## Checklist (base/QA-CHECKLIST.md)
<!-- Una fila por ítem. La segunda columna lleva solo ✓, ✗ o N/A: el hook de render busca "| ✗ |". -->
| Ítem | ✓/✗ | Evidencia |
|---|---|---|

## Devoluciones previas → cómo se respetaron
| Devolución | Cómo se respetó |
|---|---|

## Clips descartados
| Clip | Motivo |
|---|---|

## Excepciones al estilo
| Qué | Por qué (notas.txt / pedido del editor) |
|---|---|

## Rondas
| Ronda | Pedido del editor | Cambios hechos |
|---|---|---|
