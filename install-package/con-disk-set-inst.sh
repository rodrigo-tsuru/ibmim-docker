#!/bin/sh

# +------------------------------------------------------------------------+
# | Licensed Materials - Property of IBM                                   |
# | (C) Copyright IBM Corp. 2010, 2015.  All Rights Reserved.              |
# |                                                                        |
# | US Government Users Restricted Rights - Use, duplication or disclosure |
# | restricted by GSA ADP Schedule Contract with IBM Corp.                 |
# +------------------------------------------------------------------------+


# +------------------------------------------------------------------------+
# | NOTE: This script is intended to be used when doing a console mode     |
# | install from a multi-CD/DVD disk set, where IM prompts the user to     |
# | insert the next CD/DVD during the install.  For all other use-cases,   |
# | it is not necessary to run this script.  Instead, use the "installc",  |
# | "userinstc", or "groupinstc" launcher with the "-c" option to install  |
# | in console mode.                                                       |
# +------------------------------------------------------------------------+


processargs()
{
    accessRights=
    while [ $# -ne 0 ]; do
        case $1 in
        -accessRights | -aR)
            if [ $# -ne 1 ]; then
                accessRights=$2
            else
                accessRights=badarg
            fi
            break
            ;;
        esac
        shift
    done

    launcher=
    case "$accessRights" in
    "admin" | "")
        launcher=installc
        ;;
    "nonAdmin")
        launcher=userinstc
        ;;
    "group")
        launcher=groupinstc
        ;;
    *)
        echo The only allowed -accessRights values are admin, nonAdmin, and group
        exit 1
    esac

}

scriptBaseName=`basename "$0"`
tempScriptBaseName=con-disk-set-inst-$$.sh

if [ "$scriptBaseName" != "$tempScriptBaseName" ]; then
    # Original script from CD/DVD is running in here.  Make a temporary copy
    # of the script and exec it so that it is possible to eject the first CD/DVD
    # in the mult-CD/DVD disk set. 

    origScriptLoc=`dirname "$0"`
    slash=`LC_ALL=C expr "$origScriptLoc" : "\(/\)"`
    if [ "X$slash" != "X/" ]; then
        origScriptLoc=`pwd`/$origScriptLoc
    fi

    # Place copy in a protected subdirectory of the temp directory. The
    # subdirectory must have a random name.  Do not just use PID since that
    # can be easily predicted by a malicious user.

    randomChars=$RANDOM$RANDOM$RANDOM
    if [ -z "$randomChars" ]; then
        # The RANDOM environment variable isn't available in all Bourne shells.
        # Try using "/dev/urandom" to generate a random string.
        randomChars=`LC_ALL=C tr -dc [:alnum:] < /dev/urandom 2>&- | dd bs=15 count=1 2>&-`
        if [ -z "$randomChars" ]; then
            echo Could not create unique temporary directory
            exit 1
        fi
    fi
    tempRootDir=${TMPDIR-/tmp}
    tempScriptDir=$tempRootDir/con-disk-set-inst-$randomChars-$$

    (umask 077 && mkdir $tempScriptDir)
    status=$?
    if [ $status -ne 0 ]; then
        echo Could not create temporary directory
        exit 1
    fi

    tempScript=$tempScriptDir/$tempScriptBaseName
    cp "$0" "$tempScript"
    status=$?
    if [ $status -ne 0 ]; then
        echo Could not create temporary script
        exit 1
    fi

    # Export the original script location and the temporary subdirectory
    # location for use by the temporary script.
    export origScriptLoc
    export tempScriptDir

    # Replace the original script in this process with the temporary script.
    # Also change the working directory of this process to the temporary
    # directory to ensure the working directory isn't on the CD/DVD.
    cd "$tempRootDir"
    exec "$tempScript" $@

    # Should not return from above exec.
    exit 1 
fi

# The temporary script is running here.

processargs $@

restartScript=$tempScriptDir/restartScript-$$.sh
restartScript2=$tempScriptDir/restartScript2-$$.sh

rm -f "$restartScript"

# Launch Installation Manager.
"$origScriptLoc/$launcher" -c -restartScriptLocation "$restartScript" $@
status=$?
if [ $status -eq 0 ]; then
    # Relaunch Installation Manager if necessary.
    while [ -f "$restartScript" ]; do
        mv -f "$restartScript" "$restartScript2"
        "$restartScript2"
        status=$?
        if [ $status -ne 0 ]; then
            break
        fi
    done
fi

# Remove the temporary subdirectory and all its contents.
rm -r -f "$tempScriptDir"

# Exit with the status returned by the last Installation Manager launch.
exit $status
