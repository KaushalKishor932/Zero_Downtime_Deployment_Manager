param (
    [int]$Port
)

Write-Host "Stopping application on Port: $Port"

# Find process listening on the port
$TCPConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($TCPConnection) {
    $ProcessId = $TCPConnection.OwningProcess
    Write-Host "Found process ID: $ProcessId. Sending SIGTERM (via Stop-Process)..."

    
    taskkill /PID $ProcessId
    
    Write-Host "Process stopped."
} else {
    Write-Host "No process found on port $Port."
}
Exit 0