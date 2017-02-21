@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2007
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

CALL "%~dp0readRegistry.bat" "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\Environment" PROCESSOR_ARCHITECTURE arch LaunchPadArch > nul

REM We need to normalize that value by removing quotes and spaces.  This is only needed on vista
SET LaunchPadArch=%LaunchPadArch: =%
SET LaunchPadArch=%LaunchPadArch:"=%

echo.%LaunchPadArch%
