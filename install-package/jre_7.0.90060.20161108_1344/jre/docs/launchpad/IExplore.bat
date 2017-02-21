@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

SETLOCAL

    CALL "%~dp0GetShortName.bat" "%~dp0" LaunchPadBatchPath
    IF NOT {"%LaunchPadBrowser%"} == {""} GOTO :startIE
    IF {%LaunchPadDefaultBrowser%} == {IExplore} GOTO :startIE
    IF {%LaunchPadDefaultBrowser%} == {} GOTO :startIE
    SET LaunchPadDefaultBrowser=
    SET LaunchPadBrowser=%comspec%
    SET LaunchPadBrowserArgs=/c START
:startIE
    COPY /Y "%LaunchPadBatchPath%\RunIExplore.bat" "%LaunchPadTemp%\RunIExplore.bat" >nul 2>&1
    "%LaunchPadTemp%\RunIExplore.bat" 2>nul
    
ENDLOCAL
