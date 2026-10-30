# Instalacion del kit estratex-edicion en una PC de edicion (Windows).
# Uso: abrir PowerShell (no hace falta como administrador), pegar todo y Enter.
# Se puede correr de nuevo sin problema: saltea lo que ya esta hecho.

$ErrorActionPreference = 'Continue'
$Workspace = 'C:\Estratex-Edicion'
$Repo = 'LihuelZerega/estratex-edicion'

function Paso($t) { Write-Host "`n==> $t" -ForegroundColor Cyan }
function Ok($t) { Write-Host "    OK  $t" -ForegroundColor Green }
function Falla($t) { Write-Host "    ERROR  $t" -ForegroundColor Red }
function RefrescarPath {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path', 'User') + ';' +
              "$env:USERPROFILE\.local\bin"
}
function Tiene($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

Paso '1/7 Programas (Node, Git, GitHub CLI, ffmpeg)'
if (-not (Tiene winget)) { Falla 'No esta winget. Instala "App Installer" desde Microsoft Store y volve a correr esto.'; return }
$programas = @(
  @{ cmd = 'node';   id = 'OpenJS.NodeJS.LTS' },
  @{ cmd = 'git';    id = 'Git.Git' },
  @{ cmd = 'gh';     id = 'GitHub.cli' },
  @{ cmd = 'ffmpeg'; id = 'Gyan.FFmpeg' }
)
foreach ($p in $programas) {
  if (Tiene $p.cmd) { Ok "$($p.cmd) ya instalado" }
  else {
    winget install --id $p.id -e --accept-package-agreements --accept-source-agreements --silent
    RefrescarPath
    if (Tiene $p.cmd) { Ok "$($p.cmd) instalado" } else { Falla "$($p.cmd) no quedo disponible. Cerra PowerShell, abrilo de nuevo y volve a correr esto." ; return }
  }
}

Paso '2/7 Claude Code (linea de comandos)'
RefrescarPath
if (-not (Tiene claude)) {
  Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
  RefrescarPath
}
if (Tiene claude) { Ok "claude $(claude --version)" } else { Falla 'No se pudo instalar claude.'; return }

Paso '3/7 Acceso a GitHub (repo privado del kit)'
gh auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host '    Se abre el login de GitHub. Elegi: GitHub.com > HTTPS > Yes > Login with a web browser.' -ForegroundColor Yellow
  gh auth login --hostname github.com --git-protocol https --web
}
gh auth setup-git
gh repo view $Repo --json name 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { Ok 'La cuenta tiene acceso al repo' }
else { Falla "La cuenta de GitHub no tiene acceso a $Repo. Pedile al responsable que la invite y acepta la invitacion (github.com/notifications)."; return }

Paso '4/7 Clonar por HTTPS (variable de entorno)'
[Environment]::SetEnvironmentVariable('CLAUDE_CODE_PLUGIN_PREFER_HTTPS', '1', 'User')
$env:CLAUDE_CODE_PLUGIN_PREFER_HTTPS = '1'
Ok 'CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1'

Paso '5/7 Skills de HyperFrames'
Write-Host '    Si pregunta en que agentes instalar, elegi Claude Code.' -ForegroundColor Yellow
npx -y skills add heygen-com/hyperframes
Ok 'Skills de HyperFrames'

Paso '6/7 Kit estratex-edicion'
$mk = claude plugin marketplace list 2>&1 | Out-String
if ($mk -notmatch 'estratex') { claude plugin marketplace add $Repo }
claude plugin install estratex-edicion@estratex
$lista = claude plugin list 2>&1 | Out-String
if ($lista -match 'estratex-edicion@estratex') { Ok 'Plugin instalado' } else { Falla 'El plugin no aparece instalado. Mandale al responsable lo que se ve arriba.'; return }

Paso "7/7 Carpetas de trabajo en $Workspace"
$cache = Join-Path $env:USERPROFILE '.claude\plugins\cache\estratex\estratex-edicion'
$json = Get-ChildItem $cache -Directory -ErrorAction SilentlyContinue |
  Sort-Object { try { [version]$_.Name } catch { [version]'0.0' } } -Descending |
  ForEach-Object { Join-Path $_.FullName 'clientes\clientes.json' } | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($json) {
  $clientes = (Get-Content $json -Raw -Encoding UTF8 | ConvertFrom-Json).clientes
  foreach ($c in $clientes) { New-Item -ItemType Directory -Force (Join-Path $Workspace "$($c.carpeta)\_assets\fuentes") | Out-Null }
  Ok "$($clientes.Count) carpetas de clientes"
} else { Falla "No encontre clientes.json del plugin en $cache" }

Write-Host "`nListo. Faltan 2 cosas, dentro de Claude Desktop:" -ForegroundColor Green
Write-Host "  1. Pestana Code > nueva sesion en la carpeta $Workspace"
Write-Host "  2. Escribi /mcp > plugin:estratex-edicion:estratex-db > Authenticate, e inicia sesion en Supabase"
Write-Host "Si Claude Desktop estaba abierto, cerralo del todo (tambien de la bandeja) y abrilo de nuevo antes."
