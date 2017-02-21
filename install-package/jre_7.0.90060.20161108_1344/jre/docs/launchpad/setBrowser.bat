@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2007
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

CALL "%~dp0GetShortName.bat" "%~dp0" LaunchPadBatchPath

REM Set the LaunchPadDefaultBrowser variable
IF {%LaunchPadDefaultBrowser%} == {} CALL "%LaunchPadBatchPath%\readRegistry.bat" "HKEY_CURRENT_USER\SOFTWARE\Clients\StartMenuInternet" @ browser LaunchPadDefaultBrowserTemp

REM Normalize the registry data for Vista
SET LaunchPadDefaultBrowserTemp=%LaunchPadDefaultBrowserTemp: =%
SET LaunchPadDefaultBrowserTemp=%LaunchPadDefaultBrowserTemp:"=%

REM Hashes the registry value to one of our values
IF {"%LaunchPadDefaultBrowserTemp%"} == {"mozilla.exe"} SET LaunchPadDefaultBrowser=Mozilla
IF {"%LaunchPadDefaultBrowserTemp%"} == {"Mozilla.exe"} SET LaunchPadDefaultBrowser=Mozilla
IF {"%LaunchPadDefaultBrowserTemp%"} == {"MOZILLA.EXE"} SET LaunchPadDefaultBrowser=Mozilla

IF {"%LaunchPadDefaultBrowserTemp%"} == {"seamonkey.exe"} SET LaunchPadDefaultBrowser=SeaMonkey
IF {"%LaunchPadDefaultBrowserTemp%"} == {"SeaMonkey.exe"} SET LaunchPadDefaultBrowser=SeaMonkey
IF {"%LaunchPadDefaultBrowserTemp%"} == {"SEAMON~1.EXE"} SET LaunchPadDefaultBrowser=SeaMonkey

IF {"%LaunchPadDefaultBrowserTemp%"} == {"firefox.exe"} SET LaunchPadDefaultBrowser=Firefox
IF {"%LaunchPadDefaultBrowserTemp%"} == {"Firefox.exe"} SET LaunchPadDefaultBrowser=Firefox
IF {"%LaunchPadDefaultBrowserTemp%"} == {"FIREFOX.EXE"} SET LaunchPadDefaultBrowser=Firefox

REM We use IE if none of the previous browsers are set as the default
IF {%LaunchPadDefaultBrowser%} == {} SET LaunchPadDefaultBrowser=IExplore

echo %LaunchPadDefaultBrowser%