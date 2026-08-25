$ErrorActionPreference = "Stop"
$themes = @("chess","science","space","animals","nature","robotics","fantasy","art","building","sports","music","books","math","generic","ballet")
foreach ($theme in $themes) {
  $path = Join-Path $PSScriptRoot "public\assets\companions\$theme\form3"
  if (Test-Path $path) { Remove-Item $path -Recurse -Force }
}
Write-Host "Old Form 3 folders removed. Now copy PROJECT_FILES into the project root." -ForegroundColor Green
