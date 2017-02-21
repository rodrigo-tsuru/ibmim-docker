#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005 
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

if [ -n "$LaunchPadLocale" ]; then
   locale=$LaunchPadLocale
fi

[ "$locale" ] || locale=$LC_ALL
[ "$locale" = C -o "$locale" = POSIX ] && locale=""
[ "$locale" ] || locale=$LC_MESSAGES
[ "$locale" = C -o "$locale" = POSIX ] && locale=""
[ "$locale" ] || locale=$LANG
[ "$locale" = C -o "$locale" = POSIX ] && locale=""
[ "$locale" ] || locale=$LC_CTYPE
[ "$locale" = C -o "$locale" = POSIX ] && locale=""
[ "$locale" ] || locale=en

#Solaris 10 requires the used of /usr/xpg4/bin/tr for double-byte locales
if [ -f /usr/xpg4/bin/tr ]; then
	locale=`echo $locale | /usr/xpg4/bin/tr '[:upper:]' '[:lower:]'`
else
	locale=`echo $locale | tr '[:upper:]' '[:lower:]'`
fi
echo $locale | awk '{print substr($0,0,5)}'
