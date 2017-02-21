// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2006
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

var lastUsedId;
var viewPageTempUserName = 'lp_user_' + Math.floor(Math.random()*1000000);

// high contrast check
// sets top.highContrast to be true of false
function checkHighContrast()
{
  var vTestHC = top.document.createElement("div");
  vTestHC.id = "testHC";
  vTestHC.style.cssText = 'border: 1px solid;'
      + 'border-color:red green;'
      + 'position: absolute;'
      + 'height: 5px;'
      + 'top: -999px;'
      + 'background-image: url("transparent.gif");';
  top.document.body.appendChild(vTestHC);

  //do the tests
  var vTestHC = top.document.getElementById("testHC");
  var vStyle = null;
  try{
    vStyle = top.document.defaultView.getComputedStyle(vTestHC, "");
  }catch(e){
    vStyle = vTestHC.currentStyle;
  }
  var vTestImg = vStyle.backgroundImage;
  if ((vStyle.borderTopColor==vStyle.borderRightColor) || (vTestImg != null && (vTestImg == "none" || vTestImg == "url(invalid-url:)" ))){
    top.highContrast = true;
    top.setProperty("highContrast", "true");
  }
  else
  {
    top.highContrast = false;
    top.setProperty("highContrast", "false")
  }
}

// security check
// fcn: function
// returns boolean - if secure
function isSecure(fcn) {
    try {
        // Need to check if the security function passed contains the expected source.
        // Ensures a malevolent function is not being passed and run before the actual check to see if secure.
        if ((new Function("return window")).toString().replace(/\n/g," ") != fcn.toString().replace(/\n/g," "))
            return false;

        return(fcn().top == window.top);

    } catch(e) { alert(e.message);}
    return false;
}

// returns boolean - If is in Wizard mode.
function isWizard()
{
  return (top.navigationMode && top.navigationMode.toUpperCase() == "WIZARD");
}

// returns boolean - If is in Essentials mode.
function isEssentials()
{
  return (top.navigationMode && top.navigationMode.toUpperCase() == "ESSENTIALS");
}

// returns boolean - If is Windows 64-bit
function isWin64()
{
  return (top.ARCHITECTURE.indexOf("64") > -1)?true:false;
    
}

// returns string - script launcher executable for Windows
function getScriptLauncherExeName()
{
	if (!top.scriptLauncherExeName)
	{
		top.scriptLauncherExeName = getEnv('LaunchPadScriptLauncher') || (top.findProperty && top.findProperty('launchpadScriptLauncher', top, null)) || isWin64() ? 'ScriptLauncher64.exe' : 'ScriptLauncher.exe';
	}
	return top.scriptLauncherExeName;
}

// strip whitespace
// s : string
// returns string - no leading or trailing whitespace
function trim(s) {
    try {
        s = s.match(/\S.*/);
        if (s == null) return '';
        return s.toString().match(/.*\S/).toString();
    } catch(e) { top.logException(e,arguments);}
    return top.UNDEFINED;
}


// Add quotes if the string is not already surrounded by quotes
// or if it does not contain a quoted string.
// s: string
// returns string with quotes around it
function addQuotes(s) {
   if (s.indexOf('"') === -1) {
      return '"' + s + '"';
   } else  {
      return s;
   }
}


function createTempFile(prefix, suffix, directory)
{
	if(!directory) directory = top.getEnv('LaunchPadTemp');
	if(!suffix) suffix = '';
	if(!prefix) prefix = '';
	
	prefix = directory + top.PATHSEPARATOR + prefix;
	
	// find a filename that doesn't exist yet in temp
	var index = Math.round(Math.random() * 1000);
	var path = prefix + suffix;
	while(top.clientFileExists(null, path))
	{
		path = prefix + index + suffix;
		index++;
	}
	top.writeTextFile(path,'');
	return path;
}

// format a message with substitution references
// template: string - template message
// optional args: substitution values
// returns string - message with subsitution
function formatmsg(template) {
    try {
        var args = arguments;
        var msg = template;
        if (typeof msg == "string" && typeof arguments[1] != "undefined" && arguments[1] != null) {
            if (typeof arguments[1] != "string") {
                args = arguments[1];
            }
            for (var i=1; i < args.length; i++) {
                if ((typeof args[i] != "undefined") && args[i] != null) {
                    var ndx = 0;
                    do {
                        ndx = msg.indexOf("%"+i, ndx);
                        if (ndx >= 0) {
							var replacement = args[i].toString();
							msg = msg.substring(0,ndx) + replacement + msg.substring(ndx+2);
							ndx += replacement.length;
						}
                    } while (ndx >= 0);
                }
            }
        }
        return msg;
    } catch(e) { top.logException(e,arguments);}
    return top.UNDEFINED;
}

// see if a messy-named file exists
// securityFcn: function = new Function('return window')
// topDir: string - current full directory path for relative names
// fileName: string - messy file name
// logSeverity: string - optional log severity letter if logging is requested
// returns string - full native file if it exists
//         null - if not exists
function secureClientFileExists(securityFcn,topDir,fileName,logSeverity) {
    try {
        var fullFileName = top.getFullFileName(topDir,fileName);
        if (top.secureFileExists(securityFcn, fullFileName))
            return fullFileName;
    } catch(e) { top.logException(e,arguments);}
    if (typeof logSeverity == "string")
        top.logMessage('LPV20016'+logSeverity.toUpperCase(), fileName, topDir);
    return null;
}

// enable or disable a document element
// element: document element
// enableFlag: boolean 
// returns void
function enableElement(element, enableFlag) {
    try {
        if ((typeof element == "undefined") || (typeof element == "string") || element == null || element == '') return;
        if (typeof element.disabled != "undefined") {
            element.disabled = !enableFlag;
        }
        if (typeof element.style != "undefined") {
			if (enableFlag)
			{
				// Restore original element values
				element.style.cursor = (typeof element.savedCursor != "undefined") ? element.savedCursor : "hand";
				element.style.color = (typeof element.savedColor != "undefined") ? element.savedColor : "purple";
				element.onclick = (typeof element.savedOnclick != "undefined") ? element.savedOnclick : element.onclick;
			} 
			else 
			{
				// Save original element values
				element.savedCursor = element.style.cursor;
				element.savedColor = element.style.color;
				element.savedOnclick = element.onclick;
				
				// Set disabled element values
				element.style.cursor = "default";
				element.style.color = "gray";
				element.onclick = function(){ return false; };
			}
        }
    } catch(e) { top.logException(e,arguments);}
}

// expand a string with %envVar% parameters
// inCmd: string - string to perform substitution
// returns string - expanded string
top.expandEnv = function (inCmd)
{
    var startPos=inCmd.indexOf('%');
    while (startPos != -1) {
        var cmBefore=inCmd.substring(0,startPos);
        var cmAfter=inCmd.substring(startPos+1);
        var endPos=cmAfter.indexOf('%');
        if (endPos != -1) {
            inCmd=cmBefore+
                  top.secureGetEnv(new Function('return window'), cmAfter.substring(0,endPos))+
                  cmAfter.substring(endPos+1);
        } else {
            top.logMessage('LPV20026S',inCmd);
            break;
        }
        startPos=inCmd.indexOf('%');
    }
    return inCmd;
}


// get and format a platform dependent command to execute
// commandDataArray: [strings] - array of platform dependent command templates
// args: [strings] - substitution parameters
function getCommand(commandDataArray, args) {
    try {
        var rc;
        var command = null;
        
        try
        {
            command = top.getBestOSMatch(commandDataArray);
        } catch(e) {}
        
        if (typeof command == "undefined" || command == null) {
            top.logMessage("LPV20020S", "null");
            return;
        }

        var cmd = new Array();
        for (var i=0; i < command.length; i++) {
            if (typeof command[i] == "string")
                cmd[i] = top.formatmsg(command[i], ((typeof args == "object") ? args : arguments));
                // Expand env variables (%varName%) on command element
                if (typeof cmd[i] == "string") {
                  cmd[i]=expandEnv(cmd[i]);
                }
            else {
                cmd[i] = command[i];
                top.logMessage("LPV20020S", command);
            }
        }
        return cmd;
    } catch(e) { top.logException(e,arguments);}
}

// popup an HTML page to view
// securityFcn: function = new Function('return window')
// win: window - HTML target or null to run an external browser
// topDir: string - full current directory for relative paths
// url: string - messy URL spec to display
// element: optional document element - disable briefly while viewing for feedback
// returns boolean - true if error
var UrlRegExp = new RegExp("https?://|file://|ftp://","i");
function secureViewPage(securityFcn,win,topDir,url,element) {
    try {
        var f = null;
        if (typeof win == "undefined") {
            return true;
        }

        var anchorRegex = new RegExp("#");
        var anchorPosition = url.search(anchorRegex);
        var queryStringRegex = new RegExp("[\?]");
        var queryStringPosition = url.search(queryStringRegex);

        var anchor = "";
        var queryString = "";
        var tempUrl = url;
        //We only have an anchor
        if (anchorPosition > 0 && queryStringPosition == -1) {
            tempUrl = url.substring(0,anchorPosition);
            anchor = url.substring(anchorPosition, url.length);
        }
        //we only have a queryString
        else if (anchorPosition == -1 && queryStringPosition > 0) {
            tempUrl = url.substring(0,queryStringPosition);
            queryString = url.substring(queryStringPosition, url.length);
        }
        //we have both an anchor and a query string.  Assume the anchor comes first
        else if (anchorPosition > 0 && queryStringPosition > 0 && anchorPosition<  queryStringPosition) {
            tempUrl = url.substring(0,anchorPosition);
            anchor = url.substring(anchorPosition, queryStringPosition);
            queryString = url.substring(queryStringPosition, url.length);
        }
        //we have both an anchor and a query string and the query string is first
        else if (queryStringPosition > 0 && queryStringPosition > 0 && queryStringPosition < anchorPosition) {
            tempUrl = url.substring(0,queryStringPosition);
            queryString = url.substring(queryStringPosition, anchorPosition);
            anchor = url.substring(anchorPosition, url.length);             
        }

        if (url.search(UrlRegExp) == 0)
            var fullURL = url;
        else {
            if ((f = top.secureClientFileExists(securityFcn, topDir, tempUrl, 'W')) == null) {
                if (win != null) win.close();
                return true;
            } else {                
                var fullURL = top.nativeFileToURL(f);
                if (anchorPosition != -1 && queryStringPosition != -1 && anchorPosition < queryStringPosition) {
                    fullURL += anchor + queryString;
                } else if (anchorPosition != -1 && queryStringPosition != -1 && queryStringPosition < anchorPosition) {
                    fullURL += queryString + anchor;
                } else if (anchorPosition != -1 && queryStringPosition == -1) {
                    fullURL += anchor;
                } else if (queryStringPosition != -1 && anchorPosition == -1) {
                    fullURL += queryString;
                }
            }
        }
        
        try
        {            
           if (top.OSTYPE=="windows" && win == null) {
				secureRunProgram(securityFcn, "", ["cmd.exe","/c", "start", top.BROWSER === 'IExplore' ? '""' : '', fullURL], false, true, element);                
                return false;
           }
        }
        catch(e)
        { //fall through
        }

        if (win != null) {
            try
            {    
              win.location.replace(fullURL);
              //Closes the old blank window if UAC is on
              //if(isUACOn() && engineTop.getEnv("LaunchPadOS") == "Windows_Vista" && engineTop.getEnv("LaunchPadDefaultBrowser") == "IExplore") win.close();
            }
            catch(e)
            {
				//This is most likely to fail if the launchpad is started from a network share on another domain, and has
                //to pull a file from the local drive or a location other than where it was started from.  
                top.logException(e,arguments); 
                if (win != null) win.close();

                return true;
            }
        }

        else if (typeof top.VIEWERPATH == "string" && top.VIEWERPATH != '' && typeof top.VIEWERARGS == "string" && top.VIEWERARGS != '') {
            // run cmd /c start *.html
            secureRunProgram(securityFcn,"",[top.VIEWERPATH,top.VIEWERARGS,fullURL],false,true,element);
        } else if (typeof top.VIEWERPATH == "string" && top.VIEWERPATH != '') {
            // run mozilla or firefox *.html
            if (top.OSTYPE == "unix") {
                fullURL = fullURL.replace(/&/g, '\\&');
                var SET_LOGIN_NAME = 'LOGNAME=' + viewPageTempUserName + '; export LOGNAME;';
                secureRunProgram(securityFcn,"",['/bin/sh','-c', (top.OS === 'AIX' ? '' : SET_LOGIN_NAME) + 'unset MOZ_NO_REMOTE;' +secureGetEnv(securityFcn,'LaunchPadBrowser') + " " + fullURL],false,false,element);
            } else {
                secureRunProgram(securityFcn,"",[top.VIEWERPATH, fullURL], false, false, element);
            }
        } else
            window.open(fullURL);
        return false;
    } catch(e) { top.logException(e,arguments); 
        if (win != null) win.close();
        return true;
    }
}


// Function to determine whether User Access Control is turned on in Windows Vista/2008
function isUACOn()
{
  var uacValue = top.getEnv("LaunchPadUACValue");
  try
  {
    return uacValue.charAt(uacValue.length - 1) == '1';
  }
  catch(e) { return false };
  return false;
}

// Returns a sorted list of valid locale IDs and translated language names
// NOTE: This function can only be called after properties.js has been loaded!!
// If top.LOCALE is not in the validLocales property list, this function will
// add it to insure the current local is in the list.
// returns: Array of localID/Name Array
function getValidLocaleNames() {
    var validLocales = property('validLocales',['en']);
    var localeNames = property('localeName', new Array());

    // Build locale list
    var localeList = new Array();
    for (var i in validLocales) {
        var localeID = validLocales[i];
        var tempName = localeNames[localeID];
        if (typeof tempName != "undefined") {
            localeList.push([localeID, tempName]);    
        }    
    }

    // Sort localeList by name using locale-based compare
    localeList.sort(function(a,b){ return a[1].localeCompare(b[1]);});

    return(localeList);
}

 //<ACGC_Bidi> Start 
function isBidiLocale()
{
	var bidiLocales = property('bidiLocales',['ar','he']);
	for(var x in bidiLocales)
	{
		if(bidiLocales[x] == top.LOCALE) return true;
	}
	return false;
}

// restart launchpad with a different locale
        // lang: string 
// returns void - launchpad repaints
function changeLocale(lang) {
    try {
        var startingDir = top.getDiskMapping(null);
        if (startingDir == null) return;
        top.STARTINGDIR = startingDir;
        try {
            if (top.secureSetEnv(new Function('return window'), "LaunchPadLocale", lang)) {
                setTimeout('top.document.location.replace("'+top.document.location.href+'")',100);
                // reload() won't work in mozilla = cache problem?
                // top.document.location.reload(false);
                return;
            }
        } catch(e) {}
        top.LOCALE = lang;
        top.initializeProperties();
        var title = top.findProperty('title',this,null);
        if (typeof title == "string")
            top.document.title = title;
        for (var i=top.frames.length-1; i >= 0; i--)
            if (typeof top.frames[i].location != "undefined" && top.frames[i].location.href != '')
                // reload() won't work in mozilla = cache problem?
                setTimeout('top.frames['+i+'].location.replace("'+top.frames[i].location.href+'")',100);
        return;
    } catch(e) { top.logException(e,arguments);}
}

// Takes the current launchpad locale and converts it to the corresponding value found in the map.
function getLocaleMapping(mapName)
{
	if(typeof mapName == "undefined" || mapName == null)
	{
		mapName = "engineLocales";
	}
	var localeMappings = property(mapName);
	var locale = localeMappings[top.LOCALE];

	if ( locale == null ) { // if no mapping exists for the 5 character lang code, try the two digit code
		locale = localeMappings[top.LOCALE.substring(0,2).toLowerCase()];
	}
	if ( locale == null ) { // try the fallbackLocale
		locale = localeMappings[property('fallBackLocale', 'en')];
	}
	if ( locale == null ) { // if everything fails, default to English
		locale = localeMappings['en'];
	}
	return locale;
}

// search for a file
// securityFcn: function = new Function('return window')
// startingDir: string - full current directory for relative references
// baseFileName: string - relative path to find
// fallBackLocale: string - optional locale directory to look in 
// returns string - full native file name if found
//         undefined/null if not found
// search order:
//  extensions/locale (if applicable)
//  extensions/fallback locale (if applicable)
//  extensions (if applicable)
//	content/locale
//	content/fallback locale
//	content
//	skin/locale
//	skin/fallback locale
//	skin
//	launchpad/locale
//	launchpad/fallback locale
//	launchpad
function secureFindFile(securityFcn,startingDir,baseFileName,fallBackLocale,doc) {    

    var extensionDir = top.getExtensionDirectoryForDocument(doc);

    try {        
        if (startingDir == null || startingDir.length == 0) 
		{
			if(baseFileName.charAt(0) == '/') startingDir = "";
			else startingDir = "./";
		}
        var c = startingDir.charAt(startingDir.length-1);
        if (c != '/' && c != '\\') startingDir += "/";
        var f;        
        if ((f = top.secureClientFileExists(securityFcn,top.getFullFileName(startingDir+top.RELATIVEDIR,top.CONTENTDIR),top.LOCALE+"/"+baseFileName)) == null)
            if (top.LOCALE == fallBackLocale || typeof fallBackLocale != "string" || 
                (f = top.secureClientFileExists(securityFcn,top.getFullFileName(startingDir+top.RELATIVEDIR,top.CONTENTDIR),fallBackLocale+"/"+baseFileName)) == null)
                if ((f = top.secureClientFileExists(securityFcn,top.getFullFileName(startingDir+top.RELATIVEDIR,top.CONTENTDIR),baseFileName)) == null)

                    if ((f = top.secureClientFileExists(securityFcn,top.getFullFileName(startingDir+top.RELATIVEDIR,top.SKINDIR),top.LOCALE+"/"+baseFileName)) == null)
                        if (top.LOCALE == fallBackLocale || typeof fallBackLocale != "string" || 
                            (f = top.secureClientFileExists(securityFcn,top.getFullFileName(startingDir+top.RELATIVEDIR,top.SKINDIR),fallBackLocale+"/"+baseFileName)) == null)
                            if ((f = top.secureClientFileExists(securityFcn,top.getFullFileName(startingDir+top.RELATIVEDIR,top.SKINDIR),baseFileName)) == null)

                                if ((f = top.secureClientFileExists(securityFcn,startingDir+top.RELATIVEDIR,top.LOCALE+"/"+baseFileName)) == null)
                                    if (top.LOCALE == fallBackLocale || typeof fallBackLocale != "string" || 
                                        (f = top.secureClientFileExists(securityFcn,startingDir+top.RELATIVEDIR,fallBackLocale+"/"+baseFileName)) == null)
                                        f = top.secureClientFileExists(securityFcn,startingDir+top.RELATIVEDIR,baseFileName);

        if (extensionDir != null) {
            var extFile = top.secureClientFileExists(securityFcn,top.getFullFileName(startingDir+top.RELATIVEDIR+"/"+top.CONTENTDIR + "/" + top.EXTENSIONSDIR, extensionDir + "/" + top.LOCALE + "/"),  baseFileName);            
            if (extFile == null) {
                extFile = top.secureClientFileExists(securityFcn,top.getFullFileName(startingDir+top.RELATIVEDIR+"/"+top.CONTENTDIR + "/" + top.EXTENSIONSDIR, extensionDir + "/" + fallBackLocale+"/"),baseFileName);
                if (extFile == null) {
                    extFile = top.secureClientFileExists(securityFcn, top.getFullFileName(startingDir+top.RELATIVEDIR+"/"+top.CONTENTDIR + "/" + top.EXTENSIONSDIR, extensionDir + "/"),baseFileName)
                }
            }            
            if (extFile != null) {
                f = extFile;
            }
        }

        if (typeof f == "undefined" || f == null)
            top.logMessage("LPV20013W", startingDir, baseFileName);
        return f;
    } catch(e) { top.logException(e,arguments);}
    return top.UNDEFINED;
}

// debug function to write generated HTML to a random window
// doc: document reference
// win: window
// returns void - HTML text replaces win contents
function showHTML(doc,win) {
    var newHTML = doc.documentElement.innerHTML.replace(/</g, "&lt;"); 
    newHTML = newHTML.replace(/\n/g, "<br>");
    newHTML = newHTML.replace(/\s+\}/g, "<br>}");
    newHTML = newHTML.replace(/\}\s+/g, "}<br>");
    newHTML = newHTML.replace(/;\s+/g, ";<br>");
    newHTML = newHTML.replace(/\{\s+/g, "{<br>");
    newHTML = newHTML.replace(/document\.write\(unescape\('%0D%0A'\)\);/g, "");
    newHTML = newHTML.replace(/document\.write\(unescape\('0A'\)\);/g, "");
    win.document.write(newHTML); 
}

// resize launchpad
// x: integer - width
// y: integer - height
// returns void
function resize(x,y) {
  try
  {
    window.resizeTo(x,y);
  }
  catch(e){}
}

// set <HTML lang="??"> based on launchpad locale
// doc: document reference
// returns void
function setHTMLlang(doc) {
    try {
        var htmlelement = doc.getElementsByTagName("HTML")[0];
        if (typeof htmlelement.lang != "string" || htmlelement.lang == '') {
            if (top.LOCALE.length > 2 && top.LOCALE.charAt(2) == '_')
                htmlelement.lang = top.LOCALE.substring(0,2) + "-" + top.LOCALE.substring(3);
            else
                htmlelement.lang = top.LOCALE;
        }
    } catch(e) {}
}

//Returns the extensionDirectory associated with a document.
//Returns null if the document does not exist in a menu extension directory
function getExtensionDirectoryForDocument(doc)
{
    try
    {    
      var relativeExtensionsDir = top.getNativeFileName(engineTop.RELATIVEDIR + top.CONTENTDIR + "/"  + top.EXTENSIONSDIR);
      var normalizedFileName = top.getNativeFileName(doc.location.toString());
      var extensionIndex = normalizedFileName.indexOf(relativeExtensionsDir);

      var extensionDir = null;

      if (extensionIndex != -1) {
          extensionIndex += relativeExtensionsDir.length;
          normalizedFileName = normalizedFileName.substring(extensionIndex);
          normalizedFileName = normalizedFileName.replace(/\\/g,'/');        
          var documentURLArray = normalizedFileName.split('/');
          extensionDir = documentURLArray[1] + "/" + documentURLArray[2];        
      }

      return extensionDir;
    }
    catch(e)
    {
      top.logException(e,arguments);
    }
}

/*
strict unicode UTF-8:
^([\x00-\x7f]|
[\xc2-\xdf][\x80-\xbf]|
\xe0[\xa0-\xbf][\x80-\xbf]|
[\xe1-\xec][\x80-\xbf]{2}|
\xed[\x80-\x9f][\x80-\xbf]|
[\xee-\xef][\x80-\xbf]{2}|
f0[\x90-\xbf][\x80-\xbf]{2}|
[\xf1-\xf3][\x80-\xbf]{3}|
\xf4[\x80-\x8f][\x80-\xbf]{2})*$

ISO-10646 UTF-8:
^([\x00-\x7f]|
[\xc0-\xdf][\x80-\xbf]|
[\xe0-\xef][\x80-\xbf]{2}|
[\xf0-\xf7][\x80-\xbf]{3}|
[\xf8-\xfb][\x80-\xbf]{4}|
[\xfc-\xfd][\x80-\xbf]{5})*$
*/
var UTF8toStringRegExp = new RegExp("[\xc0-\xff]");
function UTF8toString(bytes) {
    var j = bytes.search(UTF8toStringRegExp);
    if (j < 0) return bytes;
    var retString = bytes.substring(0,j);
    var len = bytes.length;
    while (j < len) {
        var charCode = bytes.charCodeAt(j);

        if (charCode < 192) {
            retString += bytes.charAt(j);
            j++;
        } else {
            var shift;
            var mb_len;
            var dec;
            if (charCode <= 223) {
                // \xc0-\xdf
                mb_len = 2;
                dec = 192;
                shift = 6;
            } else if (charCode <= 239) {
                // \xe0-\xef
                mb_len = 3;
                dec = 224;
                shift = 12;
            } else if (charCode <= 247) {
                // \xf0-\xf7
                mb_len = 4;
                dec = 240;
                shift = 18;
            } else if (charCode <= 251) {
                // \xf8-\xfb
                mb_len = 5;
                dec = 248;
                shift = 24;
            } else {
                // \xfc-\xfd
                mb_len = 6;
                dec = 252;
                shift = 30;
            }
            charCode = 0;
            while (mb_len-- > 0) {
                charCode += (bytes.charCodeAt(j++) - dec) << shift;
                dec = 128;
                shift -= 6;
            }
            retString += String.fromCharCode(charCode);
        }
    }
    return retString;
}

/*
function call() {
  try {
    var fcn;
    var v;
    var p = this;
    do {
        try { eval("fcn = p."+arguments[0]); } catch(e) {}
        if (typeof fcn != "undefined") {
        var exec_cmd="v = fcn(";
        for (var i=1; i < arguments.length-1; i++) exec_cmd += "arguments["+i+"],";
        if (arguments.length > 1)
        exec_cmd += "arguments["+(arguments.length-1)+"]";
        exec_cmd += ")";
        eval(exec_cmd);
        return v;
        }
        if (p.parent == p) p = null;
        else
        p = p.parent;
    } while (p != null);
    return v;
  } catch(e) { top.logException(e,arguments); }
}
*/

top.document.href = top.document.location.href;

function getDocument(doc)
{
	if(!doc) doc = document;
	else if(typeof element == "string") 
	{
		// get document for top/main/log/banner/content/navigation/
		alert('string not supported in getDocument');
	}
	return doc;
}

function createElement(type, id, content, document)
{

	document = getDocument(document);
	var element = document.createElement(type);
	if(id) element.setAttribute('id',id);
	if(content) element.innerHTML = content;
	return element;

}

function getElement(element, document)
{
	document = getDocument(document);
	
	if(!element) element = document.body;
	if(typeof element == "string") 
	{
		element = document.getElementById(element);
	}
	
	return element;
}

function appendElement(element, parent, document)
{
	parent = getElement(parent, document);
	element = getElement(element, document);
	parent.appendChild(element);
}

function removeElement(element, document)
{
	element = getElement(element, document);
	element.parentNode.removeChild(element);
}

function addFrameOverlay(id, url, document)
{
	var element = createElement('div',id,'<div class="frame_overlay' + '' + '"></div> '+'<iframe id="frame_' + id + '" src="' + url + '" width="100%" height="100%" marginwidth="0" marginheight="0" frameborder="0" application="yes" />',document);
	element.className = 'frame_overlay_wrapper';
	appendElement(element, document.body, document);
}
function removeFrameOverlay(id, document)
{
	removeElement(id, document);
}

function showDialog(title, url, width, height, id, document)
{
	
  if(!width) width = '75%';
  if(!height) height = '75%';

	top.document.getElementById('semiTransparentWash').style.display = "block";
  top.document.getElementById('dialogContainer').style.display = "block";
  
  var overlay = (top.BROWSER == 'IExplore') ? top.document.getElementById('innerDialogWrapper') : top.document.getElementById('dialogDiv');
  overlay.style.width = width;
  overlay.style.height = height;
  top.dialogFrame.dialogTitleFrame.document.getElementById('title').innerHTML = title;
  top.dialogFrame.dialogContentFrame.location.href = url;
}
function setupDialog(title, url, width, height, id, doc)
{
	var dialogFrameWindow = doc.getElementById("dialogFrame"+id).contentWindow;
	if(!dialogFrameWindow || !dialogFrameWindow.dialogTitleFrame || !dialogFrameWindow.dialogTitleFrame.document || !dialogFrameWindow.dialogTitleFrame.document.getElementById('title') 
		|| !dialogFrameWindow.dialogContentFrame || !dialogFrameWindow.dialogContentFrame.location) {
		setTimeout(function(){ setupDialog(title, url, width, height, id, doc); }, 5);
		return;
	}
	
	try
	{
	if(!width) width = '75%';
	if(!height) height = '75%';
	var overlay = (top.BROWSER == 'IExplore') ? doc.getElementById('innerDialogWrapper'+id) : doc.getElementById('dialogDiv'+id);
	overlay.style.width = width;
	overlay.style.height = height;

	dialogFrameWindow.dialogTitleFrame.document.getElementById('title').innerHTML = title;
	dialogFrameWindow.dialogContentFrame.location.href = url;
	
  
	dialogFrameWindow.dialogTitleFrame.document.getElementById('closeButton').onclick = function()
	{
		top.removeElement(id, doc);
	};
	}catch(e){ alert(e); }
}

function showOverlay(show, doc, id, optionalZindex)
{
  if(!doc) doc = top.document;
  
  if(!show)
  {
    if(!id) id = lastUsedId;
    top.removeElement(id, doc);
    return;
  }
  
  if(!id) id = "" + Math.floor(Math.random() * 1000000000);
  lastUsedId = id;

  var innerHTML = '\
  <div id="' + id + '" class="black semitransparent fill absolute">\
  </div>';

  var element = top.createElement('div',id,innerHTML,doc);
  top.appendElement(element, doc.body, doc);

  if(optionalZindex)
    element.style.zindex = optionalZindex;

  return id;
}

function removeFrameOverlay(id, document)
{
  if(!document) document = top.document;
  if(!id) id = "";
  document['dialogFrame' + id].dialogContentFrame.location.href = "blank.html";
  document.getElementById('semiTransparentWash'+id).style.display="none";
  document.getElementById('dialogContainer'+id).style.display="none";
}

function ternary(booleanValue, resultIfTrue, resultIfFalse) 
{ 
	return (booleanValue) ? resultIfTrue : resultIfFalse;
}

function compare(comparisonType, value1, value2) 
{
	if (comparisonType == "==") 
		return (value1 == value2);  
	else if (comparisonType == "!=") 
		return (value1 != value2);
	else 
		return false; 
}

function include(document, scripts, shouldFindFile, type) {
	if(typeof scripts == 'string')
	{
		scripts = [scripts];
	}
	if(!type) type = 'script';
	
	var head = document.getElementsByTagName('head')[0];
	for(var i in scripts)
	{
		var script = scripts[i];
		if(shouldFindFile)
		{
			script = findURL(null, script);
		}
		var element = document.createElement(type);
		element.src = script;
		head.appendChild(element)
	}
}

function convertHexStringToByteArray(hexString)
{
	var byteArray = new Array();
	try
	{
		for(var i = 0; i < hexString.length; i += 2)
		{
			var b1 = parseInt(hexString.charAt(i), 16);
			var b2 = i < hexString.length - 1 ? parseInt(hexString.charAt(i + 1), 16) : 0;
		
			var b = (b1 << 4) + b2;
			byteArray.push(b);
		}
		return byteArray;
	}
	catch(e)
	{
		//TODO logging of message
		alert('Invalid hexidecimal string: ' + hexString);
		return null;
	}
}
