// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2006
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

// change the mouse cursor to look busy or normal
// isBusy: boolean
// doc: document reference
// returns: undefined
/*
function busyCursor(isBusy,doc) {
  try {
    try {
        if (typeof doc.body != "undefined" && typeof doc.body.style != "undefined" && typeof doc.body.style.cursor != "undefined") {
            if (isBusy)
                doc.body.style.cursor='wait';
            else
                doc.body.style.cursor='default';
        }
        else if (typeof doc.all != "undefined" && typeof doc.all.length != "undefined") {
            var i;
            for (i=0; i < doc.all.length; i++) {
                if (isBusy)
                    doc.all[i].style.cursor = 'wait';
                else
                    doc.all[i].style.cursor = 'default';
            }
        }
    } catch(e) {}
  } catch(e) { top.logException(e,arguments); }
}
*/

// create a directory on the system
// fileName: string - full native file name
// returns:  false if the directory was not created, true otherwise 
function createDirectory(fileName)
{
    var retVal = false;
    try {
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(fileName);
		file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE , '0600');
		retVal = true;
	} catch(e)
    {
        top.logException(e,arguments);
    }	
	return false;
}


// determine if the file or folder exists
// fileName: string - full native file name
// shouldIndicateType: boolean - specifies whether to return a simple boolean value, or a truthy value (1 file exists, -1 directory exists, 0 does not exist)
// returns:  false if the file does not exist, true otherwise (or if shouldIndicateType is true, 1 if file exists, -1 directory exists, 0 file does not exist)
function fileExists(fileName, shouldIndicateType)
{
    var retVal = 0;
	
	//This commented-out code functions for URLs on remote systems but not work for local files
	/*try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var xmlReq = new XMLHttpRequest();
		xmlReq.open("GET", fileName, false);
		xmlReq.send(null);
		
		alert(xmlReq.status);
		
		if (xmlReq.status == 200)
			return true;
	} catch(e)
	{
		top.logException(e,arguments);
	}
	return false;*/
	
    try {
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(fileName);
        if (file.exists())
			retVal = file.isDirectory()?-1:1;
    } catch(e)
    {
        top.logException(e,arguments);
    }	
	
	if(shouldIndicateType)
	{
		return retVal;
	}
	else
	{
		return retVal != 0;
	}
	return retVal;
}


// determine if the file exists
// securityFcn: function = new Function('return window')
// fileName: string - full native file name
// returns: boolean
function secureFileExists(securityFcn,fileName,shouldLogException)
{
    try {
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(fileName);
        if ( file.exists() )
            return true;
    } catch(e)
    {
      if(typeof shouldLogException == "undefined" || shouldLogException) top.logException(e,arguments);
    }
    return false;
}

// determine if the directory exists
// securityFcn: function = new Function('return window')
// directory: string - full native directory name
// returns: boolean
function secureDirectoryExists(securityFcn, directory)
{
    var retVal = false;
    try
    {
        if ( top.isSecure(securityFcn) )
        {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");       
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(directory);
     
            retVal = secureFileExists(securityFcn, directory) && file.isDirectory(); 
        }
    }
    catch (e)
    {     
        top.logException(e,arguments);
    }

    return retVal;
}

// gets the value of an environment variable
// securityFcn: function = new Function('return window')
// anyvar: string - name of variable
// returns: string - value of variable
//          undefined - variable is not defined
function secureGetEnv(securityFcn,anyvar)
{
    try {
        var v = null;
        try {
            if ( top.isSecure(securityFcn) )
                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            if ( typeof Components.classes["@mozilla.org/process/environment;1"] != "undefined" )
            {
                var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment); 
                v = env.get(anyvar);
            }
        } catch(e)
        {
        }
        try {
            if ( v == null )
            {
                var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
                v = process.getEnvironment(anyvar);
            }
        } catch(e)
        {
        }
        return v;
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

// sets the value of an environment variable
// securityFcn: function = new Function('return window')
// anyvar: string - name of variable
// value: string - new value of variable
// returns: boolean - success status
function secureSetEnv(securityFcn,anyvar,value)
{
    try {
        var v;
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment); 
        env.set(anyvar,value);
        return secureGetEnv(securityFcn,anyvar) == value;
    } catch(e)
    {
    }
    return false;
}

var elementArray = new Array();

// reenables a document element if the associated process has completed
// element: document element
// returns: undefined
function _enableElement()
{
    try {
        top.enableElement(elementArray.shift(), true);
    } catch(e)
    {
        top.logException(e,arguments);
    }
}

function getEnv(name)
{
	return secureGetEnv(new Function('return window'), name);
}
// executes an arbitrary command
// securityFcn: function = new Function('return window')
// topDir: string - CD mount point
// args: [strings] - command and parameters
// waitBoolean: boolean - foreground or background
// isHidden: boolean - visible window or silent
// element: document element - element to disable while running
// returns: int - return code
function secureRunProgram(securityFcn,topDir,argsIn,waitBoolean,isHidden,element,workingDirectory,callback,timeout,noQuotes)
{
    if(waitBoolean) {
       top.logMessage("LPV31044W", argsIn[0]);
    }
	
	if (!noQuotes) noQuotes = false;
    try {
    	var args = new Array();
        for(var i = 0; i < argsIn.length; i++)
        {
          args[i] = argsIn[i]; //copy the args array
        }
        
        if (typeof waitBoolean == "undefined" || waitBoolean == null) waitBoolean = false; // long running
        if (typeof isHidden == "undefined" || isHidden == null) isHidden = false; // since some things like notepad have to run in visible mode
		if (!timeout) timeout = 5000;

        if ( typeof element != "undefined" && element != null ) {
			top.enableElement(element,false);
		}
		
        args[0] = top.getFullFileName(topDir,args[0]);
        //Since we prefix the command with /bin/bash, we'll almost never get an exception if the program the user
        //wants to run doesn't exist.  So, we have this check just in case.
        if (!programOnPath(securityFcn, args[0]) && !secureFileExists(securityFcn, args[0])) {
          top.logMessage("LPV22041W", args[0]);
        }
		
		if(top.isWindows() && isHidden)
		{
			args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/ScriptLauncher.exe")].concat(args);
		}
		else if(top.isWindows() && !isHidden)
		{
			args = ["-v"].concat(args);
			args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
		}

        var processArgs = new Array();
        if ( waitBoolean == true )
		{
            for ( var i=0; i < top.commandForegroundPrefix.length; i++ ) processArgs.push(top.commandForegroundPrefix[i]);
		}
        else
		{
            for ( var i=0; i < top.commandBackgroundPrefix.length; i++ ) processArgs.push(top.commandBackgroundPrefix[i]);
		}
		
		if(workingDirectory || callback)
		{
			if(top.isWindows())
			{
				if(!isHidden) args = ["-v"].concat(args);
				args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/ScriptLauncher.exe")].concat(args);
			}
			if(workingDirectory) {
				args = [getEnv('LaunchPadTemp') + "/changeDirectory" + (top.isWindows() ? ".bat" : ".sh"), workingDirectory].concat(args);
				if(top.isWindows())  args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/ScriptLauncher.exe")].concat(args);
			}
			if(callback) {
				for (var i=0; i < args.length; i++)
				{
					var batchDelimitersRegExp = new RegExp(/[=,\s;]/).test(args[i]);
					if(batchDelimitersRegExp)
					{
					  args[i]='"' + args[i] + '"';
					}	
				}
				args = [getEnv('LaunchPadTemp') + "/callback" + (top.isWindows() ? ".bat" : ".sh"), top.createCallback(callback,element,timeout)].concat(args);
				if(top.isWindows()) args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/ScriptLauncher.exe")].concat(args);
			}
		}
		
        var commandStr = null;
        if ( waitBoolean == true )
        {
            if ( top.commandForegroundWrapperPrefix != null )
                commandStr = top.commandForegroundWrapperPrefix;
        }
        else
        {
            if ( top.commandBackgroundWrapperPrefix != null )
                commandStr = top.commandBackgroundWrapperPrefix;
        }
        if ( commandStr != null )
        {
            for ( var i=0; i < args.length; i++ )
            {
                var arg = args[i];
                var re = new RegExp(/^[!@+=%:\\\/\-a-zA-Z0-9_]+$/);
                if ( !re.test(arg) && !noQuotes)
                {
                   arg = addQuotes(arg);
//                    if ( arg.indexOf('"') >= 0 )
//                        arg = "'" + arg + "'";
//                    else
//                        arg = '"' + arg + '"';
                }
                commandStr += ' ' + arg;
            }
            processArgs.push(commandStr);
        }
        else
        {
            for ( var i=0; i < args.length; i++ )
                processArgs.push(args[i]);
        }
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var FileFactory = new Components.Constructor("@mozilla.org/file/local;1","nsILocalFile","initWithPath");
        var program = new FileFactory(processArgs[0]);
        var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);

        process.init(program);
        processArgs.shift();
		process.run(waitBoolean, processArgs, processArgs.length);
		var rc = waitBoolean ? process.exitValue : 0;
        if (element && !callback)
        {

            if ( waitBoolean || ((typeof process.isRunning != "undefined") && !process.isRunning) )
			{
                top.enableElement(element,true);
			}
            else
            {
                elementArray.push(element);
                setTimeout('_enableElement()',5000);
            }

        }
        return rc;
    } catch(e)
    {
        try { 
			if (element && !callback) 
				top.enableElement(element,true);
		} catch(e2) { };
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}



//Determines whether the given file can be found using the path, in case
//the full file name is not used to call runProgram.
//Returns true if the program is found on the path, false otherwise
function programOnPath(securityFcn, name)
{
  if ( top.isSecure(securityFcn) )
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
      
  var userEnvironment = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
  var path = userEnvironment.get("PATH");
    
  var foundOnPath = false;
  var paths = path.split(top.isWindows() ? ";" : ":");
    
  for(var i in paths)
  {
	if(top.expandEnv)
	{
		paths[i] = top.expandEnv(paths[i]);
	}
    if(secureFileExists(securityFcn, paths[i] + top.PATHSEPARATOR + name, false))
    {
      foundOnPath = true;
      break;
    }
  }
  return foundOnPath;
}

// Initializes a callback and creates and returns a file that will contain the return code on exit.
// callback: function - the function to call when the batch finishes
// timeout: int - milliseconds to wait between polls to see if the batch file has completed
// returns: string - the path to the file that will contain the return code to be passed to the callback
function createCallback(callback,element,timeout)
{
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var returnCodeFilePath = top.createTempFile('launchpadExecReturnCode');
	var returnCodeFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	returnCodeFile.initWithPath(returnCodeFilePath);

	// Setup and start timeout for callback function
	var originalCallback = callback;
	callback = function()
	{
		try
		{
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

			// Create a new instance of returnCodeFile on each recursion, else fileSize doesn't ever change
			var newFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			newFile.initWithPath(returnCodeFile.path);

			if(newFile.fileSize > 0)
			{
				var returnCode = top.trim(readTextFile(returnCodeFile.path));
				returnCodeFile.remove(false);
				if(element) top.enableElement(element,true);
				originalCallback(returnCode);
			}
			else
			{
				setTimeout(callback,timeout);
			}
		}
		catch(e)
		{
			top.logException(e, arguments);
		}
	};
	setTimeout(callback,timeout);

	return returnCodeFile.path;
}

// read an external file
// securityFcn: function = new Function('return window')
// fileName: string - full native file name
// returns: [line strings]
function secureReadTextFile(securityFcn,fileName)
{
    try {
        var fileLines = new Array();
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( fileName );
        if ( nsILocalFile.exists() == false )
        {
            top.logMessage("LPV20022S", fileName);
        }
        var nsIFileInputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
        .createInstance( Components.interfaces.nsIFileInputStream);
        nsIFileInputStream.init( nsILocalFile, 0x01, 00004, null);
        var nsIBinaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
        .createInstance( Components.interfaces.nsIBinaryInputStream);
        nsIBinaryInputStream.setInputStream(nsIFileInputStream);
        var fileContents = top.UTF8toString(nsIBinaryInputStream.readBytes(nsIFileInputStream.available()));

        nsIFileInputStream.close();
        nsIBinaryInputStream.close();
        if (fileContents.length == 0)
          return top.UNDEFINED;
        //Removes BOM characters from the beginning of the file
        if (fileContents.charCodeAt(0) == '65279' || fileContents.charCodeAt(0) == '65534')
        {
            fileContents = fileContents.substring(1,fileContents.length);   
        }
        if (fileContents.length == 0)
          return top.UNDEFINED;
        fileLines = fileContents.split(/\r*\n/);
        if ( fileLines.length > 0 )
            if ( fileLines[fileLines.length-1].length == 0 )
                fileLines.pop();
        return fileLines;
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

// read an external file
// fileName: string - full native file name 
// returns: string - contents of file if readable, null otherwise
function readTextFile(fileName, encoding)
{
    try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( fileName );
    // We don't do anything with this right now.  UTF8 is a superset of ASCII, so no difference if reading in an ASCII file.
		if (!encoding) encoding = UTF8;
        if ( nsILocalFile.exists() == false )
        {
            top.logMessage("LPV20022S", fileName);
        }
		var nsIFileInputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
        .createInstance( Components.interfaces.nsIFileInputStream);
        nsIFileInputStream.init( nsILocalFile, 0x01, 00004, null);
        var nsIBinaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
        .createInstance( Components.interfaces.nsIBinaryInputStream);
        nsIBinaryInputStream.setInputStream(nsIFileInputStream);
        var fileContents = top.UTF8toString(nsIBinaryInputStream.readBytes(nsIFileInputStream.available()));

        nsIFileInputStream.close();
        nsIBinaryInputStream.close();

        //Removes BOM characters from the beginning of the file
        if (fileContents.charCodeAt(0) == '65279' || fileContents.charCodeAt(0) == '65534')
        {
            fileContents = fileContents.substring(1,fileContents.length);   
        }
		if (fileContents.charCodeAt(0) == '239' &&  fileContents.charCodeAt(1) == '187' && fileContents.charCodeAt(2) == '191')  //0xEF BB BF
		{
			fileContents = fileContents.substring(3,fileContents.length); 
		}

		return fileContents;
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return null;
}

// get a list of child directories
// securityFcn: function = new Function('return window')
// dir: string - parent directory
// returns: [directory name strings]
function secureGetDirectories(securityFcn,dir)
{
    try {
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( top.getNativeFileName(dir) );
        if ( nsILocalFile.exists() == true )
        {
            var entries = nsILocalFile.directoryEntries;
            var returnArray = new Array();
            while ( entries.hasMoreElements() )
            {
                var entry = entries.getNext();
                entry.QueryInterface(Components.interfaces.nsIFile);
                if ( entry.leafName != "." && entry.leafName != ".." )
                {
                	//If directory is disconnected or corrupt we want to 
                	//   log it and move on to the next
					try{
					    if ( entry.isDirectory() )
					    {
							returnArray.push(entry.leafName);
					    }
	                } catch(e) 
	                {
	                    top.logException(e,arguments);
	                }
                }
            }
            return returnArray;
        }
    } catch(e)
    {      
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

// get a list of child files
// securityFcn: function = new Function('return window')
// dir: string - parent directory
// returns: [file name strings]
function secureGetFiles(securityFcn,dir)
{
    try {
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( dir );
        if ( nsILocalFile.exists() == true )
        {
            var entries = nsILocalFile.directoryEntries;
            var returnArray = new Array();
            while ( entries.hasMoreElements() )
            {
                var entry = entries.getNext();
                entry.QueryInterface(Components.interfaces.nsIFile);
                if ( entry.isFile() )
                {
                    returnArray.push(entry.leafName);
                }
            }
            return returnArray;
        }
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

/*
function setBooleanPreference(s,v) {
  try {
    //netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    //var prefs = Components.classes["@mozilla.org/preferences-service;1"].createInstance(Components.interfaces.nsIPrefBranch);
    if (prefs.getBoolPref(s) != v) {
    prefs.setBoolPref(s,v);
    }
  } catch(e) { top.logException(e,arguments); }
  return top.UNDEFINED;
}
*/

// exit launchpad
// securityFcn: function = new Function('return window')
// returns: undefined
function secureExit(securityFcn)
{
    try {
        if ( top.isSecure(securityFcn) )
            window.close();
    } catch(e)
    {
        top.logException(e,arguments);
    }
}

top.OPENMODE = 0;
top.SAVEMODE = 1;
// private function for log.html
function chooseFileName(mode,defaultName)
{
    try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        if ( mode == top.SAVEMODE )
            filePicker.init(window, null, nsIFilePicker.modeSave);
        else
            filePicker.init(window, null, nsIFilePicker.modeOpen);
        filePicker.defaultExtension  = defaultName.substring(defaultName.indexOf('.')+1);
        filePicker.defaultString  = defaultName.substring(0,defaultName.indexOf('.'));
        filePicker.appendFilters(nsIFilePicker.filterText);
        if ( filePicker.show() != nsIFilePicker.returnCancel )
        {
            return filePicker.file;
        }
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return null;
}

// private function for log.html
// write an external file
// securityFcn: function = new Function('return window')
// fileName: string - full native file name
// lines: array of text lines
// returns: true of written, null if no file given, and UNDEFINED if exception
function secureWriteTextFile(securityFcn,nsILocalFile,lines)
{
    try {
        if ( nsILocalFile == null ) return null;
        if ( top.isSecure(securityFcn) )
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsIFileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance( Components.interfaces.nsIFileOutputStream);
        nsIFileOutputStream.init( nsILocalFile, 0x40|0x20|0x08|0x02, 00004, null);
        for ( var i=0; i < lines.length; i++ )
        {
            var len = lines[i].length;
            var outlen = 0;
            while ( outlen < len )
                outlen += nsIFileOutputStream.write(lines[i].substring(outlen,len), len-outlen);
            if ( top.OSTYPE == "windows" )
            {            
                nsIFileOutputStream.write("\r", 1);
            }
            nsIFileOutputStream.write("\n", 1);
        }
        nsIFileOutputStream.flush();
        nsIFileOutputStream.close();
        return true;
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

// write a text file
// fileName: string - full native file name
// textToWrite:  string - content of text file
// append: boolean - true = append text to end of file,  false = overwrite existing file
// returns: true if file was written successfully, false otherwise
function writeTextFile(fileName, textToWrite, append, encoding)
{
    try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsILocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        nsILocalFile.initWithPath( fileName );

		if (!encoding) encoding = UTF8;
		
		var nsIFileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance( Components.interfaces.nsIFileOutputStream);
        var rwtflags = append?0x40|0x10|0x08|0x02 : 0x40|0x20|0x08|0x02;  // 0x20 is the truncate option 0x10 is to append
		nsIFileOutputStream.init( nsILocalFile, rwtflags, 00604, null);
		
		/*var nsIConverterOutputStream = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
		nsIConverterOutputStream.init(nsIFileOutputStream, charset, 4096, 0x0000); // 4096 is the buffer size
		nsIConverterOutputStream.writeString(textToWrite, textToWrite.length);
		nsIConverterOutputStream.flush();
		nsIFileOutputStream.flush();
		nsIConverterOutputStream.close();
		nsIFileOutputStream.close();*/
		var nsIScriptableUnicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                          .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		nsIScriptableUnicodeConverter.charset =  encoding;
		
		var convertedtext = nsIScriptableUnicodeConverter.ConvertFromUnicode(textToWrite);
		nsIFileOutputStream.write(convertedtext, convertedtext.length);
		convertedtext = nsIScriptableUnicodeConverter.Finish();
		if (convertedtext.length > 0)
			nsIFileOutputStream.write(convertedtext, convertedtext.length);
		nsIFileOutputStream.close();

		return true;
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return false;
}

netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserWrite');

if ( secureGetEnv(new Function('return window'), "LaunchPadToolbarEnable" ) !='true' )
{
    window.locationbar.visible = false;
    window.menubar.visible = false;
    window.personalbar.visible = false;
    window.scrollbars.visible = false;
    window.statusbar.visible = false;
    window.toolbar.visible = false;
}

/*
    var query = top.document.location.search;
    if (query.length > 1) {
        query = query.substring(1);
        var tokens = query.split(",");
        for (var q=0; q < tokens.length; q++) {
            var keyvalue = tokens[q].split("=");
            if (keyvalue[0].length > 0) {
                if (keyvalue[1].length > 0) {
            var envVarOverride = unescape(keyvalue[0]).toUpperCase();
            if (envVarOverride == "LOCALE")
            top.LOCALE = unescape(keyvalue[1]);
            if (envVarOverride == "CONTENTDIR")
            top.CONTENTDIR = unescape(keyvalue[1]);
            if (envVarOverride == "OSTYPE")
            top.OSTYPE = unescape(keyvalue[1]);
            if (envVarOverride == "OS")
            top.OS = unescape(keyvalue[1]);
        }
            }
        }
    }
*/

// Init log filter now that we have access to env vars
logInitFilter();

//The reason for modifying the locale we're passed is that we haven't yet 
//been able to map it using the locale mapping mechanism.  So we might
//receive "en_us" but it will eventually be resolved to "en"  For now, we just 
//assume that we don't need a regional dialect and just use the base language.
//If this assumption is in correct, the proper locale/global properites will be loaded
//in Mozilla/IExplore.html
if (typeof top.LOCALE == "undefined" || top.LOCALE == null)
    {    
      top.LOCALE = top.trim(secureGetEnv(new Function('return window'), "LaunchPadLocale" ));
      if (top.LOCALE.length > 2 && top.LOCALE.toLowerCase() != "pt_br" && top.LOCALE.toLowerCase() != "zh_tw") 
      {          
          top.LOCALE = top.LOCALE.substring(0,2);
      }
      if (top.LOCALE == "pt_br") 
      {
          top.LOCALE = "pt_BR";
      }
      if (top.LOCALE == "zh_tw") 
      {
          top.LOCALE = "zh_TW";
      }
    }
if (top.LOCALE == null) top.LOCALE = "en";

if ( typeof top.OSTYPE == "undefined" || top.OSTYPE == null ) top.OSTYPE = secureGetEnv(new Function('return window'), "LaunchPadOSType" );

if ( typeof top.OS == "undefined" || top.OS == null ) top.OS = secureGetEnv(new Function('return window'), "LaunchPadOS" );

top.ARCHITECTURE = secureGetEnv(new Function('return window'), "LaunchPadArch");

//Set the target OS/Arch variables    
top.TARGETOS = secureGetEnv(new Function('return window'), "LaunchPadTargetOS");
if (top.TARGETOS == "")
{
top.TARGETOS = top.OS;
}
top.TARGETOSTYPE = secureGetEnv(new Function('return window'), "LaunchPadTargetOSType");
if (top.TARGETOSTYPE == "") 
{
  top.TARGETOSTYPE = top.OSTYPE;
}
top.TARGETARCHITECTURE = secureGetEnv(new Function('return window'), "LaunchPadTargetArch");
if (top.TARGETARCHITECTURE == "") 
{
  top.TARGETARCHITECTURE = top.ARCHITECTURE;
}

if (navigator.userAgent.indexOf('Firefox') != -1)
{
  top.BROWSER = "Firefox";
}
else if (navigator.userAgent.indexOf('SeaMonkey') != -1)
{
  top.BROWSER = "SeaMonkey";
}
else
{
  top.BROWSER = "Mozilla";
}

top.PATHSEPARATOR = top.getNativeFileSeparator();
top.STARTINGDIR = top.getStartingTopDir();
//    top.RELATIVEDIR = top.getStartingRelativeDir();

top.CONTENTDIR = secureGetEnv(new Function('return window'), "LaunchPadContentDirectory" );
top.SKINDIR = secureGetEnv(new Function('return window'), "LaunchPadSkinDirectory" );
top.STARTPAGE = secureGetEnv(new Function('return window'), "LaunchPadStartPage" );
top.COMPATIBILITYVERSION = secureGetEnv(new Function('return window'), "LaunchPadCompatibilityVersion" );
top.VIEWERPATH = secureGetEnv(new Function('return window'), "LaunchPadBrowser" );

top.commandBackgroundPrefix = [];
top.commandForegroundPrefix = []; 
// Wrappering is when the command needs to be sent as a single string instead of parsed arguments
// null means that it should be sent as parsed arguments
top.commandBackgroundWrapperPrefix = null;
top.commandForegroundWrapperPrefix = null;
if ( top.OSTYPE == "windows" )
{
    try {
        top.LaunchPadUSERPROFILE = secureGetEnv(new Function('return window'), "LaunchPadUSERPROFILE" );
        var profileOK;
        if ( typeof top.LaunchPadUSERPROFILE == "string" && top.LaunchPadUSERPROFILE != '' )
            profileOK = secureSetEnv(new Function('return window'), "USERPROFILE", top.LaunchPadUSERPROFILE);
        else
            profileOK = true;
        if ( !profileOK || !secureSetEnv(new Function('return window'), "MOZ_NO_REMOTE", '') )
        {
            top.COMSPEC = secureGetEnv(new Function('return window'), "ComSpec" );
            if ( typeof top.COMSPEC == "string" && top.COMSPEC != '' )
            {
                if ( !profileOK )
                    top.commandForegroundPrefix = [top.COMSPEC,"/c","set USERPROFILE="+top.LaunchPadUSERPROFILE,"&&","set MOZ_NO_REMOTE=&&"];
                else
                {
                    top.commandForegroundPrefix = [top.COMSPEC,"/c","set MOZ_NO_REMOTE=&&"];
                }
                top.commandBackgroundPrefix = top.commandForegroundPrefix;
            }
        }
    } 
    catch(e)
    {
    }    
    if ( typeof top.CURRENTPROFILE == "string" )
        secureRunProgram(new Function('return window'),top.STARTINGDIR,[top.RELATIVEDIR+'ScriptLauncher.exe',top.RELATIVEDIR+'MozillaPatch.bat',top.CURRENTPROFILE],false,true);
}
else if ( top.OSTYPE == "unix" )
{
    top.LaunchPadHOME = secureGetEnv(new Function('return window'), "LaunchPadHOME" );
    secureSetEnv(new Function('return window'), "LOGNAME", secureGetEnv(new Function('return window'), "LaunchPadLogName" ));

    if ( typeof top.LaunchPadHOME == "string" ) try
    {
        top.SHELL = secureGetEnv(new Function('return window'), "SHELL" );
        if ( typeof top.SHELL != "string" ) top.SHELL = "/bin/sh";
        top.commandForegroundPrefix = [top.SHELL,"-c"];
        top.commandBackgroundPrefix = top.commandForegroundPrefix;
        if ( secureSetEnv(new Function('return window'), "HOME", top.LaunchPadHOME) )
            top.commandForegroundWrapperPrefix = "";
        else
            top.commandForegroundWrapperPrefix = "HOME="+top.LaunchPadHOME;
        top.commandBackgroundWrapperPrefix = top.commandForegroundWrapperPrefix;
    }
    catch(e)
    {
    }
}

