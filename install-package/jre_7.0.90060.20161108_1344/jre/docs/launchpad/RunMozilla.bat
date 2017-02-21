@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

    SET ProgramStatus=OK
    PROMPT +$S
    @ECHO on
    "%LaunchPadBrowser%" -nosplash -P %LaunchPadProfileName% %LaunchPadURL%?%LaunchPadLocale%
    @ECHO off
    IF errorlevel == 1 SET ProgramStatus=Failed

    REM clean up temp profile
    IF not exist "%LaunchPadTemp%\%LaunchPadProfileName%.dat" GOTO :cleanupTemp
    COPY /Y "%LaunchPadTemp%\%LaunchPadProfileName%.dat" "%USERPROFILE%\Application Data\Mozilla\registry.dat" >nul
    DEL /F "%LaunchPadTemp%\%LaunchPadProfileName%.dat"
    
    
:cleanupTemp
    SET LaunchPadBrowser=
    IF %ProgramStatus% == Failed CALL "%LaunchPadBatchPath%\NoBrowser.bat"
    CALL :DelDir "%USERPROFILE%\Application Data\Mozilla\Profiles\%LaunchPadProfileName%"
    CD ..
    IF NOT "%LaunchPadTemp%" == "" (
		IF NOT EXIST "%LaunchPadTemp%\LaunchPadKeepTemp.txt" (
			CALL :DelDir "%LaunchPadTemp%" & GOTO :eof
		)
		ELSE (
			DEL "%LaunchPadTemp%\LaunchPadKeepTemp.txt"
		)
    )
    GOTO :eof

:DelDir
    CD %~1
    IF errorlevel == 1 GOTO :eof
    FOR /f "tokens=*" %%A in ('DIR /a:d /b') DO CALL :DelDir "%%A"
    DEL /F /Q . & CD .. & RMDIR "%~1"
