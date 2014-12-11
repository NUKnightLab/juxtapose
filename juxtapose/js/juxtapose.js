
(function (document, window) {

	var juxtapose = { sliders: [] };

	var flickr_key = "d90fc2d1f4acc584e08b8eaea5bf4d6c";
	var FLICKR_SIZE_PREFERENCES = ['Large', 'Medium'];

	function Graphic(properties, slider) {
		var self = this;
		this.image = new Image();
		
		this.loaded = false;
		this.image.onload = function() {
			self.loaded = true;
			slider._onLoaded();
		};

		this.image.src = properties.src;
		this.label = properties.label || false;
		this.credit = properties.credit || false;
	}

	function FlickrGraphic(properties, slider) {
		var self = this;
		this.image = new Image();

		this.loaded = false;
		this.image.onload = function() {
			self.loaded = true;
			slider._onLoaded();
		};

		this.flickrID = this.getFlickrID(properties.src);
		this.callFlickrAPI(this.flickrID, self);

		this.label = properties.label || false;
		this.credit = properties.credit || false;
	}

	FlickrGraphic.prototype = {
		getFlickrID: function(url) {
			var idx = url.indexOf("flickr.com/photos/");
			var pos = idx + "flickr.com/photos/".length;
			var photo_info = url.substr(pos);
			if (photo_info.indexOf('/') == -1) return null;
			if (photo_info.indexOf('/') === 0) photo_info = photo_info.substr(1);
			id = photo_info.split("/")[1];
			return id;
		},

		callFlickrAPI: function(id, self) {
			var flickr_best_size = "Large";
			var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes' +
					'&api_key=' + flickr_key +
					'&photo_id=' + id + '&format=json&nojsoncallback=1';

			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.onload = function() {
				if (request.status >= 200 && request.status < 400){
					data = JSON.parse(request.responseText);
					var flickr_url = self.bestFlickrUrl(data.sizes.size);
					self.setFlickrImage(flickr_url);
				} else {
					console.error("There was an error getting the picture from Flickr");
				}
			};
			request.onerror = function() {
				console.error("There was an error getting the picture from Flickr");
			};
			request.send();
		},

		setFlickrImage: function(src) {
			this.image.src = src;
		},

		bestFlickrUrl: function(ary) {
			var dict = {};
			for (var i = 0; i < ary.length; i++) {
				dict[ary[i].label] = ary[i].source;
			}
			for (var j = 0; j < FLICKR_SIZE_PREFERENCES.length; j++) {
				if (FLICKR_SIZE_PREFERENCES[j] in dict) {
					return dict[FLICKR_SIZE_PREFERENCES[j]];
				}
			}
			return ary[0].source;
		}
	};

	function getNaturalDimensions(DOMelement) {
		if (DOMelement.naturalWidth && DOMelement.naturalHeight) {
			return {width: DOMelement.naturalWidth, height: DOMelement.naturalHeight};
		}
		// http://www.jacklmoore.com/notes/naturalwidth-and-naturalheight-in-ie/
		var img = new Image();
		img.src = DOMelement.src;
		return {width: img.width, height: img.height};
	}

	function getImageDimensions(img) {
		var dimensions = {
			width: getNaturalDimensions(img).width,
			height: getNaturalDimensions(img).height,
			aspect: function() { return (this.width / this.height); }
		};
		return dimensions;
	}

	function addClass(element, c) {
		if (element.classList) {
			element.classList.add(c);
		} else {
			element.className += " " + c; 
		}
	}

	function removeClass(element, c) {
		element.className = element.className.replace(/(\S+)\s*/g, function (w, match) {
			if (match === c) {
				return '';
			}
			return w;
		}).replace(/^\s+/, '');
	}

	function setText(element, text) {
		if (element.textContent) {
			element.textContent = text;
		} else {
			element.innerText = text;
		}
	}

	function getComputedWidthAndHeight(element) {
		if (window.getComputedStyle) {
			return {
				width: parseInt(getComputedStyle(element).width, 10),
				height: parseInt(getComputedStyle(element).height, 10)
			};
		} else {
			w = element.getBoundingClientRect().right - element.getBoundingClientRect().left;
			h = element.getBoundingClientRect().bottom - element.getBoundingClientRect().top;
			return {
				width: parseInt(w, 10) || 0,
				height: parseInt(h, 10) || 0
			};
		}
	}

	function getPageX(e) {
		var pageX;
		if (e.pageX) {
			pageX = e.pageX;
		} else if (e.touches) {
			pageX = e.touches[0].pageX;
		} else {
			pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		}
		return pageX;
	}

	function getPageY(e) {
		var pageY;
		if (e.pageY) {
			pageY = e.pageY;
		} else if (e.touches) {
			pageT = e.touches[0].pageY;
		} else {
			pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return pageY;
	}

	function checkFlickr(url) {
		var idx = url.indexOf("flickr.com/photos/");
		if (idx == -1) {
			return false;
		} else {
			return true;
		}
	}

	function getLeftPercent(slider, input) {
		if (typeof(input) === "string" || typeof(input) === "number") {
			leftPercent = parseInt(input, 10);
		} else {
			var sliderRect = slider.getBoundingClientRect();
			var offset = {
				top: sliderRect.top + document.body.scrollTop,
				left: sliderRect.left + document.body.scrollLeft
			};
			var width = slider.offsetWidth;
			var pageX = getPageX(input);
			var relativeX = pageX - offset.left;
			leftPercent = (relativeX / width) * 100;
		}
		return leftPercent;
	}

	function getTopPercent(slider, input) {
		if (typeof(input) === "string" || typeof(input) === "number") {
			topPercent = parseInt(input, 10);
		} else {
			var sliderRect = slider.getBoundingClientRect();
			var offset = {
				top: sliderRect.top + document.body.scrollTop,
				left: sliderRect.left + document.body.scrollLeft
			};
			var width = slider.offsetHeight;
			var pageY = getPageY(input);
			var relativeY = pageY - offset.top;
			topPercent = (relativeY / width) * 100;
		}
		return topPercent;
	}


	var BOOLEAN_OPTIONS =  {'animate': true, 'showLabels': true, 'showCredits': true };
	function interpret_boolean(x) {
		if (typeof(x) != 'string') {
			return Boolean(x);
		}
		return !(x === 'false' || x === '');
	}

	function JXSlider(selector, images, options) {

		this.selector = selector;

		var i;
		this.options = {
			animate: true,
			showLabels: true,
			showCredits: true,
			startingPosition: "50%",
			orientation: 'horizontal'
		};

		for (i in this.options) {
			if(i in options) {
				if (i in BOOLEAN_OPTIONS) {
					this.options[i] = interpret_boolean(options[i]);
				} else {
					this.options[i] = options[i];
				}
			}
		}

		if (images.length == 2) {

			if(checkFlickr(images[0].src)) {
				this.imgBefore = new FlickrGraphic(images[0], this);
			} else {
				this.imgBefore = new Graphic(images[0], this);
			}

			if(checkFlickr(images[1].src)) {
				this.imgAfter = new FlickrGraphic(images[1], this);
			} else {
				this.imgAfter = new Graphic(images[1], this);
			}

		} else {
			console.warn("The images parameter takes two Image objects.");
		}

		if (!this.imgBefore.label || !this.imgAfter.label) {
			this.options.showLabels = false;
		}
		if (!this.imgBefore.credit || !this.imgAfter.credit) {
			this.options.showCredits = false;
		}
	}

	JXSlider.prototype = {

		updateSlider: function(input, animate) {
			var leftPercent, rightPercent;

			if (this.options.orientation === "vertical") {
				leftPercent = getTopPercent(this.slider, input);
			} else {
				leftPercent = getLeftPercent(this.slider, input);
			}

			leftPercent = Math.round(leftPercent) + "%";
			leftPercentNum = parseInt(leftPercent);
			rightPercent = Math.round(100 - leftPercentNum) + "%";

			if (leftPercentNum > 0 && leftPercentNum < 100) {
				removeClass(this.handle, 'transition');
				removeClass(this.rightImage, 'transition');
				removeClass(this.leftImage, 'transition');

				if (this.options.animate && animate) {
					addClass(this.handle, 'transition');
					addClass(this.leftImage, 'transition');
					addClass(this.rightImage, 'transition');
				}

				if (this.options.orientation === "vertical") {
					this.handle.style.top = leftPercent;
					this.leftImage.style.height = leftPercent;
					this.rightImage.style.height = rightPercent;
				} else {
					this.handle.style.left = leftPercent;
					this.leftImage.style.width = leftPercent;
					this.rightImage.style.width = rightPercent;
				}
				this.sliderPosition = leftPercent;
			}
		},

		getPosition: function() {
			return this.sliderPosition;
		},

		displayLabels: function() {

			makeLabels(this.leftImage, this.imgBefore.label);
			makeLabels(this.rightImage, this.imgAfter.label);

			function makeLabels(element, labelText) {
				console.log(element, labelText);

				label = document.createElement("div");
				label.className = 'jx-label';
				label.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document

				content = document.createElement("span");
				setText(content, labelText);

				label.appendChild(content);
				element.appendChild(label);
			}

		},

		displayCredits: function() {
			credit = document.createElement("div");
			credit.className = "jx-credit";

			text =  "<em>Photo Credits: Before </em>" + this.imgBefore.credit +
					" <em>After </em>" + this.imgAfter.credit;
			credit.innerHTML = text;

			this.wrapper.appendChild(credit);
		},

		setStartingPosition: function(s) {
			this.options.startingPosition = s;
		},

		checkImages: function() {
			if (getImageDimensions(this.imgBefore.image).aspect() ==
				getImageDimensions(this.imgAfter.image).aspect()) {
				return true;
			} else {
				return false;
			}
		},

		setWrapperDimensions: function() {
			ratio = getImageDimensions(this.imgBefore.image).aspect();

			width = getComputedWidthAndHeight(this.wrapper).width;
			height = getComputedWidthAndHeight(this.wrapper).height;
			
			if (width) {
				height = width / ratio;
				this.wrapper.style.height = parseInt(height) + "px";
			} else if (height) {
				width = height * ratio;
				this.wrapper.style.width = parseInt(width) + "px";
			}
		},

		_onLoaded: function() {

			if (this.imgBefore && this.imgBefore.loaded === true &&
				this.imgAfter && this.imgAfter.loaded === true) {

				this.wrapper = document.querySelector(this.selector);
				addClass(this.wrapper, 'juxtapose');

				this.wrapper.style.width = getNaturalDimensions(this.imgBefore.image).width;
				this.setWrapperDimensions();

				this.slider = document.createElement("div");
				this.slider.className = 'jx-slider';
				this.wrapper.appendChild(this.slider);

				if (this.options.orientation != "horizontal") {
					addClass(this.slider, this.options.orientation);
				}

				this.handle = document.createElement("div");
				this.handle.className = 'jx-handle';

				this.rightImage = document.createElement("div");
				this.rightImage.className = 'jx-image right';
				this.rightImage.appendChild(this.imgAfter.image);

				this.leftImage = document.createElement("div");
				this.leftImage.className = 'jx-image left';
				this.leftImage.appendChild(this.imgBefore.image);

				this.labCredit = document.createElement("a");
				this.labCredit.setAttribute('href', 'http://juxtapose.knightlab.com');
				this.labCredit.className = 'jx-knightlab';
				this.labLogo = document.createElement("div");
				this.labLogo.className = 'knightlab-logo';
				this.labCredit.appendChild(this.labLogo);
				this.projectName = document.createElement("span");
				this.projectName.className = 'juxtapose-name';
				setText(this.projectName, 'JuxtaposeJS');
				this.labCredit.appendChild(this.projectName);

				this.slider.appendChild(this.handle);
				this.slider.appendChild(this.leftImage);
				this.slider.appendChild(this.rightImage);
				this.slider.appendChild(this.labCredit);

				this.leftArrow = document.createElement("div");
				this.rightArrow = document.createElement("div");
				this.control = document.createElement("div");
				this.controller = document.createElement("div");

				this.leftArrow.className = 'jx-arrow left';
				this.rightArrow.className = 'jx-arrow right';
				this.control.className = 'jx-control';
				this.controller.className = 'jx-controller';
				
				this.controller.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
				this.controller.setAttribute('role', 'slider');
				this.controller.setAttribute('aria-valuenow', 50);
				this.controller.setAttribute('aria-valuemin', 0);
				this.controller.setAttribute('aria-valuemax', 100);

				this.handle.appendChild(this.leftArrow);
				this.handle.appendChild(this.control);
				this.handle.appendChild(this.rightArrow);
				this.control.appendChild(this.controller);

				this._init();
			}
		},

		_init: function() {

			if (this.checkImages() === false) {
				console.warn(this, "Check that the two images have the same aspect ratio for the slider to work correctly.");
			}

			this.updateSlider(this.options.startingPosition, false);

			if (this.options.showLabels === true) {
				this.displayLabels();
			}

			if (this.options.showCredits === true) {
				this.displayCredits();
			}

			var self = this;
			window.addEventListener("resize", function() {
				self.setWrapperDimensions();
			});

			this.slider.addEventListener("mousedown", function(e) {
				e = e || window.event;
				e.preventDefault();
				self.updateSlider(e, true);
				animate = true;

				this.addEventListener("mousemove", function(e) {
					e = e || window.event;
					e.preventDefault();
					if (animate) { self.updateSlider(e, false); }
				});

				document.addEventListener('mouseup', function(e) {
					e = e || window.event;
					e.preventDefault();
					animate = false;
				});

			});

			this.slider.addEventListener("touchstart", function(e) {
				e = e || window.event;
				e.preventDefault();
				self.updateSlider(e, true);

				this.addEventListener("touchmove", function(e) {
					e = e || window.event;
					e.preventDefault();
					self.updateSlider(event, false);
				});

			});
			
			/* keyboard accessibility */ 
		
			this.handle.addEventListener("keydown", function (e) {
				e = e || window.event;
				var key = event.which || event.keyCode;
				var ariaValue = parseFloat(this.style.left);

			    //move jx-controller left
			    if (key == 37) { 
			    	ariaValue = ariaValue - 1;
					var leftStart = parseFloat(this.style.left) - 1;
					self.updateSlider(leftStart, false);
					self.controller.setAttribute('aria-valuenow', ariaValue);
			    }
			    
			    //move jx-controller right
			    if (key == 39) { 
			    	ariaValue = ariaValue + 1;
					var rightStart = parseFloat(this.style.left) + 1;
					self.updateSlider(rightStart, false);
					self.controller.setAttribute('aria-valuenow', ariaValue);
			    }
			});
			
			//toggle right-hand image visibility
			this.leftImage.addEventListener("keydown", function (event) {
    			 var key = event.which || event.keyCode;
				    if ((key == 13) || (key ==32)) { 
				   		self.updateSlider("90%", true);
				   	    self.controller.setAttribute('aria-valuenow', 90);
				    }
			});
			
			//toggle left-hand image visibility
			this.rightImage.addEventListener("keydown", function (event) {
    			 var key = event.which || event.keyCode;
				    if ((key == 13) || (key ==32)) { 
						self.updateSlider("10%", true);
						self.controller.setAttribute('aria-valuenow', 10);
				    }
			});
		}
	};

	/*
		Given an element that is configured with the proper data elements, make a slider out of it.
		Normally this will just be used by scanPage.
	*/
	juxtapose.makeSlider = function (element, idx) {
		if (typeof idx == 'undefined') {
			idx = juxtapose.sliders.length; // not super threadsafe...
		}

		var w = element;

		var images = w.querySelectorAll('img');

		var options = {};
		// don't set empty string into options, that's a false false.
		if (w.getAttribute('data-animate')) { 
			options.animate = w.getAttribute('data-animate'); 
		}
		if (w.getAttribute('data-showlabels')) { 
			options.showLabels = w.getAttribute('data-showlabels'); 
		}
		if (w.getAttribute('data-showcredits')) { 
			options.showCredits = w.getAttribute('data-showcredits'); 
		}
		if (w.getAttribute('data-startingposition')) { 
			options.startingPosition = w.getAttribute('data-startingposition'); 
		}
		if (w.getAttribute('data-orientation')) { 
			options.orientation = w.getAttribute('data-orientation'); 
		}

		specificClass = 'juxtapose-' + idx;
		addClass(element, specificClass);

		selector = '.' + specificClass;

		if (w.innerHTML) {
			w.innerHTML = '';
		} else {
			w.innerText = '';
		}

		slider = new juxtapose.JXSlider(
			selector,
			[
				{
					src: images[0].src,
					label: images[0].getAttribute('data-label'),
					credit: images[0].getAttribute('data-credit')
				},
				{
					src: images[1].src,
					label: images[1].getAttribute('data-label'),
					credit: images[1].getAttribute('data-credit')
				}
			],
			options
		);
		juxtapose.sliders.push(slider);

	};

	//Enable HTML Implementation
	juxtapose.scanPage = function() {
	    var elements = document.querySelectorAll('.juxtapose');
    	
    	for (var i = 0; i < elements.length; i++) {
			juxtapose.makeSlider(elements[i], i);
		}
	};

	juxtapose.JXSlider = JXSlider;
	window.juxtapose = juxtapose;

	juxtapose.scanPage();

}(document, window));


// addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
(function(win, doc){
	if(win.addEventListener)return;		//No need to polyfill

	function docHijack(p){var old = doc[p];doc[p] = function(v){return addListen(old(v));};}
	function addEvent(on, fn, self){
		return (self = this).attachEvent('on' + on, function(e){
			var e = e || win.event;
			e.preventDefault  = e.preventDefault  || function(){e.returnValue = false;};
			e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true;};
			fn.call(self, e);
		});
	}
	function addListen(obj, i){
		if(i = obj.length)while(i--)obj[i].addEventListener = addEvent;
		else obj.addEventListener = addEvent;
		return obj;
	}

	addListen([doc, win]);
	if('Element' in win)win.Element.prototype.addEventListener = addEvent;			//IE8
	else{																			//IE < 8
		doc.attachEvent('onreadystatechange', function(){addListen(doc.all);});		//Make sure we also init at domReady
		docHijack('getElementsByTagName');
		docHijack('getElementById');
		docHijack('createElement');
		addListen(doc.all);	
	}
})(window, document);
