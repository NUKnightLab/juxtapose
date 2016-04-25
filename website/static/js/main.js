function imageDataFromForm() {
    return [
        {
            src: $("#before-src").val(),
            label: $("#before-label").val(),
            credit: $("#before-credit").val()
        },
        {
            src: $("#after-src").val(),
            label: $("#after-label").val(),
            credit: $("#after-credit").val()
        }
    ];
}

function optionsFromForm() {
    var pos = $("#starting-position").val();
    if (pos === '') {
        pos = '50';
    }
    try {
        var test = parseInt(pos);
    } catch(e) {
        console.log('invalid position');
        pos = '50';
    }
    var options = {
        animate: $("#animate").prop('checked'),
        showLabels: $("#show-labels").prop('checked'),
        showCredits: $("#show-credits").prop('checked'),
        makeResponsive: $("#make-responsive").prop('checked'),
        mode: ($("#vertical").prop('checked')) ? 'vertical' : 'horizontal',
        startingPosition: pos,
    };
    return options;
}

// Set the iframe height/width equal to that of the image with the smaller respective dimension
function setDims(dim, images){
  return images[0][dim] > images[1][dim] ? images[1][dim] : images[0][dim];
}

function createSliderFromForm() {
    $("#create-slider-preview").html('');
    document.getElementById('slider-size-warning').style.display = 'none';
    var opts = optionsFromForm();
    opts.callback = function(jx) {
      var result = jx.optimizeWrapper($('.row-fluid').width());
      if (result == juxtapose.OPTIMIZATION_WAS_CONSTRAINED){
        document.getElementById('slider-size-warning').style.display = 'block';
      }
    };
    window.slider_preview = new juxtapose.JXSlider("#create-slider-preview", imageDataFromForm(), opts);
}

$("#update-preview").click(createSliderFromForm);

function imageTagForObject(o) {
    return '<img src="' + o.src
    + '" data-label="'
    + o.label
    + '" data-credit="'
    + o.credit
    + '">';
}

function updateEmbedCode() {
    var imgs = imageDataFromForm();
    var opts = optionsFromForm();
}

$('a.help').popover({
    trigger: 'manual'
}).click(function(event) {
    if(!$(this).next().hasClass('popover')) {
        $('a.help').not(this).popover('hide');
    }
    $(this).popover('toggle');
    event.stopPropagation();
});

$(document).click(function(e) {
    $('a.help').popover('hide');
});


$("#authoring-form input.auto-update").change(function(evt) {
    createSliderFromForm();
});

$("#authoring-form input#starting-position").change(function(evt) {
    try {
        var value = parseInt($(evt.target).val());
        if (value < 0 || value > 100) {
            evt.preventDefault();
        } else {
            slider_preview.updateSlider(value,false);
        }
    } catch(e) {
        evt.preventDefault();
    }
});

$("#use-current-position").click(function(){
    var pos = slider_preview.getPosition();
    pos = pos.replace('%','').split('.')[0];
    $("#starting-position").val(pos);
});

createSliderFromForm();

var iFrameURL = 'https://cdn.knightlab.com/libs/juxtapose/latest/embed/index.html';
function createIFrameCode(data) {
    var uid = data.uid;
    var url = iFrameURL + '?uid=' + uid;
    var images = [slider_preview.imgBefore.image, slider_preview.imgAfter.image];
    var opts = optionsFromForm();
    var width = opts.makeResponsive ? "100%" : setDims("naturalWidth", images);
    var height = slider_preview.calculateDims(setDims("naturalWidth", images), null).height;
    code = '<iframe frameborder="0" class="juxtapose" width="' + width + '" height="' + height + '" src="' + url + '"></iframe>';
    $('#embed-code').text(code);

}

function getJSONToPublish() {
    data = {
        'images': imageDataFromForm(),
        'options': optionsFromForm(),
    };
    return data;
}

function callCreateAPI(data) {

    $.ajax({
      type: "POST",
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      url: "/juxtapose/create/",
      complete: function(data) { $("#publish-slider").removeClass('disabled'); },
      success: function(data) {
        createIFrameCode(data);
      },
      error: function(xhr, status, errorMsg) {
        $("#publish-error").html("<strong>Error:</strong> " + errorMsg).show();
        console.log(xhr);
      }
    });

}

function publishSlider() {
    if (!$("#publish-slider").hasClass('disabled')) {
        $("#publish-error").html("").hide();
        $("#publish-slider").addClass('disabled');
        $("#publish-note").show();
        data = getJSONToPublish();
        callCreateAPI(data);
    }
}
$("#publish-slider").click(publishSlider);


// THIRD PARTY CHOOSERS
$('.dropbox-picker').click(function(e) {
    e.preventDefault();

    var image = $(this).data('image');
    Dropbox.choose({
        success: function(files) { handleDropboxLink(files, image); },
        linkType: "preview", 
        extensions: ['images']
    });
});

function handleDropboxLink(files, image) {
    var file = files[0];
    var url = file.link.replace("www.dropbox.com", "dl.dropbox.com");
    if (image == 'before') {
        $("#before-src").val(url);
    } else if (image == 'after') {
        $("#after-src").val(url);
    }
    createSliderFromForm();
}

// GOOGLE CHROME

// The Browser API key obtained from the Google Developers Console.
var developerKey = 'xxxxxxxYYYYYYYY-12345678';

// The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
var clientId = "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"

// Scope to use to access user's photos.
var scope = ['https://www.googleapis.com/auth/photos'];

var pickerApiLoaded = false;
var oauthToken;

// Use the API Loader script to load google.picker and gapi.auth.
function onApiLoad() {
    gapi.load('auth', {'callback': onAuthApiLoad});
    gapi.load('picker', {'callback': onPickerApiLoad});
}

function onAuthApiLoad() {
window.gapi.auth.authorize(
    {
      'client_id': clientId,
      'scope': scope,
      'immediate': false
    },
    handleAuthResult);
}

function onPickerApiLoad() {
    pickerApiLoaded = true;
    createPicker();
}

function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
    }
}

// Create and render a Picker object for picking user Photos.
function createPicker() {
if (pickerApiLoaded && oauthToken) {
    var picker = new google.picker.PickerBuilder().
        addView(google.picker.ViewId.PHOTOS).
        setOAuthToken(oauthToken).
        setDeveloperKey(developerKey).
        setCallback(pickerCallback).
        build();
        picker.setVisible(true);
    }
}

// A simple callback implementation.
function pickerCallback(data) {
var url = 'nothing';
if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
  var doc = data[google.picker.Response.DOCUMENTS][0];
  url = doc[google.picker.Document.URL];
}
var message = 'You picked: ' + url;
document.getElementById('result').innerHTML = message;
}

