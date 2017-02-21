#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2007
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.

case "`uname`" in
Linux) os=Linux;;
HP-UX) os=HP_UX;;
AIX) os=AIX;;
SunOS) os=SunOS;;
esac

echo $os
