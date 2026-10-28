// Guardián del pipeline de edición: hook PreToolUse del plugin estratex-edicion.
// Lee el evento por stdin y, si corresponde, responde deny/ask por stdout.
// Reglas:
//   1. Crudos: nada escribe, mueve ni borra dentro de <Mes>/<DD-MM-AAAA>/.
//   2. Plugin: una sesión no modifica los archivos instalados del plugin
//      (salvo ESTRATEX_RESPONSABLE=1, para quien mantiene el kit).
//   3. Render: `hyperframes render` en un proyecto de _proyectos/ exige
//      REVISION.md con estado aprobado (o renderizado) y sin ✗ pendientes.
//   4. Publish: `hyperframes publish` siempre pide confirmación al editor.
// Ante un error interno no bloquea: el hook nunca debe trabar el trabajo
// por un bug propio. Lo que sí detecta, lo bloquea siempre.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
const FECHA_RE = /^\d{2}-\d{2}-\d{4}(-[A-Za-z])?$/;

const BORRAR_MOVER = new Set(['rm', 'rmdir', 'rd', 'del', 'erase', 'unlink', 'shred', 'truncate',
  'mv', 'move', 'ren', 'rename', 'remove-item', 'ri', 'move-item', 'mi', 'rename-item', 'rni',
  'clear-content', 'clc', 'set-content', 'sc', 'out-file', 'add-content', 'ac', 'new-item', 'ni']);
const COPIAR = new Set(['cp', 'copy', 'copy-item', 'cpi', 'xcopy', 'robocopy', 'ffmpeg', 'tee', 'tee-object']);
const CD = new Set(['cd', 'set-location', 'sl', 'pushd', 'chdir']);

const sinTildes = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function normalizar(p, cwd) {
  if (!p) return null;
  let s = String(p).trim().replace(/^['"]|['"]$/g, '');
  if (!s) return null;
  if (s.startsWith('~')) s = os.homedir() + s.slice(1);
  s = s.replace(/^\/([a-zA-Z])(\/|$)/, '$1:/'); // /e/VsCode → e:/VsCode (Git Bash)
  const glob = s.search(/[*?[]/);
  if (glob >= 0) s = s.slice(0, glob);
  if (!s) s = '.';
  return path.resolve(cwd || process.cwd(), s);
}

function segmentos(p) {
  return path.resolve(p).split(/[\\/]+/).filter(Boolean);
}

// Regla 1a: el path está dentro de una carpeta de material <Mes>/<DD-MM-AAAA>/.
export function esCrudo(p) {
  const segs = segmentos(p);
  for (let i = 1; i < segs.length; i++) {
    if (FECHA_RE.test(segs[i]) && MESES.includes(sinTildes(segs[i - 1]))) {
      if (!segs.slice(0, i).some(s => s.toLowerCase() === '_proyectos')) return true;
    }
  }
  return false;
}

// Regla 1b: el path es una carpeta que contiene material (Mes, cliente o raíz del workspace).
export function contieneCrudos(p, profundidad = 3) {
  try {
    if (!fs.statSync(p).isDirectory()) return false;
    const base = path.basename(p);
    if (base.toLowerCase() === '_proyectos') return false;
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const hijo = path.join(p, e.name);
      if (FECHA_RE.test(e.name) && MESES.includes(sinTildes(base))) return true;
      if (profundidad > 1 && contieneCrudos(hijo, profundidad - 1)) return true;
    }
  } catch { /* no existe o sin permiso: no es material */ }
  return false;
}

const protegeCrudo = p => esCrudo(p) || contieneCrudos(p);

function raicesPlugin() {
  if (process.env.ESTRATEX_RESPONSABLE === '1') return [];
  const raices = [];
  if (process.env.CLAUDE_PLUGIN_ROOT) raices.push(path.resolve(process.env.CLAUDE_PLUGIN_ROOT));
  return raices;
}

export function esPlugin(p) {
  const r = path.resolve(p).toLowerCase();
  if (raicesPlugin().some(root => r === root.toLowerCase() || r.startsWith(root.toLowerCase() + path.sep))) return true;
  if (process.env.ESTRATEX_RESPONSABLE === '1') return false;
  // Copias instaladas: ~/.claude/plugins/{cache,marketplaces}/…estratex…
  return /[\\/]\.claude[\\/]plugins[\\/](cache|marketplaces)[\\/][^\\/]*estratex/i.test(path.resolve(p));
}

// Tokeniza respetando comillas simples y dobles.
export function tokens(s) {
  const out = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

// Parte el comando en tramos por ; && || | y saltos de línea (fuera de comillas).
export function tramos(cmd) {
  const out = [];
  let cur = '', q = null;
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    const dos = cmd.slice(i, i + 2);
    if (dos === '&&' || dos === '||') { out.push(cur); cur = ''; i++; continue; }
    if (c === ';' || c === '|' || c === '\n') { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out.map(t => t.trim()).filter(Boolean);
}

function verbo(toks) {
  let i = 0;
  while (i < toks.length && ['&', 'sudo', 'command', 'call'].includes(toks[i].toLowerCase())) i++;
  if (toks[i] && /^cmd(\.exe)?$/i.test(toks[i]) && /^\/[ck]$/i.test(toks[i + 1] || '')) i += 2;
  const v = (toks[i] || '').toLowerCase().replace(/\.exe$/, '');
  return { v: path.basename(v), resto: toks.slice(i + 1) };
}

const esFlag = t => /^-{1,2}[A-Za-z]/.test(t) || /^\/[A-Za-z]{1,3}$/.test(t);

function destinoCopia(v, resto) {
  const iDest = resto.findIndex(t => /^-destination$/i.test(t));
  if (iDest >= 0) return resto[iDest + 1];
  const pos = resto.filter(t => !esFlag(t));
  if (v === 'robocopy') return pos[1];
  if (v === 'tee' || v === 'tee-object') return pos[0];
  return pos[pos.length - 1];
}

function redirecciones(t) {
  const out = [];
  const re = /\d?>>?\s*("([^"]+)"|'([^']+)'|([^\s;|&]+))/g;
  let m;
  while ((m = re.exec(t))) {
    const dst = m[2] ?? m[3] ?? m[4];
    if (!/^&\d$/.test(dst) && !/^(\$null|nul|\/dev\/null)$/i.test(dst)) out.push(dst);
  }
  return out;
}

// Directorio del proyecto que se renderiza/publica.
function dirProyecto(resto, cwd) {
  const conValor = new Set(['-o', '--output', '-c', '--composition', '--quality', '--fps', '--format', '-f', '-q']);
  for (let i = 0; i < resto.length; i++) {
    const t = resto[i];
    if (conValor.has(t)) { i++; continue; }
    if (esFlag(t)) continue;
    return normalizar(t, cwd);
  }
  return cwd;
}

function raizProyecto(dir) {
  let d = dir;
  for (let i = 0; i < 6 && d; i++) {
    if (fs.existsSync(path.join(d, 'hyperframes.json'))) return d;
    const padre = path.dirname(d);
    if (padre === d) break;
    d = padre;
  }
  return null;
}

export function revisarRender(dir) {
  const raiz = raizProyecto(dir) || dir;
  if (!segmentos(raiz).some(s => s.toLowerCase() === '_proyectos')) return null; // no es un reel de Estratex
  const rev = path.join(raiz, 'REVISION.md');
  if (!fs.existsSync(rev)) return `No se puede renderizar: el proyecto ${raiz} no tiene REVISION.md. Completá la revisión (checklist) y esperá el "aprobado" del editor.`;
  const txt = fs.readFileSync(rev, 'utf8');
  const fm = (txt.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
  const campo = k => ((fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) || [])[1] || '').replace(/#.*$/, '').trim().replace(/^["']|["']$/g, '');
  const estado = campo('estado');
  if (!['aprobado', 'renderizado'].includes(estado)) {
    return `No se puede renderizar: REVISION.md dice "estado: ${estado || '(vacío)'}". Solo se renderiza lo que el editor aprobó ("aprobado <fecha>").`;
  }
  const pendientes = txt.split(/\r?\n/).filter(l => /^\|.*\|\s*✗\s*\|/.test(l));
  if (pendientes.length && !campo('render_con_pendientes')) {
    return `No se puede renderizar: el checklist tiene ${pendientes.length} ✗ sin resolver (${pendientes.map(l => l.split('|')[1].trim()).join('; ')}). Corregilos, o si el editor autoriza renderizar igual, anotá el motivo en "render_con_pendientes" del frontmatter de REVISION.md.`;
  }
  return null;
}

export function evaluar(ev) {
  const tool = ev.tool_name || '';
  const ti = ev.tool_input || {};
  let cwd = ev.cwd || process.cwd();

  if (['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
    const p = normalizar(ti.file_path || ti.notebook_path, cwd);
    if (!p) return null;
    if (esCrudo(p)) return { decision: 'deny', motivo: `Bloqueado: ${p} está en una carpeta de material (crudos). El material del editor no se modifica; trabajá sobre la copia en _proyectos/.` };
    if (esPlugin(p)) return { decision: 'deny', motivo: `Bloqueado: ${p} es un archivo del plugin estratex-edicion. ESTILO.md, frame.md y las skills se cambian solo en el repo del kit (proponelo con /cerrar-mes o /relevar-estilo).` };
    return null;
  }

  if (tool !== 'Bash' && tool !== 'PowerShell') return null;
  const cmd = String(ti.command || '');

  for (const tramo of tramos(cmd)) {
    const toks = tokens(tramo);
    const { v, resto } = verbo(toks);

    if (CD.has(v)) {
      const dst = resto.find(t => !esFlag(t));
      if (dst) cwd = normalizar(dst, cwd);
      continue;
    }

    // Reglas 3 y 4: hyperframes render / publish (npx hyperframes[@x] …, npm run render)
    const hf = toks.findIndex(t => /^hyperframes(@\S+)?$/i.test(t));
    const sub = hf >= 0 ? (toks[hf + 1] || '').toLowerCase() : null;
    const npmRender = /^(npm|pnpm|yarn|bun)$/i.test(toks[0] || '') && toks.some(t => /^render(:|$)/i.test(t));
    if (sub === 'render' || sub === 'cloud' || npmRender) {
      const dir = sub ? dirProyecto(toks.slice(hf + 2), cwd) : cwd;
      const motivo = revisarRender(dir);
      if (motivo) return { decision: 'deny', motivo };
    }
    if (sub === 'publish') {
      const dir = dirProyecto(toks.slice(hf + 2), cwd);
      const raiz = raizProyecto(dir) || dir;
      if (segmentos(raiz).some(s => s.toLowerCase() === '_proyectos')) {
        return { decision: 'ask', motivo: `Esto sube el proyecto ${raiz} a HeyGen (privado). Confirmá solo si el editor pidió compartir este reel.` };
      }
    }

    // Reglas 1 y 2 en comandos de shell
    const candidatos = [];
    if (BORRAR_MOVER.has(v)) candidatos.push(...resto.filter(t => !esFlag(t)));
    if (COPIAR.has(v)) { const d = destinoCopia(v, resto); if (d) candidatos.push(d); }
    candidatos.push(...redirecciones(tramo));
    if (/^git$/i.test(v) && /^clean$/i.test(resto[0] || '')) candidatos.push(cwd);

    for (const c of candidatos) {
      const p = normalizar(c, cwd);
      if (!p) continue;
      if (protegeCrudo(p)) return { decision: 'deny', motivo: `Bloqueado: el comando modificaría o borraría material del editor (${p}). Los crudos no se tocan; copiá lo que necesites a _proyectos/.` };
      if (esPlugin(p)) return { decision: 'deny', motivo: `Bloqueado: el comando modificaría archivos del plugin estratex-edicion (${p}). Se cambian solo en el repo del kit.` };
    }
  }
  return null;
}

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  let res = null;
  try { res = evaluar(JSON.parse(raw.replace(/^﻿/, ''))); } catch { res = null; }
  if (res) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: res.decision,
        permissionDecisionReason: res.motivo,
      },
    }));
  }
  process.exit(0);
}

// Solo corre como hook; los tests importan evaluar() sin ejecutar main().
if (path.basename(process.argv[1] || '') === 'guardian.mjs') main();
