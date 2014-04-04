
function Image(url) {
	this.url = '';
	this.title = '';
}

$(document).ready(function() {

	function createBASlider() {
		$('div.wrapper').append("<div class='image left'></div>");
		$('div.wrapper').append("<div class='image right'></div>");
	}

	createBASlider();

});