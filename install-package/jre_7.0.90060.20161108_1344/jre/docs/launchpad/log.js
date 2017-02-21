// Licensed Materials - Property of IBM
// 5648-F10 (C) Copyright International Business Machines Corp. 2005
// All Rights Reserved
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

// buffered messages
top.logMessages = new Array();
// functions who can process messages
top.logListeners = new Array();
// Initialize log filter, will get overwritten once env variable is read
// This may cause a few messages to be logged before the default or envrionment var log filter is read.
top.LOGFILTER = 'ESW';
top.LOG_SHOW_AT_LOAD = false;
top.FATAL = 'F';
top.TRACE = 'T';
top.WARNING = 'W';
top.ERROR = 'E';
top.SEVERE = 'S';

// Set log filter and show log if env var is set
// Note: Cannot be called until secureGetEnv() exists
function logInitFilter() {
    // Set log filter if env variable exists
    var _envLogFilter_ = secureGetEnv(new Function('return window'), "LaunchPadLogFilter" );
    if ((typeof _envLogFilter_ == "string") && (_envLogFilter_ != '')) {
        top.LOG_SHOW_AT_LOAD = true;  // Assume we will show the log
	top.LOGFILTER = _envLogFilter_.toUpperCase();
    }
    else {
	// Set default filter
	top.LOGFILTER = "ESW";
    }

    // Determine if we should show the log (mainly used during a reload)
    var _envShowLog_ = secureGetEnv(new Function('return window'), "LaunchPadShowLog" );
    if ((typeof _envShowLog_ == "string") && (_envShowLog_ != '')) {
	top.LOG_SHOW_AT_LOAD = (_envShowLog_.toLowerCase() == "true");
    }
}

// Update log filter
// newFilter: string - log filter chars
function logSetFilter(newFilter) {
    top.LOGFILTER = newFilter;
    // Update env var so we can use it on a reload
    top.secureSetEnv(new Function('return window'), "LaunchPadLogFilter", top.LOGFILTER);
}

// log a message
// id: string - message property name -> message template
// optional string substitution values
function logMessage() {
    if (top.LOGFILTER == '') return;
    if ((typeof arguments[0] != "string") || arguments[0] == null || arguments[0] == '') return;
    var date = new Date();
    var id = arguments[0].toUpperCase();
    var sev = id.charAt(id.length-1);  
    if (top.LOGFILTER.indexOf(sev) == -1 && sev != top.FATAL) return;
    for (var i in top.logListeners)
        if (top.logListeners[i] != null)
            if ((top.logListeners[i])(date,arguments) == false)
                return;
    if (typeof top.showMessage == "undefined") {        
        logMessages.push([date,arguments]);
    }
    else {
        try {
            dumpBufferedLogMessages();
            top.showMessage(new Date(),arguments);
            //alert in the case of fatal errors.
            if (sev == top.FATAL && top.LOGFILTER.indexOf(sev) == -1) {
                alert(property('fatalError') + " " + top.getFormattedMessage(arguments));              
            }
        } catch(e) {
            showMessage = null;
        }
    }
}

function getSignature(methodName, args)
{
	var signature = methodName + '(';
	for(var i = 0; i < args.length; i++)
	{
		signature += args[i];
		if(i < args.length -1)
		{
			signature += ', ';
		}
	}
	signature += ');';
	
	return signature;
}

function getArray(array, start, end)
{
	var newArray = [];
	for(var i = start; i < end; i++)
	{
		newArray.push(array[i]);
	}
	return newArray;
}

function logEnter(name, args)
{
	if(top.LOGFILTER.indexOf(top.TRACE) > -1)
	{	
		var signature = getSignature(name, args);
		logTrace(signature);
	}
}

function logExit(name, args)
{
	logEnter(name, args);
}

function logTrace(string)
{
	logMessage('LPV20017T', string);
}
function logFatal(string)
{
	logMessage('LPV20017F', string);
}
function logSevere(string)
{
	logMessage('LPV20017S', string);
}
function logError(string)
{
	logMessage('LPV20017E', string);
}
function logWarning(string)
{
	logMessage('LPV20017W', string);
}

function logDebug(string)
{
	logMessage('LPV20017D', string);
}
function logInfo(string)
{
	logMessage('LPV20017I', string);
}

// log unknown syntax errors
window.onerror = function (msg,fn,line) {
    logMessage("LPV20011E", msg, fn, line);
    return true;
}

// once the logging facility is active - send buffered messages
// returns void
function dumpBufferedLogMessages() {
    var i;
    for (i in logMessages) {
        var a = logMessages[i];
        var id = a[1][0]
        var sev = id.charAt(id.length-1);   

        //Don't put up alert for fatal errors if 'F' is part of the log filter
        if (sev == top.FATAL && top.LOGFILTER.indexOf(sev) == -1) {
            alert(property('fatalError') + " " + top.getFormattedMessage(a[1]));
        }
        showMessage(a[0], a[1]);
    }
    logMessages = new Array();
}

// helper utility to extract and format a function name and its arguments into a string
function getFunctionInvocation(functionArguments) {
    var fcn = functionArguments.callee.toString().match(new RegExp("[f]unction\\s+\\w+\\s*\\(")); // find "[f]unction blah ("
    if (fcn != null) {
        fcn = fcn[0].substring(8).match(new RegExp("\\w+"))[0]; // skip "[f]unction" and remove "(";
        var s = fcn + '(';
        for (var i=0; i < functionArguments.length; i++) {
            s += functionArguments[i];
            if (i < (functionArguments.length-1)) s += ',';
        }
        s += ')';
    }
    return fcn;
}

// log a generic exception
// e: exception
// args: parent function arguments
function logException(e,args) {
    if (typeof args != "undefined" && typeof args.callee != "undefined" && (fcn = getFunctionInvocation(args)) != null)
        logMessage("LPV20010E", e.name, fcn, e.message);
    else if (typeof args == "string")
        logMessage("LPV20012E", e.name, args, e.message);
    else
        logMessage("LPV20012E", e.name, '?', e.message);
    return true;
}

// interface utility to add a function listener for log messages
// returns integer - listener ID needed to remove listener
function logAddListener(fcn) {
    return top.logListeners.push(fcn);
}

// interface utility to remove a log listener
// pushRetVal: integer - value returned from logAddListener
function logRemoveListener(pushRetVal) {
    var rc = (top.logListeners[pushRetVal-1] != null);
    top.logListeners[pushRetVal-1] = null;
    return rc;
}
