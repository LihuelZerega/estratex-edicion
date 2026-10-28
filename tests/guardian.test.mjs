// node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { evaluar } from '../plugins/estratex-edicion/scripts/guardian.mjs';

// Workspace de prueba: Estratex-Edicion/Atelier/{Octubre/08-10-2026, _proyectos/2026-10/08-10-2026}
const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'guardian-'));
const cli = path.join(ws, 'Estratex-Edicion', 'Atelier');
const reel = path.join(cli, 'Octubre', '08-10-2026');
const clip = path.join(reel, '08-10-2026-01.mp4');
const proy = path.join(cli, '_proyectos', '2026-10', '08-10-2026');
const plugin = path.join(ws, 'plugin-root');
for (const d of [reel, path.join(proy, 'media'), plugin]) fs.mkdirSync(d, { recursive: true });
fs.writeFileSync(clip, 'x');
fs.writeFileSync(path.join(proy, 'hyperframes.json'), '{}');

const rev = (estado, extra = '', filas = '| Duración | ✓ | 28 s |') =>
  fs.writeFileSync(path.join(proy, 'REVISION.md'),
    `---\nreel: "08-10-2026"\nestado: ${estado}        # comentario\nrender_con_pendientes: "${extra}"\n---\n\n## Checklist\n| Ítem | ✓/✗ | Evidencia |\n|---|---|---|\n${filas}\n`);

const bash = (command, cwd = cli, tool = 'Bash') => evaluar({ tool_name: tool, tool_input: { command }, cwd });
const write = (file_path, tool = 'Write') => evaluar({ tool_name: tool, tool_input: { file_path }, cwd: cli });
const deny = r => assert.equal(r?.decision, 'deny', JSON.stringify(r));
const allow = r => assert.equal(r, null, JSON.stringify(r));

test('crudos: escribir o editar dentro de la carpeta de material se bloquea', () => {
  deny(write(clip));
  deny(write(path.join(reel, 'notas.txt'), 'Edit'));
  deny(write('Octubre/08-10-2026/nuevo.txt'));
});

test('crudos: trabajar en _proyectos y _contexto está permitido', () => {
  allow(write(path.join(proy, 'index.html')));
  allow(write(path.join(cli, '_contexto', 'CLIENTE.md')));
  allow(bash(`rm -rf "${path.join(proy, 'media')}"`));
});

test('crudos: borrar, mover o pisar material por shell se bloquea', () => {
  deny(bash(`rm "${clip}"`));
  deny(bash('Remove-Item -Recurse -Force "Octubre"', cli, 'PowerShell'));
  deny(bash(`rm -rf "${cli}"`, ws));
  deny(bash('rm -rf Estratex-Edicion/*', ws));
  deny(bash(`cmd /c del /q "${clip}"`));
  deny(bash(`mv "${clip}" "${proy}"`));
  deny(bash(`ffmpeg -i "${path.join(proy, 'a.mp4')}" -y "${clip}"`));
  deny(bash(`Copy-Item -Path a.mp4 -Destination "${reel}"`, cli, 'PowerShell'));
  deny(bash(`echo hola > "${path.join(reel, 'notas.txt')}"`));
  deny(bash('cd Octubre && rm 08-10-2026/08-10-2026-01.mp4'));
  const gitBash = clip.replace(/^([A-Za-z]):/, (_, d) => '/' + d.toLowerCase()).replace(/\\/g, '/');
  deny(bash(`rm "${gitBash}"`));
});

test('crudos: leer y copiar material hacia el proyecto está permitido', () => {
  allow(bash(`ffprobe -v error "${clip}"`));
  allow(bash(`cp "${clip}" "${path.join(proy, 'media')}/"`));
  allow(bash(`ffmpeg -i "${clip}" -vf scale=1080:1920 "${path.join(proy, 'media', 'c1.mp4')}"`));
  allow(bash(`Copy-Item -Path "${clip}" -Destination "${path.join(proy, 'media')}"`, cli, 'PowerShell'));
  allow(bash(`ls "${reel}" 2>&1 > $null`));
});

test('plugin: no se modifica salvo el responsable', () => {
  process.env.CLAUDE_PLUGIN_ROOT = plugin;
  deny(write(path.join(plugin, 'clientes', 'atelier', 'ESTILO.md'), 'Edit'));
  deny(bash(`rm -rf "${plugin}"`));
  process.env.ESTRATEX_RESPONSABLE = '1';
  allow(write(path.join(plugin, 'clientes', 'atelier', 'ESTILO.md'), 'Edit'));
  delete process.env.ESTRATEX_RESPONSABLE;
  delete process.env.CLAUDE_PLUGIN_ROOT;
  deny(write(path.join(os.homedir(), '.claude', 'plugins', 'cache', 'estratex', 'estratex-edicion', '0.1.3', 'x.md')));
});

test('render: exige REVISION.md aprobado y sin ✗', () => {
  fs.rmSync(path.join(proy, 'REVISION.md'), { force: true });
  deny(bash('npx hyperframes render', proy));
  rev('en-revision');
  deny(bash('npx hyperframes render --quality delivery', proy));
  deny(bash(`cd "${proy}" && npx hyperframes@latest render -o out.mp4`));
  deny(bash(`npx hyperframes render "${proy}" --output final.mp4`));
  deny(bash('npm run render', proy));
  rev('aprobado');
  allow(bash('npx hyperframes render --quality delivery', proy));
  allow(bash(`npx hyperframes render "${proy}" -o renders/atelier-08-10-2026.mp4`));
  rev('renderizado');
  allow(bash('npx hyperframes render', path.join(proy, 'media')));
  rev('aprobado', '', '| Duración | ✓ | 28 s |\n| Textos literales | ✗ | falta CTA |');
  deny(bash('npx hyperframes render', proy));
  rev('aprobado', 'el editor autorizó sin CTA', '| Textos literales | ✗ | falta CTA |');
  allow(bash('npx hyperframes render', proy));
});

test('render: proyectos fuera de _proyectos no se tocan; snapshot y preview siguen libres', () => {
  const otro = path.join(ws, 'otro-video');
  fs.mkdirSync(otro, { recursive: true });
  allow(bash('npx hyperframes render', otro));
  rev('en-revision');
  allow(bash('npx hyperframes snapshot', proy));
  allow(bash('npx hyperframes preview --background', proy));
  allow(bash('npx hyperframes check', proy));
});

test('publish: pide confirmación en reels de Estratex', () => {
  assert.equal(bash('npx hyperframes publish', proy)?.decision, 'ask');
  allow(bash('npx hyperframes publish', path.join(ws, 'otro-video')));
});

test('otras tools y entradas raras no bloquean', () => {
  assert.equal(evaluar({ tool_name: 'Read', tool_input: { file_path: clip }, cwd: cli }), null);
  assert.equal(evaluar({ tool_name: 'Bash', tool_input: {}, cwd: cli }), null);
  assert.equal(evaluar({}), null);
});

test.after(() => fs.rmSync(ws, { recursive: true, force: true }));
