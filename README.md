BeforeAfterImageSlider
======================

This is a simple open source tool for creating before/after image sliders. Just provide two image URLs and this will do the rest of the work for you. 

###Instructions
The `imageSlider` class takes three arguments. First, is the string of the ID of the element you want to turn into a slider. Second is an array of two objects. Each object *must* have `imgSrc` defined and can optionally define a `label` and a `credit`. The third argument lets you set additional options for the image slider.

    <div id="slider"></div>
    <script>
    slider = new imageSlider('slider', 
        [
            {
                imgSrc: 'First Image URL Here',
                label: '2009',
                credit: 'Image Credit'
            },
            {
                imgSrc: 'Second Image URL Here',
                label: '2014',
                credit: "Image Credit"
            }
        ], 
        {
            animate: true,
            showLabels: true,
            showCredits: true,
            startingPosition: "50%"
        });
    </script>

