#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2009
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

if [ ! "$LaunchPadURL" ]; then
	LaunchPadURL="$LaunchPadBatchPath/WebKit.html"; export LaunchPadURL
fi

exec /bin/sh -c "trap '' 1
	( set -x 
	\"$LaunchPadBrowser\" LaunchPadURL $LaunchPadURL )
	\cd ..
	if [ -f \"$LaunchPadTmpDir\"/LaunchPadKeepTemp.txt ]; then
		rm \"$LaunchPadTmpDir\"/LaunchPadKeepTemp.txt
	else
		rm -rf $LaunchPadTmpDir
	fi"
	
exit 0
