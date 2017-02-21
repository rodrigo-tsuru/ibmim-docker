@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

    FOR /f "tokens=1* delims=\" %%Y in ("%~f1") DO (
        if {%~d1} == {\\} CALL :parseDirs "%%Z" %2 %~d1%%Y\
        if not {%~d1} == {\\} CALL :parseDirs "%%Z" %2 %~d1\
    )
    GOTO :eof

:parseDirs
    IF "{%~1}" == "{}" (
	SET %2=%~s3
	GOTO :eof
    )
    FOR /f "tokens=1* delims=\" %%Y in ("%~1") DO (
	IF "{%%Z}" == "{}" CALL :parseDirs "" %2 "%~s3%%Y"
	IF not "{%%Z}" == "{}" CALL :parseDirs "%%Z" %2 "%~s3%%Y\"
    )
