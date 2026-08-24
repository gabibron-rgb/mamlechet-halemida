$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
  Write-Host "ERROR: Run this script from the project root (the folder that contains package.json)." -ForegroundColor Red
  exit 1
}

$base = ".\public\assets\companions\chess\form2"
$obsolete = @(
  "chess-form2-body.png",
  "chess-form2-front-left-leg.png",
  "chess-form2-front-right-leg.png",
  "chess-form2-back-left-leg.png",
  "chess-form2-back-right-leg.png",
  "chess-form2-head.png",
  "chess-form2-head-closed.png",
  "chess-form2-tail.png",
  "chess-form2-pendant.png",
  "chess-form2-reference.png"
)

Write-Host "Cleaning obsolete Chess Form 2 experiment assets..." -ForegroundColor Cyan
foreach ($name in $obsolete) {
  $path = Join-Path $base $name
  if (Test-Path $path) {
    Remove-Item $path -Force
    Write-Host "Removed $path"
  }
}

Write-Host "Done. The new frames folder was not touched." -ForegroundColor Green
