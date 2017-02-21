// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005
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
	if (isBusy)
            doc.body.style.cursor='wait';
	else
            doc.body.style.cursor='default';
    } catch(e) {}
  } catch(e) { top.logException(e,arguments); }
}
*/

// create a directory on the file system
// directoryName: string - full native directory name
// returns: 0 = directory was not created.  1 = directory was created successfully
function createDirectory(directoryName) {
     
	try {
		fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
		if (!fileSystemObject.FileExists(directoryName)) {	  
			fileSystemObject.CreateFolder(directoryName);
			return true;
		}       
		return false;   
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
		fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
		var parent = fileSystemObject.GetParentFolderName(path);
		if(!fileSystemObject.FolderExists(parent))
		{
			mkdirs(parent);
		}
		if(!fileSystemObject.FolderExists(path))
			fileSystemObject.CreateFolder(path);
		return true;
	}
	catch(e) {
		top.logException(e, arguments);
		return false;
	}
}

function getParentFolderName(path) {
	try {
		fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
		return fileSystemObject.GetParentFolderName(path);
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
	// the code commented out below was created to handle a future requirement for a url being passed
	// var end = fileName.length - 1;
	// var beginning = (fileName.substr(0,4)).toLowerCase(); 
	// if (beginning == "file")
	//     fileName = "file" + fileName.substr(4, end);
	// fileName = fileName.replace("file:///", "");
	// fileName = fileName.replace("file://", "");
	var result = 0;
	try {
		fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
		if (fileSystemObject.FileExists(fileName)) {	        
			result = 1;
		}       
		else if (fileSystemObject.FolderExists(fileName)) {
			result = -1;   
		}       
		else {
			result = 0;
		}
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
    var fileSystemObject;
    try {
      if (top.isSecure(securityFcn))
          fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
      if (fileSystemObject.FileExists(fileName))
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
      if (top.isSecure(securityFcn))
      {      
          var fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
          if (fileSystemObject.FolderExists(directory))
          {
              retVal = true;
          }
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
  try {
    var v;
    try {
	if (top.isSecure(securityFcn))
            var wshell = new ActiveXObject( "WScript.Shell" );
        var getEnvVar = wshell.Environment("Process");
        v = getEnvVar( anyvar );
    } catch(e) {}
    return v;
  } catch(e) { top.logException(e,arguments); }
}

// sets the value of an environment variable
// securityFcn: function = new Function('return window')
// anyvar: string - name of variable
// value: string - new value of variable
// returns: boolean - success status
function secureSetEnv(securityFcn,anyvar,value) {
  try {
    try {
	if (top.isSecure(securityFcn))
            var wshell = new ActiveXObject( "WScript.Shell" );
        var setEnvVar = wshell.Environment("Process");
        setEnvVar( anyvar ) = value;
	return true;
    } catch(e) {}
    return false;
  } catch(e) { top.logException(e,arguments); }
}

// this works well but blocks the UI thread
//function pause(numberMillis) {
//    window.showModalDialog('javascript:document.writeln("<script>window.setTimeout(\'window.close()\',' + numberMillis + ');<\/script>")');
//}

var elementArray = new Array();

// reenables a document element if the associated process has completed
// element: document element
// returns: undefined
function _enableElement(element) {
  try {
    if (typeof element == "undefined")
        element = elementArray.shift(); // pop next element being monitored
    if (typeof element == "undefined" || element == null) return;
    if (element.process.status == 0) { // process not finished
	elementArray.push(element);
	setTimeout('_enableElement()',1000); // sleep 1 second and retry
    }
    else if (element != null)
	top.enableElement(element,true);
  } catch(e) { top.logException(e,arguments); }
}

// executes an arbitrary command
// securityFcn: function = new Function('return window')
// topDir: string - CD mount point
// args: [strings] - command and parameters
// waitBoolean: boolean - foreground or background
// isHidden: boolean - visible window or silent
// element: document element - element to disable while running
// returns integer - exit code if foreground or process status if background
function secureRunProgram(securityFcn,topDir,argsIn,waitBoolean,isHidden,element,workingDirectory,callback,timeout, noQuotes) 
{
    try {
        var args = new Array();
        for(var i = 0; i < argsIn.length; i++)
        {
          args[i] = argsIn[i]; //copy the args array
        }
        
		if (typeof waitBoolean == "undefined" || waitBoolean == null) waitBoolean = false; // long running = background
		if (typeof isHidden == "undefined" || isHidden == null) isHidden = false; // since some things like notepad have to run in visible mode
		if (!timeout) timeout = 5000;
	    
		if (element) top.enableElement(element,false);
	    
		var activexShell = null;
		if (top.isSecure(securityFcn))
		{
			activexShell = new ActiveXObject("WScript.Shell");
		}

		args[0] = top.getFullFileName(topDir,args[0]);
		if(!secureFileExists(new Function('return window'), args[0]) && !programOnPath(securityFcn, args[0]))
		{
			top.logMessage("LPV22041W", args[0]);
		}	
		//args[0] = '"' + args[0] + '"';
		
		for (var i=0; i < args.length; i++)
		{
			var containsSpecialChar = new RegExp(/[=,\s;]/).test(args[i]);
			var containsQuote = new RegExp(/"/).test(args[i]);
			if(containsSpecialChar  && !noQuotes)
			{
           args[i] = addQuotes(args[i]);

			}	
		}
		
		if(workingDirectory)
		{
			if(!isHidden) args = ["-v"].concat(args);
			args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
			args = [getEnv('LaunchPadTemp') + "/changeDirectory" + (top.isWindows() ? ".bat" : ".sh"), workingDirectory].concat(args);
			args = [top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName())].concat(args);
		}
		
		var commandstr = "";
		for (var i=0; i < args.length; i++)
			commandstr += args[i] + " ";

		var rc;
		// background with an element get special treatment to keep mshta from hanging waiting for the process to exit
		// in the case that launchpad is exited before the spawned process dies
		if (waitBoolean == false && element != null) {
	        var dosinatorOptions = isHidden ? " " : " -v ";
	        commandstr = top.getNativeFileName(getEnv('LaunchPadTemp') + "/" + top.getScriptLauncherExeName()) + dosinatorOptions + commandstr;
		    rc = activexShell.Exec(commandstr);
		    if (rc != null) {
				if (rc.status == 0) {
				    element.process = rc;
					if (element && !callback) _enableElement(element);
				    rc = 0;
				}
				else {
				    rc = rc.ExitCode;
				    if (element && !callback) top.enableElement(element,true);
				}
				function _monitorProcess(process, callback) {
					try {
						if (process.status == 0) { // process not finished
							setTimeout(function(){ _monitorProcess(process, callback); },timeout);
						}
						else {
							callback(process.ExitCode);
						}
					} catch(e) { top.logException(e,arguments); }
				}
				if(callback) _monitorProcess(process, callback);
		    }
		}
		else {
			rc = activexShell.Run(commandstr, (isHidden ? 0 : 1), (waitBoolean == null ? true : waitBoolean));
			if(callback) callback(rc);
			if(element) top.enableElement(element,true);
		}
		return rc;
    } catch(e) {
        try { if (element) top.enableElement(element,true); } catch(e2) {};
        top.logException(e,arguments);
    }
}

//Determines whether the given file can be found using the path, in case
//the full file name is not used to call runProgram.
//Returns true if the program is found on the path, false otherwise
function programOnPath(securityFcn, name)
{
  var activexShell = null;
  if (top.isSecure(securityFcn))
	activexShell = new ActiveXObject("WScript.Shell");

  var path = activexShell.Environment.item("PATH");
  
  var foundOnPath = false;
  var paths = path.split(";");
    
  for(var i in paths)
  {
    if(secureFileExists(securityFcn, top.expandEnv(paths[i] + "/" + name), false))
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
	var fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
	var returnCodeFile = fileSystemObject.GetFile(returnCodeFilePath);

	// Setup and start timeout for callback function
	var originalCallback = callback;
	callback = function()
	{
		try
		{
			if(returnCodeFile.size > 0)
			{
				var returnCode = top.trim(readTextFile(returnCodeFile.Path));
				returnCodeFile.Delete(true);
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
        if (top.isSecure(securityFcn))
            var fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
        var srcFolder = fileSystemObject.GetFolder( top.getNativeFileName(dir) );
        var dirs = new Enumerator( srcFolder.SubFolders );
	var returnArray = new Array();
        while (!dirs.atEnd()) {
	    if (dirs.item().Name != "." && dirs.item().Name != "..")
	        returnArray.push(dirs.item().Name);
            dirs.moveNext();
	}
	return returnArray;
  } catch(e) { top.logException(e,arguments); }
}

// get a list of child files
// securityFcn: function = new Function('return window')
// dir: string - parent directory
// returns: [file name strings]
function secureGetFiles(securityFcn,dir) {
  try {
        if (top.isSecure(securityFcn))
            var fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
        var srcFolder = fileSystemObject.GetFolder( dir );
        var files = new Enumerator( srcFolder.files );
	var returnArray = new Array();
        while (!files.atEnd()) {
	    returnArray.push(files.item().Name);
            files.moveNext();
	}
	return returnArray;
  } catch(e) { top.logException(e,arguments); }
}

// read an external file
// fileName: string - full native file name or URL
// returns: string - contents of file if readable, null otherwise
function readTextFile(fileName, encoding) {
  
    if (fileName == null)
		return null;
  
  if (!encoding) encoding = UTF8;
  var isUTF8 = (encoding.toLowerCase() == UTF8.toLowerCase());
  
    var fileContents = null;
    
	try {
	    // Try to read file using XMLHttpRequest 
	    try {
	        var xmlReq = new ActiveXObject("Microsoft.XMLHTTP");

	        // Do a synchronous read on the file       
	        xmlReq.open("GET", fileName, false);
	        xmlReq.send(null);
	        fileContents = xmlReq.responseText;
	    }
	    catch(e) {
	        //Log this exception, then try to fallback to ADODB.stream
	        top.logException(e,arguments);
	        try
	        {
	            var objectStream = new ActiveXObject("ADODB.Stream");
	             
	            objectStream.Type=2;
	            objectStream.Charset=encoding;
	            objectStream.open();
	            objectStream.LoadFromFile(fileName);              
	            fileContents = objectStream.ReadText();
	            objectStream.close();
	        }
	        //If an exception is caught, this means we can't use ADODB.stream, so we have use FSO to do
	        //the file read.
	        catch(e)
	        {
				//If ADODB.stream fails, log it and try FSO
				top.logException(e,arguments);
				fileContents = null;
				var fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");

				var handle = fileSystemObject.GetFile(fileName);
				var O_READONLY = 1;
				var asUnicode = isUTF8?-1:0;
				var stream = handle.OpenAsTextStream(O_READONLY, asUnicode);

				var uniContents = stream.ReadAll();
				stream.close();

       			// No need to process unicode chars
        		if (!isUTF8) return uniContents;
        
				var rawContents = [];
				for (var i=0; i < uniContents.length; i++) {
					var charCode = uniContents.charCodeAt(i);
					rawContents.push(String.fromCharCode(charCode & 255, charCode >> 8));
				}
				rawContents = rawContents.join("")

				if (handle.size > rawContents.length) {        
					if (typeof top.fileReadErrorList == "undefined") {
						top.fileReadErrorList = new Array();
					}
					//This is just here so we don't log a message for the same file over and over again.
					if (typeof top.fileReadErrorList[fileName] == "undefined") {
						top.fileReadErrorList[fileName]=true;
						top.logMessage('LPV20033W', fileName);
					}                 
				}
				fileContents = top.UTF8toString(rawContents);      
	        } // End of ADODB catch
	    } // End of XMLHttpRequest catch

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

    var fileContents = null;

    // Try to read file using XMLHttpRequest 
    try {
        var xmlReq = new ActiveXObject("Microsoft.XMLHTTP");

        // Do a synchronous read on the file       
        xmlReq.open("GET", fileName, false);
        xmlReq.send(null);
        fileContents = xmlReq.responseText;
    }
    catch(e) {
        //Log this exception, then try to fallback to ADODB.stream        
        top.logException(e,arguments);
        try
        {
            var objectStream = new ActiveXObject("ADODB.Stream");
             
            objectStream.Type=2;
            objectStream.Charset="UTF-8";
            objectStream.open();
            objectStream.LoadFromFile(fileName);              
            fileContents = objectStream.ReadText();
            objectStream.close();
        }
        //If an exception is caught, this means we can't use ADODB.stream, so we have use FSO to do
        //the file read.
        catch(e)
        {
          //If ADODB.stream fails, log it and try FSO
          top.logException(e,arguments);
          fileContents = null;
          var fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");

          var handle = fileSystemObject.GetFile(fileName);
          var O_READONLY = 1;
          var asUnicode = -1;
	      var stream = handle.OpenAsTextStream(O_READONLY, asUnicode);

          var uniContents = stream.ReadAll();
	      stream.close();

          var rawContents = '';
	      for (var i=0; i < uniContents.length; i++) {
	          var charCode = uniContents.charCodeAt(i);
	          rawContents += String.fromCharCode(charCode & 255, charCode >> 8);
	      }
	      if (handle.size > rawContents.length) {        
              if (typeof top.fileReadErrorList == "undefined") {
                  top.fileReadErrorList = new Array();
              }
              //This is just here so we don't log a message for the same file over and over again.
              if (typeof top.fileReadErrorList[fileName] == "undefined") {
                  top.fileReadErrorList[fileName]=true;
                  top.logMessage('LPV20033W', fileName);
              }                 
	      }
          fileContents = top.UTF8toString(rawContents);      
        } // End of ADODB catch
    } // End of XMLHttpRequest catch

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
    //FSO failed, there's nothing we can do to read this files    
    top.logException(e,arguments); 
  }
}

// write a text file
// fileName: string - full native file name
// text:  string - content of text file
// append: boolean - true = append text to end of file,  false = overwrite existing file
// returns: true if file was written successfully, false otherwise
function writeTextFile(fileName, fileContent, append, encoding)
{
	if (!encoding) encoding = UTF8;

  try
	{
		var objectStream = new ActiveXObject("ADODB.Stream");
		objectStream.Type=2;
		objectStream.Charset=encoding;
		objectStream.Open();
			   
		if (append && fileExists(fileName)) {    
			objectStream.LoadFromFile(fileName);        // load the pre-existing file into the stream
			objectStream.Position = objectStream.size;  // set position at end of stream
		}                           
		if(fileContent) objectStream.WriteText(fileContent); 
		objectStream.SaveToFile(fileName, 2);          // 2 = overwrite file contents
		objectStream.close();
		objectStream = null;
		return true;
	}  
	catch(e) {
		// write failed
		try{
			if(append != true){
   				var fileSystemObject = new ActiveXObject("Scripting.FileSystemObject");
				var objectStream = fileSystemObject.CreateTextFile(fileName, true);
				objectStream.Write (fileContent);
				objectStream.Close();
			}else{
				//Can't use this route is we plan on appending to file
				top.logException(e,arguments); 
				return false;
			}


		}catch(e) {		
			top.logException(e,arguments); 
			return false;
		}
	}
}


// exit launchpad
// securityFcn: function = new Function('return window')
// returns: void
function secureExit(securityFcn) {
  try {
	if (top.isSecure(securityFcn)) {
	    try { if (window.opener == null) window.opener=self; } catch(e) {}
	    try { window.close(); } catch(e) { alert("ERROR: Exit failed"); }
	}
  } catch(e) { top.logException(e,arguments); }
}
   
// Init log filter now that we have access to env vars
logInitFilter();

if (typeof top.LOCALE == "undefined" || top.LOCALE == null)
{    
  //The reason for modifying the locale we're passed is that we haven't yet 
  //been able to map it using the locale mapping mechanism.  So we might
  //receive "en_us" but it will eventually be resolved to "en"  For now, we just 
  //assume that we don't need a regional dialect and just use the base language.
  //If this assumption is incorrect, the proper locale/global properites will be loaded
  //in Mozilla/IExplore.html
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


top.OSTYPE = "windows";

if (typeof top.OS == "undefined") top.OS = secureGetEnv(new Function('return window'), "LaunchPadOS" );

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

top.BROWSER = "IExplore";

top.PATHSEPARATOR = top.getNativeFileSeparator();
top.STARTINGDIR = top.getStartingTopDir();

top.CONTENTDIR = secureGetEnv(new Function('return window'), "LaunchPadContentDirectory" );
top.SKINDIR = secureGetEnv(new Function('return window'), "LaunchPadSkinDirectory" );
top.STARTPAGE = secureGetEnv(new Function('return window'), "LaunchPadStartPage" );

top.COMPATIBILITYVERSION = secureGetEnv(new Function('return window'), "LaunchPadCompatibilityVersion" );
top.VIEWERPATH = secureGetEnv(new Function('return window'), "LaunchPadBrowser" );
top.VIEWERARGS = secureGetEnv(new Function('return window'), "LaunchPadBrowserArgs" );

  
    