(function (document, window) {

	var flickr_key = "d90fc2d1f4acc584e08b8eaea5bf4d6c";

	function Graphic(properties) {
		this.image = new Image();
		this.image.src = properties.src;
		this.label = properties.label;
		this.credit = properties.credit;
	}

	function FlickrGraphic(properties) {
		this.image = new Image();
		
		self = this;
		this.flickrID = this.getFlickrID(properties.src);
		this.callFlickrAPI(this.flickrID, self);

		this.label = properties.label;
		this.credit = properties.credit;
	}

	FlickrGraphic.prototype = {
		getFlickrID: function(url) {
			var idx = url.indexOf("flickr.com/photos/");
			var pos = idx + "flickr.com/photos/".length;
			var photo_info = url.substr(pos)
			if (photo_info.indexOf('/') == -1) return null;
			if (photo_info.indexOf('/') == 0) photo_info = photo_info.substr(1);
			id = photo_info.split("/")[1];
			return id;
		},

		callFlickrAPI: function(id, self) {
			var flickr_best_size = "Large";
			// var url = "//api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=" + flickr_key + "&photo_id=" + id + "&format=json&jsoncallback=?";
			var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=6de5251eb45db0fe719bbb2d8bf133d9&photo_id=14220736823&format=json&nojsoncallback=1&auth_token=72157644462885218-c4758bc9e4cc0ccf&api_sig=e97d1ccff0bbadbc918cbb9b2b96ae43'
			$.getJSON(url, function(d) {
				for(var i = 0; i < d.sizes.size.length; i++) {
					if (d.sizes.size[i].label == flickr_best_size) {
						flickr_url = d.sizes.size[i].source;
					}
				}
				self.setFlickrImage(flickr_url);
			});
		},

		setFlickrImage: function(src) {
			this.image.src = src;
		}
	}


	var imageSlider = function(id, images, options) {

		function setImage(element, url) {
			var property = "url(" + url + ")";
			element.style.backgroundImage = property;
		}

		getImageDimensions = function(img) {
			var dimensions = {
				width: img.naturalWidth,
				height: img.naturalHeight,
				aspect: function() { return (this.width / this.height); }
			};
			return dimensions;
		};

		function checkFlickr(url) {
			var idx = url.indexOf("flickr.com/photos/");
			if (idx == -1) {
				return false;
			} else {
				return true;
			}
		}

		function ImageSlider(id, images, options) {

			var i;
			this.options = {
				animate: true,
				showLabels: true,
				showCredits: true,
				startingPosition: "50%"
			};

			for (i in options) {
				if(options[i]) {
					this.options[i] = options[i];
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
				console.warn("The images paramater takes two Image objects.");
			}

			if (!this.imgBefore.label || !this.imgAfter.label) {
				this.options.showLabels = false;
			}
			if (!this.imgBefore.credit || !this.imgAfter.credit) {
				this.options.showCredits = false;
			}

  			this.load1 = false;
  			this.load2 = false;
  			
  			self = this;
  			this.imgBefore.image.onload = function() {
  				self.load1 = true;
  				self._onLoaded();
 			}
  
  			this.imgAfter.image.onload = function() {
  				self.load2 = true;
  				self._onLoaded();
			}

		}		

		ImageSlider.prototype = {

			updateSlider: function(e, dragging) {

				var sliderRect = this.slider.getBoundingClientRect()
				var offset = {
				  top: sliderRect.top + document.body.scrollTop,
				  left: sliderRect.left + document.body.scrollLeft
				};

				var width = this.slider.offsetWidth;

				var relativeX = e.pageX - offset.left;

				var leftPercent = (relativeX / width) * 100 + "%";
				var rightPercent = 100 - ((relativeX / width) * 100) + "%";
				
				var a = (relativeX / width);
				if (a > 0 && a < 1) {

					this.handle.classList.remove("transition");
					this.rightImage.classList.remove("transition");
					this.leftImage.classList.remove("transition");

					if(this.options.animate && !dragging) {
						this.handle.classList.add("transition");
						this.leftImage.classList.add("transition");
						this.rightImage.classList.add("transition");
					}

					this.handle.style.left = leftPercent;
					this.leftImage.style.width = leftPercent;
					this.rightImage.style.width = rightPercent;
				}
			},

			displayLabels: function() {
				leftDate = document.createElement("div");
				leftDate.className = 'klba-label';
				leftDate.textContent = this.imgBefore.label;
				rightDate = document.createElement("div");
				rightDate.className = 'klba-label';
				rightDate.textContent = this.imgAfter.label;

				this.leftImage.appendChild(leftDate);
				this.rightImage.appendChild(rightDate);
			},

			displayCredits: function() {
				credit = document.createElement("div");
				credit.className = "klba-credit";

				text = 	"<em>Before </em>" + this.imgBefore.credit + 
						" <em>After </em>" + this.imgAfter.credit;
				credit.innerHTML = text;

				this.wrapper.appendChild(credit);
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

				width = (parseInt(getComputedStyle(this.wrapper)['width']));
				height = (parseInt(getComputedStyle(this.wrapper)['height']));

				if (width) {
					height = width * (1 / ratio);
					this.wrapper.style.height = height + "px";
				} else if (height) {
					width = height * ratio;
					this.wrapper.style.width = width + "px";
				} else {
					// w = 600;
					// h = width * (1 / ratio);
					// this.slider.style.width = maxwidth + "px";
					// this.slider.style.height = maxheight + "px";
				}
			},

			_onLoaded: function() {
				if (this.load1 && this.load2) {
					//Create the HTML structure for the slider
					this.wrapper = document.getElementById(id);

					if (this.wrapper.classList) {
						this.wrapper.classList.add("klba-wrapper");
					} else {
						this.wrapper.className += ' ' + "klba-wrapper";
					}

					self = this;

					this.wrapper.style.width = this.imgBefore.image.naturalWidth
					self.setWrapperDimensions();
					window.onresize = function(event) {
						self.setWrapperDimensions()
					};


					this.slider = document.createElement("div");
					this.slider.className = 'klba-slider';
					this.wrapper.appendChild(this.slider);


					this.handle = document.createElement("div");
					this.handle.className = 'klba-handle';

					this.rightImage = document.createElement("div");
					this.rightImage.className = 'klba-image right';
					this.leftImage = document.createElement("div");
					this.leftImage.className = 'klba-image left'

					this.slider.appendChild(this.handle);
					this.slider.appendChild(this.leftImage);
					this.slider.appendChild(this.rightImage);

					leftArrow = document.createElement("div");
					rightArrow = document.createElement("div");
					control = document.createElement("div");
					controller = document.createElement("div");

					leftArrow.className = 'klba-arrow left';
					rightArrow.className = 'klba-arrow right';
					control.className = 'klba-control';
					controller.className = 'klba-controller';

					this.handle.appendChild(leftArrow);
					this.handle.appendChild(control);
					this.handle.appendChild(rightArrow);
					control.appendChild(controller);

					this.dragging = false;

					//Add Interactivity
					this._init(this);
				}
			},

			_init: function() {

				if (this.checkImages() == false) {
					console.warn("Check that the two images have the same aspect ratio for the slider to work correctly.");
				}

				var rightStart = 100 - parseInt(this.options.startingPosition) + "%";


				this.leftImage.style.width = this.options.startingPosition;
				this.rightImage.style.width = rightStart;
				this.handle.style.left = this.options.startingPosition;

				setImage(this.leftImage, this.imgBefore.image.src);
				setImage(this.rightImage, this.imgAfter.image.src);

				if (this.options.showLabels) {
					this.displayLabels();
				}

				if (this.options.showCredits) {
					this.displayCredits();
				}


				var self = this;

				this.slider.addEventListener("mousedown", function(d) {
					d.preventDefault();
					self.updateSlider(d, false);
					dragging = true;

					this.addEventListener("mousemove", function(event) {
						if (dragging) {
							self.updateSlider(event, true);
						}
					});

					document.addEventListener('mouseup', function() {
						dragging = false;
					});

					this.addEventListener('mouseleave', function() {
						dragging = false;
					});
				});

				this.slider.addEventListener("touchstart", function(d) {
					d.preventDefault();
					self.updateSlider(d, false)

					this.addEventListener("touchmove", function(event) {
						self.updateSlider(event, true);
					});
				});
			}
		}
		return new ImageSlider(id, images, options);
	};
		
	window.imageSlider = imageSlider;

	var wrapper = document.getElementById('klba-wrapper');
	var images = wrapper.querySelectorAll('img');
		
	var options = {
		animate: wrapper.getAttribute('data-animate'),
		showLabels: wrapper.getAttribute('data-showlabels'),
		showCredits: wrapper.getAttribute('data-showcredits'),
		startingPosition: wrapper.getAttribute('data-startingposition')
	};

	wrapper.innerHTML = '';

	slider = new imageSlider('klba-wrapper', 
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
		], options);

}(document, window));



