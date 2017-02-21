var launchpad = launchpad || {};

launchpad.extend = launchpad.extend || function (extensions, target) {
	
	target = target || this;
	
	for(var property in extensions){
	
		target[property] = extensions[property];
	}
	
	return target;
};

launchpad.extend({
		
	log: function (message) {
		console.log(message);
	},
	
	each: function(object, callback) {
		for (var i in object) {
			var next = object[i];
			if (callback.call(next, i, next) === false) {
				break;
			}
		}
	}
});

launchpad.extend({

	event: (function () {

		var windowUniqueID = 'window' + Math.round(Math.random() * 1000000000);
		var documentUniqueID = 'document' + Math.round(Math.random() * 1000000000);

		function getKey(element, onEventName, callback) {
		
			var elementID = element === window ? windowUniqueID : element === document ? documentUniqueID : element.uniqueID;
			return elementID + '[' + onEventName + ']=' + callback;
		}

		function isMemberOf(element, potentialMember) {
			
			while (potentialMember && potentialMember !== element) {
				potentialMember = potentialMember.parentNode;
			}
			return potentialMember === element;
		}
		
		function createHoverFunction(callback, type)
		{
			return function (event) {
				var relatedTarget = event.relatedTarget;
				if (!isMemberOf(this, relatedTarget)) {
					callback.call(this, event);
				}
			}
		}

		var registeredEvents = [];

		return {

			add: function(element, eventName, callback, useCapture) {
			
				element = launchpad.dom.get(element);
				
				if (!!element.addEventListener) {
				
					if (eventName === 'mouseenter') {
					
						element.addEventListener('mouseover', createHoverFunction(callback, eventName), useCapture);
						
					} else if (eventName === 'mouseleave') { 
					
						element.addEventListener('mouseout', createHoverFunction(callback, eventName), useCapture);
						
					} else {
					
						element.addEventListener(eventName, callback, useCapture);
						
					}
					
				} else if (!!element.attachEvent) {
				
					var onEventName = 'on' + eventName;
					var key = getKey(element, onEventName, callback);
					var registeredEvent = registeredEvents[key];
					
					if (!registeredEvent) {
					
						element.attachEvent(onEventName, registeredEvent = registeredEvents[key] = function() {
							callback.call(element, event || (element.ownerDocument && element.ownerDocument.parentWindow && element.ownerDocument.parentWindow.event) || window.event);
						});
						
						window.attachEvent('onunload', function () {
							element.detachEvent(onEventName, registeredEvent);
						});
					}
				}
				return this;
			},

			remove: function(element, eventName, callback, useCapture) {
			
				element = launchpad.dom.get(element);
				
				if (!!element.removeEventListener) {
				
					element.removeEventListener(eventName, callback, useCapture);
					
				} else if (!!element.detachEvent) {
				
					var onEventName = 'on' + eventName;
					var key = getKey(element, onEventName, callback);
					var registeredEvent = registeredEvents[key];
					
					if (!!registeredEvent) {
					
						element.detachEvent(onEventName, registeredEvent);
						delete registeredEvents[key];
					}
				}
				return this;
			},
			
			hover: function (element, onEnter, onLeave) {
				launchpad.event.add(element, 'mouseenter', onEnter, false);
				launchpad.event.add(element, 'mouseleave', onLeave, false);
				return this;
			}, 
			
			extend: launchpad.extend
		};
	})()
	
});

launchpad.each('abort,blur,change,click,contextmenu,copy, cut,dblclick,error,focus,keydown,keypress,keyup,load,mousedown,mousemove,mouseout,mouseover,mouseup,mousewheel,paste,reset,resize,scroll,select,submit,unload'.split(','),
	function(i, name){
		launchpad.event[name] = function (element, callback) { launchpad.event.add(element, name, callback) };
	}
);

launchpad.extend({

	dom: {

		get: function(element, doc) {
			return typeof element === 'string' ? (doc || document).getElementById(element) : element;
		},
		
		remove: function(element, options) {

			options = options || {};
			element = this.get(element);
			
			var parent = element.parentNode;
			parent.removeChild(element);
			
			return this;
		},
		
		append: function(element, content, options) {

			options = options || {};
			element = this.get(element);
			
			var fragment = element.ownerDocument.createDocumentFragment();
			var buffer = element.ownerDocument.createElement('div');
			buffer.innerHTML = content;
			
			while (buffer.firstChild) {
				fragment.appendChild(buffer.firstChild);
			}

			element.appendChild(fragment);
			
			return this;
		},
		
		prepend: function(element, content, options) {
		
			options = options || {};
			element = this.get(element);
			
			var fragment = element.ownerDocument.createDocumentFragment();
			var buffer = element.ownerDocument.createElement('div');
			buffer.innerHTML = content;
			
			while (buffer.firstChild) {
				fragment.appendChild(buffer.firstChild);
			}

			element.insertBefore(fragment, element.firstChild);
			
			return this;
		},
		
		style: function(element, name, value, options) {
		
			options = options || {};
			element = this.get(element);
			
			var style = element.style;
			
			if (value === undefined) {
				return style[name];
				
			} else {
			
				style[name] = value;
				return this;
			}
		},
		
		html: function(element, html, options) {

			options = options || {};
			element = this.get(element);
			
			element.innerHTML = html;
			return this;
		},

		hide: function(element, options) {

			options = options || {};
			element = this.get(element);
			
			element.style.display = 'none';

			return this;
		},

		show: function(element, options) {

			options = options || {};
			element = this.get(element);
			
			element.style.display = 'block';

			return this;
		},
		
		extend: launchpad.extend
	}
});

launchpad.dom.extend({

	animate: (function () {

		function Animation(element, options) {
			this.queue = typeof options.queue === 'undefined' ? element : options.queue;
			this.element = element;
			this.s = element.style;
			this.options = options;
			this.count = 0;
			this.options.steps = options.steps || 1;
			this.steps = this.options.steps;
			this.frequency = this.options.frequency;
		}
		
		Animation.prototype.next = function () {
			if (this.count++ < this.options.steps) {
			
				var newValue = this.calculateIncrement() + parseFloat(this.s[this.options.name]);
				this.s[this.options.name] = newValue;
				return true;
				
			} else {
			
				clearInterval(this.id);
				
				if (this.queue) {
				
					queues[this.queue].shift();
					
					if (queues[this.queue].length > 0) {
						queues[this.queue][0].start();
					}
				}
			}
			return false;
		}
		
		Animation.prototype.calculateIncrement = function () {
			var increment = (this.options.end - this.options.start) / this.options.steps;
			return increment;
		}
		
		Animation.prototype.initializeStartValue = function () {
			console.log('initializeStartValue: ' + launchpad.dom.style(this.element, this.options.name));
			if (this.options.start !== undefined) {
				this.s[this.options.name] = this.options.start;
			} else {
				this.options.start = this.s[this.options.name];
				console.log('initializeStartValue: ' + this.s[this.options.name]);
			}
		}
		
		Animation.prototype.start = function() {
			var animation = this;
			animation.initializeStartValue();
			function animate() {
				animation.next();
			}
			animation.id = setInterval(animate, animation.frequency);
		}
		
		var queues = {};
		
		function queue(animation) {
		
			if (!animation.queue) {
			
				animation.start();

			} else {
			
				if (!queues[animation.queue]) {
				
					queues[animation.queue] = [];
				}
				if (queues[animation.queue].push(animation) === 1) {
				
					animation.start();					
				}
			}
		}
		
		return function(element, options) {

			element = this.get(element);
			
			options = options || {};
			options.duration = options.duration || (options.frequency && options.steps && (options.frequency * options.steps)) || 2000;
			options.frequency = options.frequency || (options.duration && options.steps && (options.duration / options.steps)) || 100;
			options.steps = options.steps || options.duration / options.frequency;
			
			var animation = new Animation(element, { name: options.name, start: options.start, end: options.end, steps: options.steps, frequency: options.frequency, queue: options.queue });
			queue(animation);
			return this;
		};
		
	})()

});

launchpad.extend({

	get: (function () {
		function Element(element, doc) {
			this.element = launchpad.dom.get(element, doc);
		}
		
		function createFunction(name, context) {
		
			return function () {
				var args = [];
				args.push(this.element);
				for(var i = 0; i < arguments.length; i++) args.push(arguments[i]);
				return context[name].apply(this, args);
			};
		}
		
		var event = launchpad.event;
		for(var name in event) {
			Element.prototype[name] = createFunction(name, event);
		}
		
		var dom = launchpad.dom;
		for(var name in dom) {
			Element.prototype[name] = createFunction(name, dom);
		}
		
		return function (id, doc) {
			var element = new Element(id, doc);
			return element.element === null ? null : element;
		};
	})()

});

launchpad.extend({

	load: function(callback, win) {
		win = win || window;
		launchpad.get(win).add('load', callback);
		return this;
	}
});

launchpad.extend({

	coordinates: (function () {

		var location = { x: 0, y: 0 };
		
		launchpad.load(function(){ 
		
			launchpad.get(document.body).mousemove( function(e) { 
				location.x = e.pageX ? e.pageX : e.clientX + document.body.scrollLeft;
				location.y = e.pageY ? e.pageY : e.clientY + document.body.scrollTop;
			});
		});
		
		return function (e) {
		
			if (!e) return location;
			
			var pageX = e.pageX ? e.pageX : e.clientX + document.body.scrollLeft;
			var pageY = e.pageY ? e.pageY : e.clientY + document.body.scrollTop;
			
			return { x: pageX, y: pageY, current: location };
		}
	})()
});

