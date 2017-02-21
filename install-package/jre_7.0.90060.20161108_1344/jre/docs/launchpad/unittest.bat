@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

SETLOCAL

    SET browser=%1
    IF {%browser%} == {} SET browser=IExplore
    SET LaunchPadContentDirectory=content/unittest/
    SET LaunchPadSkinDirectory=skins/unittest/
    SET LaunchPadStartPage=utframeset.html
    SET LaunchPadLogFilter=SE
    "%~dp0%browser%.bat"

ENDLOCAL

