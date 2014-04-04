
function Image(url) {
	this.url = '';
	this.title = '';
}

$(document).ready(function() {
	
	var wrapper = $('div.wrapper');
	
	$('div.wrapper').append("<div class='image left'></div>");
	$('div.wrapper').append("<div class='image right'></div>");
	
	leftImage = $('div.image.left')
	rightImage = $('div.image.right')

	leftImage.width('50%');
	rightImage.width('50%');

	wrapper.mousedown(function(e) {

		$(this).mousemove(function(d) {
			updateSlider(d);
		});

		$(this).mouseup(function(){
			e.unbind();
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

	//createBASlider();

});