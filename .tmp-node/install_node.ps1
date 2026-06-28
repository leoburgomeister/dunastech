$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$url = "https://nodejs.org/dist/v20.12.2/node-v20.12.2-win-x64.zip"
$destDir = "c:\Users\Juju\dunastech\.tmp-node"
$zip = "$destDir\node.zip"

if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

Write-Host "Downloading Node.js from $url..."
Invoke-WebRequest -Uri $url -OutFile $zip

Write-Host "Extracting Node.js to $destDir..."
if (Test-Path "$destDir\node-v20.12.2-win-x64") {
    Remove-Item "$destDir\node-v20.12.2-win-x64" -Recurse -Force -ErrorAction SilentlyContinue
}
Expand-Archive -Path $zip -DestinationPath $destDir -Force

Write-Host "Cleaning up zip file..."
Remove-Item $zip -Force

Write-Host "Verifying installation..."
$nodePath = "$destDir\node-v20.12.2-win-x64\node.exe"
if (Test-Path $nodePath) {
    Write-Host "Node.js installed successfully at: $nodePath"
    & $nodePath -v
} else {
    Write-Error "Node.exe not found after extraction!"
}
