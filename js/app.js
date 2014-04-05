
(function (document, window) {

	var imageSlider = function(element, images, options) {

		function Image(a) {
			this.url = a.url;
			this.title = a.title;
		};

		function ImageSlider(elementID, images, options) {
			var i;

			if (images.length == 2) {
				this.images = images;
				console.log(images[1].url);
			} else {
				throw new Error("The images paramater takes two Image objects.");
			}

			this.options = {
				animate: true,
				transition: 400
			};

			for (i in options) {
				this.options[i] = options[i];
			}

			this.wrapper = $('#' + elementID);

			this._init(this);
		};

		ImageSlider.prototype = {

			_init: function() {
				this.wrapper.append("<div class='image left'></div>");
				this.wrapper.append("<div class='image right'></div>");
				
				this.leftImage = $('div.image.left')
				this.rightImage = $('div.image.right')

				this.leftImage.width('50%');
				this.rightImage.width('50%');
			}

		};

		return new ImageSlider(element, images, options);
	};
	
	window.imageSlider = imageSlider;

}(document, window));