@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2007
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

IF not {%LaunchPadOS%} == {} GOTO :end

FOR /f "tokens=2,3,4,5*" %%a in ('ver') DO CALL :findOs %%a  %%b  %%c  %%d
GOTO :end

REM The ver command generates the following output on each supported windows OS
REM 2k    - Microsoft Windows 2000 [Version 5.0.XXX]   Note... the 2000 may or may not appear
REM XP    - Microsoft Windows XP [Version 5.1.XXX]
REM 2k3   - Microsoft Windows [Version 5.2.XXX]
REM Vista - Microsoft Windows [Version 6.0.XXX]
REM
REM This function is passed all of the info from "Windows" on to the end of the ver output string
:findOs
REM XP is an easy decision.  If it's not XP, we fall back to the versions
IF {%2} == {XP} (
 SET LaunchPadOS=Windows_XP
)

REM If we see 2000, this also makes the decision easy
IF {%2} == {2000} (
  SET LaunchPadOS=Windows_2000
)

IF {%LaunchPadOS%} == {} (
  for /f "tokens=1,2,3 delims=." %%i in ('echo %3') DO CALL :findOsHelper %%i %%j
)

GOTO :EOF

REM This function maps version numbers to OS names
REM param %1 major version
REM param %2 minor version
:findOsHelper

SET minorVersion=%2
SET minorVersion=%minorVersion:~0,1%

REM The check for 2000 may not be necessary here, but I could swear I've seen a 2K machine that
REM didn't have "2000" in the version string
if {%1} == {5} (
  if {%minorVersion%} == {0} (
	SET LaunchPadOS=Windows_2000
	GOTO :EOF
  )
)
REM If we haven't figured it out yet, check the product name in the registry
CALL "%LaunchPadBatchPath%\readRegistryVista.bat" "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion" ProductName subOs LaunchPadOSCheck
SET LaunchPadOSCheck=!LaunchPadOSCheck:"=!  
FOR /f "tokens=1,2,3,4*" %%p in ('echo !LaunchPadOSCheck!') DO CALL :checkVista %%p %%q %%r %%s
GOTO :EOF

:checkVista
REM echo CheckVersion: 1=%1 2=%2 3=%3 4=%4
if {"%4"} == {"2008"} (
  SET LaunchPadOS=Windows_2008
) else if {"%3"} == {"2008"} (
  SET LaunchPadOS=Windows_2008
) else if {"%2"} == {"2008"} (
  SET LaunchPadOS=Windows_2008
) else if {"%4"} == {"XP"} (
  SET LaunchPadOS=Windows_XP
) else if {"%3"} == {"XP"} (
  SET LaunchPadOS=Windows_XP
) else if {"%2"} == {"XP"} (
  SET LaunchPadOS=Windows_XP
) else if {"%4"} == {"2003"} (
  SET LaunchPadOS=Windows_2003
) else if {"%3"} == {"2003"} (
  SET LaunchPadOS=Windows_2003
) else if {"%2"} == {"2003"} (
  SET LaunchPadOS=Windows_2003
) else if {"%4"} == {"Vista"} (
  SET LaunchPadOS=Windows_Vista
) else if {"%3"} == {"Vista"} (
  SET LaunchPadOS=Windows_Vista
) else if {"%2"} == {"Vista"} (
  SET LaunchPadOS=Windows_Vista
) else if {"%4"} == {"7"} (
  SET LaunchPadOS=Windows_7
) else if {"%3"} == {"7"} (
  SET LaunchPadOS=Windows_7
) else if {"%2"} == {"7"} (
  SET LaunchPadOS=Windows_7
) else (
  SET LaunchPadOS=Windows
)
GOTO :EOF

:end
echo.%LaunchPadOS%