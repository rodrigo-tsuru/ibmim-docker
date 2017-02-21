@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

    IF not "%LaunchPadTemp%" == "" GOTO :gottempdir
    IF {%tmp%} == {} SET tmp=%temp%
    IF {%tmp%} == {} SET tmp=%homedrive%%homepath%
    IF {%tmp%} == {} SET tmp=%SystemDrive%
    IF {%tmp%} == {} SET tmp=C:
    SET LaunchPadTemp=%tmp%\IBM_LaunchPad_%RANDOM%
:gottempdir
    CALL "%~dp0GetShortName.bat" "%LaunchPadTemp%" LaunchPadTemp
    MKDIR "%LaunchPadTemp%" >nul 2>nul
    CD %LaunchPadTemp%
    FOR %%z in (%LaunchPadTemp%) DO SET drive=%%~dz
    %drive%
