
(function (document, window) {

	var imageSlider = function(id, images, options) {
	
		function setBackgroundImage(element, url) {
			var property = "url(" + url + ")";
			element.css("background-image", property);
		}

		function Graphic(a) {
			this.imgSrc = a.imgSrc;
			this.title = a.title;
			this.credit = a.credit
		};

		function ImageSlider(id, images, options) {
			var i;

			if (images.length == 2) {
				this.imgBefore = new Graphic(images[0]);
				this.imgAfter = new Graphic(images[1]);
			} else {
				throw new Error("The images paramater takes two Image objects.");
			}

			this.options = {
				animate: true,
				transition: 400,
				showDates: true
			};

			for (i in options) {
				this.options[i] = options[i];
			}

			this.wrapper = $('#' + id);
			this.wrapper.append("<div class='image left'></div>");
			this.wrapper.append("<div class='image right'></div>");
			
			this.leftImage = $('div.image.left')
			this.rightImage = $('div.image.right')

			this._init(this);
		};

		ImageSlider.prototype = {

			_init: function() {
				this.leftImage.width('50%');
				this.rightImage.width('50%');
				setBackgroundImage(this.leftImage, this.imgBefore.imgSrc);
				setBackgroundImage(this.rightImage, this.imgAfter.imgSrc);
			}

		};

		return new ImageSlider(id, images, options);
	};
	
	window.imageSlider = imageSlider;

}(document, window));