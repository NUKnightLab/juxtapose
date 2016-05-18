function imageDataFromForm() {
    return [
        {
            src: processThirdPartyLinks($("#before-src").val(), "before-src"),
            label: $("#before-label").val(),
            credit: $("#before-credit").val()
        },
        {
            src: processThirdPartyLinks($("#after-src").val(), "after-src"),
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
    removeAllWarnings();

    var opts = optionsFromForm();

    opts.callback = function(jx) {
        var result = jx.optimizeWrapper($('.row-fluid').width());
        if (result == juxtapose.OPTIMIZATION_WAS_CONSTRAINED) {
            createWarning($('#slider-preview-warning'), "One or both of your photos is larger than your browser window. The preview below has been resized to fit your screen, but your embedded Juxtapose will retain your original image dimensions.")
        }
        if (window.slider_preview.checkImages() === false) {
            createWarning($('#slider-preview-warning'), "Your images have different aspect ratios. Your Juxtapose will still work fine, but you may want to crop your images.")
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
        'images': encodeImageData(imageDataFromForm()),
        'options': optionsFromForm(),
    };
    return data;
}

function callCreateAPI(data) {
    console.log(data);
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


// BASE 64 ENCODING
function encodeImageData(imgData) {
    var data = imgData;
    // use existing img element loaded in the juxtapose, not the src from the data
    data[0].src = encode64BitImg(window.slider_preview.imgBefore.image);
    data[1].src = encode64BitImg(window.slider_preview.imgAfter.image);
    return data;
}

function encode64BitImg(image) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var dataURL;
    canvas.height = image.height;
    canvas.width = image.width;
    ctx.drawImage(image, 0, 0);
    dataURL = canvas.toDataURL();
    return dataURL;
}


// THIRD PARTY PICKERS

function processThirdPartyLinks(url, pos) {
    if (url.indexOf("www.dropbox.com") > 0) {
        return handleDropboxLink(url, pos);
    }
    if (url.indexOf("drive.google.com") > 0) {
        return handleDriveURL(url, pos);
    }
    return url;
}

$('.dropbox-picker').click(function(e) {
    e.preventDefault();

    var image = $(this).data('image');
    Dropbox.choose({
        success: function(files) { handleDropboxPickerLink(files, image); },
        linkType: "preview", 
        extensions: ['images']
    });
});

function handleDropboxLink(url, pos) {
    // Warn if /home and not share link
    if (url.indexOf("home") > 0) { 
        createWarning($("#" + pos).parent(), "<strong>Not An Image Link:</strong> It looks like you copied the wrong link from Dropbox. Try using the image's <a href='https://www.dropbox.com/help/167' target='_blank'>share url</a>.");
    }

    if (url.indexOf("?") > 0) {
        url = url.split("?")[0];
    }
    url += "?raw=1";
    return url;
}

function handleDropboxPickerLink(files, image) {
    if (image == 'before') {
        $("#before-src").val(files[0].link);
    } else if (image == 'after') {
        $("#after-src").val(files[0].link);
    }
    createSliderFromForm();
}


// GOOGLE API STUFF
// The Browser API key obtained from the Google Developers Console.
var developerKey = 'AIzaSyCTSfFKwdxxBf4b7-XVBfFdPear2HS8OFk';
// The Client ID obtained from the Google Developers Console.
var clientId = "439829333191-jkvfj8grh008amdkbe1nn2cadcneei50.apps.googleusercontent.com"
// Scope to use to access user's photos.
var scope = ['https://www.googleapis.com/auth/drive.readonly'];

var pickerApiLoaded = false;
var oauthToken;
var apiLoaded = false;

$('.drive-picker').click(function(e) {
    var image = $(this).data('image');
    if (!apiLoaded) { 
        onApiLoad(image);
    } else {
        createPicker(image);
    }
});

function handleDriveURL(url, pos) {
    createWarning($("#" + pos).parent(), "<strong>Not An Image Link:</strong> It looks like you are trying to use an image from Google Drive. Copy and pasting the link won't work, instead use the Google Drive picker button.");
    return url;
}

// Use the API Loader script to load google.picker and gapi.auth.
function onApiLoad(image) {
    gapi.load('auth', {'callback': function() { onAuthApiLoad(image); }});
    gapi.load('picker', {'callback': function() { onPickerApiLoad(image); }});
}

function onAuthApiLoad(image) {
    window.gapi.auth.authorize({
      'client_id': clientId,
      'scope': scope,
      'immediate': false
    },
    (function(authResult) {
        handleAuthResult(authResult, image);
    }));
}

function onPickerApiLoad(image) {
    pickerApiLoaded = true;
    finishedLoadingAPIs(image);
}

function handleAuthResult(authResult, image) {
    if (authResult && !authResult.error) {
      oauthToken = authResult.access_token;
      finishedLoadingAPIs(image);
    }
}

function finishedLoadingAPIs(image) {
    if (pickerApiLoaded && oauthToken) {
        apiLoaded = true;
        createPicker(image);
    }
}

// Create and render a Picker object for picking user Photos.
// TODO: Dont call this every time you do something probably
function createPicker(image) {
    var myImageView = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES)
        .setIncludeFolders(true)
        .setOwnedByMe(true);

    var sharedImageView = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES)
        .setIncludeFolders(true)
        .setOwnedByMe(false);

    var picker = new google.picker.PickerBuilder().
        addView(myImageView).
        addView(sharedImageView).
        addView(google.picker.ViewId.PHOTO_UPLOAD).
        setOAuthToken(oauthToken).
        setDeveloperKey(developerKey).
        setCallback(function(data) {
            pickerCallback(data, image);
        }).
        build();
    picker.setVisible(true);
}

// A simple callback implementation.
function pickerCallback(data, image) {
    console.log("CALLBACK")
    console.log(data);
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        handleDrivePickerResult(doc, image);
    }
}

function handleDrivePickerResult(data, image) {
    if (image == 'before') {
        $("#before-src").val(driveLinkFromID(data['id']));
    } else if (image == 'after') {
        $("#after-src").val(driveLinkFromID(data['id']));
    }
    createSliderFromForm();
}

function driveLinkFromID(id) {
    return "https://drive.google.com/uc?id=" + id;
}





// ALERT

function removeAllWarnings() {
    $(".warning").remove();
}

function createWarning(elToAppendTo, message) {
    $warning = "<div class='alert alert-danger warning' role='alert'> \
                  <span class='icon icon-exclamation-sign' aria-hidden='true'></span> \
                  <span class='error-message'>" + message + "</span> \
                </div>"
    elToAppendTo.append($warning)
}

