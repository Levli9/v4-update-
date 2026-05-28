@echo off
REM Lightweight Maven launcher for Windows. Downloads Apache Maven locally
REM and runs it. Requires PowerShell and network access.

set MAVEN_VERSION=3.9.6
set MAVEN_BASE_DIR=.mvn\apache-maven-%MAVEN_VERSION%
set MAVEN_BIN=%MAVEN_BASE_DIR%\bin\mvn.cmd

if not exist "%MAVEN_BIN%" (
  echo Maven not found. Downloading Apache Maven %MAVEN_VERSION%...
  powershell -Command "\
    $urls = @(\
      'https://downloads.apache.org/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip',\
      'https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip'\
    );\
    foreach ($u in $urls) { try { Invoke-WebRequest -Uri $u -OutFile 'maven.zip' -UseBasicParsing; break } catch {} };\
    if (-Not (Test-Path 'maven.zip')) { exit 2 };\
    Expand-Archive -LiteralPath 'maven.zip' -DestinationPath '.mvn'; Remove-Item 'maven.zip'"
)

"%MAVEN_BIN%" %*
