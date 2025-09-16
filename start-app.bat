@echo off
echo ========================================
echo   SecureInsure Pro - Quick Start
echo ========================================
echo.

echo Starting Docker services...
docker-compose up -d postgres redis auth-service frontend

echo.
echo Waiting for services to start...
timeout /t 30 /nobreak > nul

echo.
echo Testing application...
curl -s http://localhost:3000 > nul
if %errorlevel% equ 0 (
    echo Frontend: OK
) else (
    echo Frontend: Not responding
)

curl -s http://localhost:8082/actuator/health > nul
if %errorlevel% equ 0 (
    echo Backend: OK
) else (
    echo Backend: Not responding
)

echo.
echo Opening application in browser...
start http://localhost:3000

echo.
echo ========================================
echo   Application is ready!
echo ========================================
echo.
echo Login Credentials:
echo   Username: admin    Password: admin123
echo   Username: user     Password: user123
echo   Username: agent    Password: agent123
echo.
echo Press any key to exit...
pause > nul