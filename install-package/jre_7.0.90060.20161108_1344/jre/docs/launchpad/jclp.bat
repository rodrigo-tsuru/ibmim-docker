REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2007
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

echo.
echo Entering jclp.bat...
GOTO %1

:start
	echo.
	echo start
	set LAUNCHPAD_FALSE=false
	set LAUNCHPAD_TRUE=true

:setLaunchPadBrowserEnabled
	echo.
	echo setLaunchPadBrowserEnabled
    if not {%LaunchPadBrowserEnabled%} == {} (
        echo LaunchPadBrowserEnabled=%LaunchPadBrowserEnabled%=LaunchPadBrowserEnabled
    ) else if not {!LAUNCHPAD_BROWSER_ENABLED_windows_%LaunchPadArch%!} == {} (
        set LaunchPadBrowserEnabled=!LAUNCHPAD_BROWSER_ENABLED_windows_%LaunchPadArch%!
        echo LaunchPadBrowserEnabled=!LaunchPadBrowserEnabled!=LAUNCHPAD_BROWSER_ENABLED_windows_%LaunchPadArch%
    ) else if not {%LAUNCHPAD_BROWSER_ENABLED%} == {} (
        set LaunchPadBrowserEnabled=%LAUNCHPAD_BROWSER_ENABLED%
        echo LaunchPadBrowserEnabled=!LaunchPadBrowserEnabled!=LAUNCHPAD_BROWSER_ENABLED
    ) else (
        set LaunchPadBrowserEnabled=%LAUNCHPAD_TRUE%
        echo LaunchPadBrowserEnabled=!LaunchPadBrowserEnabled!=LAUNCHPAD_TRUE
    )
    echo LaunchPadBrowserEnabled=%LaunchPadBrowserEnabled%

	
:setLaunchPadJrePreferred
	echo.
	echo setLaunchPadJrePreferred
    if {%LaunchPadBrowserEnabled%} == {false} (
        set LaunchPadJrePreferred=true
        echo LaunchPadJrePreferred=%LaunchPadJrePreferred%=NOT_LaunchPadBrowserEnabled
    ) else if not {%LaunchPadJrePreferred%} == {} (
        echo LaunchPadJrePreferred=%LaunchPadJrePreferred%=LaunchPadJrePreferred
    ) else if not {%LaunchPadJavaPath%} == {} (
		set LaunchPadJrePreferred=true
        echo LaunchPadJrePreferred=%LaunchPadJrePreferred%=LaunchPadJavaPath
    ) else if not {!LAUNCHPAD_JRE_PREFERRED_windows_%LaunchPadArch%!} == {} (
        set LaunchPadJrePreferred=!LAUNCHPAD_JRE_PREFERRED_windows_%LaunchPadArch%!
        echo LaunchPadJrePreferred=!LaunchPadJrePreferred!=LAUNCHPAD_JRE_PREFERRED_windows_%LaunchPadArch%
    ) else if not {%LAUNCHPAD_JRE_PREFERRED%} == {} (
        set LaunchPadJrePreferred=%LAUNCHPAD_JRE_PREFERRED%
        echo LaunchPadJrePreferred=!LaunchPadJrePreferred!=LAUNCHPAD_JRE_PREFERRED
    ) else (
        set LaunchPadJrePreferred=%LAUNCHPAD_FALSE%
        echo LaunchPadJrePreferred=!LaunchPadJrePreferred!=LAUNCHPAD_FALSE
    )
    echo LaunchPadJrePreferred=%LaunchPadJrePreferred%


:setLaunchPadCopyJre
	echo.
	echo setLaunchPadCopyJre
    if not {%LaunchPadCopyJreToTemp%} == {} (
        echo LaunchPadCopyJreToTemp=%LaunchPadCopyJreToTemp%=LaunchPadCopyJreToTemp
    ) else if not {!LAUNCHPAD_COPY_JRE_TO_TEMP_windows_%LaunchPadArch%!} == {} (
        set LaunchPadCopyJreToTemp=!LAUNCHPAD_COPY_JRE_TO_TEMP_windows_%LaunchPadArch%!
        echo LaunchPadCopyJreToTemp=!LaunchPadCopyJreToTemp!=LAUNCHPAD_COPY_JRE_TO_TEMP_windows_%LaunchPadArch%
    ) else if not {%LAUNCHPAD_COPY_JRE_TO_TEMP%} == {} (
        set LaunchPadCopyJreToTemp=%LAUNCHPAD_COPY_JRE_TO_TEMP%
        echo LaunchPadCopyJreToTemp=!LaunchPadCopyJreToTemp!=LAUNCHPAD_COPY_JRE_TO_TEMP
    ) else (
        set LaunchPadCopyJreToTemp=%LAUNCHPAD_TRUE%
        echo LaunchPadCopyJreToTemp=!LaunchPadCopyJreToTemp!=LAUNCHPAD_TRUE
    )
    echo LaunchPadCopyJreToTemp=%LaunchPadCopyJreToTemp%

	
:setJreLocation	
	echo.
	echo setJreLocation
    if not {%LaunchPadJreLocation%} == {} (
        echo LaunchPadJreLocation=%LaunchPadJreLocation%=LaunchPadJreLocation
    ) else if not {!launchpad_vm_windows_%LaunchPadArch%!} == {} (
        set LaunchPadJreLocation=!launchpad_vm_windows_%LaunchPadArch%!
        echo LaunchPadJreLocation=!LaunchPadJreLocation!=launchpad_vm_windows_%LaunchPadArch%
    ) else if not {%LAUNCHPAD_JRE_LOCATION%} == {} (
        set LaunchPadJreLocation=%LAUNCHPAD_JRE_LOCATION%
        echo LaunchPadJreLocation=!LaunchPadJreLocation!=LAUNCHPAD_JRE_LOCATION
    ) else (
        set LaunchPadJreLocation=jre
        echo LaunchPadJreLocation=!LaunchPadJreLocation!=JRE_DEFAULT
    )
    echo LaunchPadJreLocation=%LaunchPadJreLocation%

	
:setJavaPath
	echo.
	echo setJavaPath
    IF {%LaunchPadJavaPath%} == {} (
		IF {%LaunchPadCopyJreToTemp%} == {true} ( 
			set LaunchPadJavaPath=.\%LaunchPadJreLocation%\bin\java.exe
		) else ( 
			set LaunchPadJavaPath=%LaunchPadBatchPath%\..\%LaunchPadJreLocation%\bin\java.exe
		)
        echo LaunchPadJavaPath=!LaunchPadJavaPath!=LaunchPadJavaPathCalculated
    ) else (
        echo LaunchPadJavaPath=!LaunchPadJavaPath!=LaunchPadJavaPath
    )

	
:setJREOptions
	echo.
	echo setJREOptions
	SET LaunchPadJavaOptions=%LaunchPadJavaOptions% -Dfile.encoding=UTF-8
  	IF {%LaunchPadMainClass%} == {} SET LaunchPadMainClass=com.ibm.eec.launchpad.runtime.Launchpad
	IF NOT {%LaunchPadDebugPort%} == {} (
		call :setJreDebugOptions
	) ELSE IF NOT "%LaunchPadDebugOptions%" == "" (
		call :setJreDebugOptions
	)
	echo LaunchPadJavaOptions=%LaunchPadJavaOptions%	
	goto :checkJrePreferred
	
:setJreDebugOptions
	echo setJreDebugOptions
	IF "%LaunchPadDebugOptions%" == "" (
		IF {%LaunchPadDebugSuspend%} == {} (
			set LaunchPadDebugSuspend=y
		)
		SET LaunchPadDebugOptions=transport=dt_socket,address=%LaunchPadDebugPort%,server=y,suspend=%LaunchPadDebugSuspend%
	)
	if "%LaunchPadJavaVersion%" == "1.4.2" (
		set LaunchPadDebugPrefix=-Xdebug -Xrunjdwp:
	) else (
		set LaunchPadDebugPrefix=-agentlib:jdwp=
	)
	set LaunchPadPreDebugJavaOptions=%LaunchPadJavaOptions%
	set LaunchPadJavaOptions=%LaunchPadDebugPrefix%%LaunchPadDebugOptions% %LaunchPadJavaOptions%
	goto :EOF
	
:checkJrePreferred
	echo.
	echo checkJrePreferred
	IF {%LaunchPadJrePreferred%} == {true} goto :useJRE
	echo.
	echo Exiting jclp.bat...
	goto :EOF
	
	
:useJRE
	echo.
	echo useJRE
	IF NOT EXIST "%LaunchPadJavaPath%" ( 
		IF {%LaunchPadCopyJreToTemp%} == {true} (
			IF NOT EXIST "%LaunchPadBatchPath%\..\%LaunchPadJreLocation%\bin\java.exe" (
				echo.
				echo Could not find %LaunchPadBatchPath%\..\%LaunchPadJreLocation%\bin\java.exe
				GOTO :checkBrowserEnabled
			)	
		) ELSE (
         echo .
         echo Could not find %LaunchPadJavaPath%
         GOTO :checkBrowserEnabled
      )
	)
	GOTO :launchJRE
	
	
:checkBrowserEnabled
	echo.
	echo checkBrowserEnabled
	IF {%LaunchPadBrowserEnabled%} == {false} goto :noJRE
	echo.
	echo Exiting jclp.bat...
	goto :EOF
	
	
:noJRE
	echo.
	echo noJRE
	CALL "%LaunchPadBatchPath%\noJRE.bat"
	exit

	
:noBrowser
	echo.
	echo noBrowser
	REM Assume that launchpad.bat has already called jclp.bat :start
	IF NOT EXIST "%LaunchPadJavaPath%" ( 
		IF {%LaunchPadCopyJreToTemp%} == {true} (
			IF NOT EXIST "%LaunchPadBatchPath%\..\%LaunchPadJreLocation%\bin\java.exe" (
				echo.
				echo Could not find %LaunchPadBatchPath%\..\%LaunchPadJreLocation%\bin\java.exe
				GOTO :checkBrowserEnabled
			)	
		)
	)
	GOTO :launchJRE

	
:cleanupTemp
	echo.
	echo Deleting temp dir: %LaunchPadTemp%...
    CD ..
    IF NOT "%LaunchPadTemp%" == "" CALL :DelDir "%LaunchPadTemp%" & GOTO :EOF
    GOTO :EOF

	
:DelDir
    CD %~1
    IF errorlevel == 1 GOTO :eof
    FOR /f "tokens=*" %%A in ('DIR /a:d /b') DO CALL :DelDir "%%A"
    DEL /F /Q . &  CD .. & RMDIR "%~1"	
	GOTO :EOF
	
	
:launchJRE
	echo.
	echo launchJRE
	IF {%LaunchPadCopyJreToTemp%} == {true} (
		echo.
		echo Copying JRE...
		mkdir "%LaunchPadJreLocation%"
		xcopy /q/y/i/e "%LaunchPadBatchPath%\..\%LaunchPadJreLocation%" "%LaunchPadJreLocation%" 
	)
	
	echo.
	echo Copying lib...
	xcopy /q/y/i/e "%LaunchPadBatchPath%\lib" .\lib > nul
	
	CALL "%LaunchPadBatchPath%\setClasspath.bat"
	echo.
	echo CLASSPATH=%CLASSPATH%
	
	echo.
	echo Starting Java Launchpad...
	set LaunchPadJavaArgs=LaunchPadCleanEnv false %LaunchPadJavaArgs%
	echo "%LaunchPadJavaPath%" %LaunchPadJavaOptions% %LaunchPadMainClass% %LaunchPadJavaArgs%
	IF NOT {%LaunchPadDebug%} == {} (
		"%LaunchPadJavaPath%" %LaunchPadJavaOptions% %LaunchPadMainClass% %LaunchPadJavaArgs%
	) else (
		"%LaunchPadJavaPath%" %LaunchPadJavaOptions% %LaunchPadMainClass% %LaunchPadJavaArgs% 2>>"%LaunchPadTemp%\errorlog.txt"
	)
	
	REM Delete the temp dir if java execution was successful
	IF NOT errorlevel == 1 (
		CALL :cleanupTemp
	) else IF NOT "%LaunchPadDebugOptions%" == "" (
		REM Maybe we're running with 1.4, try to start using -Xdebug
		cmd /c exit
		echo JVM 1.5+ Debug invocation failed. Trying 1.4 debug invocation...
		"%LaunchPadJavaPath%" -Xdebug -Xrunjdwp:%LaunchPadDebugOptions% %LaunchPadPreDebugJavaOptions% %LaunchPadMainClass% %LaunchPadJavaArgs%
		IF NOT ERRORLEVEL == 1 (
			CALL :cleanupTemp
		)
	)

	echo.
	echo Exiting jclp.bat...
	IF NOT {%LaunchPadDebug%} == {} pause
	exit
