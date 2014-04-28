(function (document, window) {

	// TOUCHES = [];

	// function detectDrag(e) {
	// 	TOUCHES = (e.changedTouches);
	// 	console.log(TOUCHES);
	// 	return true;
	// }

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
		console.log(dimensions);
		return dimensions;
	};

	var imageSlider = function(id, images, options) {

		function setBackgroundImage(element, url) {
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
				this.options[i] = options[i];
			}

			if (images.length == 2) {
				this.imgBefore = new Graphic(images[0]);
				this.imgAfter = new Graphic(images[1]);
			} else {
				throw new Error("The images paramater takes two Image objects.");
			}

			//Image Loading
			var load1 = false;
			var load2 = false;
			
			var self = this;

			this.imgBefore.image.onload = function() {
				console.log(self);
				load1 = true;
				self._onLoaded();
			};

			this.imgAfter.image.onload = function() {
				load2 = true;
				self._onLoaded();
			};

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

				_onLoaded: function() {
					
					//If both images have loaded
					if (load1 & load2) {

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
						this._init();
					}
				},

				_init: function() {

					if (this.checkImages() == false) {
						throw new Error("The two images need to have the same dimensions.");
					}

					var rightStart = 100 - parseInt(this.options.startingPosition) + "%";

					this.leftImage.style.width = this.options.startingPosition;
					this.rightImage.style.width = rightStart;
					this.handle.style.left = this.options.startingPosition;


					setBackgroundImage(this.leftImage, this.imgBefore.image.src);
					setBackgroundImage(this.rightImage, this.imgAfter.image.src);

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
						dragging = true;

						this.addEventListener("touchmove", function(event) {
							swipe = detectDrag(event);
							if (dragging) {
								self.updateSlider(event, true);
							}
						});
					});
				}
			}

		}

		return new ImageSlider(id, images, options);
	};
		
	window.imageSlider = imageSlider;

}(document, window));
