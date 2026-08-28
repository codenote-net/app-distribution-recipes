$ErrorActionPreference = "Stop"

if (-not $env:VCPKG_ROOT) {
  throw "VCPKG_ROOT must point to a vcpkg installation containing openssl:x64-windows."
}

$tripletRoot = Join-Path $env:VCPKG_ROOT "installed/x64-windows"
$packageRoot = Resolve-Path (Join-Path $PSScriptRoot "../node_modules/@journeyapps/sqlcipher")
$libraryTarget = Join-Path $packageRoot "deps/OpenSSL-Win64"
$includeTarget = Join-Path $packageRoot "deps/openssl-include/openssl"
$runtimeTarget = Join-Path $PSScriptRoot "../.windows-openssl"

$requiredFiles = @(
  (Join-Path $tripletRoot "lib/libcrypto.lib"),
  (Join-Path $tripletRoot "lib/libssl.lib"),
  (Join-Path $tripletRoot "bin/libcrypto-3-x64.dll"),
  (Join-Path $tripletRoot "bin/libssl-3-x64.dll")
)

foreach ($file in $requiredFiles) {
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
    throw "Required OpenSSL file is missing: $file"
  }
}

$sourceHeaders = Join-Path $tripletRoot "include/openssl"
if (-not (Test-Path -LiteralPath $sourceHeaders -PathType Container)) {
  throw "Required OpenSSL headers are missing: $sourceHeaders"
}

New-Item -ItemType Directory -Force -Path $libraryTarget, $includeTarget, $runtimeTarget | Out-Null
Copy-Item -LiteralPath $requiredFiles[0] -Destination (Join-Path $libraryTarget "libcrypto.lib") -Force
Copy-Item -LiteralPath $requiredFiles[1] -Destination (Join-Path $libraryTarget "libssl.lib") -Force
Copy-Item -Path (Join-Path $sourceHeaders "*") -Destination $includeTarget -Recurse -Force
Copy-Item -LiteralPath $requiredFiles[2] -Destination $runtimeTarget -Force
Copy-Item -LiteralPath $requiredFiles[3] -Destination $runtimeTarget -Force

Write-Host "Staged OpenSSL headers, import libraries, and runtime DLLs for SQLCipher."
