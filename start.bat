@echo off
chcp 65001 >nul
setlocal

cd /d %~dp0

echo [1/4] 检查 uploads 目录...
if not exist uploads mkdir uploads

echo [2/4] 启动后端...
start "MyApp Backend" cmd /k "cd /d %~dp0backend && if not exist venv (python -m venv venv) && call venv\Scripts\activate && pip install -r requirements.txt && python run.py"

echo [3/4] 启动前端...
start "MyApp Frontend" cmd /k "cd /d %~dp0frontend && if not exist node_modules npm install && npm run dev"

echo [4/4] 启动完成

echo 后端地址: http://localhost:8000
echo 前端地址: http://localhost:5173
echo.
echo 请保持两个新打开的窗口运行。
pause
