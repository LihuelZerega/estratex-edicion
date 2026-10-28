---
name: cerrar-mes
description: Cierra el mes de edición de un cliente de Estratex. Junta las revisiones de todos los reels y produce APRENDIZAJES (métricas y cambios propuestos al ESTILO.md y al frame.md) para que el responsable los incorpore al plugin. Usar con "/cerrar-mes <cliente>" cuando el mes está renderizado.
---

# /cerrar-mes

El contexto curado (`ESTILO.md`, `frame.md`) vive en el plugin, igual en todas las PCs. Por eso ninguna sesión lo modifica: esta skill genera una **propuesta** que revisa el responsable.

## Pasos
1. Resolver cliente y mes. Leer todos los `REVISION.md` de `<cliente>/_proyectos/<YYYY-MM>/`, el `CLIENTE.md` del mes, el `ESTILO.md` del plugin y el `_look/frame.md` del mes si existe.
2. Si hay reels sin renderizar o con ✗ abiertos, listarlos y preguntar si se cierra igual.
3. **Métricas** por reel: rondas, excepciones al estilo y clips descartados.
4. **Cambios propuestos.** Para que algo entre como propuesta tiene que cumplir una de estas condiciones, y cada propuesta lleva su evidencia (qué reel, qué ronda, qué pidió quién):
   - se repitió en 2 o más reels (mismo pedido del editor, misma excepción);
   - el editor pidió explícitamente que quede como regla;
   - es la variante elegida del reel piloto (clientes NUEVOS).
5. **frame.md**: si el `_look/frame.md` del mes difiere del `frame.md` del plugin (o el plugin no tiene uno), adjuntarlo como propuesta.
6. Escribir `<cliente>/_contexto/APRENDIZAJES-<YYYY-MM>.md` con `../../templates/APRENDIZAJES.template.md` y copiar al lado el `frame.md` propuesto, si hay.
7. Decirle al editor que mande esos dos archivos al responsable. El responsable actualiza `clientes/<slug>/ESTILO.md` (con `version` + 1 y una fila de Changelog) y `frame.md` en el plugin. El próximo `/contexto-cliente` va a tomar esa versión.
