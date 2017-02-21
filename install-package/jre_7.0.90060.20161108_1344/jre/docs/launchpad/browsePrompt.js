// may want to consider adding a new preference to startup: dom.disable_window_open_feature.status=false
// useful modal sleep routine
function sleep( milliseconds ) {
    if (milliseconds <= 0) return true;
    var timeToExit = (new Date()).getTime() + milliseconds;
    try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsIThread = Components.classes["@mozilla.org/thread;1"].getService(Components.interfaces.nsIThread);
        var currentTime = (new Date()).getTime();
        var timeout = timeToExit - currentTime;
        if (timeout <= 0) return true;
        if (timeout > milliseconds) timeout = milliseconds;
        nsIThread.currentThread.sleep(timeout);
        return true;
    }
    catch(e) {
        try {
            window.showModalDialog("javascript:document.writeln('<script>currentTime=(new Date()).getTime();if (currentTime>="+timeToExit+")window.close();else { if (currentTime<"+(timeToExit-milliseconds)+")timeout="+milliseconds+";else timeout="+timeToExit+"-currentTime;window.setTimeout( \"window.close()\",timeout);}<\/script>')");
	    return true;
        }
        catch(e2) { 
            return false; }
    }
}


window._modalPrompt_ = new Array();

// example of how we could handle a bunch of other events if needed by the user
function modalPromptEvent_onunload(e) {
    if (window._modalPrompt_['ONUNLOAD'] != null) {
	try {
	    return window._modalPrompt_['ONUNLOAD'](e);
	}
	catch(e) {}
	window._modalPrompt_['ONUNLOAD'] = null;
	window.focus();
	return true;
    }
}

function modalPromptEvent_onload(e) {
    if (window._modalPrompt_['ONLOAD'] != null) {
	try {
	    return window._modalPrompt_['ONLOAD'](e);
	}
	catch(e) {}
	window._modalPrompt_['ONLOAD'] = null;
	return true;
    }
}

// returns the inputed text string or null if cancelled
// change this so width and height are allowed to be optional or null
function modalPrompt(windowTitle, userText, userValue, userHTML, exitValidator, width, height) {
   
    var undefined;
    x = (document.body.offsetWidth-width)/2+window.screenLeft;
    y = window.screenTop;
    window._modalPrompt_['ReturnValue'] = undefined;
    window._modalPrompt_['ExitValueOK'] = exitValidator;

    if (top.BROWSER != "IExplore")
    {
      userText = userText.replace(/\'/g,"\\'");
    }
    userText = userText.replace(/\'/g,"\\'");

    var winHTMLprefix = new Array(
	"<HTML>",
	"<HEAD>",
	"<TITLE>"+windowTitle+"<\/TITLE>",
        "<\/HEAD>",
	"<BODY onload=window.opener.modalPromptEvent_onload onunload=window.opener.modalPromptEvent_onunload>",
        "<script>",
        "    function unconditionalExit(val) {",
        "        window.opener._modalPrompt_['ReturnValue']=val;",
        "        window.close();",
        "        return false;",
        "    }",
        "    function conditionalExit(val) { ",
        "        if (typeof window.opener._modalPrompt_['ExitValueOK'] != 'undefined' && window.opener._modalPrompt_['ExitValueOK'] != null) { ",
	    "            if (window.opener._modalPrompt_['ExitValueOK'](window,val)) { ",
	    "                return unconditionalExit(val);  }",
        "            else {  return true;  }",
        "         }                         ",
        "        else { return unconditionalExit(val);  }",
        "    }",
        "    userText='"+userText+"';",
        ((typeof userValue == "undefined")?"var userValue;":"userValue='"+userValue+"';"),
        "<\/script>"
    );
    var winHTMLsuffix = new Array(
	"<\/BODY>",
	"<\/HTML>"
    );
    try {
	// for mozilla, just open a modal window
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserWrite");
	var winHTML = winHTMLprefix.join(" ");
	if (typeof userHTML == "object" && userHTML != null && typeof userHTML.length == "number" && userHTML.length > 0)
	    winHTML+= userHTML.join(" ");
	winHTML+= winHTMLsuffix.join(" ");
	winHTML = "javascript:document.writeln('"+winHTML.replace(/'/g, "\\'")+"')";
        var modalWin = window.open(winHTML, "MODAL", 
            "modal=1,width="+width+",height="+height+",location=no,menubar=no,status=no,titlebar=yes,dialog=yes,toolbar=no,resizable=yes,scrollbars=yes,alwaysRaised=yes,dependent=yes");

        var isClosed;
        do {
            try {
                isClosed = modalWin.closed;
            } catch(e) { 
                isClosed = true; }
            if (!isClosed) sleep(100);
        } while (!isClosed);
        window.focus();
        return window._modalPrompt_['ReturnValue'];
    } catch(e2) { 
    try {
	// for IE, yikes, we're in trouble
	// IE modal windows cannot access the parent window so we can't share data - boo!
	// start a hidden modal window that creates a modeless popup window and then exits
	try {
            dataWin = window.showModalDialog("javascript:document.writeln('<script>window.returnValue=window.open(\"\",\"DataWin\",\"width="+(width-12)+",height="+(height-32)+",top="+y+",left="+x+",location=no,toolbar=no,status=no,menubar=no,resizable=yes,scrollbars=no,titlebar=yes,directories=no\");window.close()<\/script>')");
	} catch(e) {}

	// create a modeless dialog over top of the modeless popup
        modelessWin = window.showModelessDialog("",
            "ModalPrompt", 
            "dialogWidth:"+(width)+"px;dialogHeight:"+(height)+"px;dialogLeft:"+x+";dialogTop:"+y+";status:no;resizable:yes;scroll:yes;center:no;edge:sunken;");
	modelessWin.opener = window;

	modelessWin.document.open();

	for (i=0; i < winHTMLprefix.length; i++) {
	      modelessWin.document.writeln(winHTMLprefix[i]);        
	}

	if (typeof userHTML == "object" && userHTML != null && typeof userHTML.length == "number" && userHTML.length > 0)
	    for (i=0; i < userHTML.length; i++) {
	        modelessWin.document.writeln(userHTML[i]);
	    }

	for (i=0; i < winHTMLsuffix.length; i++) {
	    modelessWin.document.writeln(winHTMLsuffix[i]);
	}

	modelessWin.document.close()
	try {
	    dataWin.modelessWin = modelessWin;
	} catch(e) {}
	// create a modal dialog that can now access the modeless dialog created earlier
        if (false == window.showModalDialog("javascript:document.writeln('\
		<script>\
		  try {\
		    dataWin=window.open(\"\",\"DataWin\",\"width=1,height=1,top=1,left=1,location=no,toolbar=no,status=no,menubar=no,resizable=yes,scrollbars=no,titlebar=yes,directories=no\");\
		    modelessWin = dataWin.modelessWin;\
		    dataWin.close();\
		    modelessWin.modalWin=window;\
		    function checkModeless() {\
			try {\
			    isClosed = modelessWin.closed;\
			} catch(e) {isClosed = true; }\
			if (isClosed) { window.returnValue = true; window.close(); }\
			else setTimeout(\"checkModeless()\",100);\
		    }\
		    checkModeless();\
		  } catch(e) { window.returnValue = false; window.close(); }\
		<\/script>')")) 
	{ // oops, the dataWin is dead, poll, waiting for the modeless dialog to close
	    try {
	        dataWin.close();
	    } catch(e) {}
            var isClosed;
            do {
                try {
                    isClosed = modelessWin.closed;
                } catch(e) { isClosed = true; }
                if (!isClosed) {
		    sleep(1000);
	        }
            } while (!isClosed);
	}
        window.focus();
        return window._modalPrompt_['ReturnValue'];
    }
    catch(e) {
	do {
	    userValue = window.prompt(userText, userValue);
	} while (typeof exitValidator != "undefined" && exitValidator != null && !exitValidator(window,userValue));
	return userValue;
    }}
}


function isDirOK(win,val) {
    return true;  // this should validate the directory that was chosen
}


// popup modal dialog to browse for a directory
function browseForFolder(directions) {
    var result = null;
    try {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var dialog = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	dialog.init(window, directions, nsIFilePicker.modeGetFolder);

	// start off with the home directory
	var initialDir = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("Home", Components.interfaces.nsIFile);
	// get the root directory of home
	try {
	while (typeof initialDir.parent != 'undefined' && initialDir.parent != null && initialDir.parent.path != initialDir.path)
	    initialDir = initialDir.parent;
	} catch(e) {}
	dialog.displayDirectory = initialDir;
	if (dialog.show() == nsIFilePicker.returnOK) {
	    result = dialog.file.path;
	}
    } catch(e) {
        try {
	    var shell = new ActiveXObject("Shell.Application");
            var folder = shell.BrowseForFolder(0, directions, 1+0x10+0x1000, 0x11);
	    var folderItem = folder.Items().item();
	    result = folderItem.Path;
        } catch(e) {}
     }
    return result;
}

function modalPromptWithBrowse(windowTitle, userText, userValue, exitValidator, width, height) {


    window._modalPrompt_['OK'] = property('promptOK');
    window._modalPrompt_['CANCEL'] = property('promptCancel');
    window._modalPrompt_['BROWSE'] = property('promptBrowse');
    window._modalPrompt_['BROWSE_TITLE'] = property('promptTitle');
    INPUTLENGTH = 50;

    //If we're on mozilla or firefox, replace \ with \\ so the value used in the input field
    //is correct.
    if (!isIE()) {
        userValue = userValue.replace(/\\/g, "\\\\");   
    }    

    userValue = "\"" + userValue + "\"";
	var orientation = top.isBidiLocale() ? 'rtl' : 'ltr';
    htmltext = new Array(
"<script>",
	//<ACGC_Bidi> start
	//if locale is Bidi set dir= rtl for the HTML tag
	"try{var orientation = '" + orientation + "';",
	"var direction;\
	try\
	{\
		var html = document.getElementsByTagName('HTML')[0];\
		direction = html.getAttribute('dir');\
		if((orientation == 'rtl' && direction != 'rtl') || (orientation == 'ltr' && direction == 'rtl'))\
		{\
			html.setAttribute('dir',orientation);\
		}\
	}\
	catch(e)\
	{\
	}\
	try\
	{\
		direction = document.dir;\
		if((orientation == 'rtl' && direction != 'rtl') || (orientation == 'ltr' && direction == 'rtl'))\
		{\
			document.dir = orientation;\
		}\
	}\
	catch(e)\
	{\
	}}catch(e2){}",
	//<ACGC_Bidi> end
"function handleBrowse(textInput) {",
"	var result = window.opener.browseForFolder(window.opener._modalPrompt_['BROWSE_TITLE']);",
"	if (typeof result == 'string')",
"	    textInput.value = result;",
"}",

"<\/script>",
	"<div style='vertical-align:middle;margin:10 10 10 10;'>",
        "<form name=form1 onSubmit='conditionalExit(document.form1.textInput.value);return false' onclick=window.opener.clicker>",
	"  <LABEL style='font-family: Verdana, Arial, Helvetica, sans-serif;font-size: 12px;' for=textInput>"+userText+"<\/LABEL>",
    "  <br>",
	"  <input dir=ltr type=text size="+INPUTLENGTH+" style='overflow: visible;margin-top: 1ex;margin-bottom: 1ex;' id=textInput value="+userValue+">",
    "  <br>",
    "  <input name=OK type=button onClick=conditionalExit(document.form1.textInput.value); value='"+window._modalPrompt_['OK']+"'>",
	"  <input name=CANCEL type=button onClick=unconditionalExit(null) value='"+window._modalPrompt_['CANCEL']+"'>",
	"  <input name=BROWSE type=button onClick=handleBrowse(document.form1.textInput) value='"+window._modalPrompt_['BROWSE']+"'>",
	"<\/form>",
	"<\/div>"
    );

    //Now, for both browsers, replace all \ with \\ once again.  Yes, this is correct for mozilla even though we've
    //already done this operation above. 
    userValue = userValue.replace(/\\/g, "\\\\");   

    return modalPrompt(windowTitle,userText,userValue,htmltext,exitValidator,width,height);
}

function isIE()
{
    return top.BROWSER == "IExplore";    
}
    
