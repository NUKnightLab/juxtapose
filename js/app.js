(function (document, window) {

	function Graphic(properties) {
		this.image = new Image();
		this.image.src = properties.src;
		this.label = properties.label;
		this.credit = properties.credit;
	}

	Graphic.prototype.getImageDimensions = function() {
		var dimensions = {
			width: this.image.naturalWidth,
			height: this.image.naturalHeight,
			aspect: function() { return (this.width / this.height); }
		};
		return dimensions;
	};

	var imageSlider = function(id, images, options) {

		function setImage(element, url) {
			var property = "url(" + url + ")";
			element.style.backgroundImage = property;
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
				this.imgBefore = new Graphic(images[0]);
				this.imgAfter = new Graphic(images[1]);
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
				if (a < 1) {

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
				if (this.imgBefore.getImageDimensions().aspect() == 
					this.imgAfter.getImageDimensions().aspect()) {
					return true;
				} else {
					return false;
				}
			},

			setSliderDimensions: function() {

				ratio = this.imgBefore.getImageDimensions().aspect();

				width = (parseInt(getComputedStyle(this.slider)['width']));
				height = (parseInt(getComputedStyle(this.slider)['height']));

				if (width) {
					height = width * (1 / ratio);
					this.slider.style.height = height + "px";
				} else if (height) {
					width = height * ratio;
					this.slider.style.width = width + "px";
				} else {
					w = 600;
					h = width * (1 / ratio);
					this.slider.style.width = maxwidth + "px";
					this.slider.style.height = maxheight + "px";
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


					this.slider = document.createElement("div");
					this.slider.className = 'klba-slider';
					this.wrapper.appendChild(this.slider);

					this.setSliderDimensions()

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
					console.warn("You should check to make sure that the two images have the same aspect ratio for the slider to work correctly.");
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
				label: images[0].alt,
				credit: images[0].getAttribute('data-credit')
			},
			{
				src: images[1].src,
				label: images[1].alt,
				credit: images[1].getAttribute('data-credit')
			}
		], options);

}(document, window));



