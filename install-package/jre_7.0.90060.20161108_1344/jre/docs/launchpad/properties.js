// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

// Sets a property to the specified value
// varName - string - property name
// docTop - document - the document in which the property should be set
// value - the value to set the property to
// returns - boolean - success of the set operation
function assignProperty(varName, docTop, value)
{    
    return assignValue(docTop, docTop.document.properties, varName, varName, value, false) ;
}

// retrieve a resource property
// varName: string - resource ID
// docTop: document - staring child document to use for inheritance
// defaultValue: string - optional value to use if the resource cannot be found
// returns string or [] - resource value
function findProperty(varName,docTop,defaultValue) {
    var v;
    try {
        var p = docTop;
        var arrayIndex = null;
        do {
            var i = varName.indexOf('[');
            if (i > 0) {
                var j = varName.lastIndexOf(']');
                if (j > i) {
                    arrayIndex = varName.substring(i+1,j);
                    varName = varName.substring(0,i);
                }
            }
            try { v = p.document.properties[varName];} catch(e) {
            }
            if (typeof v != "undefined") {
                // varName exists, determine if it is an array
                if (typeof v == "object" && arrayIndex != null) {
                    i = arrayIndex.indexOf('[');
                    while (i > 0 && (typeof v == "object")) {
                        j = arrayIndex.lastIndexOf(']');
                        if (j > i) {
                            v = v[arrayIndex.substring(0,i)];
                            arrayIndex = arrayIndex.substring(i+1,j);
                            i = arrayIndex.indexOf('[');
                        } else
                            i = -1;
                    }
                    if (typeof v == "object")
                        v = v[arrayIndex];
                }
                break;
            }
            if (p.parent == p) p = null;
            else
                p = p.parent;
        } while (p != null);

    } catch(e) {
        v = top.UNDEFINED;
        top.logException(e,arguments); 
    }
    
    if (typeof v == "undefined") {
        v = defaultValue;
        if (typeof v == "undefined") {
            top.logMessage("LPV20024W",varName);
            v = "** "+varName+" - NO PROPERTY **";
        }
    }
    return v;
}

// private helper function to combine text lines that end with \
function combineContinuedLines(arrayOfLines) {
    try {
        for (var index = arrayOfLines.length-2; index >= 0; index--) {
            if (arrayOfLines[index].length > 0)
                if (arrayOfLines[index].charAt(arrayOfLines[index].length-1) == "\\") {
                    arrayOfLines[index] = arrayOfLines[index].substring(0,arrayOfLines[index].length-1) + arrayOfLines[index+1];
                    arrayOfLines.splice(index+1, 1);
                }
        }
    } catch(e) {
        top.logException(e,arguments);
    }
}

// store key/value pair into array
// fileName: string - property file name used for logging
// array: [] - property array
// key: string - resource ID
// value: string or [] - resource value
// isFallBackLocale: boolean - won't overwrite if true
// returns void
function assignValue(fileName, array, origkey, key, value, isFallBackLocale) {

    var success = true;

    try {
        try {
            var i = key.indexOf("[");
            if (i > 0 && (key.length-2) > i && key.charAt(key.length-1) == "]") {
                var arrayIndex = top.trim(key.substring(i+1,key.length-1));
                key = top.trim(key.substring(0,i));
                var a = null;
                if (typeof array[key] == "undefined") {
                    array[key] = new Array();
                } else if (typeof array[key] == "string") {
                    top.logMessage("LPV20003S", fileName, key);
                    success = false;
                }
                return assignValue(fileName, array[key], origkey, arrayIndex, value, isFallBackLocale);
            } else {
                if (isFallBackLocale && (typeof array[key] == "undefined")) {
                    top.logMessage("LPV20006W", fileName, origkey);
                    success = false;
                }
                if (!isFallBackLocale || (typeof array[key] == "undefined")) {
                    array[key] = value;
                }
            }
        } catch(e) {
            top.logMessage("LPV20004S", fileName, e.message, key);
            success = false;
        }
    } catch(e) {
        top.logException(e,arguments);
    }

    return success;
}

// private helper function to parse resource file lines into key/value pairs
function getKeyValuePairs(fileName, arrayOfLines, propertiesArray, isFallBackLocale) {
    try {
        var index = 0;
        while (index < arrayOfLines.length) {
            var curLine= top.trim(arrayOfLines[index]);
            // Ignore blank lines and comments
            if ((curLine.length == 0) || (curLine.substr(0,2) == '//') ||
                (curLine.charAt(0) == '#') || (curLine.charAt(0) == '!') || (curLine.charAt(0) == ':') ) {
                index++;
                continue;
            }

            var eq = 0;
            var colon = curLine.indexOf(":");
            var equals = curLine.indexOf("=");
            if (equals > 0 && colon < 0) {
                eq = equals;
            }
            if (colon > 0 && equals < 0) {
                eq = colon;
            }
            if (colon > 0 && equals > 0) {
                if (equals < colon) {
                    eq = equals;
                }
                if (colon < equals) {
                    eq = colon;
                }
            }
            if (colon == -1 && equals == -1) {
                eq = -1;
            }
            if (eq > 0) {
                // Get key part
                var key = top.trim(curLine.substring(0,eq));
                if (key.length > 0) {
                    // Get value part
                    var value = top.trim(curLine.substring(eq+1));
                    // find the next line with at least 1 character for the delimiter
                    while (value.length == 0 && index < (arrayOfLines.length-1)) {
                        index++;
                        value = top.trim(arrayOfLines[index]);
                    }
                    if (value.length > 0) {
                        var originalValue = value;
                        var endIndex = 0;
                        var delim = value.charAt(0);
                        var endDelim = delim;
                        if (delim == '[' && value.charAt(value.length - 1) == ']') {
                            endDelim = ']';
                        }
                        //The property has a known delimiter, so strip the delimiters off and continue processing
                        if (delim == '"' || delim == "'" || (delim == '[' && endDelim == ']')) {
                            
                            var endRE = new RegExp("\\"+endDelim+"\\s*;?\\s*(#|//|/\\*.*\\*/\\s*$|$)");
                            endIndex=value.search(endRE);
                            if (endIndex == -1) {
                                top.logMessage("LPV20005S", fileName, delim, key);
                            }
                            else {
                                value = value.substring(1,endIndex);
                            }                      
                        }
                        //process a property with a ' or " delimiter
                        if (delim == '"' || delim == "'") {
                            if (endIndex >= 0) {
                                var startRE = new RegExp("\n[^=]+\\s*=\\s*\\"+delim);
                                value = value.substring(0,endIndex);
                                if (value.search(startRE) >= 0)
                                    top.logMessage("LPV20005S", fileName, delim, key);
                            } else {
                                top.logMessage("LPV20005S", fileName, delim, key);
                            }                            
                        }
                        //process an array property
                        if (delim == '[' && endDelim == ']') {
                            try {
                                value = value.substring(0,endIndex);
                                eval('value = ['+value+']');
                            //if there is an exception we want to see if it is a bad array or a valid string
                            //a bad array for example would be [value], arrays should be written as such ['value1','value2']
                            //a valid string for example would [%1] some text here ending in ], although it is wrapped in [ ] this is not meant to be an array
                            } catch(e) {
                                var validString = true;
                                var stackCtr = 0;
                                for (var i = 0; i < originalValue.length; i++) {
                                    var currentChar = originalValue.charAt(i);
                                    if (currentChar == '[') {
                                        stackCtr++;
                                    } else if (currentChar == ']') {
                                        stackCtr--;
                                        if (stackCtr == 0) {
                                            if (i == originalValue.length -1) {
                                                top.logMessage("LPV20018S", fileName, value, key);
                                                validString = false;
                                            }
                                        }
                                    }
                                    if (validString) {
                                        value = originalValue;
                                    }
                                }
                            }
                        }
                        value = handleSpecialChars(fileName, value);
                        assignValue(fileName, propertiesArray, key, key, value, isFallBackLocale);
                    } else {
                        // Only occurs if last property in file has no value
                        top.logMessage("LPV20028F", curLine, fileName);          
                    }                    
                }
            } else {
                // No equal sign or colon found after property name
                top.logMessage("LPV20027F", curLine, fileName);          
            }
            index++;
        }
    } catch(e) {
        top.logException(e,arguments);
    }
}

// private helper function to remove blank lines
function removeBlankLines(arrayOfLines) {
    try {
        for (var index = arrayOfLines.length-1; index >= 0; index--) {
            if (arrayOfLines[index].length == 0)
                arrayOfLines.splice(index, 1);
        }
    } catch(e) {
        top.logException(e,arguments);
    }
}


// private helper function to handle special characters within Strings
function handleSpecialChars(fileName, propertyValue){

    var retVal = "";
    var state = 0;
    var START = 0;
    var PROCESSSLASH = 1;
    var UNICODE = 2;
    //Only processing strings since arrays are being handled by the eval statement in the getKeyValuePairs function
    if (typeof propertyValue != "string") {
        return propertyValue;
    } else {
        try {
            var i = 0;
            while (i < propertyValue.length) {
                var curChar = propertyValue.charAt(i);
                if (state == START) {
                    if (curChar != '\\') {
                        retVal = retVal + curChar;
                        i++;
                    } else {
                        state = PROCESSSLASH;
                    }       
                } else if (state == PROCESSSLASH) {
                    var nextPosition = i + 2;
                    var nextChar = propertyValue.substring(i+1, nextPosition);
                    if (nextChar == "u") {
                        i += 2;
                        state = UNICODE;
                    } else if (nextChar == ' ') {
                        retVal = retVal + String.fromCharCode(32);
                        i += 2;
                        state = START;
                    } else if (nextChar == "'") {
                        retVal = retVal + String.fromCharCode(39);
                        i += 2;
                        state = START;
                    } else if (nextChar == '"') {
                        retVal = retVal + String.fromCharCode(34);
                        i += 2;
                        state = START;
                    } else if (nextChar == '\\') {
                        retVal = retVal + String.fromCharCode(92);
                        i += 2;
                        state = START;
                    } else if (nextChar == 'r') {
                        retVal = retVal + String.fromCharCode(13);
                        i += 2;
                        state = START;
                    } else if (nextChar == "n") {
                        retVal = retVal + String.fromCharCode(10);
                        i += 2;
                        state = START;
                    } else if (nextChar == 't') {
                        retVal = retVal + String.fromCharCode(9);
                        i += 2;
                        state = START;
                    } else {
                        top.logMessage("LPV21035W", nextChar, fileName);
                        break;
                    }
                } else if (state == UNICODE) {
                    if ((i + 4) <= propertyValue.length) {
                        var uniString = propertyValue.substring(i, i+4);
                        if (validateUnicodeChar(uniString)) {
                            var letter = parseInt(uniString, 16);
                            retVal = retVal + String.fromCharCode(letter);
                            i += 4;
                        }
                        state = START;
                    }
                }
            }
        }        
        catch(e) {
            top.logException(e,arguments);
        }
    }
    return retVal;
}

// validates wether or not a character is a valid hexadecimal character
function validateUnicodeChar(unicodeString){
    try{
        var valid = true;
        var i;
        for (i=0; i < unicodeString.length && valid; i++) {
            var uniChar = unicodeString.charCodeAt(i);
            valid = (uniChar >= 48 && uniChar <=57)||(uniChar >= 65 && uniChar <=70)||(uniChar >= 97 && uniChar <=102); 
        }    
    }catch(e) {
        top.logException(e,arguments);
        valid = false;
    }
    if (!valid) {
        top.logMessage("LPV21034W", unicodeString.charAt(i-1));
    }
    return valid;
}


// reads a single resource file
// securityFcn: function = new Function('return window')
// fileName: string - full qualified native file name
// properties: [] - array of key/value pairs
// isFallBackLocale: boolean
// returns void
function secureRead1PropertyFile(securityFcn,fileName,properties,isFallBackLocale) {
    try {
        var lines = secureReadTextFile(securityFcn, fileName);
        combineContinuedLines(lines);
        getKeyValuePairs(fileName, lines, properties, isFallBackLocale);
    } catch(e) {
        top.logException(e,arguments);
    }
}

// reads 1 or more resource files
// securityFcn: function = new Function('return window')
// startingDir: full current directory for relative names
// fileName: string - messy-named file name
// properties: [] - array of key/value pairs
// fallBackLocale: string - fallback locale
// returns void
// search order:
//	.
//	./fallback locale
//	./locale
function secureRead1PropertyKind(securityFcn,startingDir,relativeDir,fileName,properties,fallBackLocale) {
    try {
        var f = null;
        if (typeof relativeDir != "undefined" && relativeDir != null) {
            if ((f = top.secureClientFileExists(securityFcn, startingDir, relativeDir+fileName, 'I')) != null) {
                secureRead1PropertyFile(securityFcn,f,properties,false);
                if (typeof properties['fallBackLocale'] == "string") fallBackLocale = properties['fallBackLocale'];
            }
            if ((f = top.secureClientFileExists(securityFcn, startingDir, relativeDir+top.LOCALE+'/'+fileName, 'I')) != null) {
                secureRead1PropertyFile(securityFcn,f,properties,false);
                if (typeof properties['fallBackLocale'] == "string") fallBackLocale = properties['fallBackLocale'];
            }
            if (typeof fallBackLocale == "string" && top.LOCALE != fallBackLocale && (f = top.secureClientFileExists(securityFcn, startingDir, relativeDir+fallBackLocale+'/'+fileName, 'I')) != null) {
                secureRead1PropertyFile(securityFcn,f,properties,true);
                if (typeof properties['fallBackLocale'] == "string") fallBackLocale = properties['fallBackLocale'];
            }
//if (fallBackLocale != "en") alert('fallBackLocale for file ' + relativeDir+fileName + ' = ' + fallBackLocale);
        }
    } catch(e) {
        top.logException(e,arguments);
    }
}

// finds and reads 1 or more resource files
// securityFcn: function = new Function('return window')
// startingDir: full current directory for relative names
// fileName: string - messy-named file name
// properties: [] - array of key/value pairs
// fallBackLocale: string - fallback locale
// returns void
// search order:
//	launchpad
//	skin
//	content
function secureReadPropertiesFile(securityFcn, startingDir, fileName, properties, fallBackLocale) {
    try {
        var f;
        var lines;
        secureRead1PropertyKind(securityFcn,startingDir,'',fileName,properties,fallBackLocale);

        // bootstrap read the content properties to see if it defines the skin dir - which then has to be read first
        if (typeof top.SKINDIR == "undefined" || top.SKINDIR == null || top.SKINDIR == '') {
            secureRead1PropertyKind(securityFcn,startingDir,top.CONTENTDIR,fileName,properties,fallBackLocale);
            top.SKINDIR = properties.skinDirectory;
            if (typeof top.SKINDIR == "undefined" || top.SKINDIR == null || top.SKINDIR == '') {
                var dirs = top.secureGetDirectories(new Function('return window'), top.getNativeFileName(startingDir + "/skins"));
                //if there's only one directory in skins and nothing has been set, assume it's the skin.
                if (dirs.length == 1) {
                    top.SKINDIR = "skins/" + dirs[0] + "/";
                }
                //otherwise, the user needs to explicitly define a skin dir.  Alert user of a potentially fatal error.
                else {
                    var message = findProperty('skinDirNotDefined',self,'');
                    //This code gets called several times and global.properties hasn't necessarily been read
                    if (message != '' && top.LOGFILTER.indexOf(top.FATAL) == -1 ) {
                        alert(message);                        
                    }
                }                
            }
        }
        secureRead1PropertyKind(securityFcn,startingDir,top.SKINDIR,fileName,properties,fallBackLocale);

        secureRead1PropertyKind(securityFcn,startingDir,top.CONTENTDIR,fileName,properties,fallBackLocale);

    } catch(e) {
        top.logException(e,arguments);
    }
}

// helper function to convert the document search string to key/value pairs
function getURLproperties(doc,properties) {
    try {
        if (typeof doc.search == "string")
            var query = doc.search;
        else
            var query = doc.location.search;
        if (query.length > 1) {
            query = query.substring(1);
            var tokens = query.split(",");
            for (var i=0; i < tokens.length; i++) {
                var keyvalue = tokens[i].split("=");
                if (keyvalue[0].length > 0) {
                    if (keyvalue[1].length > 0) {
                        assignValue(doc.location.href, properties, unescape(keyvalue[0]), unescape(keyvalue[0]), unescape(keyvalue[1]), false);
                    } else {
                        assignValue(doc.location.href, properties, unescape(keyvalue[0]), unescape(keyvalue[0]), "", false);
                    }
                }
            }
        }
    } catch(e) {
        top.logException(e,arguments);
    }
}

// helper function to initialize property globals and to read bootstrap property files
function initializeProperties() {
    try {
        var properties = new Array();

        // bootstrap read URL properties just in case they defined contentdir or skindir or startpage
        getURLproperties(document,properties);

        if (typeof top.CONTENTDIR == "undefined" || top.CONTENTDIR == null || top.CONTENTDIR == '')
            top.CONTENTDIR = properties.contentDirectory;
        if (typeof top.CONTENTDIR == "undefined" || top.CONTENTDIR == null || top.CONTENTDIR == '')
            top.CONTENTDIR = "content/";

        if (typeof top.SKINDIR == "undefined" || top.SKINDIR == null || top.SKINDIR == '')
            top.SKINDIR = properties.skinDirectory;

        secureReadPropertiesFile(new Function('return window'), top.STARTINGDIR+top.RELATIVEDIR, top.GLOBALPROPERTIES, properties, findProperty('fallBackLocale',self,'en'));
        secureReadPropertiesFile(new Function('return window'), top.STARTINGDIR+top.RELATIVEDIR, top.OSTYPE+".properties", properties, findProperty('fallBackLocale',self,'en'));
        secureReadPropertiesFile(new Function('return window'), top.STARTINGDIR+top.RELATIVEDIR, top.OS+".properties", properties, findProperty('fallBackLocale',self,'en'));

        // reread URL properties so they override properties from files
        getURLproperties(document,properties);

        if (typeof top.STARTPAGE == "undefined" || top.STARTPAGE == null || top.STARTPAGE == '')
            top.STARTPAGE = properties.startPage;
        if (typeof top.STARTPAGE == "undefined" || top.STARTPAGE == null || top.STARTPAGE == '')
            top.STARTPAGE = "main.html";

        document.properties = properties;
    } catch(e) {
        top.logException(e,arguments);
    }
}
initializeProperties();
