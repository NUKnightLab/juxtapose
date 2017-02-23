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

// $('a.help').popover({
//     trigger: 'manual'
// }).click(function(event) {
//     if(!$(this).next().hasClass('popover')) {
//         $('a.help').not(this).popover('hide');
//     }
//     $(this).popover('toggle');
//     event.stopPropagation();
// });
//
// $(document).click(function(e) {
//     $('a.help').popover('hide');
// });


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
function updateEmbedCodes(data) {
    var uid = data.uid;
    var url = iFrameURL + '?uid=' + uid;
    var images = [slider_preview.imgBefore.image, slider_preview.imgAfter.image];
    var opts = optionsFromForm();
    var width = opts.makeResponsive ? "100%" : setDims("naturalWidth", images);
    var height = slider_preview.calculateDims(setDims("naturalWidth", images), null).height;
    code = '<iframe frameborder="0" class="juxtapose" width="' + width + '" height="' + height + '" src="' + url + '"></iframe>';
    $('#embed-code').text(code);
    $('#oembed-url').val(url);

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
        updateEmbedCodes(data);
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
        $(".show-after-publish").show();
        data = getJSONToPublish();
        callCreateAPI(data);
    }
}
$("#publish-slider").click(publishSlider);


// THIRD PARTY PICKERS

function processThirdPartyLinks(url, pos) {
    if (url.indexOf("www.dropbox.com") > 0) {
        return handleDropboxLink(url, pos);
    }

    if (url.indexOf("drive.google.com") > 0) {
        return handleGoogleDriveLink(url, pos);
    }

    return url
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
        createWarning($("#" + pos).parent(), "<strong>Not An Image Link:</strong> It looks like you copied the wrong link from Dropbox. Try using the image's <a href='https://www.dropbox.com/help/167' target='_blank'>share url</a>.")
    }

    if (url.indexOf("?") > 0) {
        url = url.split("?")[0]
    }
    url += "?raw=1"
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

function handleGoogleDriveLink(url, pos) {
    // https://drive.google.com/open?id=0By5R-j9oQKMJQUlYRFVSQ1pWZWc
    var re = /^https:\/\/drive\.google\.com\/open\?id=(.*)$/;
    if (url.match(re)) {
        var correctedUrl = "https://drive.google.com/uc?export=view&id=" + url.match(re)[1]
        createWarning($("#" + pos).parent(), "<strong>Not An Image Link:</strong> It looks like you're trying to use the share link from Google Drive, which doesn't work as an image link. We've swapped it out with <a href='" + correctedUrl + "' target='_blank'>this one instead</a>.");
    }

    return correctedUrl;
}

// ALERT

function removeAllWarnings() {
    $(".warning").remove();
}

function createWarning(elToAppendTo, message) {
    $warning = "<div class='alert alert-danger warning column-12 note' role='alert'> \
                  <span class='icon icon-exclamation-sign' aria-hidden='true'></span> \
                  <span class='error-message'>" + message + "</span> \
                </div>"
    elToAppendTo.append($warning)
}
