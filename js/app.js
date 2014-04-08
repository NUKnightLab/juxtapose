
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
			};

			for (i in options) {
				this.options[i] = options[i];
			}

			this.wrapper = $('#' + id);
			
			this.wrapper.append("<div class='handle'></div>");
			this.wrapper.append("<div class='image left'></div>");
			this.wrapper.append("<div class='image right'></div>");
			
			this.handle = $('div.handle');
			this.handle.append("<div class='arrow left'></div>");
			this.handle.append("<div class='control'></div>");
			this.handle.append("<div class='arrow right'></div>");
			
			this.leftImage = $('div.image.left');
			this.rightImage = $('div.image.right');

			this.dragging = false;

			this._init(this);
		}

		ImageSlider.prototype = {

			updateSlider: function(e) {
				var offset = this.wrapper.offset();
				var width = this.wrapper.width();
				var relativeX = e.pageX - offset.left;


				var leftPercent = (relativeX / width) * 100 + "%";
				var rightPercent = (100 - (relativeX / width) * 100) + "%";

				
				var a = (relativeX / width) * 100;
				if (a < 100) {

					if(this.options.animate) {
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

			_init: function() {
				this.leftImage.width('50%');
				this.rightImage.width('50%');
				this.handle.css({left: '50%'});

				setBackgroundImage(this.leftImage, this.imgBefore.imgSrc);
				setBackgroundImage(this.rightImage, this.imgAfter.imgSrc);

				if (this.options.showDates) {
					this.displayDates();
				}
				var self = this;
				this.wrapper.mousedown(function(d) {	
					d.preventDefault();
					self.updateSlider(d);
					dragging = true;

					$(this).mousemove(function(e) {
						if (dragging) {
							self.updateSlider(e);
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