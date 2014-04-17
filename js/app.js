(function (document, window) {

	var imageSlider = function(id, images, options) {
	
		function setBackgroundImage(element, url) {
			var property = "url(" + url + ")";
			element.style.backgroundImage = property;
		}

		function Image(properties) {
			this.imgSrc = properties.imgSrc;
			this.label = properties.label;
			this.credit = properties.credit;
		}

		function ImageSlider(id, images, options) {
			var i;

			if (images.length == 2) {
				this.imgBefore = new Image(images[0]);
				this.imgAfter = new Image(images[1]);
			} else {
				throw new Error("The images paramater takes two Image objects.");
			}

			this.options = {
				animate: true,
				duration: 100,
				showDates: true,
				showCredits: true,
				startingPosition: "50%"
			};

			for (i in options) {
				this.options[i] = options[i];
			}

			this.wrapper = document.getElementById(id);

			if (this.wrapper.classList) {
				this.wrapper.classList.add("slider_wrapper");
			} else {
				this.wrapper.className += ' ' + "slider_wrapper";
			}

			this.slider = document.createElement("div");
			this.slider.className = 'slider';
			this.wrapper.appendChild(this.slider);

			this.handle = document.createElement("div");
			this.handle.className = 'handle';

			this.rightImage = document.createElement("div");
			this.rightImage.className = 'image right';
			this.leftImage = document.createElement("div");
			this.leftImage.className = 'image left'

			this.slider.appendChild(this.handle);
			this.slider.appendChild(this.leftImage);
			this.slider.appendChild(this.rightImage);

			leftArrow = document.createElement("div");
			rightArrow = document.createElement("div");
			control = document.createElement("div");
			controller = document.createElement("div");

			leftArrow.className = 'arrow left';
			rightArrow.className = 'arrow right';
			control.className = 'control';
			controller.className = 'controller';

			this.handle.appendChild(leftArrow);
			this.handle.appendChild(control);
			this.handle.appendChild(rightArrow);
			control.appendChild(controller);

			this.dragging = false;

			this._init(this);
		}

		ImageSlider.prototype = {

			updateSlider: function(e, dragging) {

				var sliderRect = this.slider.getBoundingClientRect()
				var offset = {
				  top: sliderRect.top + document.body.scrollTop,
				  left: sliderRect.left + document.body.scrollLeft
				}

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

			displayDates: function() {
				leftDate = document.createElement("div");
				leftDate.className = 'label';
				leftDate.textContent = this.imgBefore.label;
				rightDate = document.createElement("div");
				rightDate.className = 'label';
				rightDate.textContent = this.imgAfter.label;

				this.leftImage.appendChild(leftDate);
				this.rightImage.appendChild(rightDate);
			},

			displayCredits: function() {
				credit = document.createElement("div");
				credit.className = "credit";

				text = 	"<em>Before </em>" + this.imgBefore.credit + 
						" <em>After </em>" + this.imgAfter.credit;
				credit.innerHTML = text;

				this.wrapper.appendChild(credit);
			},

			_init: function() {

				rightStart = 100 - parseInt(this.options.startingPosition) + "%";

				this.leftImage.style.width = this.options.startingPosition;
				this.rightImage.style.width = rightStart;
				this.handle.style.left = this.options.startingPosition;


				setBackgroundImage(this.leftImage, this.imgBefore.imgSrc);
				setBackgroundImage(this.rightImage, this.imgAfter.imgSrc);

				if (this.options.showDates) {
					this.displayDates();
				}

				if (this.options.showCredits) {
					this.displayCredits();
				}


				var self = this;
				this.slider.addEventListener("mousedown", function(d) {
					d.preventDefault();
					self.updateSlider(d, false);
					dragging = true;

					this.addEventListener("mousemove", function(e) {
						if (dragging) {
							self.updateSlider(e, true);
						}
					});

					document.addEventListener('mouseup', function() {
						dragging = false;
					});

					this.addEventListener('mouseleave', function() {
						dragging = false;
					});

				});

			}
		}

		return new ImageSlider(id, images, options);
	};
	
	window.imageSlider = imageSlider;

}(document, window));
