@echo off
echo ==========================================
echo SecureInsure Pro - Application Setup and Start
echo ==========================================

:: Check for required tools
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed or not in PATH
    exit /b 1
)

set MAVEN_HOME=C:\maven\apache-maven-3.9.5
set PATH=%MAVEN_HOME%\bin;%PATH%

where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven not found at %MAVEN_HOME%
    echo Please ensure Maven is installed at C:\maven\apache-maven-3.9.5
    exit /b 1
)

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    exit /b 1
)

where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker is not installed or not in PATH. Some features may not work.
    set DOCKER_AVAILABLE=false
) else (
    set DOCKER_AVAILABLE=true
)

:: Clean up existing containers
if "%DOCKER_AVAILABLE%"=="true" (
    echo.
    echo Cleaning up existing Docker containers...
    docker stop $(docker ps -aq) 2>nul
    docker rm $(docker ps -aq) 2>nul
    
    echo.
    echo Starting PostgreSQL container...
    docker run -d --name secureinsure-postgres ^
        -e POSTGRES_DB=secureinsure_pro ^
        -e POSTGRES_USER=postgres ^
        -e POSTGRES_PASSWORD=password ^
        -p 5432:5432 ^
        -v %~dp0data\postgres:/var/lib/postgresql/data ^
        postgres:15-alpine
    
    echo Starting Redis container...
    docker run -d --name secureinsure-redis ^
        -p 6379:6379 ^
        -v %~dp0data\redis:/data ^
        redis:7-alpine
    
    echo.
    echo Waiting for databases to initialize...
    timeout /t 15 /nobreak >nul
)

:: Build and start backend
echo.
echo ==========================================
echo Building and starting backend services...
echo ==========================================

cd backend
echo.
echo Building backend services (this may take a few minutes)...
call mvn clean install -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build backend services
    exit /b 1
)

echo.
echo Starting gateway service...
start "Backend Gateway" cmd /k "cd /d %~dp0backend && mvn spring-boot:run -pl gateway-service"

echo Waiting for backend to start...
timeout /t 30 /nobreak >nul

:: Setup and start frontend
echo.
echo ==========================================
echo Setting up and starting frontend...
echo ==========================================

cd ..\frontend

:: Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from example...
    copy .env.example .env >nul
)

echo.
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)

echo.
echo Starting frontend development server...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

:: Display completion message
echo.
echo ==========================================
echo Application Setup Complete!
echo ==========================================
echo.
echo Frontend:    http://localhost:3000
echo Backend API: http://localhost:8080
echo.
if "%DOCKER_AVAILABLE%"=="true" (
    echo PostgreSQL: localhost:5432
echo Redis:       localhost:6379
echo.
)
echo Check the command windows that opened for progress.
echo.
pause
