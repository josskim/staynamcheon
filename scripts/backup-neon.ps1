$ErrorActionPreference = "Stop"

function Get-RepoRoot {
    Split-Path -Parent $PSScriptRoot
}

function Get-DatabaseUrl {
    $envPath = Join-Path (Get-RepoRoot) ".env"
    if (-not (Test-Path $envPath)) {
        throw "Cannot find .env at $envPath"
    }

    $content = Get-Content $envPath -Raw
    $match = [regex]::Match($content, 'DATABASE_URL\s*=\s*"?([^"\r\n]+)"?')
    if (-not $match.Success) {
        throw "DATABASE_URL was not found in .env"
    }

    return $match.Groups[1].Value.Trim()
}

function Get-EnvValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $envPath = Join-Path (Get-RepoRoot) ".env"
    if (-not (Test-Path $envPath)) {
        return $null
    }

    $content = Get-Content $envPath -Raw
    $pattern = "(?m)^\s*$([regex]::Escape($Name))\s*=\s*`"?([^`"\r\n]+)`"?\s*$"
    $match = [regex]::Match($content, $pattern)
    if (-not $match.Success) {
        return $null
    }

    return $match.Groups[1].Value.Trim()
}

function Get-PgDumpPath {
    $candidates = @(
        "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    $cmd = Get-Command pg_dump -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source) {
        return $cmd.Source
    }

    throw "pg_dump.exe was not found."
}

function Send-TelegramMessage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $botToken = Get-EnvValue -Name "TELEGRAM_BOT_TOKEN"
    $chatId = Get-EnvValue -Name "TELEGRAM_CHAT_ID"

    if (-not $botToken -or -not $chatId) {
        Write-Host "Telegram settings are missing. Skipping notification."
        return
    }

    $uri = "https://api.telegram.org/bot$botToken/sendMessage"
    $body = @{
        chat_id = $chatId
        text    = $Message
    }

    Invoke-RestMethod -Method Post -Uri $uri -Body $body | Out-Null
}

$repoRoot = Get-RepoRoot
$backupDir = Join-Path $repoRoot "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$retentionDays = 14
$now = Get-Date

Get-ChildItem -Path $backupDir -File -Filter "*.sql" -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $now.AddDays(-$retentionDays) } |
    Remove-Item -Force

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $backupDir "neon-backup-$timestamp.sql"
$pgDump = Get-PgDumpPath
$dbUrl = Get-DatabaseUrl

try {
    & $pgDump --dbname="$dbUrl" --no-owner --no-privileges --format=plain --file="$backupFile"

    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }

    $size = (Get-Item $backupFile).Length
    $sizeMb = [math]::Round($size / 1MB, 2)
    $message = @"
[staynamcheon backup] SUCCESS
File: $backupFile
Size: $sizeMb MB
Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@
    Send-TelegramMessage -Message $message
    Write-Host "Backup created: $backupFile"
}
catch {
    $errorMessage = $_.Exception.Message
    $message = @"
[staynamcheon backup] FAILED
Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Error: $errorMessage
"@
    try {
        Send-TelegramMessage -Message $message
    } catch {
        Write-Host "Failed to send Telegram notification: $($_.Exception.Message)"
    }
    throw
}
