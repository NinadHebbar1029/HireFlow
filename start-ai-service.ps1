# Start AI Recommendation Service
# Run this script from the HireFlow root directory

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  HireFlow AI Service Startup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.7+" -ForegroundColor Red
    Write-Host "  Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Navigate to ai-service directory
Write-Host ""
Write-Host "Navigating to ai-service directory..." -ForegroundColor Yellow
Set-Location -Path "ai-service" -ErrorAction Stop
Write-Host "✓ Changed to ai-service directory" -ForegroundColor Green

# Check if requirements are installed
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$packagesInstalled = $true

try {
    python -c "import flask" 2>$null
} catch {
    $packagesInstalled = $false
}

if (-not $packagesInstalled) {
    Write-Host "⚠ Dependencies not installed. Installing now..." -ForegroundColor Yellow
    Write-Host ""
    pip install -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ All dependencies already installed" -ForegroundColor Green
}

# Check if port 8080 is available
Write-Host ""
Write-Host "Checking if port 8080 is available..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "⚠ Port 8080 is already in use!" -ForegroundColor Red
    Write-Host "  Process ID: $($portInUse.OwningProcess)" -ForegroundColor Yellow
    
    $response = Read-Host "Do you want to kill this process and continue? (y/n)"
    if ($response -eq 'y') {
        Stop-Process -Id $portInUse.OwningProcess -Force
        Write-Host "✓ Process killed" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✓ Port 8080 is available" -ForegroundColor Green
}

# Start the AI service
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Starting AI Service on port 8080" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

python app.py
