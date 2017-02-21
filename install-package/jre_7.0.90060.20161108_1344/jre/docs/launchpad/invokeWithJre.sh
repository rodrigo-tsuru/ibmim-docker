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
if [  ! "$LaunchPadJavaPath" = "" ]; then
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

if [ "$LaunchPadCopyJre" = "" ]; then
	LaunchPadCopyJre=`eval "echo \\$LAUNCHPAD_COPY_JRE_TO_TEMP_${os}_${LaunchPadArch}"`
fi
if [ "$LaunchPadCopyJre" = "" ]; then
	LaunchPadCopyJre="$LAUNCHPAD_COPY_JRE_TO_TEMP"
fi
if [ "$LaunchPadCopyJre" = "" ]; then
	LaunchPadCopyJre="true"
fi
export LaunchPadCopyJre

if [ "$LaunchPadJreLocation" = "" ]; then
	LaunchPadJreLocation=`eval "echo \\$launchpad_vm_${os}_${LaunchPadArch}"`
fi
if [ "$LaunchPadJreLocation" = "" ]; then
	LaunchPadJreLocation="$LAUNCHPAD_JRE_LOCATION"
fi
if [ "$LaunchPadJreLocation" = "" ]; then
	LaunchPadJreLocation="jre"
fi
export LaunchPadJreLocation

if [ "$LaunchPadMainClass" = "" ]; then
	LaunchPadMainClass="com.ibm.eec.launchpad.runtime.Launchpad"; export LaunchPadMainClass
fi

LaunchPadJavaOptions="$LaunchPadJavaOptions -Dfile.encoding=UTF-8"
if [ ! "$LaunchPadDebugPort" = "" -o ! "$LaunchPadDebugOptions" = "" ]; then
	if [ "$LaunchPadDebugOptions" = "" ]; then
		if [ "$LaunchPadDebugSuspend" = "" ]; then
			LaunchPadDebugSuspend="y"
			export LaunchPadDebugSuspend
		fi
		LaunchPadDebugOptions="transport=dt_socket,address=$LaunchPadDebugPort,server=y,suspend=$LaunchPadDebugSuspend"
		export LaunchPadDebugOptions
	fi
	if [ "$LaunchPadJavaVersion" = "1.4.2" ]; then
		LaunchPadDebugPrefix="-Xdebug -Xrunjdwp:"
	else
		LaunchPadDebugPrefix="-agentlib:jdwp="
	fi
	export LaunchPadDebugPrefix
	
	LaunchPadPreDebugJavaOptions="$LaunchPadJavaOptions"
	export LaunchPadPreDebugJavaOptions
	LaunchPadJavaOptions="$LaunchPadDebugPrefix$LaunchPadDebugOptions $LaunchPadJavaOptions"
fi
export LaunchPadJavaOptions

# Set the classpath by inlining the commands from setClasspath.sh
. $installsourcepath/setClasspath.sh
if [ ! $? -eq 0 ]; then
	source $installsourcepath/setClasspath.sh
fi

cp -r $installsourcepath/lib $LaunchPadTmpDir

LaunchPadJavaPathOrig="$LaunchPadJavaPath"
if [ "$LaunchPadCopyJre" = "true" ]; then
	mkdir -p $LaunchPadTmpDir/$LaunchPadJreLocation
	cp -r $installsourcepath/../$LaunchPadJreLocation $LaunchPadTmpDir/$LaunchPadJreLocation/..
	LaunchPadJavaPath=$LaunchPadTmpDir/$LaunchPadJreLocation/bin/java
else
	LaunchPadJavaPath=$installsourcepath/../$LaunchPadJreLocation/bin/java
fi
if [ ! "$LaunchPadJavaPathOrig" = "" ]; then
	LaunchPadJavaPath="$LaunchPadJavaPathOrig"
fi
export LaunchPadJavaPath

ls "$LaunchPadJavaPath" > /dev/null 2>&1
if [ ! $? -eq 0 ]; then
	if [ "$LaunchPadBrowserEnabled" = "false" ]; then	
		$installsourcepath/noJre.sh
	fi
	exit 1
fi

LaunchPadJavaArgs="LaunchPadCleanEnv false $LaunchPadJavaArgs";
export LaunchPadJavaArgs;

# Launch the Java based launchpad
exec /bin/sh -c "trap '' 1
	\"$LaunchPadJavaPath\" $LaunchPadJavaOptions $LaunchPadMainClass $LaunchPadJavaArgs
	if [ \$? -eq 0 ]; then
		\cd ..
		rm -rf $LaunchPadTmpDir
	elif [ ! \"$LaunchPadDebugOptions\" = \"\" ]; then
		# Maybe we're running with 1.4, try to start using -Xdebug
		echo \"JVM 1.5+ Debug invocation failed. Trying 1.4 debug invocation...\"
		\"$LaunchPadJavaPath\" -Xdebug -Xrunjdwp:$LaunchPadDebugOptions $LaunchPadPreDebugJavaOptions $LaunchPadMainClass $LaunchPadJavaArgs
		if [ \$? -eq 0 ]; then
			\cd ..
			rm -rf $LaunchPadTmpDir
		fi
	fi	
	exit \$?" &

#When this script is called from NoBrowser, this signals the NoBrowser script that the launchpad was successfully invoked from the jre
if [ "$1" = "NoBrowser" ]; then
	exit 0
fi

