// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

// get path separator
// returns string - / or \
function getNativeFileSeparator() {
    if (top.OSTYPE == "windows")
	return "\\";
    else
	return "/";
}

function isWindows()
{
	return top.OSTYPE == "windows";
}

function isUnix()
{
	return top.OSTYPE == "unix";
}

function getDocumentLocation()
{
  var startingFile = top.getFullFileName(null,document.location.pathname);
  if (top.secureFileExists(new Function('return window'), startingFile))
  {
    return startingFile;
  }
  else
  {
    startingFilePrepended = "\\\\" + document.location.hostname + "\\" + startingFile;
    if (top.secureFileExists(new Function('return window'), startingFilePrepended))
    {
      return startingFilePrepended;
    }
    startingFilePrepended = "\\\\" + document.location.host + "\\" + startingFile;
    if (top.secureFileExists(new Function('return window'), startingFilePrepended))
    {
      return startingFilePrepended;
    }
  }
  return startingFile;
}


// get starting directory
// returns string - full grandparent directory path of starting document
function getStartingTopDir() {
    if (typeof top.PATHSEPARATOR == "undefined" || top.PATHSEPARATOR == null) top.PATHSEPARATOR = getNativeFileSeparator();
    var startingFile = getDocumentLocation();
    var i = startingFile.lastIndexOf(top.PATHSEPARATOR);
    if (i > 0) {
	var j = startingFile.lastIndexOf(top.PATHSEPARATOR,i-1);
	if (j > 0)
	    return startingFile.substring(0,j+1);
	return startingFile.substring(0,i+1);
    }
    return '';  
}

// get starting relative directory
// returns string - parent directory of starting document
function getStartingRelativeDir() {
    if (typeof top.PATHSEPARATOR == "undefined" || top.PATHSEPARATOR == null) top.PATHSEPARATOR = getNativeFileSeparator();
    var startingFile = getDocumentLocation();
    var i = startingFile.lastIndexOf(top.PATHSEPARATOR);
    if (i > 0) {
	var j = startingFile.lastIndexOf(top.PATHSEPARATOR,i-1);
	if (j > 0)
	    return startingFile.substring(j+1,i+1);
    }
    return '';  
}

// convert file name to URL syntax
// fullPath: string - full native file name
// returns string - fully qualified URL
function nativeFileToURL(fullPath) {
//if (typeof fullPath == "undefined" || fullPath == null) return top.UNDEFINED;
  try {
    var htmlFile = "file://";
    var c = fullPath.charAt(0);
    if (c != "/" && c != "\\")
	htmlFile += "/";
    if (top.OSTYPE == "windows" && fullPath.substring(0,2) == "\\\\")
	htmlFile += "/";
    htmlFile += fullPath;
    var i;
    for (i=0; i < htmlFile.length; i++)
	if (htmlFile.charAt(i) == "\\")
	    htmlFile = htmlFile.substring(0,i)+"/"+htmlFile.substring(i+1);
    return htmlFile;
  } catch(e) { top.logException(e,arguments); }
  return top.UNDEFINED;
}

// convert non-native, non-standard file name to fully qualified native file name
// fullPath: string - messy input file name
// returns string - full native file name
function getNativeFileName(fullPath) {
  try {
    var i;
    var j;
    if (top.OSTYPE == "windows") {
        do {
            i = fullPath.indexOf("/");
            if (i >= 0) fullPath = fullPath.substring(0,i)+"\\"+fullPath.substring(i+1);
        } while (i >= 0);
        if (fullPath.indexOf(":\\") > 0)
            while (fullPath.charAt(0) == "\\")
                fullPath = fullPath.substring(1);
        do {
            i = fullPath.indexOf("\\.\\");
            if (i > 0) fullPath = fullPath.substring(0,i)+fullPath.substring(i+2);
        } while (i > 0);
        do {
            i = fullPath.indexOf("\\\\",1); // skip position 0 to allow for UNC paths
            if (i > 0) fullPath = fullPath.substring(0,i)+fullPath.substring(i+1);
        } while (i > 0);
        do {
            j = -1;
            i = fullPath.indexOf("\\..\\");
            if (i > 0) {
                j = fullPath.lastIndexOf("\\",i-1);
                if (j >= 0) fullPath = fullPath.substring(0,j)+fullPath.substring(i+3);
            }
        } while (i > 0 && j >= 0);
    }
    else {
        do {
            i = fullPath.indexOf("\\");
            if (i >= 0) fullPath = fullPath.substring(0,i)+"/"+fullPath.substring(i+1);
        } while (i >= 0);
        do {
            i = fullPath.indexOf("/./");
            if (i > 0) fullPath = fullPath.substring(0,i)+fullPath.substring(i+2);
        } while (i > 0);
        do {
            i = fullPath.indexOf("//");
            if (i > 0) fullPath = fullPath.substring(0,i)+fullPath.substring(i+1);
        } while (i > 0);
        do {
            j = -1;
            i = fullPath.indexOf("/../");
            if (i > 0) {
                j = fullPath.lastIndexOf("/",i-1);
                if (j >= 0) fullPath = fullPath.substring(0,j)+fullPath.substring(i+3);
            }
        } while (i > 0 && j >= 0);
    }
    return fullPath;
  } catch(e) { top.logException(e,arguments); }
  return top.UNDEFINED;
}

// convert relative path to full native file name
// topDir: string - current directory for relative paths
// fileName: string - relative or full messy file name
// returns string - full nataive file name
function getFullFileName(topDir,fileName) {
  try {
    if (fileName.charAt(0) == '"') //strip quotes if they exist
    {
      fileName = fileName.substring(1);
      if(fileName.charAt(fileName.length - 1) == '"')
        fileName = fileName.substring(0, fileName.length - 1);
    }
    
    if (fileName == null || fileName.length == 0) return null;
    var fullPath;
    if (top.OSTYPE == "windows" && fileName.length > 2 && fileName.charAt(1) == ":") return getNativeFileName(fileName);
    else if (typeof topDir == "string" && topDir.length > 0 && fileName.charAt(0) != "/" && fileName.charAt(0) != "\\") {
	var c = topDir.charAt(topDir.length-1);
	if (c != '/' && c != '\\')
	    topDir = topDir + '/';
        fullPath = topDir + fileName;
    }
    else
	fullPath = fileName;
    return getNativeFileName(fullPath);
  } catch(e) { top.logException(e,arguments); }
  return top.UNDEFINED;
}
