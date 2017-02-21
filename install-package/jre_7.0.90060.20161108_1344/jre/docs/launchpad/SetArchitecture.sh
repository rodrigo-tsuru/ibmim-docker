#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2005 
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.
LaunchPadArch=""
case "`uname`" in
Linux)  case "`file -L /bin/sh`" in
                *Intel*80386*) LaunchPadArch=x86;;
                *IA-64*) LaunchPadArch=IA64;;
                *AMD*64*) LaunchPadArch=AMD64;;
                *IBM*S/390*) case "`file -L /bin/sh`" in
		                      *64-bit*) LaunchPadArch=s390x;;		
				      *) LaunchPadArch=s390;;
		             esac;;
                *PowerPC*) LaunchPadArch=`uname -i 2>/dev/null` || LaunchPadArch = `uname -m 2>/dev/null`
                           if [ "$LaunchPadArch" = ppc64 ]; then
                               LaunchPadArch=PPC64
                           else
                               LaunchPadArch=PPC32
                           fi;;
                *86*64*) LaunchPadArch=AMD64;;
        esac;;
HP-UX)	case "`file /bin/sh`" in
                *IA64*) LaunchPadArch=IA64;;
		*) LaunchPadArch=PARISC;;		
	esac;;        
AIX)    case "`uname -p`" in
             *powerpc*) case "`prtconf -c`" in                
		            *64*) case "`prtconf -k`" in
                                       *64*) LaunchPadArch=PPC64;;                                       
                                       *) LaunchPadArch=PPC32;;
                                  esac;;
                            *) LaunchPadArch=PPC32;;
                       esac;;
	esac;;
SunOS)	case "`file /bin/sh`" in
		*SPARC*) case "`isainfo -b 2>/dev/null`" in
		              64) LaunchPadArch=SPARC64;;
		              *) LaunchPadArch=SPARC;;
		         esac;;
                *80386*) case "`/usr/sbin/amd64/prtconf -x >/dev/null 2>&1; echo $?`" in
                              0) LaunchPadArch=AMD64;;
                              *) LaunchPadArch=x86;;
                         esac;;
                *AMD64*) LaunchPadArch=AMD64;;
                *) LaunchPadArch=SPARC64;;
	esac;;
esac

# This is our catchall condition in case we don't match one of the cases above
if [ -z "$LaunchPadArch" ]; then
  
  LaunchPadArch=`uname -i 2>/dev/null` || LaunchPadArch=`uname -m 2>/dev/null`
  case "$LaunchPadArch" in
    ia32) LaunchPadArch=x86;;
    ia64) LaunchPadArch=IA64;;
    ppc64) LaunchPadArch=PPC64;;
    ppc32) LaunchPadArch=PPC32;;
    s390) LaunchPadArch=s390;;    
    *SUN*) case "`uname -p`" in
                *sparc*) LaunchPadArch=SPARC64;;
           esac;;
  esac                                                                                                     
fi

export LaunchPadArch
echo $LaunchPadArch

