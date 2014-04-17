BeforeAfterImageSlider
======================

This is a simple open source tool for creating before/after image sliders. Just provide two image URLs and this will do the rest of the work for you. 

###Instructions
To use on your site, 

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

