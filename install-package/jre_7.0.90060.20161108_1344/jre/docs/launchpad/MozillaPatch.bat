@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

SETLOCAL

    IF "{%1}" == "{}" GOTO :eof
    IF not exist "%LaunchPadTemp%\%1.dat" GOTO :eof
    COPY /Y "%LaunchPadTemp%\%1.dat" "%USERPROFILE%\Application Data\Mozilla\registry.dat" >nul 2>&1
    DEL /F "%LaunchPadTemp%\%1.dat" >nul 2>&1

ENDLOCAL
