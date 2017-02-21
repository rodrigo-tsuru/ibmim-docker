#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2007
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

LaunchPadOS=`$LaunchPadBatchPath/getOS.sh`

LaunchPadSplashCmd=""
case "$LaunchPadOS" in
Linux)  case "$LaunchPadArch" in
                x86) LaunchPadSplashCmd=linuxx86;;
                IA64) LaunchPadSplashCmd=linuxx86;;
                AMD64) LaunchPadSplashCmd=linuxx86;;
                s390) LaunchPadSplashCmd=linuxs390;;
				s390x) LaunchPadSplashCmd=linuxs390;;
				PPC64) LaunchPadSplashCmd=linuxppc;;
				PPC32) LaunchPadSplashCmd=linuxppc;;
        esac;;
HP_UX)	case "$LaunchPadArch" in
                IA64) LaunchPadSplashCmd=hpuxia64;;
				PARISC) LaunchPadSplashCmd=hpuxparisc;;		
	esac;;        
AIX)    LaunchPadSplashCmd=aixppc;;
SunOS)	case "$LaunchPadArch" in
		SPARC64)  LaunchPadSplashCmd=sunsparc;;
		SPARC) LaunchPadSplashCmd=sunsparc;;
        AMD64) LaunchPadSplashCmd=sunx86;;
        x86) LaunchPadSplashCmd=sunx86;;
	esac;;
esac

$LaunchPadBatchPath/splash/$LaunchPadSplashCmd/AZY_Splash -i $LaunchPadBatchPath/splash.ini 1> /dev/null 2> /dev/null
