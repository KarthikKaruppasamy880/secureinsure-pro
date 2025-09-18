@echo off
echo Starting SecureInsure Pro Services...
echo =====================================

echo.
echo Starting PostgreSQL...
net start postgresql-x64-15 2>nul || echo PostgreSQL service not found or already running

echo.
echo Starting Redis...
redis-server --daemonize yes 2>nul || echo Redis not found or already running

echo.
echo Starting Auth Service (Port 8081)...
cd backend\auth-service
start "Auth Service" cmd /k "mvn spring-boot:run"
cd ..\..

echo.
echo Starting Policy Service (Port 8082)...
cd backend\policy-service
start "Policy Service" cmd /k "mvn spring-boot:run"
cd ..\..

echo.
echo Starting Claims Service (Port 8083)...
cd backend\claims-service
start "Claims Service" cmd /k "mvn spring-boot:run"
cd ..\..

echo.
echo Starting Frontend (Port 3000)...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo =====================================
echo All services are starting...
echo Check the opened command windows for any errors.
echo.
echo Services will be available at:
echo - Frontend: http://localhost:3000
echo - Auth Service: http://localhost:8081
echo - Policy Service: http://localhost:8082
echo - Claims Service: http://localhost:8083
echo.
echo Press any key to exit...
pause >nul
