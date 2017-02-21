// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2006, 2009
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.


function pollLaunchpadStartedFile(file)
{
		if (file)
			top.launchpadStartedFile = file;
		if (top.fileExists(top.launchpadStartedFile))
			window.setTimeout("pollLaunchpadStartedFile()", 50);
		else
			top.Exit(false);
}

function restartLaunchpad(location)
{
	top.setEnv("LaunchPadVersion", top.getLaunchpadUpdateVersion());
	if ((location = location || getUpdateLocation()) && location != "")
	{
		var lpCommand = top.isUnix()?"launchpad.sh":"launchpad.exe";
		var args = new Array(); 
		args[0] = top.getNativeFileName(location + "../" + lpCommand);
		args[1] = "LaunchPadStartedFile";
		args[2] = top.createTempFile("launchpadStartedFile", ".txt");
		args[3] = "LaunchPadRestart";
		args[4] = "TRUE";
		args[5] = "LaunchPadVersion";
		args[6] = top.getLaunchpadUpdateVersion();
    	if (top.getEnv("LaunchPadLoadedFromCache"=="TRUE"))
    	{
      		args[7] = "LaunchPadLoadedFromCache";
      		args[8] = "TRUE";
    	}
		if (top.fileExists(args[0]))
		{
			top.runProgram(NO_DISKID,args,BACKGROUND,HIDDEN,null,location + "../");
			top.createTempFile("LaunchPadKeepTemp", ".txt");
			top.pollLaunchpadStartedFile(args[2]);
		}
		else
		{
      //top.setLaunchpadUpdateSite("");  //With caching we can't blank this out here.
			top.setEnv("LaunchPadRestart", "TRUE");
			window.location.reload();
		}
	}
	else
	{
		top.setLaunchpadUpdateSite("");
		top.setEnv("LaunchPadRestart", "TRUE");
		window.location.reload();
	}
}

function readJSONScript(scriptLocation)
{
	top.include(document, scriptLocation, false);
}

function loadFromCacheCallback(jsonObject)
{
  top.hybrid = jsonObject.hybrid;
  top.launchpadUpdateVersion = jsonObject.version + '';
  getLaunchpadUpdateVersion();
}

function getLaunchpadUpdateVersion()
{
  if (!top.launchpadUpdateVersion)
  {
    var cachedir = top.getCacheLocation();
    if (cachedir)
    {
      if (top.fileExists(top.getNativeFileName(cachedir + "/lpversion.json")))
      {
        readJSONScript(top.nativeFileToURL(top.getNativeFileName(cachedir + "/lpversion.json")));
        return top.launchpadUpdateVersion;
      }
    }
    top.launchpadUpdateVersion = "1.0";
  }
  return top.launchpadUpdateVersion;
}

function getLaunchpadCurrentVersion()
{
  if (!top.launchpadCurrentVersion)
  {
    //alert("LPVER: " + top.getEnv('LaunchPadVersion'));
    var version = top.secureGetEnv(new Function('return window'), 'LaunchPadVersion') + '';
    if (version != '')
      top.launchpadCurrentVersion = version;
    else
      top.launchpadCurrentVersion = "1.0";
  }
  return top.launchpadCurrentVersion;
}

function loadFilesFromCache()
{
  
  if ((top.getEnv("LaunchPadLoadedFromCache") == "TRUE") ||(top.getEnv("LaunchPadUpdated") == "TRUE"))
	{
      if ( top.launchpadUpdateVersion <= top.launchpadCurrentVersion )
      return;
	}
  var cachedir = top.getCacheLocation();
  if (cachedir)
  {
    if (!top.fileExists(top.getNativeFileName(cachedir)))
      return;
    top.PROCESSINGCACHE = true;
    top.showOverlay(true);
    readJSONScript(top.getNativeFileName(cachedir + "/lpversion.json"));
    if (top.hybrid)
    {
      top.copyLaunchpadToTemp();
    } 
    copyCacheToTemp(cachedir);
    top.updatesProcessed = true;
    top.setUpdateLocation(top.secureGetEnv(new Function('return window'), "LaunchPadTemp") + "/launchpad/");
    top.setEnv("LaunchPadLoadedFromCache", "TRUE");
    window.setTimeout("waitForUpdateProcessing()", 50);	
  }
}

function launchpadUpdateVersionCallback(jsonObject)
{
  var version = jsonObject.version + '';
  var fullurl = top.getLaunchpadUpdateSite();
  fullurl = fullurl.substring(0, fullurl.lastIndexOf("/")+1) + jsonObject.url;
  if (version > top.launchpadCurrentVersion)
  {
    
    var size = hasInternetAccess(fullurl, true, true);
    if (size != 0)
    {
      showUpdatePrompt(size, fullurl);
    }
  }
}

function showUpdatePrompt(size, fullurl)
{
     
      top.launchpadUpdateSite = fullurl;
      var content = '<div><p>'+ property('updatePrompt');
      if (size > 0)
      {
        content += '<br>' + top.formatmsg(property('updateDownloadSize'), (Math.round(size/1024)) + '');
      }
      content +=  '</p></div>';
      top.updateDialogId = showDialog(content, {
        title: property('updatePromptTitle', property('title')),
        buttons: [
          {
            id: "updatePromptConfirmationButton",
            name: "updatePromptConfirmationButton",
            value: property('updatePromptYes'),
            onclick: function(){  top.closeDialog(top.updateDialogId);
                                  top.showOverlay(true);
                                  top.versionsProcessed = true;  
                                  checkUpdates(); }
          },
          {
            id: "updatePromptCancelButton",
            name: "updatePromptCancelButton",
            value: property('updatePromptNo'),
            onclick: function(){ top.closeDialog(top.updateDialogId);top.launchpadUpdateSite=null; }
          }
        ],
        width: "300px"
      });
}

function launchpadUpdateHandlerCallback(jsonObject)
{	
	var hybrid = jsonObject.hybrid;
  var version = jsonObject.version;
  if (hybrid)
  {
    top.copyLaunchpadToTemp();
  }
  var data = jsonObject.data;
	var lpTemp = top.getEnv('LaunchPadTemp') + top.getNativeFileSeparator();
  var cachedir = top.getCacheLocation();
  if (!cachedir) cachedir = lpTemp;
	for(var i = 0; i < data.length; i++)
	{
		var fileName = data[i][0];
		for(var c = 1; c < data[i].length; c++)
		{
			top.writeBinaryFile(cachedir + fileName, data[i][c]);
		}
	}
  top.writeTextFile(top.getNativeFileName(cachedir + "/lpversion.json"), 'loadFromCacheCallback({version: "'+version+'",hybrid: '+hybrid+'});');
	if ( top.OSTYPE == "unix" )
	{
		var args = new Array(); 
		args[0] = "chmod -R +x";
		args[1] = top.getNativeFileName(cachedir) + "*";
		top.runProgram(NO_DISKID,args,FOREGROUND,HIDDEN,null,top.getNativeFileName(cachedir));
	}
  copyCacheToTemp(cachedir);
	top.updatesProcessed = true;
  top.setEnv("LaunchPadUpdated", "TRUE");
  top.setUpdateLocation(top.secureGetEnv(new Function('return window'), "LaunchPadTemp") + "/launchpad/");
  window.setTimeout("waitForUpdateProcessing()", 50);	
}

function checkUpdates()
{
  if(top.navigationLoaded && top.versionsInitialized && ((property('languageSelectionType','embedded') != 'dialog') || (property('languageSelectionType','embedded') == 'dialog' && top.getEnv("LaunchPadDialogLocaleSelected") == 'true')))
	{
    loadFilesFromCache();
		var updateSite = top.getLaunchpadUpdateSite();
		if (updateSite && updateSite != "" && (!top.PROCESSINGCACHE))
		{
      if (top.getEnv("LaunchPadUpdated") != "TRUE")
      {
        readJSONScript(updateSite);
      }
		}
	}
	else
	{
		window.setTimeout("checkUpdates()", 50);
	}
}

function initVersions(initializing)
{
  if (initializing)
  {
    if (top.launchpadCurrentVersion && top.launchpadUpdateVersion)
    {
      top.versionsInitialized = true;
    }
    else
      window.setTimeout("initVersions(true)", 50);
  }
  else
  {
    if(top.navigationLoaded)
    {
      top.getLaunchpadCurrentVersion();
      top.getLaunchpadUpdateVersion();
      initVersions(true);
    }
    else
    {
      window.setTimeout("initVersions()", 50);
    }
  }
}

function waitForUpdateProcessing()
{
	if (top.abortUpdate)
	{
		return;
	}
	if (top.updatesProcessed)
	{
      //top.setLaunchpadUpdateSite(""); //With caching we can't blank this out here.
			top.restartLaunchpad();
	}
	else
		window.setTimeout("waitForUpdateProcessing()", 200);
}

function showFixpackNotification(fixpackBinaryUrl, fixpackDownloadPageUrl, productName)
{
	if (!productName)
		productName = property('title');
	if (fixpackBinaryUrl && fixpackDownloadPageUrl)
	{	
		top.showNotification(top.formatmsg(document.properties['fixpackAvailable'], productName) + " " + top.formatmsg(document.properties['fixpackInstallAndDownload'], fixpackBinaryUrl, fixpackDownloadPageUrl), { type: 'notice', id: 'myFixpackMessage' });
	}
	else if (fixpackBinaryUrl)
	{
		top.showNotification(top.formatmsg(document.properties['fixpackAvailable'], productName) + " " + top.formatmsg(document.properties['fixpackInstall'], fixpackBinaryUrl), { type: 'notice', id: 'myFixpackMessage' });
	}
	else if (fixpackDownloadPageUrl)
	{
		top.showNotification(top.formatmsg(document.properties['fixpackAvailable'], productName) + " " + top.formatmsg(document.properties['fixpackDownload'], fixpackDownloadPageUrl), { type: 'notice', id: 'myFixpackMessage' });	}
	else
	{
		top.logError(document.properties['fixpackError']);
	}
}

function copyCacheToTemp(cachedir)
{
  copyLaunchpadToTemp(null, cachedir);
}

function copyLaunchpadToTemp(filenames, sourcedir)
{
  if (!sourcedir) sourcedir = top.getNativeFileName(top.STARTINGDIR);
  if (filenames && !(filenames instanceof Array))
  {
    var temp = filenames;
    filenames=new Array();
    filenames[0] = temp;
  }
  if (top.OSTYPE == "windows")
	{
    if (filenames)
    {
      var args = new Array(); 
      args[0] = top.getEnv("WINDIR") + "/system32/cmd.exe";
      args[1] = "/c";
      args[2] = "copy";
      args[3] = "/y";
      for (var i in filenames)
      {
        top.mkdirs(top.getParentFolderName(top.getNativeFileName(top.getEnv('LaunchPadTemp') + "/" + filenames[i])));
        args[4] = top.getNativeFileName(top.STARTINGDIR+filenames[i]);
        args[5] = top.getNativeFileName(top.getEnv('LaunchPadTemp') + "/" + filenames[i]);
        top.runProgram(NO_DISKID, args, FOREGROUND, HIDDEN);
      }
    }
    else
    {
      var args = new Array(); 
      args[0] = top.getEnv("WINDIR") + "/system32/xcopy.exe";
      args[1] = "/q/y/i/e";
      args[2] = top.getNativeFileName(sourcedir) + "*.*";
      args[3] = top.getNativeFileName(top.getEnv('LaunchPadTemp'));
      top.runProgram(NO_DISKID, args, FOREGROUND, HIDDEN);
    }
  }
  if (top.OSTYPE == "unix")
	{
		var args = new Array(); 
    args[0] = "/bin/cp";
    args[1] = "-R";
    if (filenames)
    {
      for (var i in filenames)
      {
        args[2] = top.getNativeFileName(top.STARTINGDIR) + filenames[i];
        args[3] = top.getNativeFileName(top.getEnv('LaunchPadTemp') + "/" + filenames[i]);
        top.createDirectory(top.getNativeFileName(top.getEnv('LaunchPadTemp') + "/" + filenames[i].substring(0, filenames[i].lastIndexOf("/"))));
        top.runProgram(NO_DISKID,args,FOREGROUND,HIDDEN, null, null, null, null, true);
      }
    }
    else
    {
      args[2] = top.getNativeFileName(sourcedir) + "*";
      args[3] = top.getNativeFileName(top.getEnv('LaunchPadTemp'));
      top.runProgram(NO_DISKID,args,FOREGROUND,HIDDEN, null, null, null, null, true);
    }
	}
}
initVersions();
checkUpdates();