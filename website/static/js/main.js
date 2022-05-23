
function makeTabClick(event, buttonType) {
    makeButtons = document.getElementsByClassName("make-button");
    for (i = 0; i < makeButtons.length; i++) {
        makeButtons[i].className = makeButtons[i].className.replace(" button-complement", " button-default");
    }

    event.currentTarget.className = event.currentTarget.className.replace(" button-default", " button-complement");

    // hide show corresponding content
    interactiveContent = document.getElementsByClassName("interactive-content");
    gifContent = document.getElementsByClassName("gif-content");
    if (buttonType == "interactive") {
        // show interactive
        for (i=0; i<interactiveContent.length; i++) {
            interactiveContent[i].style = "display: auto;"
        }

        for (i=0; i<gifContent.length; i++) {
            gifContent[i].style = "display: none;"
        }
    } else {
        // show gif
        for (i=0; i<interactiveContent.length; i++) {
            interactiveContent[i].style = "display: none;"
        }

        for (i=0; i<gifContent.length; i++) {
            gifContent[i].style = "display: auto;"
        }
    }
}

// upload buttons taken and adapted from https://speckyboy.com/custom-file-upload-fields/
function readURL(input, box) {
    if (input.files && input.files[0]) {
  
      var reader = new FileReader();
  
      reader.onload = function(e) {
        $('.image-upload-wrap.' + box).hide();
  
        $('.file-upload-image.' + box).attr('src', e.target.result);
        $('.file-upload-content.' + box).show();

        if (box == '1') {
            gifBeforeURL = e.target.result;
        } else if (box == '2') {
            gifAfterURL = e.target.result;
        }
      };
  
      reader.readAsDataURL(input.files[0]);
  
    } else {
      removeUpload();
    }
  }
  
  function removeUpload(box) {
      if (box == '1') {
          let inputField = document.getElementById("gif-before-src");
          inputField.value = "";

          gifBeforeChange();
      } else if (box == '2') {
          let inputField = document.getElementById("gif-after-src");
          inputField.value = "";

          gifAfterChange();
      }
    $('.file-upload-input.' + box).replaceWith($('.file-upload-input.' + box).clone());
    $('.file-upload-content.' + box).hide();
    $('.image-upload-wrap.' + box).show();
  }

  $('.image-upload-wrap').bind('dragover', function () {
      $('.image-upload-wrap').addClass('image-dropping');
    });
    $('.image-upload-wrap').bind('dragleave', function () {
      $('.image-upload-wrap').removeClass('image-dropping');
  });

  // call the proxy and return image data based on a url
  function getImageData(image_path) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/image_proxy/" + image_path,
            complete: function(data) { 
                console.log("complete");
            },
            success: function(data, status, xhr) {
                let bufferData = Buffer.from(data, 'base64');
                resolve(bufferData);
            },
            error: function(xhr, status, errorMsg) {
                reject(xhr);
            }
          });
    })
}

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

function demoImageData() {
    return [
        {
            src: "https://juxtapose.knightlab.com/static/img/Sochi_11April2005.jpg",
            label: "Apr. 2005",
            credit: ""
        },
        {
            src: "https://juxtapose.knightlab.com/static/img/Sochi_22Nov2013.jpg",
            label: "Nov. 2013",
            credit: ""
        }
    ];
}

function gifImageDataFromForm() {
    return [
        {
            src: gifBeforeURL
        },
        {
            src: gifAfterURL
        }
    ];
}

var gifBeforeURL = "";
var gifAfterURL = "";
function gifBeforeChange() {
    gifURL = processThirdPartyLinks($("#gif-before-src").val(), "gif-before-src");

    getImageData(gifURL).then(imgSrc => {
        gifBeforeURL = `data:image/jpeg;base64,${toBase64(imgSrc)}`;

        $('.image-upload-wrap.1').hide();
  
        $('.file-upload-image.1').attr('src', gifBeforeURL);
        $('.file-upload-content.1').show();
    })
}

function toBase64(arr) {
    return btoa(
       arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
 }

function gifAfterChange() {
   gifURL = processThirdPartyLinks($("#gif-after-src").val(), "gif-after-src");

    getImageData(gifURL).then(imgSrc => {
        gifAfterURL = `data:image/jpeg;base64,${toBase64(imgSrc)}`;

        $('.image-upload-wrap.2').hide();

        $('.file-upload-image.2').attr('src', gifAfterURL);
        $('.file-upload-content.2').show();
    })
}

function generateGIF() {
    // get the two links
    let imageData = gifImageDataFromForm();
    let linkOne = imageData[0].src;
    let linkTwo = imageData[1].src;
    
    // generate gif
    let imgGIF = document.getElementById("gif-img");
    if (imgGIF) {
        imgGIF.remove();
    }

    let loader = document.getElementById("loader-spinner");
    if (loader) {
        loader.style.display = "block";
    }

    let downloadButton = document.getElementById('download-gif');
    if (downloadButton) {
        downloadButton.style.display = "none";
    }

    window.juxtapose_gif = new jxpGIF(linkOne, linkTwo, {container_id: 'gif-container'});
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

    let imageData = imageDataFromForm();
    window.slider_preview = new juxtapose.JXSlider("#create-slider-preview", imageData, opts);
}

function createInteractiveDemoPreview() {
    $("#interactive-demo-preview").html('');

    var opts = optionsFromForm();
    let imageData = demoImageData();
    window.demo_preview = new juxtapose.JXSlider("#interactive-demo-preview", imageData, opts);
}

createInteractiveDemoPreview();

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
