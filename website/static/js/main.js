

var clip_base_template = _.template($("#clip-base-template").html().trim());
var clip_preview_template = _.template($("#clip-preview-template").html().trim());
var create_error_template = _.template($("#create-error-template").html().trim());

$('#audition_area').on("click",".delete-clip", function() {
    var the_sound = $(this).prev('.soundcite');
    for (i=0; i<clips.length; i++) {
        if(the_sound[0] === clips[i].el) {
            clips.splice(i, 1);
        }
    }
    $(this).parents(".clip").remove();
});

function create_clip() {
    if (validate_form()) {
        var widget = SC.Widget("player_iframe");
        widget.pause();
        widget.getCurrentSound(function(sound_metadata) {
            var clip_html = clip_base_template({
                id: sound_metadata.id,
                start: getTimeAsMillis('#start_field'),
                end: getTimeAsMillis('#end_field'),
                text: $('#linktext').val()
            });
            $('#audition_area').css('display', 'block');
            $('#audition_area_status').css('display', 'none');
            $('#audition_area').prepend(clip_preview_template({clip_html: clip_html}))
            $('#audition_area .clip:first').find('.soundcite').each(function() {
                clips.push(new soundcite.Clip(this));
            });
        });
    } else {
        console.log('not valid?');
    }
}

$('#create_clip').click(create_clip);

$("#example").click(function() {
  $("#url").val($(this).text());
  load_sc_player();
});

function show_errors(msgs) {
    $("#create-error").remove();
    var $error_box = $(create_error_template());
    if (msgs) {
        var $error_list = $("<ul>").appendTo($error_box);
        for (var i = 0; i < msgs.length; i++) {
            var msg = $("<li>").text(msgs[i]).appendTo($error_list);
        }
    }
    $("form#times").after($error_box);
}

function validate_form() {
    var msgs = [];
    $("#create_clip").removeAttr("disabled");
    $("#create-error").remove();
    validate_required($("#start_field"),"Start time", msgs);
    validate_time_field($("#start_field"),"Start time", msgs);
    validate_required($("#end_field"),"End time", msgs);
    validate_time_field($("#end_field"),"End time", msgs);
    validate_required($("#linktext"),"Link text", msgs);
    var start = getTimeAsMillis("#start_field");
    var end = getTimeAsMillis("#end_field");
    if (start && end && (end < start)) {
        msgs.push("End time must be after start time.")
        $("#start_field").parent().addClass("error");
        $("#end_field").parent().addClass("error");
    }
    if (msgs && msgs.length > 0) {
        $("#create_clip").attr("disabled","disabled");
        show_errors(msgs);
        return false;
    }
    return true;
}
function validate_time_field($el, label, msgs) {
    var value = $el.val();
    if (value) {
        $el.parent().removeClass("error");
        if (value.match(/^\d+$/)) {
            $el.val(millisToTime(value));
        } else if (isNaN(timeToMillis(value))) {
            $el.parent().addClass("error");
            if (msgs) {
                msgs.push(label + " is not a valid time. Use mm:ss format.")
            }
            return false;
        } else if (timeToMillis(value) < 0) {
            console.log(value);
            msgs.push(label + " must not be a negative number." + value);
            return false;
        } else if (clip_duration_in_millis > 0 && timeToMillis(value) > clip_duration_in_millis) {
            msgs.push(label + " is beyond the end of the clip.")
            return false;
        }
        
    }
    return true;
}
function validate_required($el, label, msgs) {
    $el.parent().removeClass("error");
    
    if ($el.val().match(/.+/)) {
        return true;
    }
    $el.parent().addClass("error");
    msgs.push(label + " must not be blank.")
    return false
}

function set_end_from_widget() {
    var widget = SC.Widget("player_iframe");
    widget.getDuration(function(duration) { 
        clip_duration_in_millis = duration;
        setTime("#end_field",millisToTime(duration));           
        validate_time_field($("#end_field"));
    });
}
$("#start_field,#end_field,#linktext").change(validate_form);


$("#linktext").keyup(function() {
    validate_form();
});

$('#header').click(function() {
    $('#header').select();
});

$('#audition_area').on('click', 'textarea.code', function() {
    $(this).select();
});



// My Stuff

$("form#stepOne").submit(function() {
    event.preventDefault();

    $this = $(this);

    var formData = {};
    $.each($this.serializeArray(), function() {
        formData[this.name] = this.value;
    })

    previewStepOne = new JXSlider('.stepOnePreview', [
            {
                src: formData.beforeImgSrc,
                label: formData.beforeImgLabel
            },
            {
                src: formData.afterImgSrc,
                label: formData.afterImgLabel
            }
        ], {});


});



