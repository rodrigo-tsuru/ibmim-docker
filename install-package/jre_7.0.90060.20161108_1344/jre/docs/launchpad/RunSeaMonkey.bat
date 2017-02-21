@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.


    PROMPT +$S
    @ECHO on

    REM This is a hack for required by Firefox 2.0 on certain windows OSes.  For some reason,
    REM firefox cannot read process level environment variables if it is running with a profile
    REM that was not created with the profile creation tool (the -createProfile switch doesn't
    REM seem to work either).  So prior to calling firefox, we'll write the environment into a well
    REM known location.  Yes, there are some potential synchronization issues with this.  But for any
    REM practical application, it will probably be ok.
    set > %TEMP%\launchpad.env

	if "%LaunchPadUseDefaultProfile%" == "true" (
		"%LaunchPadBrowser%" %LaunchPadURL%?%LaunchPadLocale%
	) else (
        "%LaunchPadBrowser%" -profile  %LaunchPadProfilePath% %LaunchPadURL%?%LaunchPadLocale%
	)      
    @ECHO off
    IF errorlevel == 1 GOTO :noFirefox

    SET /A count=5
:checkInitialization
    IF exist "%LaunchPadProfilePath%\parent.lock" GOTO :checkStatus
    PING -w 1000 -n 3 127.0.0.1 >nul
    SET /A count=%count%-1
    IF not %count% == 0 GOTO :checkInitialization

:noFirefox
    SET LaunchPadBrowser=
    CALL "%LaunchPadBatchPath%\NoBrowser.bat"
    GOTO :cleanupTemp
    
:checkStatus
    PING -w 1000 -n 3 127.0.0.1 >nul
    DEL /F /Q "%LaunchPadProfilePath%\parent.lock" >nul
    IF exist "%LaunchPadProfilePath%\parent.lock" GOTO :checkStatus

:cleanupTemp
    REM clean up temp profile if using random profile names
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
