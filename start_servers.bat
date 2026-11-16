@echo off
title Smart Academic Attendance & Leave Management System
echo =======================================================================
echo Smart Academic Attendance & Leave Management System - Alok Raghav
echo =======================================================================
echo.
echo Starting Backend API (FastAPI) on port 8000...
start "Backend - FastAPI" cmd /k "cd /d "%~dp0" && .\backend\venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"

echo Starting Frontend (Next.js) on port 3000...
start "Frontend - Next.js" cmd /k "cd /d "%~dp0\frontend" && npm run dev"

echo.
echo =======================================================================
echo Servers are launching!
echo Backend API & Swagger Docs: http://localhost:8000/api/docs
echo Frontend Web Application:   http://localhost:3000
echo.
echo Default Demo Logins:
echo   - Admin:   admin@smartacademic.edu         / Admin@123
echo   - Faculty: rajesh.sharma@smartacademic.edu / Faculty@123
echo   - Student: student01@smartacademic.edu     / Student@123
echo =======================================================================
pause
