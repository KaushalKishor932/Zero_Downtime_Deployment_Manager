param (
    [int]$Port
)

Write-Host "Stopping application on Port: $Port"

# Find process listening on the port
$TCPConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($TCPConnection) {
    $ProcessId = $TCPConnection.OwningProcess
    Write-Host "Found process ID: $ProcessId. Sending SIGTERM (via Stop-Process)..."
    
    # In Windows, Stop-Process is closer to SIGKILL, but node handles generic signals. 
    # For true graceful shutdown on Windows, we might need to send a specific signal or use an IPC channel.
    # However, 'taskkill /PID <pid>' sends SIGTERM by default (without /F).
    
    taskkill /PID $ProcessId
    
    Write-Host "Process stopped."
} else {
    Write-Host "No process found on port $Port."
}
Exit 0
