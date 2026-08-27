param(
  [string]$Message,

  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

function Get-ChangedFiles {
  $tracked = @(git diff --name-only)
  $staged = @(git diff --cached --name-only)
  $untracked = @(git ls-files --others --exclude-standard)

  return @($tracked + $staged + $untracked) |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
    Sort-Object -Unique
}

Push-Location $repoRoot

try {
  if (-not $SkipBuild) {
    Write-Host "Running build check..." -ForegroundColor Cyan
    npm run build
  }

  $changedFiles = Get-ChangedFiles

  if ($changedFiles.Count -eq 0) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    exit 0
  }

  foreach ($file in $changedFiles) {
    git add -- $file
  }

  if (-not $Message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Message = "Sync: $timestamp"
  }

  git commit -m $Message
  git push origin main

  Write-Host "GitHub sync completed." -ForegroundColor Green
}
finally {
  Pop-Location
}
