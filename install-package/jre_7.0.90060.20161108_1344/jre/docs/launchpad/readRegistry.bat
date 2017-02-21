@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2007
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

REM %1 - The registry key folder
REM %2 - The key name
REM %3 - A unique key (hopefully) that will be used to bypass the expensive call to reg/regedit if we've
REM      already looked up the value for this key
REM %4 - The env var to store the value from the registry into

CALL "%~dp0getOS.bat"
CALL "%~dp0SetTmp.bat"

SET %4=

IF {%LaunchPadOS%} == {Windows_2000} GOTO readRegPreVista
IF {%LaunchPadOS%} == {Windows_XP} GOTO readRegPreVista
IF {%LaunchPadOS%} == {Windows_2003} GOTO readRegPreVista

:readRegPostVista
   CALL "%~dp0readRegistryVista.bat" %1 %2 %3 %4              
   GOTO :eof

:readRegPreVista
    CALL "%~dp0readRegistryNonVista.bat" %1 %2 %3 %4              
    GOTO :eof
