$ErrorActionPreference = "Stop"

$themes = @(
  "animals", "nature", "science", "robotics", "space", "fantasy", "art",
  "building", "sports", "music", "books", "math", "generic", "ballet"
)

$projectRoot = (Get-Location).Path
if (-not (Test-Path (Join-Path $projectRoot "package.json"))) {
  Write-Host "ERROR: Run this script from the project root (the folder that contains package.json)." -ForegroundColor Red
  exit 1
}

Write-Host "Cleaning old non-chess Form 2 attempts..." -ForegroundColor Cyan
foreach ($theme in $themes) {
  $target = Join-Path $projectRoot "public/assets/companions/$theme/form2"
  if (Test-Path $target) {
    Remove-Item -Recurse -Force $target
    Write-Host "Removed $target"
  }
}

# 'general' was an old incorrect theme id. The real id is 'generic'.
$legacyGeneral = Join-Path $projectRoot "public/assets/companions/general"
if (Test-Path $legacyGeneral) {
  Remove-Item -Recurse -Force $legacyGeneral
  Write-Host "Removed legacy general companion folder"
}

# Known QA/poster files from previous Form 2 attempts that may have been copied to project root.
$oldRootFiles = @(
  "FORM2_CONTACT_SHEET.jpg",
  "FORM2_CONTACT_SHEET.png",
  "form2_rebuild_contact.jpg",
  "form2_rebuild_contact_v2.jpg",
  "form2_rebuild_contact_clean.jpg",
  "form2_rebuild_contact_clean2.jpg"
)
foreach ($name in $oldRootFiles) {
  $candidate = Join-Path $projectRoot $name
  if (Test-Path $candidate) { Remove-Item -Force $candidate }
}

Write-Host "Cleanup complete. Now copy the contents of PROJECT_FILES into the project root." -ForegroundColor Green
