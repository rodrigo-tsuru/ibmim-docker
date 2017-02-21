@ECHO off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2007
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.

REM %1 - The registry key folder
REM %2 - The key name
REM %3 - A unique key (hopefully) that will be used to bypass the expensive call to reg/regedit if we've
REM      already looked up the value for this key
REM %4 - The env var to store the value from the registry into

REM  If we are running on Vista, we need to use reg instead of regedit to prevent security popups
SET keyName=%2
SET regCommand=reg QUERY %1 /v %2
IF {%2} == {@} (
   SET keyName=^(Default^)
   SET regCommand=reg QUERY %1
)

IF not exist "%LaunchPadTemp%\%3.reg" %regCommand% > "%LaunchPadTemp%\%3.reg"
IF {%ERRORLEVEL%} == {1} ( 
  GOTO :eof 
)


IF not exist "%LaunchPadTemp%\%3.reg" GOTO :eof
REM %%c is wrapped in quotes because it may have spaces and batch won't process it properly
for /f "tokens=1,2*" %%a in ('TYPE %LaunchPadTemp%\%3.reg') do 	set value="%%c" & CALL :parseVista %keyName% %4 %%a %%b
GOTO :eof

REM Helper function to process the registry entries
REM %1 - The key name we are looking for
REM %2 - The env var to set
REM %3-%4 space delimited output from the reg query
:parseVista
IF {%1} == {%3} (
 SET %2=!value!
 echo !value!
)
GOTO :eof
