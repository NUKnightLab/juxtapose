// smoothScroll.init({
//     offset: 50
// });


var stepOnePreview;
var stepTwoPreview;
var stepOneData;
var stepTwoData;

$("form#stepOne").submit(function() {
    event.preventDefault();

    $this = $(this);
    stepOneData = objectFromForm($this);

    if (typeof(stepOnePreview) !== 'undefined') {
        $('#stepOnePreview').empty();
    }
    stepOnePreview = new juxtapose.JXSlider('#stepOnePreview', [
            {
                src: stepOneData.beforeImgSrc,
                label: stepOneData.beforeImgLabel
            },
            {
                src: stepOneData.afterImgSrc,
                label: stepOneData.afterImgLabel
            }
        ], {});

    smoothScroll.animateScroll(null, '#stepOnePreview', {offset: 50});

    updateEmbedCode();
});


$("form#stepTwo").submit(function() {
    event.preventDefault();
    $this = $(this);

    console.log(stepOneData);

    stepTwoData = objectFromForm($this);

    if (typeof(stepTwoPreview) !== 'undefined') {
        $('#stepTwoPreview').empty();
    }

    if (stepTwoData.startingPosition <= 0 && stepTwoData.startingPosition >= 100) {
        console.warn("must be between 0 and 100")
    }

    stepTwoPreview = new juxtapose.JXSlider('#stepTwoPreview', [
            {
                src: stepOneData.beforeImgSrc,
                label: stepOneData.beforeImgLabel
            },
            {
                src: stepOneData.afterImgSrc,
                label: stepOneData.afterImgLabel
            }
        ], {
           animate: stepTwoData.animate,
           showCredits: stepTwoData.showCredits,
           showLabels: stepTwoData.showLabels,
           startingPosition: stepTwoData.startingPosition
        });
    
    smoothScroll.animateScroll(null, '#stepTwoPreview', {offset: 50});

    updateEmbedCode();
}); 

$('#useCurrentPosition').click(function() {
    console.log(stepTwoPreview.handlePosition);
    event.preventDefault();
    $this = $(this);
    $("form#stepTwo div.startingPosition input").val(stepTwoPreview.handlePosition)
    stepTwoPreview.setStartingPosition(stepTwoPreview.handlePosition);
})

function updateEmbedCode() {
    code =  '<js>' +
            '<css>' +
            '<div class="juxtapose" data-startingposition="' + stepTwoData.startingPosition + '">' +
                '<img src="' + stepOneData.beforeImgSrc + '">' +
                '<img src="' + stepOneData.afterImgSrc + '">' +
            '</div>'

    $('ol#stepThree textarea').text(code);
}






function objectFromForm($form) {
    var formData = {};
    $.each($form.serializeArray(), function() {
        formData[this.name] = this.value;
    })
    return formData;
}

function validateURL(url) {

}


