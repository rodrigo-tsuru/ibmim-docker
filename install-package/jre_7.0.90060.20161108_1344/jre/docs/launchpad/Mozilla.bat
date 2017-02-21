@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2009
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

SETLOCAL
    SET LaunchPadBrowserName=Mozilla
    CALL "%~dp0GetShortName.bat" "%~dp0" LaunchPadBatchPath
    CALL "%LaunchPadBatchPath%\SetTmp.bat"
    CALL "%LaunchPadBatchPath%\GetLocale.bat"
    IF exist "%LaunchPadBrowser%" GOTO :gotbrowser
	SET LaunchPadBrowser=
    CALL "%LaunchPadBatchPath%\readRegistry.bat" "HKEY_LOCAL_MACHINE\Software\Clients\StartMenuInternet\%LaunchPadBrowserName%.exe\shell\open\command" @ moz LaunchPadBrowserPath

    IF {%ERRORLEVEL%} == {1} ( 
      ECHO "Browser Registry Key not found.  Checking if 32-bit browser on 64-bit machine."
      CALL "%LaunchPadBatchPath%\readRegistry.bat" "HKEY_LOCAL_MACHINE\Software\Wow6432Node\Clients\StartMenuInternet\%LaunchPadBrowserName%.exe\shell\open\command" @ moz LaunchPadBrowserPath
    )

	SET LaunchPadBrowserProfileType=1
    IF NOT "%LaunchPadBrowserName%" == "Firefox" (
	    CALL "!LaunchPadBatchPath!\readRegistry.bat" "HKEY_LOCAL_MACHINE\Software\Mozilla\!LaunchPadBrowserName!" CurrentVersion !LaunchPadBrowserName!Version LaunchPadBrowserVersion
        IF {!LaunchPadBrowserVersion!} == {} ( 
    		REM Reset the errorlevel
    		cmd /c exit /b 0
    		SET LaunchPadBrowserProfileType=0
        )
	)

    REM Normalize the path by removing all quotes
    SET LaunchPadBrowserPath=%LaunchPadBrowserPath:"=%

    CALL "%LaunchPadBatchPath%\GetShortName.bat" "%LaunchPadBrowserPath%" LaunchPadBrowser

:gotbrowser
    IF not exist "%LaunchPadBrowser%" (
        SET LaunchPadBrowser=
        SET LaunchPadDefaultBrowser=
        GOTO :forceIE
    )
    IF not exist "%systemroot%\system32\mshta.exe" SET LaunchPadNoHTA=true
    IF not {%LaunchPadNoHTA%} == {} goto :forceNoHTA
:forceIE
    "%LaunchPadBatchPath%\IExplore.bat"

:forceNoHTA
	SET MOZ_NO_REMOTE=1
	SET LaunchPadProfileName=Profile_%RANDOM%
	if "%LaunchPadBrowserProfileType%" == "0" (
		COPY /Y "!USERPROFILE!\Application Data\Mozilla\registry.dat" !LaunchPadTemp!\!LaunchPadProfileName!.dat >nul 2>&1
		"!LaunchPadBrowser!" -nosplash -CreateProfile !LaunchPadProfileName!

		SET LaunchPadProfilePath=
		( FOR /f "tokens=1" %%A in ('DIR "!USERPROFILE!\Application Data\Mozilla\Profiles\!LaunchPadProfileName!\*.slt" /a:d /b /o:d') DO SET LaunchPadProfilePath=!USERPROFILE!\Application Data\Mozilla\Profiles\!LaunchPadProfileName!\%%A) 2>nul

		IF "{!LaunchPadProfilePath!}" == {} (
			COPY /Y !LaunchPadTemp!\!LaunchPadProfileName!.dat "!USERPROFILE!\Application Data\Mozilla\registry.dat" >nul 2>&1
			SET LaunchPadBrowser=
			SET LaunchPadDefaultBrowser=
			GOTO :forceIE
		)
	) else (
		SET LaunchPadProfilePath=!LaunchPadTemp!\!LaunchPadProfileName!
		MKDIR !LaunchPadProfilePath! >nul 2>nul
		xcopy /q/y/i/e "!LaunchPadBatchPath!\!LaunchPadBrowserName!\profile" "!LaunchPadProfilePath!"
		ECHO // >>!LaunchPadProfilePath!\prefs.js
		ECHO // >>!LaunchPadProfilePath!\user.js
	)

	call "%LaunchPadBatchPath%\preferences.bat"

rem browser.helperApps.neverAsk.saveToDisk

    SET LaunchPadURL=file://
    SET LaunchPadSourcePathTemp=%LaunchPadBatchPath%\Mozilla.html
    REM Check for UNC (no :)
    FOR /f "tokens=1-2  delims=:" %%A in ("%LaunchPadSourcePathTemp%") DO IF {%%B} == {} SET LaunchPadURL=%LaunchPadURL%//
:getURL
    FOR /f "tokens=1* delims=\" %%A in ("%LaunchPadSourcePathTemp%") DO (
	IF {%%A} == {} GOTO :gotURL
	SET LaunchPadURL=%LaunchPadURL%/%%A
	SET LaunchPadSourcePathTemp=%%B
        GOTO :getURL
    )
:gotURL
    ECHO user_pref("capability.principal.codebase.p0.id", "%LaunchPadURL%?%LaunchPadLocale%"); >>"%LaunchPadProfilePath%\user.js"
    CALL "%LaunchPadBatchPath%\getOS.bat"
    SET LaunchPadOSType=windows

	if "%LaunchPadBrowserProfileType%" == "0" (
		COPY /Y "%LaunchPadBatchPath%\RunMozilla.bat" "%LaunchPadTemp%\RunMozilla.bat" >nul 2>&1
		"%LaunchPadTemp%\RunMozilla.bat" 2>nul		
	) else (
		COPY /Y "%LaunchPadBatchPath%\Run%LaunchPadBrowserName%.bat" "%LaunchPadTemp%\Run%LaunchPadBrowserName%.bat" >nul 2>&1
		"%LaunchPadTemp%\Run%LaunchPadBrowserName%.bat" 2>nul
	)

ENDLOCAL

