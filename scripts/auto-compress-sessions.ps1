# Auto-compress AI CLI Tool Sessions
# Universal session compressor for AI CLI coding tools

[CmdletBinding()]
param(
    [string]$ConfigPath = "..\CONFIG.json",
    [int]$MaxSizeKB = 500,
    [int]$MaxLines = 300,
    [int]$KeepMessages = 100,
    [int]$KeepSystemLines = 5,
    [switch]$NoBackup,
    [string]$SpecificSession,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Import config if exists
$Config = $null
if (Test-Path $ConfigPath) {
    try {
        $ConfigContent = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        $Config = $ConfigContent
    } catch {
        Write-Warning "Failed to load config: $_"
    }
}

# Apply config defaults if not overridden
if ($Config -and -not $PSBoundParameters.ContainsKey('MaxSizeKB')) {
    $MaxSizeKB = $Config.thresholds.maxSizeKB
}
if ($Config -and -not $PSBoundParameters.ContainsKey('MaxLines')) {
    $MaxLines = $Config.thresholds.maxLines
}
if ($Config -and -not $PSBoundParameters.ContainsKey('KeepMessages')) {
    $KeepMessages = $Config.compression.keepMessages
}
if ($Config -and -not $PSBoundParameters.ContainsKey('KeepSystemLines')) {
    $KeepSystemLines = $Config.compression.keepSystemLines
}
$CreateBackup = $NoBackup -eq $false
if ($Config -and -not $PSBoundParameters.ContainsKey('NoBackup')) {
    $CreateBackup = $Config.compression.createBackup
}

# Track statistics
$stats = @{
    Checked = 0
    Compressed = 0
    Skipped = 0
    TotalSavedKB = 0
    Errors = @()
}

function Expand-Path {
    param([string]$Path)
    $expanded = [System.IO.Path]::GetFullPath($Path -replace '\~', $env:USERPROFILE)
    return $expanded
}

function Get-ToolSessions {
    $sessions = @()

    # If specific session provided, use it
    if ($SpecificSession) {
        $path = Expand-Path $SpecificSession
        if (Test-Path $path) {
            $sessions += @{
                Path = $path
                Tool = "custom"
            }
        } else {
            Write-Error "Session file not found: $SpecificSession"
        }
        return $sessions
    }

    # Scan configured tools
    if ($Config -and $Config.tools) {
        foreach ($toolName in $Config.tools.PSObject.Properties.Name) {
            $tool = $Config.tools.$toolName
            if ($tool.enabled -eq $false) { continue }

            $sessionDir = Expand-Path $tool.sessionDir
            if (Test-Path $sessionDir) {
                Write-Verbose "Scanning $toolName sessions in $sessionDir"

                $sessionFiles = Get-ChildItem -Path $sessionDir -Filter "*.jsonl" -File
                foreach ($file in $sessionFiles) {
                    $sessions += @{
                        Path = $file.FullName
                        Tool = $toolName
                    }
                }
            } else {
                Write-Verbose "Session directory not found for $toolName`: $sessionDir"
            }
        }
    }

    # Fallback: search common locations
    $commonPaths = @(
        "$env:USERPROFILE\.cursor\sessions",
        "$env:USERPROFILE\.aider\sessions",
        "$env:USERPROFILE\.claude\sessions",
        "$env:USERPROFILE\.openclaw\agents\main\sessions",
        "$env:USERPROFILE\.cursor\sessions",
        "$env:APPDATA\Cursor\User\sessions"
    )

    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $existingTools = $sessions | ForEach-Object { $_.Tool }
            $toolName = Split-Path $path -Leaf
            if ($existingTools -notcontains $toolName) {
                Write-Verbose "Scanning $toolName in $path"
                $sessionFiles = Get-ChildItem -Path $path -Filter "*.jsonl" -File -ErrorAction SilentlyContinue
                foreach ($file in $sessionFiles) {
                    $sessions += @{
                        Path = $file.FullName
                        Tool = $toolName
                    }
                }
            }
        }
    }

    # Remove duplicates
    $uniquePaths = @{}
    $uniqueSessions = @()
    foreach ($session in $sessions) {
        if (-not $uniquePaths.ContainsKey($session.Path)) {
            $uniquePaths[$session.Path] = $true
            $uniqueSessions += $session
        }
    }

    return $uniqueSessions
}

function Compress-SessionFile {
    param(
        [string]$Path,
        [string]$Tool
    )

    $stats.Checked++

    $fileName = Split-Path $Path -Leaf

    # Check if file exists
    if (-not (Test-Path $Path)) {
        Write-Warning "File not found: $Path"
        $stats.Errors += "File not found: $Path"
        return
    }

    # Get file info
    $fileSizeKB = (Get-Item $Path).Length / 1KB
    $lines = @(Get-Content $Path).Count

    # Calculate required lines
    $requiredLines = $KeepSystemLines + $KeepMessages

    # Check if compression is needed
    $needsCompression = $false

    if ($Force) {
        $needsCompression = $true
    } elseif ($fileSizeKB -gt $MaxSizeKB -or $lines -gt $MaxLines) {
        $needsCompression = $true
    } elseif ($lines -gt $requiredLines) {
        # Also compress if it has way more lines than needed
        $needsCompression = $true
    }

    if (-not $needsCompression) {
        Write-Verbose "Skip $fileName ($lines lines, $([math]::Round($fileSizeKB,2)) KB)"
        $stats.Skipped++
        return
    }

    Write-Host "`n$fileName [$Tool]"
    Write-Host "  Current: $lines lines, $([math]::Round($fileSizeKB,2)) KB"

    # Create backup
    $backupPath = "$Path.backup"
    if ($CreateBackup) {
        try {
            Copy-Item $Path $backupPath -Force
            Write-Verbose "  Backup created: $backupPath"
        } catch {
            Write-Error "Failed to create backup: $_"
            $stats.Errors += "Backup failed: $Path"
            return
        }
    }

    # Read and compress
    try {
        $allLines = Get-Content $Path

        if ($allLines.Count -le $requiredLines) {
            Write-Host "  Skipping (already compressed)"
            if ($CreateBackup) { Remove-Item $backupPath -Force }
            $stats.Skipped++
            return
        }

        # Keep first N system lines and last M messages
        $keepLines = $allLines[0..($KeepSystemLines - 1)]
        $lastMessages = $allLines[(-$KeepMessages)..-1]

        # Handle case where KeepSystemLines > total lines
        if ($allLines.Count -lt $KeepSystemLines) {
            $keepLines = $allLines
            $lastMessages = @()
        }

        # Handle case where KeepMessages > available lines
        $availableMessages = $allLines.Count - $KeepSystemLines
        if ($availableMessages -lt $KeepMessages) {
            $lastMessages = $allLines[$KeepSystemLines..-1]
        }

        $compressed = @()
        $compressed += $keepLines
        if ($lastMessages) {
            $compressed += $lastMessages
        }

        # Write compressed content
        $compressed | Out-File -FilePath $Path -Encoding utf8 -Force

        # Calculate savings
        $newSizeKB = (Get-Item $Path).Length / 1KB
        $savedKB = $fileSizeKB - $newSizeKB
        $stats.TotalSavedKB += $savedKB

        Write-Host "  Compressed: $($allLines.Count) → $($compressed.Count) lines"
        Write-Host "  Size: $([math]::Round($fileSizeKB,2)) KB → $([math]::Round($newSizeKB,2)) KB"
        if ($savedKB -gt 0) {
            Write-Host "  Saved: $([math]::Round($savedKB,2)) KB" -ForegroundColor Green
        }

        $stats.Compressed++

        # Clean up backup after short delay
        if ($CreateBackup) {
            Start-Sleep -Milliseconds 500
            if (Test-Path $backupPath) {
                Remove-Item $backupPath -Force -ErrorAction SilentlyContinue
            }
        }

    } catch {
        Write-Error "Compression failed: $_"
        $stats.Errors += "Compression failed: $Path"

        # Restore from backup if available
        if (Test-Path $backupPath) {
            Write-Host "  Restoring from backup..." -ForegroundColor Yellow
            Move-Item $backupPath $Path -Force
        }
    }
}

# Main execution
Write-Host "=== CLI Context Manager ===" -ForegroundColor Cyan
Write-Host "Auto-compress sessions for AI CLI tools`n"

Write-Host "Configuration:"
Write-Host "  Max size: $MaxSizeKB KB"
Write-Host "  Max lines: $MaxLines"
Write-Host "  Keep messages: $KeepMessages"
Write-Host "  Keep system: $KeepSystemLines"
Write-Host "  Backup: $(if ($CreateBackup) { 'Yes' } else { 'No' })"
Write-Host "  Force: $Force"
Write-Host ""

# Get sessions to process
$sessions = Get-ToolSessions

if ($sessions.Count -eq 0) {
    Write-Host "No sessions found to process." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($sessions.Count) session(s) to check`n"

# Process each session
foreach ($session in $sessions) {
    Compress-SessionFile -Path $session.Path -Tool $session.Tool
}

# Print summary
Write-Host "`n=== Summary ==="
Write-Host "Checked: $($stats.Checked)"
Write-Host "Compressed: $($stats.Compressed)"
Write-Host "Skipped: $($stats.Skipped)"
if ($stats.TotalSavedKB -gt 0) {
    Write-Host "Total saved: $([math]::Round($stats.TotalSavedKB,2)) KB" -ForegroundColor Green
}
if ($stats.Errors.Count -gt 0) {
    Write-Host "Errors: $($stats.Errors.Count)" -ForegroundColor Red
    foreach ($err in $stats.Errors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
}

exit 0
