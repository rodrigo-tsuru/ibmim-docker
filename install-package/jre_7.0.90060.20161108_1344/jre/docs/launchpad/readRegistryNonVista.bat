@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2007
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

REM %1 - The registry key folder
REM %2 - The key name
REM %3 - A unique key (hopefully) that will be used to bypass the expensive call to reg/regedit if we've
REM      already looked up the value for this key
REM %4 - The env var to store the value from the registry into

CALL "%~dp0SetTmp.bat"

SET %4=
IF not exist "%LaunchPadTemp%\%3.regedit" regedit /E "%LaunchPadTemp%\%3.regedit" %1
IF not exist "%LaunchPadTemp%\%3.regedit" GOTO :eof
TYPE "%LaunchPadTemp%\%3.regedit" >"%LaunchPadTemp%\%3.reg"
DEL /F /Q "%LaunchPadTemp%\%3.regedit" >nul 2>nul
FOR /f "tokens=1* delims=\=" %%A IN ('TYPE "%LaunchPadTemp%\%3.reg"') DO IF "{%%~A}" == "{%2}" FOR /F "tokens=* delims=\" %%z in ("%%~B") DO (
    SET %4=%%~z
	echo %%~z
    GOTO :eof
)

