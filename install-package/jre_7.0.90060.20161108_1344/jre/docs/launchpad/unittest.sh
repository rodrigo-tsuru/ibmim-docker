#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005 
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

case "$0" in
    /*) fullpath=$0;;
     *) fullpath=`pwd`/$0;;
esac
installsourcepath=`echo "$fullpath" | sed "s,/\./,/,g; s,/[^/][^/]*/\.\./,/,g; s,//,/,g; s,/[^/]*$,,"`
# fixup symlink if possible
[ -f /bin/pwd ] && installsourcepath=`cd $installsourcepath 2>/dev/null && /bin/pwd`

export LaunchPadContentDirectory=content/unittest/
export LaunchPadSkinDirectory=skins/unittest/
export LaunchPadStartPage=utframeset.html
export LaunchPadLogFilter=SE
$installsourcepath/${1:-Mozilla}.sh
