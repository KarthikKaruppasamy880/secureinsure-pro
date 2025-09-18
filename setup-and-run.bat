@echo off
echo ==========================================
echo SecureInsure Pro Setup and Launch
echo ==========================================

REM Check if Docker is running
echo Checking Docker status...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Clean up existing containers
echo.
echo Cleaning up existing containers...
docker stop $(docker ps -aq) >nul 2>&1
docker rm $(docker ps -aq) >nul 2>&1

echo.
echo ==========================================
echo Starting Database Services
echo ==========================================

REM Start PostgreSQL
echo Starting PostgreSQL...
start "PostgreSQL" cmd /k "docker run --name secureinsure-postgres -e POSTGRES_DB=secureinsure_pro -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -v %CD%\data\postgres:/var/lib/postgresql/data postgres:15-alpine"

REM Start Redis
echo Starting Redis...
start "Redis" cmd /k "docker run --name secureinsure-redis -p 6379:6379 -v %CD%\data\redis:/data redis:7-alpine"

echo.
echo Waiting for databases to initialize...
timeout /t 15 /nobreak >nul

echo.
echo ==========================================
echo Setting Up Backend
echo ==========================================

REM Build backend
echo Building backend services...
cd backend
call mvn clean install -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend build failed. Please check the error messages above.
    pause
    exit /b 1
)

REM Start backend
echo Starting backend services...
start "Backend" cmd /k "cd /d %CD% && mvn spring-boot:run -pl gateway-service"

cd ..

echo.
echo ==========================================
echo Setting Up Frontend
echo ==========================================

REM Setup frontend
echo Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend dependencies installation failed.
    pause
    exit /b 1
)

REM Start frontend
echo Starting frontend...
start "Frontend" cmd /k "cd /d %CD% && npm start"

cd ..

echo.
echo ==========================================
echo Application Information
echo ==========================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8080
echo PostgreSQL: localhost:5432
echo Redis: localhost:6379
echo.
echo The application is now starting up. This may take a few minutes...
echo Check the command windows that opened for progress.
echo.
pause
