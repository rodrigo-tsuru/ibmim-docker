/**
 * @author Brandon
 */

top.launchpadHotkeys = [];


/*	assignAccessKey(<HTMLElement>element)
 * 		Assigns default access key to element, underlines access key
 * 
 * 	element: HTMLElement
 *	returns HTMLElement - element access key is assigned to or undefined
 *		if unsuccessful.
 ***************************************************************************************
 *	assignAccessKey(<Object>options)
 * 		Assigns browser access key to element, underlines access key
 * 
 * 		If providing options object either id or element must be specified in options.
 * 
 *	options: {
 *		*Optional* id: String, - Id of element to assign access key to
 *		*Optional* element: HTMLElement, - Element to assign access key to
 *		*Optional* accessKey: String - Perferred access key to use for assignment
 *		}
 *	returns HTMLElement - element access key is assigned to or undefined
 *		if unsuccessful.
 */
function assignAccessKey(options) {
	var element;
	var accessKey;
	if(options){
		/* If a id is provided then search for that element in in all frames */
		if(options.id){
			if(!element)
				try { element = top.root.footer.document.getElementById(options.id); }catch(e){}
			if(!element)
				try { element = top.root.banner.document.getElementById(options.id); }catch(e){}
			if(!element)
				try { element = top.root.content.document.getElementById(options.id); }catch(e){}
			if(!element)
				try { element = top.navigationDocument.getElementById(options.id); }catch(e){}
			if(!element)
				try { element = top.preloadDocument.getElementById(options.id); }catch(e){}
			if(!element) {
				try {
					var loadedPages = top.preloadDocument.defaultView.frames;
					for(var p in loadedPages){
						try { element = loadedPages[p].getElementById(options.id); }catch(e){}
						if(element)
							break;
					}
				} catch(e2){}
			}
			/* If id was provided but no matching element found then return undefined */
			if(!element)
				return undefined;
			/* If element was provided then use */
		}else if(options.element){
			element = options.element;
		}
		if(options.accessKey){
			if(!isAccessKeyAvailable(element, options.accessKey))
				return undefined;
			else
				accessKey = options.accessKey;
		}
		
		if(!options.id&&!options.element&&!options.accessKey){
			element = options;
		}
		
		
	}
	if(!accessKey)
		do{
			accessKey = generateAccessKey(element);
		}while(!isAccessKeyAvailable(element, accessKey))
	if(!accessKey)
		return undefined;

	
	element = markAccessKey(element, accessKey);

	
	return element;

}

function formatMissingAccessKey(value, key) {
	return top.formatmsg(property('hotkeyMarker', '%1 (%2)'), value, key.toUpperCase());
}

/*	markAccessKey(<HTMLElement>element, <String>key)
 * 		Attempts to underline access key in element's display text.
 * 		If access key is not in the letters of display text then
 * 		simply bind the access key to element.
 * 
 * 	returns element which access key assigned to
 */
function markAccessKey(element, key){
	//If key is found in button display text then underline key
	var loc = (element.value).toLowerCase().indexOf((key.toLowerCase()));
	if (loc < 0) {
		element.value = formatMissingAccessKey(element.value, key);
		loc = (element.value).toLowerCase().indexOf((key.toLowerCase()));
	}
	if (loc > -1) {
		var classAttName = (top.BROWSER == 'IExplore') ? 'className' : 'class';
		var newButton = element.ownerDocument.createElement('button');
		//attempt to pass attributes from old element to new
		for (var a in element.attributes) {
			var atr = element.attributes[a];
			if (atr != undefined && atr != 'undefined') {
				if (atr.name != undefined && atr.name != 'undefined' && atr.name != null && atr.name != 'value') {
					if (atr.name == 'disabled') {
						break;
					}
					if (atr.name == 'onclick') {
						break;
					}
					/* IE doesn't seem to like passing functions as strings and
					 * Mozilla doesn't seem to like to pass booleans as strings
					 * Future iterations may need to manage styles, classes and 
					 * other events for displaced elements.
					 */
					newButton.setAttribute(atr.name, atr.value);
				}
			}
		}
		newButton.id = element.id;
		newButton.disabled = element.disabled;
		newButton.onclick = element.onclick;
		//Set old value so other methods can use
		newButton.originalValue = element.value;
		var initialSegment = undefined;
		if (loc > 0) {
			initialSegment = element.ownerDocument.createElement('span');
			initialSegment.innerHTML = element.value.substring(0,loc);
		}
		var underlineSegment = element.ownerDocument.createElement('span');
		underlineSegment.innerHTML = element.value.substring(loc,loc+1);
		var otherSegment = element.ownerDocument.createElement('span');
		otherSegment.innerHTML = element.value.substring(loc+1,element.value.length);
		newButton.accessKey = key;
		if(initialSegment)
			newButton.appendChild(initialSegment);
		newButton.appendChild(underlineSegment);
		newButton.appendChild(otherSegment);
		element.parentNode.replaceChild(newButton, element);
		underlineSegment.setAttribute(classAttName, "underline");
		element = newButton;
		
	}else{ //else simply assign key and set originalValue for other methods use
		var newButton = element.cloneNode(true);
		newButton.accessKey = key;
		newButton.originalValue = element.value;
		//FF won't enable accesskey functionality if added dynamically
		//replace node works fine though
		element.parentNode.replaceChild(newButton, element);
		element = newButton;
		
	}
	//We could just mark this as true but this information becomes valuable if
	//we make a removal function.
	top.launchpadHotkeys[key]={ 
		accessKey: key,
		element: element };
	return element;
	
}
/*	isAccessKeyAvailable(<String>accessKey)	
 * 		Determines if accessKey parameter is already been assigned previously
 * 
 * 	returns booleans of availability
 */
function isAccessKeyAvailable(element, accessKey){
	if(top.launchpadHotkeys[accessKey] && top.launchpadHotkeys[accessKey].element.id != element.id)
	{
		return false;
	}
	return true;
}
/*	generateAccessKey(<HTMLElement>element)
 * 		Attempts to generate a unique access key for the element passed
 * 		as a parameter. Initial iteration assumes of element type button
 * 		and display text as element's value. Moves through the display
 * 		text checking if the character is usable as an access key.
 * 		If not usable then move to next char and check if that key
 * 		is usable as access key.
 * 		
 * 	returns unique access key or undefined
 */
function generateAccessKey(element){
	var accessKey = undefined;
	if(element.value!=undefined){
		var tempStringArray = element.value.split('');
		var keyString = '';
		for(var p in tempStringArray){
			keyString = tempStringArray[p];
			if (isAccessKeyAvailable(element, keyString)) {
				accessKey = keyString;
				break;
			}
		}
	}//Easy to expand to spans and other HTMLElements
	//Should check for weird characters as well, do we want < || > to 
	//be a access key?
	return accessKey;
}

