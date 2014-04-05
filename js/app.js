$(document).ready(function() {
	
	function Image(url) {
		this.url = '';
		this.title = '';
	}

	var wrapper = $('div.wrapper');
	
	$('div.wrapper').append("<div class='image left'></div>");
	$('div.wrapper').append("<div class='image right'></div>");
	
	leftImage = $('div.image.left')
	rightImage = $('div.image.right')

	leftImage.width('50%');
	rightImage.width('50%');

	wrapper.mousedown(function(e) {
	//http://stackoverflow.com/questions/1909760/how-to-get-mouseup-to-fire-once-mousemove-complete
	
		var dragging = true; 

		$(this).mousemove(function(e) {
			e.preventDefault();
			if (dragging) {
				updateSlider(e);
			}
			return false;
		});

		$(document).mouseup(function() {
			dragging = false;
		});

		$(this).mouseleave(function() {
			dragging = false;
		});

	});

	function updateSlider(e) {
		var offset = wrapper.offset();
		var width = wrapper.width();
		var relX = e.pageX - offset.left;

		var leftPercent = (relX / width) * 100 + "%";
		var rightPercent = (100 - (relX / width) * 100) + "%";

		leftImage.width(leftPercent);
		rightImage.width(rightPercent);
	}

});