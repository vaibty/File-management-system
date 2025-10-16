@echo off
REM Test Report Dashboard - Automated Test Suite for Windows
REM This script tests the File Management System functionality

echo 🚀 Starting File Management System Test Suite
echo ==============================================

REM Configuration
set BACKEND_URL=http://localhost:3001
set FRONTEND_URL=http://localhost:4200
set MAX_WAIT_TIME=30

REM Test counter
set TESTS_PASSED=0
set TESTS_FAILED=0

echo 📋 Test Configuration:
echo Backend URL: %BACKEND_URL%
echo Frontend URL: %FRONTEND_URL%
echo Max Wait Time: %MAX_WAIT_TIME%s
echo.

REM Test 1: Check if services are running
echo 🔍 Test 1: Service Health Checks
echo ----------------------------------------

echo ⏳ Waiting for Backend Service to be ready...
:wait_backend
for /L %%i in (1,1,%MAX_WAIT_TIME%) do (
    curl -s "%BACKEND_URL%/api/health" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Backend Service is ready!
        goto :backend_ready
    )
    echo Attempt %%i/%MAX_WAIT_TIME% - Backend not ready yet...
    timeout /t 1 /nobreak >nul
)
echo ❌ Backend Service failed to start within %MAX_WAIT_TIME% seconds
echo ❌ Cannot proceed with tests - Backend is not available
exit /b 1

:backend_ready
echo ✅ Backend Health Check - PASS: Backend is running
set /a TESTS_PASSED+=1

echo ⏳ Waiting for Frontend Service to be ready...
:wait_frontend
for /L %%i in (1,1,%MAX_WAIT_TIME%) do (
    curl -s "%FRONTEND_URL%" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Frontend Service is ready!
        goto :frontend_ready
    )
    echo Attempt %%i/%MAX_WAIT_TIME% - Frontend not ready yet...
    timeout /t 1 /nobreak >nul
)
echo ❌ Frontend Service failed to start within %MAX_WAIT_TIME% seconds
echo ❌ Frontend Health Check - FAIL: Frontend is not running
set /a TESTS_FAILED+=1
goto :frontend_done

:frontend_ready
echo ✅ Frontend Health Check - PASS: Frontend is running
set /a TESTS_PASSED+=1

:frontend_done
echo.

REM Test 2: API Endpoint Tests
echo 🔍 Test 2: API Endpoint Tests
echo ------------------------------------

REM Test health endpoint
curl -s -w "%%{http_code}" -o nul "%BACKEND_URL%/api/health" | findstr "200" >nul
if !errorlevel! equ 0 (
    echo ✅ Health Check Endpoint - PASS: HTTP 200
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Health Check Endpoint - FAIL: Expected HTTP 200
    set /a TESTS_FAILED+=1
)

REM Test system endpoint
curl -s -w "%%{http_code}" -o nul "%BACKEND_URL%/api/system" | findstr "200" >nul
if !errorlevel! equ 0 (
    echo ✅ System Info Endpoint - PASS: HTTP 200
    set /a TESTS_PASSED+=1
) else (
    echo ❌ System Info Endpoint - FAIL: Expected HTTP 200
    set /a TESTS_FAILED+=1
)

REM Test list endpoint
curl -s -w "%%{http_code}" -o nul "%BACKEND_URL%/api/list" | findstr "200" >nul
if !errorlevel! equ 0 (
    echo ✅ List Directory Endpoint - PASS: HTTP 200
    set /a TESTS_PASSED+=1
) else (
    echo ❌ List Directory Endpoint - FAIL: Expected HTTP 200
    set /a TESTS_FAILED+=1
)

REM Test static files directory
curl -s -w "%%{http_code}" -o nul "%BACKEND_URL%/api/list?path=/static-files" | findstr "200" >nul
if !errorlevel! equ 0 (
    echo ✅ List Static Files Directory - PASS: HTTP 200
    set /a TESTS_PASSED+=1
) else (
    echo ❌ List Static Files Directory - FAIL: Expected HTTP 200
    set /a TESTS_FAILED+=1
)

echo.

REM Test 3: File Download Tests
echo 🔍 Test 3: File Download Tests
echo ----------------------------------

REM Test downloading a file
set DOWNLOAD_FILE=test_download_%RANDOM%.tmp
curl -s -o "%DOWNLOAD_FILE%" "%BACKEND_URL%/api/download?path=/static-files/data/metrics.csv"
if exist "%DOWNLOAD_FILE%" (
    for %%A in ("%DOWNLOAD_FILE%") do set FILE_SIZE=%%~zA
    if !FILE_SIZE! gtr 0 (
        echo ✅ File Download Test - PASS: Download successful (!FILE_SIZE! bytes)
        set /a TESTS_PASSED+=1
    ) else (
        echo ❌ File Download Test - FAIL: Download file is empty
        set /a TESTS_FAILED+=1
    )
    del "%DOWNLOAD_FILE%"
) else (
    echo ❌ File Download Test - FAIL: Download request failed
    set /a TESTS_FAILED+=1
)

REM Test downloading a directory (should be a zip)
set DOWNLOAD_DIR=test_download_dir_%RANDOM%.tmp
curl -s -o "%DOWNLOAD_DIR%" "%BACKEND_URL%/api/download?path=/static-files"
if exist "%DOWNLOAD_DIR%" (
    for %%A in ("%DOWNLOAD_DIR%") do set FILE_SIZE=%%~zA
    if !FILE_SIZE! gtr 0 (
        echo ✅ Directory Download Test - PASS: Download successful (!FILE_SIZE! bytes)
        set /a TESTS_PASSED+=1
    ) else (
        echo ❌ Directory Download Test - FAIL: Download file is empty
        set /a TESTS_FAILED+=1
    )
    del "%DOWNLOAD_DIR%"
) else (
    echo ❌ Directory Download Test - FAIL: Download request failed
    set /a TESTS_FAILED+=1
)

echo.

REM Test 4: Navigation Tests
echo 🔍 Test 4: Navigation Tests
echo ----------------------------

REM Test root directory listing
curl -s "%BACKEND_URL%/api/list" | findstr "static-files" >nul
if !errorlevel! equ 0 (
    echo ✅ Root Directory Navigation - PASS: Root directory contains expected items
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Root Directory Navigation - FAIL: Root directory missing expected items
    set /a TESTS_FAILED+=1
)

REM Test subdirectory navigation
curl -s "%BACKEND_URL%/api/list?path=/static-files" | findstr "data" >nul
if !errorlevel! equ 0 (
    echo ✅ Subdirectory Navigation - PASS: Subdirectory contains expected items
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Subdirectory Navigation - FAIL: Subdirectory missing expected items
    set /a TESTS_FAILED+=1
)

echo.

REM Test 5: Error Handling Tests
echo 🔍 Test 5: Error Handling Tests
echo ----------------------------------

REM Test invalid path
curl -s -w "%%{http_code}" -o nul "%BACKEND_URL%/api/list?path=/nonexistent" | findstr "500" >nul
if !errorlevel! equ 0 (
    echo ✅ Invalid Path Handling - PASS: HTTP 500
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Invalid Path Handling - FAIL: Expected HTTP 500
    set /a TESTS_FAILED+=1
)

REM Test file content endpoint
curl -s -w "%%{http_code}" -o nul "%BACKEND_URL%/api/file?path=/static-files/data/metrics.csv" | findstr "200" >nul
if !errorlevel! equ 0 (
    echo ✅ File Content Endpoint - PASS: HTTP 200
    set /a TESTS_PASSED+=1
) else (
    echo ❌ File Content Endpoint - FAIL: Expected HTTP 200
    set /a TESTS_FAILED+=1
)

echo.

REM Test 6: Data Integrity Tests
echo 🔍 Test 6: Data Integrity Tests
echo ----------------------------------

REM Check if static files are properly created
curl -s "%BACKEND_URL%/api/list" | findstr "static-files" >nul
if !errorlevel! equ 0 (
    echo ✅ Data Integrity - PASS: Static files directory exists
    set /a TESTS_PASSED+=1
) else (
    echo ❌ Data Integrity - FAIL: Static files directory missing
    set /a TESTS_FAILED+=1
)

echo.

REM Final Results
echo 📊 Test Results Summary
echo ==========================
echo ✅ Tests Passed: %TESTS_PASSED%
echo ❌ Tests Failed: %TESTS_FAILED%
echo.

if %TESTS_FAILED% equ 0 (
    echo 🎉 All tests passed! The File Management System is working correctly.
    exit /b 0
) else (
    echo ⚠️  Some tests failed. Please check the output above for details.
    exit /b 1
)
