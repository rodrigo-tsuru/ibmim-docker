#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2007
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

    locale=`$installsourcepath/GetLocale.sh`
    if [ $locale != pt_br ] && [ $locale != zh_tw ]; then
        locale=`echo $locale | awk '{print substr($0,0,2)}'`    
    else
    	#Solaris 10 requires the used of /usr/xpg4/bin/tr for double-byte locales
    	if [ -f /usr/xpg4/bin/tr ]; then
        	locale=`echo $locale | awk '{print substr($0,0,2)}'`_`echo $locale | awk '{print substr($0,4,2)}' | /usr/xpg4/bin/tr '[:lower:]' '[:upper:]'` 
        else
        	locale=`echo $locale | awk '{print substr($0,0,2)}'`_`echo $locale | awk '{print substr($0,4,2)}' | tr '[:lower:]' '[:upper:]'`    
        fi
    fi

	os=`$installsourcepath/getOS.sh`; export os
    # Try to run with the jre (if < Launchpad 2.3, invokeWithJre.sh call just returns exit code 1, 
    # indicating that the jre version was not launched, thus bypassing this exit)
    $installsourcepath/invokeWithJre.sh NoBrowser && exit 0

    if [ -f $installsourcepath/$LaunchPadContentDir/$locale/noBrowser.html ]; then
      HTMLFILE=$installsourcepath/$LaunchPadContentDir/$locale/noBrowser.html
    elif [ -f $installsourcepath/$LaunchPadContentDir/en/noBrowser.html ]; then
      HTMLFILE=$installsourcepath/$LaunchPadContentDir/en/noBrowser.html
    elif [ -f $installsourcepath/$locale/noBrowser.html ]; then
           HTMLFILE=$installsourcepath/$locale/noBrowser.html
    elif [ -f $installsourcepath/en/noBrowser.html ]; then
           HTMLFILE=$installsourcepath/en/noBrowser.html
    else
        echo ERROR: No supported browser could be found!
        exit
    fi

    if [ -x "$BROWSER" ]; then
        (set -x
        "$BROWSER" $HTMLFILE) && exit
    fi
    
    if [ -z "$PAGER" ]; then
        if [ -t 1 ]; then 
            pager="cat"
        elif [ "$DISPLAY" ]; then
            pager="cat && read nothing"
        else
            pager="cat"
        fi

        eval "which less 2> /dev/null"
        if [ $? = 0 ]; then
            PAGER=`which less`
        else
            eval "which more 2> /dev/null"
            if [ $? = 0 ]; then
                PAGER=`which more`
            else
                eval "which pg 2> /dev/null"
                if [ $? = 0 ]; then
                  PAGER=`which pg`;
                fi
            fi
        fi
     
        #if we still haven't found a pager command, fallback to 'cat'
        if [ -z "$PAGER" ]; then
            PAGER=$pager
        fi
    fi

    #This is a special case for HPUX (because which never gives a non-zero return code on HPUX)
    if [ `uname` = "HP-UX" ]; then
      PAGER=more
    fi

    # use eval below to strip quotes
    eval toCharmap=`locale charmap`
    # strip off any filename extension that is sometimes added
    toCharmap=`echo "$toCharmap" | sed "s:\..*::"`
    if [ -z "$toCharmap" ]; then
        toCharmap=iso88591
    fi
    # read the html file and look for the charset=
    fromCharmap=`grep -i "content[ 	]*=.*charset=[ 	]*[_a-zA-Z0-9\-]" $HTMLFILE | 
	sed "s:.*charset=[ 	]*::; s:[^_a-zA-Z0-9\-].*::"`
    # if not found, provide a default
    if [ -z "$fromCharmap" ]; then
	fromCharmap=iso88591
    fi
    # get a list of all charmap names that this computer understands
    availableCharmaps=`locale -a | egrep "^${locale}([\-\_][A-Z]*)?\." | sed "s:^[^\.]*\.::; s:@.*::" | sort -u | xargs -l99 echo`

    # get real charmap names for toCharmap and fromCharmap 
    # normalize the toCharmap name
    toCharmapCompare=`echo $toCharmap | tr "[A-Z]" "[a-z]" | sed "s:[^0-9a-z]::"`
    # normalize the fromCharmap name
    fromCharmapCompare=`echo $fromCharmap | tr "[A-Z]" "[a-z]" | sed "s:[^0-9a-z]::"`
    for charmap in $availableCharmaps;do
	# normalize the charmap name to compare to
	charmapCompare=`echo $charmap | tr "[A-Z]" "[a-z]" | sed "s:[^0-9a-z]::"`
	if [ "$charmapCompare" = "$toCharmapCompare" ]; then
	    # found a match so replace the fake name with the real name
	    toCharmap=$charmap
	fi
	if [ "$charmapCompare" = "$fromCharmapCompare" ]; then
	    # found a match so replace the fake name with the real name
	    fromCharmap=$charmap
	fi
    done   

    # check if conversion is needed
    if [ "$fromCharmap" = "$toCharmap" ]; then
	# no conversion needed
	PGM=cat
    else
	PGM="iconv -f $fromCharmap -t $toCharmap"
    fi

    cr=`echo "\r\c"`

    # run the conversion (if needed) and perform some simple post-processing to make it look nice
    OUTPUT_COMMAND="( ( set -x
                        $PGM $HTMLFILE 2>/dev/null
		      ) ||
		      (
		        ( set -x
			  cat $installsourcepath/en/noBrowser.html 
			) ||
		        echo ERROR: No supported browser could be found!
		      )
		    ) |
		    sed \"s:<[Bb][Rr]>:  :g; s:<[^>]*>::g; s:\&nbsp\;: :g; s:\&lt\;:<:g; s:\&gt\;:>:g; s:^[ 	][ 	]*::\" | uniq | $PAGER"


    if [ "$DISPLAY" ]; then
		# try to display in an xterm
		PATH=$PATH:/usr/bin:/usr/X11R6/bin:/usr/bin/X11:/usr/lpp/X11/bin:/usr/openwin/bin
		xterm -e /bin/sh -c "$OUTPUT_COMMAND" || eval "$OUTPUT_COMMAND"
    elif [ -t 1 ]; then
	# if stdout is going to the console, just send the output there
		eval "$OUTPUT_COMMAND"
    else
	# just send the output somewhere and see what hapens
	eval "$OUTPUT_COMMAND"
    fi
