#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2010
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

# traps the SIGTTOU command that might be thrown if the user invokes
# ./launchpad.sh &
trap '' 22

# Clean variables
unset LaunchPadBrowserEnabled
unset LaunchPadJrePreferred
unset LaunchPadJavaPath
unset LaunchPadCopyJreToTemp
unset LaunchPadJreLocation
unset LaunchPadMainClass
unset LaunchPadDebugOptions
unset LaunchPadDebugSuspend

case "$0" in
	/*) fullpath=$0;;
	 *) fullpath=`pwd`/$0;;
esac
installsourcepath=`echo "$fullpath" | sed "s,/\./,/,g; s,/[^/][^/]*/\.\./,/,g; s,//,/,g; s,/[^/]*$,,"`
installsourcepath=$installsourcepath/launchpad
# fixup symlink if possible
LaunchPadPwd=`which pwd`; export LaunchPadPwd
[ -f $LaunchPadPwd ] && installsourcepath=`cd $installsourcepath 2>/dev/null && $LaunchPadPwd`
export installsourcepath
LaunchPadBatchPath=$installsourcepath
export LaunchPadBatchPath

LaunchPadTmpDir=/tmp
if [ ! -d $LaunchPadTmpDir ]; then
	mkdir $LaunchPadTmpDir
fi
LaunchPadTmpDir=$LaunchPadTmpDir/IBM_LaunchPad_$$
mkdir $LaunchPadTmpDir >/dev/null 2>&1
\cd $LaunchPadTmpDir
export LaunchPadTmpDir
LaunchPadTemp=$LaunchPadTmpDir; export LaunchPadTemp

LaunchPadArch=`$LaunchPadBatchPath/SetArchitecture.sh`; export LaunchPadArch
LaunchPadOS=`$LaunchPadBatchPath/getOS.sh`; export LaunchPadOS
LaunchPadOSType=unix; export LaunchPadOSType

LaunchPadLogName=$LOGNAME; export LaunchPadLogName

#copy temp files
cp -f "$LaunchPadBatchPath/callback.sh" $LaunchPadTemp
cp -f "$LaunchPadBatchPath/changeDirectory.sh" $LaunchPadTemp

if [ -z "$LaunchPadContentDir" ]; then
	LaunchPadContentDir=content/
	export LaunchPadContentDir
fi


LaunchPadExportFile=$LaunchPadTemp/launchpadExports;export LaunchPadExportFile

#Load java.properties variables
#Cross platform way to see if the java.properties file exists (-e doesn't work on solaris)
ls "$LaunchPadBatchPath/java.properties" > /dev/null 2>&1
if [ $? -eq 0 ]; then
	sed 's/\r$//' $LaunchPadBatchPath/java.properties > $LaunchPadTemp/javaTemp.properties
	oldIFS=$IFS
	IFS="="
	while read key value
	do
		IFS=$oldIFS
		#Ensure the key is not empty
		if [ "$key" ]; then
			#Ensure the line is somewhat well formed by checking that a value is also specified	
			if [ "$value" ]; then
				#Don't set variables that are either commented out or that already have a value
				firstChar="`echo $key | cut -c1`"
				if [ ! $firstChar = "#" ]; then
					#eval $key=$value
					#export $key
					echo "$key=\"$value\""
					echo "export $key"
				fi
			fi
		fi
		IFS="="
	done < $LaunchPadTemp/javaTemp.properties > $LaunchPadExportFile
	IFS=$oldIFS
	rm $LaunchPadTemp/javaTemp.properties
fi
. $LaunchPadExportFile
if [ ! $? -eq 0 ]; then
	source $LaunchPadExportFile
fi

#Load launchpadEnv variables
#Cross platform way to see if the launchpadEnv file exists (-e doesn't work on solaris)
ls "$LaunchPadBatchPath/launchpadEnv" > /dev/null 2>&1 
if [ $? -eq 0 ]; then
	#while read k v; eval $k=$v; export $k; done < "$LaunchPadBatchPath/launchpadEnv"
	sed 's/\r$//' $LaunchPadBatchPath/launchpadEnv > $LaunchPadTemp/launchpadEnvTemp
	while read key value
	do
		#Ensure the key is not empty
		if [ "$key" ]; then
			#Ensure the line is somewhat well formed by checking that a value is also specified	
			if [ "$value" ]; then
				#Don't set variables that are either commented out or that already have a value
				firstChar="`echo $key | cut -c1`"
				if [ ! $firstChar = "#" ]; then
					#eval $key=$value
					#export $key
					echo "$key=\"$value\""
					echo "export $key"
				fi
			fi
		fi
	done < $LaunchPadTemp/launchpadEnvTemp > $LaunchPadExportFile
	rm $LaunchPadTemp/launchpadEnvTemp
fi
# inline the commands we just wrote to the file (exporting on solaris in the above code was failing, the variables were out of scope after leaving the do while loop)
. $LaunchPadExportFile
if [ ! $? -eq 0 ]; then
	source $LaunchPadExportFile
fi

#Load command line arguments, export as key value pairs
currentArgIndex=1
nextArgIndex=2
# if the first arg is -a, skip it and continue processing the rest, this is only required for launchpad.exe
firstArgValue=`eval "echo \\$$currentArgIndex"`
if [ "$firstArgValue" = "-a" ]; then
  currentArgIndex=`expr $currentArgIndex + 1`
  nextArgIndex=`expr $nextArgIndex + 1`
fi
while [ $currentArgIndex -lt $# ]
do
	key=`eval "echo \\$$currentArgIndex"`
	value=`eval "echo \\$$nextArgIndex"`
	echo "$key=\"$value\""
	echo "export $key"
	currentArgIndex=`expr $currentArgIndex + 2`
	nextArgIndex=`expr $nextArgIndex + 2`
done > $LaunchPadExportFile	
# inline the commands we just wrote to the file (exporting on solaris in the above code was failing, the variables were out of scope after leaving the do while loop)
. $LaunchPadExportFile
if [ ! $? -eq 0 ]; then
	source $LaunchPadExportFile
fi

LaunchPadArch=`$LaunchPadBatchPath/SetArchitecture.sh`
export LaunchPadArch

if [ ! "$LaunchPadDisableSplash" ]; then 
	$LaunchPadBatchPath/splash.sh &
fi

#Inlines browser.sh , which sets and exports the BROWSER, whichBrowser and messagePreferredBrowserNotFound variables
. $LaunchPadBatchPath/browser.sh

if [ ! $? -eq 0 ]; then
	source $LaunchPadBatchPath/browser.sh
fi

whichBrowserScript=$LaunchPadBatchPath/$whichBrowser.sh


$LaunchPadBatchPath/jclp.sh || eval exec env LOGNAME=lp_user_$$ $whichBrowserScript
