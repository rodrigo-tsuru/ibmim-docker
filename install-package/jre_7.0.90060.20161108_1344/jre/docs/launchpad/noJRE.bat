@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2007
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

SETLOCAL

    SET LaunchPadBatchPath=%~dp0
    CALL "%LaunchPadBatchPath%GetLocale.bat"
    PROMPT +$S

	IF "%LaunchPadDefaultBrowser%" == "" GOTO :checkCodePage
    REM Look for html file first
    call :findLocaleFile "noJRE.html"
    IF "%RET_findLocaleFile%" == "" GOTO :checkCodePage
    ECHO on
    "%RET_findLocaleFile%"
    @ECHO off
    IF not errorlevel == 1 GOTO :EXIT

:checkCodePage
    SET /A CODEPAGE=0
    FOR /F "tokens=2 delims=:" %%z in ('chcp') DO SET /A CODEPAGE=%%z 2>nul
    IF "%CODEPAGE%" == "0" GOTO :showMessage

    REM see if there is a compatible codepage match
    call :findCompatCPFile "%LaunchPadBatchPath%%LaunchpadContentDirectory%%NoBrowserLang%\codepages\" "noJRE.txt" "%CODEPAGE%"
    IF NOT "%RET_findCompatCPFile%" == "" GOTO :showCompatible 
    call :findCompatCPFile "%LaunchPadBatchPath%%LaunchpadContentDirectory%en\codepages\" "noJRE.txt" "%CODEPAGE%"
    IF NOT "%RET_findCompatCPFile%" == "" GOTO :showCompatible 
    call :findCompatCPFile "%LaunchPadBatchPath%%NoBrowserLang%\codepages\" "noJRE.txt" "%CODEPAGE%"
    IF NOT "%RET_findCompatCPFile%" == "" GOTO :showCompatible 
    call :findCompatCPFile "%LaunchPadBatchPath%en\codepages\" "noJRE.txt" "%CODEPAGE%"
    IF NOT "%RET_findCompatCPFile%" == "" GOTO :showCompatible 
    REM Not found, show default message
    GOTO :showMessage

:showCompatible
    ECHO on
    START %comspec% /c "chcp %RET_findCompatCPCodePage% >nul 2>&1 & MORE "%RET_findCompatCPFile%" & pause"
    @ECHO off
    GOTO :EXIT

:showMessage
    ECHO on
    START %comspec% /c "ECHO ERROR: No supported browser could be found! | MORE & pause"
    @ECHO off
    GOTO :EXIT

@REM function  parm1=codpage directory, parm2=file name, parm3=current cp
@REM           return: RET_findCompatCPFile, RET_findCompatCPCodePage
:findCompatCPFile
    REM Look in current codepage directory first
    IF NOT exist "%~1%~3\%~2" GOTO :tryOtherCodePages
    SET RET_findCompatCPFile=%~1%~3\%~2
    SET RET_findCompatCPCodePage=%~3
    GOTO :findCompatCPFileExit
:tryOtherCodePages
    FOR /F "tokens=*" %%z in ('DIR "%~1" /a:d /b') DO (
        chcp %%z >nul 2>&1
        IF errorlevel == 1 GOTO :tryNextCodePage
        chcp %~3 >nul 2>&1
        IF not exist "%~1%%z\%~2" GOTO :tryNextCodePage
        SET RET_findCompatCPFile=%~1%%z\%~2
        SET RET_findCompatCPCodePage=%%z
        GOTO :findCompatCPFileExit
:tryNextCodePage
        REM
    )
    REM Not found
    set RET_findCompatCPFile=
:findCompatCPFileExit
    GOTO :EOF


@REM function  parm1=locale file (quoted)
@REM           return: sets RET_findLocaleFile if found
:findLocaleFile
    set RET_findLocaleFile=%LaunchPadBatchPath%%LaunchPadContentDirectory%%NoBrowserLang%\%~1
    IF exist "%RET_findLocaleFile%" GOTO :findLocaleFileEXIT
    set RET_findLocaleFile=%LaunchPadBatchPath%%LaunchPadContentDirectory%en\%~1
    IF exist "%RET_findLocaleFile%" GOTO :findLocaleFileEXIT
    set RET_findLocaleFile=%LaunchPadBatchPath%%NoBrowserLang%\%~1
    IF exist "%RET_findLocaleFile%" GOTO :findLocaleFileEXIT
    set RET_findLocaleFile=%LaunchPadBatchPath%en\%~1
    IF exist "%RET_findLocaleFile%" GOTO :findLocaleFileEXIT
@REM File not found
    set RET_findLocaleFile=
:findLocaleFileEXIT
    GOTO :EOF

:EXIT
ENDLOCAL
