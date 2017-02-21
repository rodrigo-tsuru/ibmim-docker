#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2007 
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

os=`$installsourcepath/getOS.sh`; export os

if [ "$LaunchPadBrowserEnabled" = "" ]; then
	LaunchPadBrowserEnabled=`eval "echo \\$LAUNCHPAD_BROWSER_ENABLED_${os}_${LaunchPadArch}"`
fi
if [ "$LaunchPadBrowserEnabled" = "" ]; then
	LaunchPadBrowserEnabled="$LAUNCHPAD_BROWSER_ENABLED"
fi
if [ "$LaunchPadBrowserEnabled" = "" ]; then
	LaunchPadBrowserEnabled="true"
fi
export LaunchPadBrowserEnabled

if [ "$LaunchPadBrowserEnabled" = "false" ]; then
	LaunchPadJrePreferred="true"
fi
if [ "$LaunchPadJrePreferred" = "" ]; then
	LaunchPadJrePreferred=`eval "echo \\$LAUNCHPAD_JRE_PREFERRED_${os}_${LaunchPadArch}"`
fi
if [ "$LaunchPadJrePreferred" = "" ]; then
	LaunchPadJrePreferred="$LAUNCHPAD_JRE_PREFERRED"
fi
if [ "$LaunchPadJrePreferred" = "" ]; then
	LaunchPadJrePreferred="false"
fi
export LaunchPadJrePreferred

if [ "$LaunchPadJrePreferred" = "true" -o "$LaunchPadBrowserEnabled" = "false" ]; then
	$installsourcepath/invokeWithJre.sh
else
	exit 1
fi
