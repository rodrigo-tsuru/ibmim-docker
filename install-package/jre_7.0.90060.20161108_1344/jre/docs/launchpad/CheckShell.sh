#!/bin/sh
# Licensed Materials - Property of IBM
# 5648-F10 (C) Copyright International Business Machines Corp. 2007
# All Rights Reserved
# US Government Users Restricted Rights - Use, duplication or disclosure
# restricted by GSA ADP Schedule Contract with IBM Corp.


errorHandler() {
  trap "" EXIT
  which bash > /dev/null
  if [ $? = 0 ]; then
    echo "bash"
  else
    echo "failed"
  fi
  
  exit
}

trap 'errorHandler' EXIT

typeset +r LOGNAME 2>/dev/null

trap "" EXIT

echo "sh"

