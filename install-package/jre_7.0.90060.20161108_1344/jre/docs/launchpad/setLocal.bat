@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2007
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

REM Calls a batch file using setLocal enabledelayedexpansion

REM usage: setLocal.bat fileToCall [args to pass...]
SETLOCAL enabledelayedexpansion 

SET LAUNCHPAD_SHIFTED_ARGS= 
SET LAUNCHPAD_SKIPPED_ARG_1=false
FOR %%A IN (%*) DO (
	if {"!LAUNCHPAD_SKIPPED_ARG_1!"} == {"false"} (
		set LAUNCHPAD_SKIPPED_ARG_1=true
	) else (
		set LAUNCHPAD_SHIFTED_ARGS=!LAUNCHPAD_SHIFTED_ARGS! %%A
	)
)

CALL "%~dp0%1" !LAUNCHPAD_SHIFTED_ARGS!

ENDLOCAL