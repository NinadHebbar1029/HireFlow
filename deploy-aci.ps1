param(
    [string]$ResourceGroup = "hireflow-rg",
    [string]$Location = "southeastasia",
    [string]$ContainerName = "hireflow-app"
)

Write-Host "`n=== HireFlow Azure Container Deployment ===" -ForegroundColor Cyan

Write-Host "`nStep 1: Creating Resource Group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

Write-Host "`nStep 2: Creating Azure Container Registry..." -ForegroundColor Yellow
$acrName = "hireflow$(Get-Random -Maximum 9999)"
az acr create --resource-group $ResourceGroup --name $acrName --sku Basic --admin-enabled true --location $Location

Write-Host "`nStep 3: Logging into ACR..." -ForegroundColor Yellow
az acr login --name $acrName

Write-Host "`nStep 4: Building and pushing images..." -ForegroundColor Yellow
$acrLoginServer = (az acr show --name $acrName --query loginServer -o tsv)

docker tag hireflow-frontend "$acrLoginServer/hireflow-frontend:latest"
docker tag hireflow-backend "$acrLoginServer/hireflow-backend:latest"
docker tag hireflow-ai-service "$acrLoginServer/hireflow-ai-service:latest"

docker push "$acrLoginServer/hireflow-frontend:latest"
docker push "$acrLoginServer/hireflow-backend:latest"
docker push "$acrLoginServer/hireflow-ai-service:latest"

Write-Host "`nStep 5: Creating MySQL Database..." -ForegroundColor Yellow
$mysqlServer = "hireflow-mysql-$(Get-Random -Maximum 9999)"
$mysqlPassword = "HireFlow@$(Get-Random -Maximum 99999)!"

az mysql flexible-server create `
    --resource-group $ResourceGroup `
    --name $mysqlServer `
    --location $Location `
    --admin-user adminuser `
    --admin-password $mysqlPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --public-access 0.0.0.0-255.255.255.255 `
    --version 8.0.21 `
    --storage-size 32

az mysql flexible-server db create --resource-group $ResourceGroup --server-name $mysqlServer --database-name hireflow

Write-Host "`nStep 6: Deploying Container Instances..." -ForegroundColor Yellow
$acrPassword = (az acr credential show --name $acrName --query "passwords[0].value" -o tsv)

# Deploy Backend
az container create `
    --resource-group $ResourceGroup `
    --name hireflow-backend `
    --image "$acrLoginServer/hireflow-backend:latest" `
    --dns-name-label "hireflow-backend-$(Get-Random -Maximum 9999)" `
    --ports 5000 `
    --os-type Linux `
    --registry-login-server $acrLoginServer `
    --registry-username $acrName `
    --registry-password $acrPassword `
    --environment-variables `
        DB_HOST="$mysqlServer.mysql.database.azure.com" `
        DB_USER="adminuser" `
        DB_PASSWORD="$mysqlPassword" `
        DB_NAME="hireflow" `
        PORT="5000" `
    --cpu 1 --memory 1.5

# Deploy Frontend
$backendFqdn = (az container show --resource-group $ResourceGroup --name hireflow-backend --query "ipAddress.fqdn" -o tsv)

az container create `
    --resource-group $ResourceGroup `
    --name hireflow-frontend `
    --image "$acrLoginServer/hireflow-frontend:latest" `
    --dns-name-label "hireflow-$(Get-Random -Maximum 9999)" `
    --ports 80 `
    --os-type Linux `
    --registry-login-server $acrLoginServer `
    --registry-username $acrName `
    --registry-password $acrPassword `
    --environment-variables VITE_API_URL="http://${backendFqdn}:5000" `
    --cpu 1 --memory 1

$frontendFqdn = (az container show --resource-group $ResourceGroup --name hireflow-frontend --query "ipAddress.fqdn" -o tsv)

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "`nYour HireFlow app:" -ForegroundColor Cyan
Write-Host "Frontend: http://$frontendFqdn" -ForegroundColor Green
Write-Host "Backend:  http://${backendFqdn}:5000" -ForegroundColor Green
Write-Host "`nMySQL Server: $mysqlServer.mysql.database.azure.com" -ForegroundColor Yellow
Write-Host "MySQL Password: $mysqlPassword" -ForegroundColor Yellow
Write-Host "`nSave these credentials!" -ForegroundColor Red
