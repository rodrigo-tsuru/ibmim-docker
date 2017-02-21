@echo off
set NEW_DIR=%1
set LAUNCHPAD_SHIFTED_ARGS=
shift
:slurp
if "x%~1"=="x" goto execute
set LAUNCHPAD_SHIFTED_ARGS=%LAUNCHPAD_SHIFTED_ARGS% %1
shift
goto :slurp
:execute
pushd %NEW_DIR%
start /wait "" %LAUNCHPAD_SHIFTED_ARGS%
exit %errorlevel%