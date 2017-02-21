// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2009
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


// create a directory on the file system
// directoryName: string - full native directory name
// returns: 0 = directory was not created.  1 = directory was created successfully
function createDirectory(directoryName) {
	
	try {
		return Launchpad.mkdirs(directoryName);
	}
	catch(e) {  
		top.logException(e,arguments); 
		return false;
	}
}

//Recursively makes all directories required for the given folder path.
//Returns true if successful, false if failed
function mkdirs(path) {
	
	try {
		return Launchpad.mkdirs(directoryName);
	}
	catch(e) {
		top.logException(e, arguments);
		return false;
	}
}

function getParentFolderName(path) {

	try {
		return Launchpad.getParentFolder(path);
	}
	catch(e) {
		top.logException(e, arguments);
		return false;
	}
}

// determine if the file or folder exists
// fileName: string - full native file name
// shouldIndicateType: boolean - specifies whether to return a simple boolean value, or a truthy value (1 file exists, -1 directory exists, 0 does not exist)
// returns:  false if the file does not exist, true otherwise (or if shouldIndicateType is true, 1 if file exists, -1 directory exists, 0 file does not exist)
function fileExists(fileName, shouldIndicateType) {

	var result = 0;
	try {
		result = Launchpad.fileExists(fileName);
	}
	catch(e) {  
		top.logException(e,arguments); 
	}

	if(shouldIndicateType)
	{
		return result;
	}
	else
	{
		return result != 0;
	}
}
// determine if the file exists
// securityFcn: function = new Function('return window')
// fileName: string - full native file name
// returns: boolean
function secureFileExists(securityFcn,fileName) {
    try {
      if (Launchpad.fileExists(fileName))
		return true;
    } catch(e) { top.logException(e,arguments); }
    return false;
}

// determine if the directory exists
// securityFcn: function = new Function('return window')
// directory: string - full native directory name
// returns: boolean
function secureDirectoryExists(securityFcn, directory)
{  
    var retVal = false;
    try {
		if (Launchpad.fileExists(directory) === -1)
		{
			retVal = true;
		}
    } catch(e) { top.logException(e,arguments); }
    
    return retVal;
}


// gets the value of an environment variable
// securityFcn: function = new Function('return window')
// anyvar: string - name of variable
// returns: string - value of variable
//          undefined - variable is not defined
function secureGetEnv(securityFcn,anyvar) {
  var v;
  try {
    v = Launchpad.getEnv( anyvar );
  } catch(e) { top.logException(e,arguments); }
  return v;
}

// sets the value of an environment variable
// securityFcn: function = new Function('return window')
// anyvar: string - name of variable
// value: string - new value of variable
// returns: boolean - success status
function secureSetEnv(securityFcn,anyvar,value) {
	try {
		Launchpad.setEnv( anyvar, value );
		return true;
	} catch(e) { top.logException(e,arguments); }
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

// executes an arbitrary command
// securityFcn: function = new Function('return window')
// topDir: string - CD mount point
// args: [strings] - command and parameters
// waitBoolean: boolean - foreground or background
// isHidden: boolean - visible window or silent
// element: document element - element to disable while running
// returns: int - return code
function secureRunProgram(securityFcn,topDir,argsIn,waitBoolean,isHidden,element,workingDirectory,callback,timeout, noQuotes)
{
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
				args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
			}
			if(workingDirectory) {
				args = [getEnv('LaunchPadTemp') + "/changeDirectory" + (top.isWindows() ? ".bat" : ".sh"), workingDirectory].concat(args);
				if(top.isWindows())  args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
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
				if(top.isWindows()) args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
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
        if ( commandStr == null ) commandStr = "";
        {
            for ( var i=0; i < args.length; i++ )
            {
                var arg = args[i];
                var re = new RegExp(/^[!@+=%:\\\/\-a-zA-Z0-9_]+$/);
                if ( !re.test(arg) && !noQuotes)
                {
                    if ( arg.indexOf('"') >= 0 )
                        arg = "'" + arg + "'";
                    else
                        arg = '"' + arg + '"';
                }
                commandStr += ' ' + arg;
            }
            processArgs.push(commandStr);
        }

		var rc = top.Launchpad.runProgram(commandStr, waitBoolean, workingDirectory ? workingDirectory : "./");
        if (element && !callback)
        {

            if ( waitBoolean )
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
  var path = Launchpad.getEnv("PATH");
    
  var foundOnPath = false;
  var paths = path.split(":");
    
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
	var returnCodeFilePath = top.createTempFile('launchpadExecReturnCode');	

	// Setup and start timeout for callback function
	var originalCallback = callback;
	callback = function()
	{
		try
		{
			if(Launchpad.fileSize(returnCodeFilePath) > 0)
			{
				var returnCode = top.trim(readTextFile(returnCodeFilePath));
				Launchpad.deleteFile(returnCodeFilePath)
				if(element) top.enableElement(element,true);
				originalCallback(returnCode);
			}
			else
			{
				window.setTimeout(callback,timeout);
			}
		}
		catch(e)
		{
			top.logException(e, arguments);
		}
	};
	window.setTimeout(callback,timeout);

	return returnCodeFilePath;
}

// get a list of child directories
// securityFcn: function = new Function('return window')
// dir: string - parent directory
// returns: [directory name strings]
function secureGetDirectories(securityFcn,dir) {
	try {
		var dirs = Launchpad.getFiles(dir);
		var returnArray = new Array();
		if(dirs) {
			for(var i = 0; i < dirs.length; i++) {
				if (Launchpad.fileExists(  dir + '/' + dirs[i], true) === -1)
					returnArray.push(dirs[i]);
			}
		}
		return returnArray;
	} catch(e) { top.logException(e,arguments); }
}

// read an external file
// fileName: string - full native file name or URL
// returns: string - contents of file if readable, null otherwise
function readTextFile(fileName) {
  
    if (fileName == null)
		return null;
  
	try{
		var fileContents = Launchpad.readTextFile(fileName);

	    //Removes BOM characters from the beginning of the file
	    if (fileContents.charCodeAt(0) == '65279' || fileContents.charCodeAt(0) == '65534')
	    {     
		    fileContents = fileContents.substring(1,fileContents.length);   
	    }
	    return fileContents;

	} catch(e) {
		//FSO failed, there's nothing we can do to read this files    
		top.logException(e,arguments); 
		return null;
	}
 
}



// read an external file
// securityFcn: function = new Function('return window')
// fileName: string - full native file name
// returns: [line strings]
function secureReadTextFile(securityFcn,fileName) {
  try {

    if (!top.isSecure(securityFcn)) {
        return null;
    }
	if ( Launchpad.fileExists(fileName) == false )
	{
		top.logMessage("LPV20022S", fileName);
	}
	
    var fileContents = Launchpad.readTextFile(fileName);
	//fileContents = top.UTF8toString(fileContents);

    //Removes BOM characters from the beginning of the file
    if (fileContents.charCodeAt(0) == '65279' || fileContents.charCodeAt(0) == '65534')
    {
      fileContents = fileContents.substring(1,fileContents.length);   
    }
    var fileLines = fileContents.split(/\r*\n/);
    if (fileLines.length > 0)
        if (fileLines[fileLines.length-1].length == 0)
            fileLines.pop();

    return fileLines;

  } catch(e) {
    top.logException(e,arguments); 
  }
}

// write a text file
// fileName: string - full native file name
// text:  string - content of text file
// append: boolean - true = append text to end of file,  false = overwrite existing file
// returns: true if file was written successfully, false otherwise
function writeTextFile(fileName, fileContent, append)
{
	try
	{
		return Launchpad.writeTextFile(fileContent, fileName, append) == 1;
	}  
	catch(e) {
		// write failed
		top.logException(e,arguments); 
		return false;
	}
}

// exit launchpad
// securityFcn: function = new Function('return window')
// returns: void
function secureExit(securityFcn) {
  try {
	Launchpad.close();
  } catch(e) { top.logException(e,arguments); }
}
   
top.OPENMODE = 0;
top.SAVEMODE = 1;
// private function for log.html
function chooseFileName(mode,defaultName)
{
    try {
        var file = Launchpad.browse(defaultName, '', mode);
		if(file)
			return file[0];
    } catch(e) {
        top.logException(e,arguments);
    }
    return null;
}

// private function for log.html
// write an external file
// securityFcn: function = new Function('return window')
// fileName: string - full native file name
// lines: array of text lines
// returns: true if written, null if no file given, and UNDEFINED if exception
function secureWriteTextFile(securityFcn,fileName,lines)
{
    try {
        if ( !fileName ) return null;
		var content = lines.join("\n");
        return Launchpad.writeTextFile(content, fileName, false) == 1;
    } catch(e)
    {
        top.logException(e,arguments);
    }
    return top.UNDEFINED;
}

// Initializes the names of the application menu items in the OS X menu bar
function initializeMenu()
{
	try {
	
		var menuBarTitle = evalJSCP(property('menuName'));
		
		Launchpad.setMenuTitle(menuBarTitle, 0);
			
			Launchpad.setMenuItemTitle(top.formatmsg(property('menuApplicationHide'), menuBarTitle), 0, 0);
			Launchpad.setMenuItemTitle(top.formatmsg(property('menuApplicationHide'), property('menuApplicationOthers')), 0, 1);
			Launchpad.setMenuItemTitle(property('menuApplicationShowAll'), 0, 2);
			Launchpad.setMenuItemTitle(top.formatmsg(property('menuApplicationQuit'), menuBarTitle), 0, 4);
			
		Launchpad.setMenuTitle(property('menuEdit'), 1);
			Launchpad.setMenuItemTitle(property('menuEditCut'), 1, 0);
			Launchpad.setMenuItemTitle(property('menuEditCopy'), 1, 1);
			Launchpad.setMenuItemTitle(property('menuEditPaste'), 1, 2);
			Launchpad.setMenuItemTitle(property('menuEditDelete'), 1, 3);
			Launchpad.setMenuItemTitle(property('menuEditSelectAll'), 1, 4);

		Launchpad.setMenuTitle(property('menuWindow'), 2);
			Launchpad.setMenuItemTitle(property('menuWindowMinimize'), 2, 0);
			
		Launchpad.setMenuTitle(property('menuHelp'), 3);
		
		Launchpad.showDockIconAndMenu();
		
	} catch(e) { top.logException(e, arguments); }
}

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

top.BROWSER = "WebKit";

top.PATHSEPARATOR = top.getNativeFileSeparator();
top.STARTINGDIR = top.getStartingTopDir();

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

top.LaunchPadHOME = secureGetEnv(new Function('return window'), "LaunchPadHOME" );
secureSetEnv(new Function('return window'), "LOGNAME", secureGetEnv(new Function('return window'), "LaunchPadLogName" ));

if ( typeof top.LaunchPadHOME == "string" ) {
	try
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
  
    