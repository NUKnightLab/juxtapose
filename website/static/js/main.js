// smoothScroll.init({
//     offset: 50
// });


var stepOnePreview;

$("form#stepOne").submit(function() {
    event.preventDefault();

    $this = $(this);
    data = objectFromForm($this);

    if (typeof(stepOnePreview) !== 'undefined') {
        $('#stepOnePreview').empty();
    }
    stepOnePreview = new JXSlider('#stepOnePreview', [
            {
                src: data.beforeImgSrc,
                label: data.beforeImgLabel
            },
            {
                src: data.afterImgSrc,
                label: data.afterImgLabel
            }
        ], {});
    smoothScroll.animateScroll(null, '#stepOnePreview', {offset: 50});

});


$("form#stepTwo").submit(function() {
     event.preventDefault();

    $this = $(this);
    data = objectFromForm($this);
    console.log(data);
});   




function objectFromForm($form) {
    var formData = {};
    $.each($form.serializeArray(), function() {
        formData[this.name] = this.value;
    })
    return formData;
}

function validateURL(url) {

}


