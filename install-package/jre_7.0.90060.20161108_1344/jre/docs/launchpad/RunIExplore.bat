@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

    CALL "%LaunchPadBatchPath%\SetTmp.bat"
    CALL "%LaunchPadBatchPath%\GetLocale.bat"
    CALL "%LaunchPadBatchPath%\getOS.bat"

    IF not exist "%systemroot%\system32\mshta.exe" GOTO :noHTA
    IF not {%LaunchPadNoHTA%} == {} GOTO :noHTA
    SET ProgramStatus=OK
    PROMPT +$S
    @ECHO on
    "%systemroot%\system32\mshta.exe" "%LaunchPadBatchPath%\IExplore.html?%LaunchPadLocale%"
    @ECHO OFF
    IF not errorlevel == 1 GOTO :cleanupTemp
    
    
:noHTA
    SET LaunchPadNoHTA=true
    IF {%LaunchPadDefaultBrowser%} == {Mozilla} "%LaunchPadBatchPath%\Mozilla.bat"
    IF {%LaunchPadDefaultBrowser%} == {Firefox} "%LaunchPadBatchPath%\Firefox.bat"
    SET LaunchPadBrowser=
    CALL "%LaunchPadBatchPath%\NoBrowser.bat"
    
:cleanupTemp
    CD ..
    IF NOT "%LaunchPadTemp%" == "" CALL :DelDir "%LaunchPadTemp%" & GOTO :eof
    GOTO :eof
    
:DelDir
    CD %~1
    IF errorlevel == 1 GOTO :eof
    FOR /f "tokens=*" %%A in ('DIR /a:d /b') DO CALL :DelDir "%%A"
    DEL /F /Q . & CD .. & RMDIR "%~1"
:Exit
