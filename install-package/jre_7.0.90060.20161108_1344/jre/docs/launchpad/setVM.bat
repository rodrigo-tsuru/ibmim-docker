@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2007
REM All Rights Reserved
REM US Government Users Restricted Rights - Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

IF EXIST "%LaunchPadBatchPath%\java.properties" FOR /F "eol=# tokens=1,* delims==" %%a in (%LaunchPadBatchPath%\java.properties) DO CALL :setOneEnvironmentVariable %%a "%%b"

REM This subroutine sets an environment variable
REM %~1 is the key
REM %~2 is the value
:setOneEnvironmentVariable

    REM Check that both %~1 and %~2 have a value
    IF {%~1} == {} GOTO :EOF
    IF {%~2} == {} GOTO :EOF

    REM Check to see that the variable isn't already set, we don't want to override preset env vars
	IF {!%~1!} == {} SET %~1=%~2
    goto :EOF
REM --------------   End setOneEnvironmentVariable ----------------------

