(function (document, window) {

	var imageSlider = function(id, images, options) {
	
		function setBackgroundImage(element, url) {
			var property = "url(" + url + ")";
			element.css("background-image", property);
		}

		function Image(a) {
			this.imgSrc = a.imgSrc;
			this.date = a.date;
			this.credit = a.credit;
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
				transition: 100,
				showDates: true,
				showCredits: true
			};

			for (i in options) {
				this.options[i] = options[i];
			}

			this.wrapper = $('#' + id);
			this.wrapper.addClass("sliderWrapper")

			this.wrapper.append("<div class='slider'></div>");
			
			this.slider = $('div.slider');

			this.slider.append("<div class='handle'></div>");
			this.slider.append("<div class='image left'></div>");
			this.slider.append("<div class='image right'></div>");
			
			this.handle = $('div.handle');
			this.handle.append("<div class='arrow left'></div>");
			this.handle.append("<div class='control'><div class='controller'></div></div>");
			this.handle.append("<div class='arrow right'></div>");

			this.leftImage = $('div.image.left');
			this.rightImage = $('div.image.right');

			this.dragging = false;

			this._init(this);
		}

		ImageSlider.prototype = {

			updateSlider: function(e, dragging) {

				this.handle.stop();
				this.rightImage.stop();
				this.leftImage.stop();

				var offset = this.slider.offset();
				var width = this.slider.width();
				var relativeX = e.pageX - offset.left;

				var leftPercent = (relativeX / width) * 100 + "%";
				var rightPercent = (100 - (relativeX / width) * 100) + "%";

				
				var a = (relativeX / width) * 100;
				if (a < 100) {

					if(this.options.animate && dragging) {
						this.handle.animate({left: leftPercent}, this.transition)
						this.leftImage.animate({width: leftPercent}, this.transition);
						this.rightImage.animate({width: rightPercent}, this.transition);
					} else {
						this.handle.css({left: leftPercent});
						this.leftImage.width(leftPercent);
						this.rightImage.width(rightPercent);
					}

				}

			},

			displayDates: function() {
				this.leftImage.append("<div class='date'></div>");
				this.rightImage.append("<div class='date'></div>");

				$('div.image.left div.date').text(this.imgBefore.date);
				$('div.image.right div.date').text(this.imgAfter.date);
			},

			displayCredits: function() {
				this.wrapper.append("<div class='credit'></div>")
				this.credit = $('div.credit');

				this.credit.append("<em>Before: </em>" + this.imgBefore.credit);
				this.credit.append("<br><em>After: </em>" + this.imgAfter.credit);

			},

			_init: function() {
				this.leftImage.width('50%');
				this.rightImage.width('50%');
				this.handle.css({left: '50%'});

				setBackgroundImage(this.leftImage, this.imgBefore.imgSrc);
				setBackgroundImage(this.rightImage, this.imgAfter.imgSrc);

				if (this.options.showDates) {
					this.displayDates();
				}

				if (this.options.showCredits) {
					this.displayCredits();
				}


				var self = this;
				this.slider.mousedown(function(d) {	
					d.preventDefault();
					self.updateSlider(d, true);
					dragging = true;

					$(this).mousemove(function(e) {
						if (dragging) {
							self.updateSlider(e, false);
						}
					});

					$(document).mouseup(function() {
						dragging = false;
					});

					$(this).mouseleave(function() {
						dragging = false;
					});
				});

			}
		}

		return new ImageSlider(id, images, options);
	};
	
	window.imageSlider = imageSlider;

}(document, window));
