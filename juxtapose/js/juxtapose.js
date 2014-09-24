(function (document, window) {

	var juxtapose = { sliders: [] };

	var flickr_key = "d90fc2d1f4acc584e08b8eaea5bf4d6c";
	var FLICKR_SIZE_PREFERENCES = ['Large', 'Medium'];

	function Graphic(properties) {
		this.image = new Image();
		this.image.src = properties.src;
		this.label = properties.label || false;
		this.credit = properties.credit || false;
	}


	function FlickrGraphic(properties) {
		var self = this;
		this.image = new Image();

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
					console.log(data);
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
			console.log(dict);
			for (var j = 0; j < FLICKR_SIZE_PREFERENCES.length; j++) {
				if (FLICKR_SIZE_PREFERENCES[j] in dict) {
					console.log("hello");
					return dict[FLICKR_SIZE_PREFERENCES[j]];
				}
			}
			return ary[0].source;
		}
	};

	function setImage(element, url) {
		var property = "url(" + url + ")";
		element.style.backgroundImage = property;
	}

	function getImageDimensions(img) {
		var dimensions = {
			width: img.naturalWidth,
			height: img.naturalHeight,
			aspect: function() { return (this.width / this.height); }
		};
		return dimensions;
	}

	function checkFlickr(url) {
		var idx = url.indexOf("flickr.com/photos/");
		if (idx == -1) {
			return false;
		} else {
			return true;
		}
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
			startingPosition: "50%"
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
				this.imgBefore = new FlickrGraphic(images[0]);
			} else {
				this.imgBefore = new Graphic(images[0]);
			}

			if(checkFlickr(images[1].src)) {
				this.imgAfter = new FlickrGraphic(images[1]);
			} else {
				this.imgAfter = new Graphic(images[1]);
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

		this.load1 = false;
		this.load2 = false;

		var self = this;

		this.imgBefore.image.onload = function() {
			self.load1 = true;
			self._onLoaded();
		};

		this.imgAfter.image.onload = function() {
			self.load2 = true;
			self._onLoaded();
		};
	}

	function isMoveEvent(evt) {
		return (evt instanceof MouseEvent ||
					(typeof(TouchEvent) != 'undefined' && evt instanceof TouchEvent)
				);
	}
	JXSlider.prototype = {

		updateSlider: function(input, animate) {
			var leftPercent, rightPercent;
			var num = -1;

			var sliderRect = this.slider.getBoundingClientRect();
			var offset = {
				top: sliderRect.top + document.body.scrollTop,
				left: sliderRect.left + document.body.scrollLeft
			};

			var width = this.slider.offsetWidth;

			if (isMoveEvent(input)) {
				var relativeX = input.pageX - offset.left;
				leftPercent = (relativeX / width) * 100 + "%";
				rightPercent = 100 - ((relativeX / width) * 100) + "%";
			} else if (typeof(input) === "string" || typeof(input) === "number") {
				if (typeof(input) === "string") {
					num = parseInt(input, 10);
				} else {
					num = input;
				}
				leftPercent = num + "%";
				rightPercent = (100 - num) + "%";
			}

			var eventCheck = (relativeX / width);
			var numCheck = parseInt(num, 10);

			if ((eventCheck > 0 && eventCheck < 1) || (numCheck >= 0 && numCheck <= 100)) {
				this.handle.classList.remove("transition");
				this.rightImage.classList.remove("transition");
				this.leftImage.classList.remove("transition");

				if((this.options.animate && animate)) {
					this.handle.classList.add("transition");
					this.leftImage.classList.add("transition");
					this.rightImage.classList.add("transition");
				}

				this.handle.style.left = leftPercent;
				this.leftImage.style.width = leftPercent;
				this.rightImage.style.width = rightPercent;
				this.sliderPosition = leftPercent;
			}
		},
		getPosition: function() {
			return this.sliderPosition;
		},
		displayLabels: function() {
			leftDate = document.createElement("div");
			leftDate.className = 'jx-label';
			leftDate.textContent = this.imgBefore.label;
			rightDate = document.createElement("div");
			rightDate.className = 'jx-label';
			rightDate.textContent = this.imgAfter.label;

			this.leftImage.appendChild(leftDate);
			this.rightImage.appendChild(rightDate);
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

			width = (parseInt(getComputedStyle(this.wrapper)['width'], 10));
			height = (parseInt(getComputedStyle(this.wrapper)['height'], 10));

			if (width) {
				height = width * (1 / ratio);
				this.wrapper.style.height = height + "px";
			} else if (height) {
				width = height * ratio;
				this.wrapper.style.width = width + "px";
			} else {
				//do something;
			}
		},

		_onLoaded: function() {

			if (this.load1 && this.load2) {

				this.wrapper = document.querySelector(this.selector);

				this.wrapper.classList.add("juxtapose");

				this.wrapper.style.width = this.imgBefore.image.naturalWidth;
				this.setWrapperDimensions();

				this.slider = document.createElement("div");
				this.slider.className = 'jx-slider';
				this.wrapper.appendChild(this.slider);

				this.handle = document.createElement("div");
				this.handle.className = 'jx-handle';

				this.rightImage = document.createElement("div");
				this.rightImage.className = 'jx-image right';
				this.leftImage = document.createElement("div");
				this.leftImage.className = 'jx-image left';

				this.labCredit = document.createElement("a");
				this.labCredit.setAttribute('href', 'http://juxtapose.knightlab.com');
				this.labCredit.className = 'jx-knightlab';
				this.labLogo = document.createElement("div");
				this.labLogo.className = 'knightlab-logo';
				this.labCredit.appendChild(this.labLogo);
				this.projectName = document.createElement("span");
				this.projectName.className = 'juxtapose-name'
				this.projectName.textContent = "JuxtaposeJS";
				this.labCredit.appendChild(this.projectName);
				// this.labImage = new Image();
				// this.labImage.className = 'jx-knightlab-image';
				// this.labImage.src = 'http://cdn.knightlab.com/libs/juxtapose/latest/juxtapose-logo.png';
				// this.labCredit.appendChild(this.labImage);

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

			setImage(this.leftImage, this.imgBefore.image.src);
			setImage(this.rightImage, this.imgAfter.image.src);

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

			this.slider.addEventListener("mousedown", function(d) {
				d.preventDefault();
				self.updateSlider(d, true);
				animate = true;

				this.addEventListener("mousemove", function(event) {
					if (animate) {
						self.updateSlider(event, false);
					}
				});

				document.addEventListener('mouseup', function() {
					animate = false;
				});

			});

			this.slider.addEventListener("touchstart", function(d) {
				d.preventDefault();
				self.updateSlider(d, true);

				this.addEventListener("touchmove", function(event) {
					self.updateSlider(event, false);
				});
			});
		}
	};

	/*
		Given an element that is configured with the proper data elements, make a slider out of it.
		Normally this will just be used by scanPage.
	*/
	juxtapose.makeSlider = function ($elem,idx) {
		if (typeof idx == 'undefined') {
			idx = juxtapose.sliders.length; // not super threadsafe...
		}

		var w = $elem;

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

		specificClass = 'juxtapose-' + idx;
		w.classList.add(specificClass);
		selector = '.' + specificClass;

		w.innerHTML = '';
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
		sliders = [];

		[].map.call(document.querySelectorAll('.juxtapose'), function(obj, i) {
			juxtapose.makeSlider(obj, i);
		});
	};

	juxtapose.JXSlider = JXSlider;
	window.juxtapose = juxtapose;

	juxtapose.scanPage();

}(document, window));
