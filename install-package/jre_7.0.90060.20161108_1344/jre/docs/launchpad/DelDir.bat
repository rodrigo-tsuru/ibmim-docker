@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

:REMOVEDIR

SETLOCAL

    CD %~1
    IF errorlevel == 1 GOTO :eof
    ( FOR /f "tokens=*" %%A in ('DIR /a:d /b') DO CALL :REMOVEDIR "%%A" ) >nul 2>&1
    DEL /F /Q . >nul 2>&1
    CD ..
    RMDIR "%~1"

ENDLOCAL
