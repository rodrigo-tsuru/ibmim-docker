#!/bin/bash
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2007
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

if [ -z "$LaunchPadBrowser" ]; then
    \cd ..
    rm -rf $LaunchPadTmpDir
	if [ "$RM_LICENSE" = "true" ];then
	  	if [ -f "$HOME/.mozilla-license" ]; then
	  		rm -rf "$HOME/.mozilla-license"
	  	fi
	fi
    $installsourcepath/NoBrowser.sh
    exit 1
fi

LaunchPadURL="file://$installsourcepath/Mozilla.html"; export LaunchPadURL

[ -f $HOME/.mozilla-license ] && ln -sf $HOME/.mozilla-license $LaunchPadTmpDir 2>/dev/null
[ -f $HOME/.Xauthority ] && ln -sf $HOME/.Xauthority $LaunchPadTmpDir 2>/dev/null

LaunchPadOS=`uname`; export LaunchPadOS
LaunchPadOSType=unix; export LaunchPadOSType

locale=`$installsourcepath/GetLocale.sh`
[ -n "$LaunchPadLocale" ] || LaunchPadLocale=$locale; export LaunchPadLocale

LaunchPadHOME=$HOME; export LaunchPadHOME
HOME=$LaunchPadTmpDir; export HOME
LaunchPadProfileName=Profile_$$

MOZ_NO_REMOTE=1; export MOZ_NO_REMOTE

	"$LaunchPadBrowser" -nosplash -CreateProfile "$LaunchPadProfileName $LaunchPadTmpDir/Profiles" >/dev/null 2>&1

	for userprefpath in $LaunchPadTmpDir/Profiles/$LaunchPadProfileName/*.slt;do 
		export userprefpath
		if [ ! -d $userprefpath ]; then
			set -x
			"$LaunchPadBrowser" -nosplash -CreateProfile "$LaunchPadProfileName $LaunchPadTmpDir/Profiles"
			set +x
			\cd ..
			rm -rf $LaunchPadTmpDir
			$installsourcepath/NoBrowser.sh
			exit 2
		fi
		mkdir $userprefpath/chrome >/dev/null 2>&1
		
		#Inlines preferences.sh, which sets up permissions in user.js
		. $LaunchPadBatchPath/preferences.sh
		if [ ! $? -eq 0 ]; then
			source $LaunchPadBatchPath/preferences.sh
		fi
	done

	exec /bin/sh -c "trap '' 1
	  ( set -x
	  \"$LaunchPadBrowser\" -nosplash -P $LaunchPadProfileName $LaunchPadURL )
	  return_code=\$?;
	  if [ \$return_code != 0 ]; then
			$installsourcepath/NoBrowser.sh
	  fi
	  \cd ..
	  if [ -f \"$LaunchPadTmpDir\"/LaunchPadKeepTemp.txt ]; then
		rm \"$LaunchPadTmpDir\"/LaunchPadKeepTemp.txt
	  else
		rm -rf $LaunchPadTmpDir
	  fi"
