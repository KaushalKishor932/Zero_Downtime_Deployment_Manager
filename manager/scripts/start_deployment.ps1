param (
    [string]$Version,
    [int]$Port
)

$RootDir = ".."
$SourceDir = "$RootDir\sample-app"
$DeployDir = "$RootDir\deployments\$Version"

Write-Host "Deploying Version: $Version on Port: $Port"

# Create deployment directory
New-Item -ItemType Directory -Force -Path $DeployDir | Out-Null

# Copy application files (Simulation of git checkout)
Copy-Item -Path "$SourceDir\*" -Destination $DeployDir -Recurse -Force

# Install dependencies
Write-Host "Installing dependencies..."
Set-Location $DeployDir
npm.cmd install --silent

# Start application in background
# Start application in background (using cmd to ensure env vars are set)
Write-Host "Starting application on Port $Port..."

# We use cmd /c to wrap the env var setting and execution in a single command string
# This guarantees that the spawned process sees the PORT variable
$ArgList = "/c set PORT=$Port && set VERSION=$Version && npm start > out.log 2> err.log"

$Process = Start-Process -FilePath "cmd.exe" -ArgumentList $ArgList -PassThru -NoNewWindow

Write-Host "Started process with ID: $($Process.Id)"
# Validating if it stays up would happen here or via health check
Exit 0
