@echo off
if exist .env (
    for /f "tokens=1,2 delims==" %%a in (.env) do set %%a=%%b
)
uvicorn main:app --reload --port 8000
