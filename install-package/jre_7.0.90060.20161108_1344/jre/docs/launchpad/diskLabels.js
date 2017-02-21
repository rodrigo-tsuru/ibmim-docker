// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2006
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

// array that maps disk IDs to real disk directories
top.diskMappings = new Array();
// array of all valid disk labels
top.allLabels = new Array();
// starting disk label
top.diskLabel = new Array();

top.foundCompatibleStartDisk = true;

var DISK_STRUCTURE_PROPERTIES = "diskStructure.properties";
var WRONG_DISK_ID = "wrongDiskId";
var NOT_DEFINED = "-NULL-";

// Determines if a disk is compatible with the starting disk and is also
// compatible with the current machine.  Consider the following scenario.
// 
// Starting disk info
// ------------------
// id = DISK1
// version = 1.0
// compatible[version] = 1.0
// compatible[top.OS] = Windows.*
// 
// Newly discovered disk info
// --------------------------
// id = DISK2
// version = 1.0
// compatible[version] = 1.0
// compatible[top.OS] = Linux
// 
// Clearly, these two disks should not be compatible.  One is designed for windows and the other is designed for Linux.
// Let's look at the process that we'll go through to make that determination.
// 
// 1) Compare the base disk compatibility checks to the properties stored on DISK2
//    a) The checks defined on DISK 1 are
//       version = 1.0
//       top.OS = Windows.*
//    b) The properties defined on DISK 2 are
//       version = 1.0
//       
//    When we do the comparisons, the version property from the 2nd disk (1.0) is compared to the expected value
//    specified by the base disk (1.0).  And they match.  The next check uses top.OS which is a javascript variable
//    that is evaluated at runtime and not a property that can be specified by the disk.  It evaluates to say Windows_2003
//    (Assuming we're on a win_2k3 box) and we compare that to Windows.*.  It matches and so far the compatiblity check
//    is happy.
// 
// 2) Compare the new disk compatibility checks to the properties stored on DISK2.  We're note interested in
//    looking at the properties stored on DISK1.  Completion of step 1 told us that DISK2 is compatible with the
//    checks defined on disk 1.  Now we need to compare the compatibility checks defined on disk 2 to the current machine
//    environment.
//    a) The checks defined on DISK2 are
//       version = 1.0
//       top.OS = Linux
//    b) The properties defined on DISK1 are
//       version = 1.0
// 
//    As in step 1, the version check will work.  However, this time, we compare top.OS to Linux which will fail on 
//    our 2K3 machine.  Hence, we are able to determine that these disks are not compatible.
// 
// newDiskCompatibilityChecks: Array - The information from thisDisk.properties on a newly discovered disk
// baseCompatibilityChecks: Array - The information from thisDisk.properties on the disk the launchpad was started from
// returns boolean - if the 2 labels are compatible
function isCompatibleDiskLabel(newDiskCompatibilityChecks, baseCompatibilityChecks) {

  return isCompatibleDiskLabelHelper(newDiskCompatibilityChecks, baseCompatibilityChecks) 
      && isCompatibleDiskLabelHelper(newDiskCompatibilityChecks, newDiskCompatibilityChecks);
}

//Helper function for comparing disk labels.  
//
// newDiskCompatibilityChecks: Array - The information from thisDisk.properties on a newly discovered disk
// baseCompatibilityChecks: Array - The information from thisDisk.properties on the disk the launchpad was started from
function isCompatibleDiskLabelHelper(newDiskCompatibilityChecks, baseCompatibilityChecks) {
  try {
    var compatibleChecks = baseCompatibilityChecks["compatible"];
    if ((typeof compatibleChecks) == "undefined" || compatibleChecks == null) return true;
    var isCompatible = true;
    for (var i in compatibleChecks) try
    {
      var v = '';
      with (newDiskCompatibilityChecks) {
        //For complex ids, split the id on the plus sign and evaluate each part seperately
        var indexArray = i.split("+");
        for (var index in indexArray) {
          var tempValue = "";
          try { tempValue = eval(indexArray[index]);} 
          catch(e) { tempValue = NOT_DEFINED;}
          v += tempValue;                
        }              
      }

      var regexp = new RegExp("^(" + compatibleChecks[i] + ")$","i");
      var m = v.match(regexp);
      if (m != null && (typeof m != "string")) m = m[0];

      isCompatible = (m == v);
      if (!isCompatible) return isCompatible;
    } catch(e) {
    }
    return isCompatible;
  } catch(e) {
    top.logException(e,arguments);
  }
  return top.UNDEFINED;
}

//Clean this up... it's got tons of duplicate code
function getIncompatibleMessage(diskLabel, compatibleLabel) {
  try {
    var retVal = "";
    var compatibleChecks = diskLabel["compatible"];
    if ((typeof compatibleChecks) == "undefined" || compatibleChecks == null) return top.UNDEFINED;
    var isCompatible = true;
    for (var i in compatibleChecks) try
    {
      if (isCompatible) {
        var v = '';
        // variables not found are assumed to be disklabel indexes
        try { v = eval(i);} catch(e) {
          v = compatibleLabel[i];
        }
        var regexp = new RegExp(compatibleChecks[i],"i");
        var m = v.match(regexp);
        if (m != null && (typeof m != "string")) m = m[0];
        isCompatible = (m == v);
        if (!isCompatible) {
          //If a launchpad variable failed a compatibility check, remove the "top." so
          //the message is more user friendly
          if (i.length > 4 && i.substring(0,4) == "top.") {
            i = i.substring(4, i.length);
          }
          var message = top.formatmsg(document.properties['diskIncompatibilityDetails'], v, i);
          retVal = message;
        }
      }
    } catch(e) {
    }
    return retVal;
  } catch(e) {
    top.logException(e,arguments);
  }
  return top.UNDEFINED;
}

// convert disk ID to real disk directory - this will prompt the user if needed
// id: string - the generic disk ID
// returns string - the real disk directory
function getDiskMapping(id) {
  var WIDTH = 410;
  var HEIGHT = 170;
  //Set to true so on first pass diskDirPrompt will be displayed despite errors from disk locations in array are present
  var showDiskPrompt = true;
  
  try {
    if (typeof id == "undefined") return null;
    if (id == null) {
      return top.diskMappings[diskLabel.id];
    }
    if (typeof top.allLabels[id] == "undefined" || top.allLabels[id] == null) {
      top.logMessage("LPV20015S", id);
      return top.UNDEFINED;
    }

    var diskMapping = top.diskMappings[id];

    if (typeof diskMapping != "undefined" 
        && top.secureFileExists(new Function('return window'), top.getNativeFileName(diskMapping+'/'+top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO))) {
      var diskLabelProperties = new Array();
      top.secureRead1PropertyFile(new Function('return window'), top.getNativeFileName(diskMapping+'/'+top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO), diskLabelProperties, false);
      if (diskLabelProperties.id == id && isCompatibleDiskLabel(diskLabelProperties,top.diskLabel)) {
        return diskMapping;
      }
    }

    var tempLabel = top.allLabels[id];
    if (typeof tempLabel == "object") {
      tempLabel = top.getBestOSMatch(tempLabel);            
    }
    var message = top.formatmsg(document.properties['diskDirPrompt'], tempLabel);
    var showWrongDirectory = false;
    
    if ((typeof diskMapping == "undefined") || diskMapping == null)
      diskMapping = top.STARTINGDIR;

    do {

      //set the default error message
      tempLabel = top.allLabels[id];
      if (typeof tempLabel == "object") {
        tempLabel = top.getBestOSMatch(tempLabel);            
      }
      message = top.formatmsg(document.properties['diskDirPrompt'], tempLabel);

      if (top.secureFileExists(new Function('return window'), top.getNativeFileName(diskMapping+'/'+top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO)) 
          || top.secureFileExists(new Function('return window'), top.getNativeFileName(diskMapping+'/'+DISK_STRUCTURE_PROPERTIES))) {
        var mediaTop = findMediaTop(top.getNativeFileName(diskMapping + "../"), top.getNativeFileName(diskMapping + "/"));
        var errorString = updateDiskMappings(mediaTop);
        var diskLabelProperties = new Array();
        if (typeof top.diskMappings[id] != "undefined") {
          top.secureRead1PropertyFile(new Function('return window'), top.getNativeFileName(top.diskMappings[id]+'/'+top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO), diskLabelProperties, false);
          if (diskLabelProperties.id == id && isCompatibleDiskLabel(diskLabelProperties,top.diskLabel)) {
            diskMapping=top.diskMappings[id];
            break;
          }
        } else {
          if (errorString != WRONG_DISK_ID && errorString != "") {
            message = top.formatmsg(document.properties['incompatibleDiskPrompt'], errorString);                   
          }
          if(showDiskPrompt) {
            message = top.formatmsg(document.properties['diskDirPrompt'], tempLabel);
            //Set to false so on all future passes the error message will persist
            showDiskPrompt=false;
          }
          //if we get here and there's no error string, it's probably because the user was prompted
          //for a CD and never inserted the correct one.  An incompatibleDiskPrompt with a null error string is
          //a pretty useless message, so we should fall back to the diskDirPrompt.
          else if (errorString == "") {
            tempLabel = top.allLabels[id];
            if (typeof tempLabel == "object") {
              tempLabel = top.getBestOSMatch(tempLabel);            
            }
            message = top.formatmsg(document.properties['diskDirPrompt'], tempLabel);
          }
        }
      }
      //If we come through here a 2nd time, it means that the last directory entered was invalid
      if (showWrongDirectory) {
        var wrongDirMessage = top.formatmsg(document.properties['wrongDirectory'], diskMapping);
        alert(wrongDirMessage);
      } else {
        showWrongDirectory = true;
      }

      diskMapping = top.modalPromptWithBrowse(property('promptTitle'), message ,diskMapping, top.isDirOK, WIDTH, HEIGHT);
    
      // Add '/' or '\' at end if not provided      

      if (diskMapping != null) {
         if ((diskMapping.indexOf("\\") != -1) &&
            (diskMapping.charAt(diskMapping.length-1) != "/") &&
            (diskMapping.charAt(diskMapping.length-1) != "\\"))
            diskMapping=diskMapping+"\\";
        else
          if ((diskMapping.indexOf("/") != -1) &&
             (diskMapping.charAt(diskMapping.length-1) != "/") &&
             (diskMapping.charAt(diskMapping.length-1) != "\\"))
             diskMapping=diskMapping + "/";
      }

    } while (diskMapping != null);
    return diskMapping;
  } catch(e) {
    top.logException(e,arguments);
  }
  return top.UNDEFINED;
}

//Searches for other disks that may exist in a DVD and updates the disk mapping array
//with their location.
//
//directory: string - The top level directory where the recursive search begins
function updateDiskMappings(directory) {
  var errorString="";

  try{        
    var diskStructureFile = top.getNativeFileName(directory + "/" + DISK_STRUCTURE_PROPERTIES);
    if (top.secureFileExists(new Function('return window'), diskStructureFile)) {
      var diskInfo = new Array();    
	  
      top.secureRead1PropertyFile(new Function('return window'), diskStructureFile, diskInfo, false);
      if (typeof diskInfo['recurse'] != "undefined") {
        for (var i = 0; i < diskInfo['recurse'].length; i++) {
          var recurseDirectory = top.getNativeFileName(directory + "/" + diskInfo['recurse'][i]);
          if (top.secureDirectoryExists(new Function('return window'), recurseDirectory)) {
            errorString = updateDiskMappings(recurseDirectory);                        
          } else {
            top.logMessage("LPV20032W", recurseDirectory);
          }                    
        }
      } else {
        top.logMessage("LPV20031E", diskStructureFile);
      }
    }
    //check for disk label file and make the necessary updates
    var thisDiskPropFile = top.getNativeFileName(directory + "/" + top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO);

    if (top.secureFileExists(new Function('return window'), thisDiskPropFile)) {
      var diskLabelProperties = new Array();
      top.secureRead1PropertyFile(new Function('return window'), thisDiskPropFile, diskLabelProperties, false); 
      if (typeof diskLabelProperties.id != "undefined" && diskLabelProperties.id != top.diskLabel.id && isCompatibleDiskLabel(diskLabelProperties,top.diskLabel)) {
        top.diskMappings[diskLabelProperties.id] = directory + "/";
      } else {
        if (typeof diskLabelProperties.id == "undefined" || diskLabelProperties.id == top.diskLabel.id) {
          errorString = WRONG_DISK_ID;
        } else {
          errorString = getIncompatibleMessage(diskLabelProperties,top.diskLabel);
        }
      }
    }
  }
  catch(e) {
    top.logException(e,arguments);
  }
  return errorString;
}

// Given a disk name and a top level starting directory, this function will recursively
// search for a disk that is compatible with the current machine of the same name.
// This function will not recurse unless an appropriately formatted diskStructure.properties file
// exists
function searchForCompatibleDiskByName(diskName, startingDirectory)
{
  var diskLocation = null;

  var diskStructureFile = top.getNativeFileName(startingDirectory + "/" + DISK_STRUCTURE_PROPERTIES);
  if (top.secureFileExists(new Function('return window'), diskStructureFile)) {
    var diskInfo = new Array();    

    top.secureRead1PropertyFile(new Function('return window'), diskStructureFile, diskInfo, false);
    if (typeof diskInfo['recurse'] != "undefined") {
      for (var i = 0; i < diskInfo['recurse'].length && diskLocation == null; i++) {
        var recurseDirectory = top.getNativeFileName(startingDirectory + "/" + diskInfo['recurse'][i]);
        if (top.secureDirectoryExists(new Function('return window'), recurseDirectory)) {
          diskLocation = searchForCompatibleDiskByName(diskName, recurseDirectory);
        } else {
          top.logMessage("LPV20032W", recurseDirectory);
        }                    
      }
    } else {
      top.logMessage("LPV20031E", diskStructureFile);
    }
  }
  else
  {    
    var thisDiskPropFile = top.getNativeFileName(startingDirectory + "/" + top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO);
    if (top.secureFileExists(new Function('return window'), thisDiskPropFile)) {
      var diskLabelProperties = new Array();
      top.secureRead1PropertyFile(new Function('return window'), thisDiskPropFile, diskLabelProperties, false); 
      if (typeof diskLabelProperties.id != "undefined" && diskLabelProperties.id == diskName && isCompatibleDiskLabel(diskLabelProperties, diskLabelProperties))
      {
        diskLocation = startingDirectory;
      }
    }
  }  
  return diskLocation;
}


//This is a helper function that looks for the top level of the media.  This is defined
//by the highest location of the file diskStructure.properties
//
//Things to fix: make getNativeFileName remove excess ../
//
//directory - the current directory that is being check for the existance of the diskStructure.properties file
//previousDirectory - the last directory that contains diskStructure.properties
function findMediaTop(directory, previousDirectory) {
  var mediaTop = previousDirectory;

  var parentDirIndex = directory.indexOf(".." + top.getNativeFileSeparator());
  if (parentDirIndex != -1) {
    directory = directory.substring(0, parentDirIndex);  //Once you get to the root, ../ start building up
  }                                                        //in the path and aren't removed by getNativeFileName
  if (previousDirectory != directory) {   //could get stuck in an infinite recursion at the media root without this check
    var file = top.getNativeFileName(directory + "/" + DISK_STRUCTURE_PROPERTIES);
    if (top.secureFileExists(new Function('return window'), file)) {
      mediaTop = findMediaTop(getNativeFileName(directory + "../"), directory);                  
    }
  }
  return mediaTop; 
}

//This function returns the disklabel array for a given directory path
//The argument directory is assumed to be the directory that contains launchpad/diskinfo
function getDiskLabelInformation(directory)
{
  var diskInfoArray = new Array();
  var thisDiskPropFile = top.getNativeFileName(directory + "/" + top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO);

  if (top.secureFileExists(new Function('return window'), thisDiskPropFile)) {
    top.secureRead1PropertyFile(new Function('return window'), thisDiskPropFile, diskInfoArray, false); 
  }
  return diskInfoArray;
}

/**
 * This function runs all of the disk labels through a FSM that will evaluate any embedded expressions in the disk label.
 * 
 * Example:  FSDISK = "First Steps Disk <%=property('fallBackLocale')%>"
 * 
 * This function should only be called after jscp and user extensions have been loaded in either IExplore.html or Mozilla.html.
 * There's nothing that prohibits it from being run before then.  However, the public APIs that a content writer will use
 * when creating the disk label will not yet be available.  
 */ 
function handleDiskLabelJavascriptSubstitution()
{
  for (var key in top.allLabels) {
    var label = top.allLabels[key];
    //This means that there are OS specific labels.  For example:
    //disk1[windows] = "Disk 1 for Windows"
    //disk1[unix] = "Disk 1 for unix"
    if (typeof label == "object") {
      for (var index in label) {
        //In this case, "label" is an array, label[index] is the value of the property
        //to be evaluated, and "index" is simply the location where the updated value should
        //be stored back into the label array.  
        handleDiskLabelJavascriptSubstitutionHelper(label, label[index], index);
      }
    }
    else
    {
        handleDiskLabelJavascriptSubstitutionHelper(top.allLabels, label, key);
    }
  }
}

/**
 * Helper function used by handleDiskLabelJavascriptSubstitution.
 * labelArray - possibly top.allLabels or perhaps a subarray of it
 * label - the label to be evaluated
 * key - an index into labelArray
 */ 
function handleDiskLabelJavascriptSubstitutionHelper(labelArray, label, key)
{
  var i = 0;

  var START = 0;
  var LESS_THAN = 1;
  var OPEN_PERCENT = 2;
  var EQUALS = 3;
  var GATHER_PROPERTY = 4;
  var CLOSE_PERCENT = 5;    

  var state = START;

  var verifiedBuffer = "";
  var tempBuffer = "";

  while (i < label.length) {
    var curChar = label.charAt(i);

    switch (state) {
    //Start state
    case START:
      if (curChar != '<') {
        verifiedBuffer += curChar;
      } else {
        tempBuffer += curChar;
        state = LESS_THAN;
      }
      break;

      //Found the first <
    case LESS_THAN:
      if (curChar != '%') {
        verifiedBuffer += tempBuffer + curChar;
        tempBuffer = "";
        state = START;
      } else if (curChar == '%') {
        tempBuffer += curChar;
        state = OPEN_PERCENT;
      }
      break;

      //We have found <%
    case OPEN_PERCENT:
      if (curChar != '=') {
        verifiedBuffer += tempBuffer + curChar;
        tempBuffer = "";
        state = START;
      } else if (curChar == '=') {
        tempBuffer += curChar;
        state = EQUALS;
      }
      break;

      //We have found <%=
    case EQUALS:
      if (curChar != '%') {
        tempBuffer += curChar
        state = GATHER_PROPERTY;
      } else {
        verifiedBuffer += tempBuffer + curChar;
        tempBuffer = "";
        state = START;
      }
      break;

      //We have found <%= and we're gathering the characters in the property key
    case GATHER_PROPERTY:
      if (curChar != '%') {
        tempBuffer += curChar;
      } else if (curChar == '%' ) {
        tempBuffer += curChar;
        state = CLOSE_PERCENT;
      }
      break;

      //We have found <%= XXXX %
    case CLOSE_PERCENT:
      if (curChar == '>') {
        //We have found something of the form <%= XXXX %>
        //Strip the leading <%= and the trailing % from tempBuffer and do a property lookup on the remainder
        var expression = tempBuffer.substring(3, tempBuffer.length - 1);          
        var result = null;

        try
        {
          eval("result = " + expression);
        }
        catch(e)
        {
          top.logException(e,arguments);
          result = undefined;
        }

        if (typeof result == "undefined") {
          top.logMessage("LPV22038W", label);
          state = START;
          tempBuffer = "";
        } else {
          //Append what ever we get to the verified buffer and get ready to start over
          verifiedBuffer += result;
          tempBuffer = "";
          state = START;
        }          
      } else {
        //Log an error message
        tempBuffer += curChar;          
        state = GATHER_PROPERTY;        
      }
      break;
    }  //End switch

    i++;
  }

  //If we exit the FSM and we're not in the START state, that means there is an incomplete expression
  if (state != START) {
    top.logMessage('LPV22039W', label);
    verifiedBuffer += tempBuffer;
    tempBuffer = "";
  }

  labelArray[key] = verifiedBuffer; 
}

function initializeDiskLabelService()
{  
  //If this function is called sometime other than when the launchpad is first loaded, we should clear out these array
  //to be sure there is no lingering data.
  top.allLabels = new Array();
  top.diskLabel = new Array();
  top.diskMappings = new Array();

  //Scan for parent directories that may contain additional disk directories
  var mediaTop = findMediaTop(top.getNativeFileName(top.STARTINGDIR + "../"), top.STARTINGDIR);

  // read all valid labels
  top.secureRead1PropertyFile(new Function('return window'), top.getNativeFileName(top.STARTINGDIR+top.RELATIVEDIR+top.DISKINFODIR+top.ALLDISKLABELS), top.allLabels, false);  

  // read this disk label
  top.secureRead1PropertyFile(new Function('return window'), top.getNativeFileName(top.STARTINGDIR+top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO), top.diskLabel, false);
  //Check to see if the starting disk can actually run on this computer
  if (!isCompatibleDiskLabel(top.diskLabel, top.diskLabel)) {
    //If not, search for a disk that is valid
    var newStartingDisk = searchForCompatibleDiskByName(top.diskLabel.id, mediaTop);
    if (newStartingDisk != null) {
      //re-read the disk properties
      top.secureRead1PropertyFile(new Function('return window'), top.getNativeFileName(newStartingDisk + "/" +top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO), top.diskLabel, false);
      top.diskMappings[top.diskLabel.id] = newStartingDisk + "/";      
    }   
    else
    {
      top.foundCompatibleStartDisk = false;
    }
  }

  //Don't waste our time trying to find other compatible disks if we can't find a start disk that works on this machine
  if (top.foundCompatibleStartDisk) {
    updateDiskMappings(mediaTop);
  }
  
  if (typeof top.diskMappings[top.diskLabel.id] == "undefined") {    
    top.diskMappings[top.diskLabel.id] = top.STARTINGDIR+"/";
  }

  // see if any sibling directories have valid disk labels that can be used so the user is not prompted as often
  var parentdir = top.getNativeFileName(top.STARTINGDIR+"/../");
  var dirs = top.secureGetDirectories(new Function('return window'), parentdir);
  for (var i=0; i < dirs.length; i++) {
    var f = top.getNativeFileName(parentdir+dirs[i]+"/"+top.RELATIVEDIR+top.DISKINFODIR+top.THISDISKINFO);
    if (top.secureFileExists(new Function('return window'), f)) {
      var diskLabelProperties = new Array();
      top.secureRead1PropertyFile(new Function('return window'), f, diskLabelProperties, false);
      if (typeof diskLabelProperties.id != "undefined" && diskLabelProperties.id != top.diskLabel.id && isCompatibleDiskLabel(diskLabelProperties,top.diskLabel)) {
        top.diskMappings[diskLabelProperties.id] = parentdir+dirs[i];
      }
    }
  }  
}


initializeDiskLabelService();
