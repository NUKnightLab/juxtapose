/*
 * Copyright (c) 2019-2022 Northwestern University Knight Lab
 */
const dom = {
    createElement: (tag, id, classes, add_to_container, content) => {
        let el = document.createElement(tag);
        if (id) {
            el.id = id;
        }
        if (classes) {
            el.className = classes.join(' ');
        };
        if (add_to_container) {
            add_to_container.appendChild(el);
        };
        if (content) {
            el.innerHTML = content;
        }
        return el;
    }
};

const version = 'Juxtapose GIF Creator Version: 0.0.1 (2019-01-04)';

window.jxpGIF = class jxpGIF {

    constructor(image_a, image_b, options) {
        this.createComposite(image_a, image_b, options.container_id);
    }

    addFrameFromComposite(composite, gif, delay) {
        let clamped = new Uint8ClampedArray(composite.bitmap.data);
        const imageData = new ImageData(clamped, composite.bitmap.width, composite.bitmap.height);
        gif.addFrame(imageData, { delay: delay });
    }

    leftRightSwipe(img_a, img_b, gif) {
        var i;

        let fps = 18;
        let duration = 1;
        let numFrames = Math.round(fps * duration);
        let increment = Math.round(img_a.bitmap.width / numFrames);
        let delay = (duration * 1000) / fps;

        //add frame to linger on image a
        this.addFrameFromComposite(img_a, gif, delay * 5);
        for (i = img_a.bitmap.width; i >= 0; i = i - increment) {
            let img_b_cropped = img_b.clone().crop(i, 0, img_b.bitmap.width - i, img_b.bitmap.height);
            let composite = img_a.clone().composite(img_b_cropped, i, 0);

            this.addFrameFromComposite(composite, gif, delay);
        }
        //add frame to linger on image b
        this.addFrameFromComposite(img_b, gif, delay * 5);
        for (i = 0; i <= img_b.bitmap.width; i = i + increment) {
            let img_b_cropped = img_b.clone().crop(i, 0, img_b.bitmap.width - i, img_b.bitmap.height);
            let composite = img_a.clone().composite(img_b_cropped, i, 0);

            this.addFrameFromComposite(composite, gif, delay);
        }

    }

    // call the proxy and return image data based on a url
    getImageData(image_path) {
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

    createComposite(image_a, image_b, container_id) {
        var promise_a, promise_b;

        promise_a = Jimp.read(image_a);
        promise_b = Jimp.read(image_b);

        Promise.all([promise_a, promise_b]).then((promises) => {
                let img_a = promises[0];
                let img_b = promises[1];

                // this dimension should be max. 640px
                let dominant_img_dim = Math.max(img_a.bitmap.height, img_a.bitmap.width, img_b.bitmap.height, img_b.bitmap.width)
                let bbox_dim = Math.min(640, dominant_img_dim);
                img_a.scaleToFit(bbox_dim, bbox_dim)
                img_b.scaleToFit(bbox_dim, bbox_dim)

                // arbitrary: make the first (left) image the one which governs size
                img_b.resize(img_a.bitmap.width, img_a.bitmap.height)


                var gif = new GIF({
                    quality: 30,
                    workerScript: '../static/js/utils/gif.worker.js'
                });

                //swipe
                this.leftRightSwipe(img_a, img_b, gif);

                gif.on('finished', function(blob) {
                    var gif_src = URL.createObjectURL(blob);

                    // remove loader and any previous gif
                    let loader = document.getElementById("loader-spinner");
                    if (loader) {
                        loader.style.display = "none";
                    }

                    let prevGIF = document.getElementById('gif-img');
                    if (prevGIF) {
                        prevGIF.remove();
                    }

                    const img = dom.createElement('img', 'gif-img', '', document.getElementById(container_id));
                    img.setAttribute('src', gif_src);
                    img.setAttribute('width', `${img_a.bitmap.width}`)
                    img.setAttribute('height', `${img_a.bitmap.height}`)

                    // display download button
                    const downloadButton = document.getElementById('download-gif');
                    downloadButton.style.display = "inline-block";

                    downloadButton.onclick = function() {
                        // download gif
                        let imgLink = document.createElement('a');
                        imgLink.href = img.src;
                        imgLink.download = 'juxtapose-gif.gif';
                        document.body.appendChild(imgLink);
                        imgLink.click();
                        document.body.removeChild(imgLink);
                    };
                });

                gif.render();

            })
            .catch((error) => {
                // remove loader and any previous gif
                let loader = document.getElementById("loader-spinner");
                if (loader) {
                    loader.style.display = "none";
                }

                let prevGIF = document.getElementById('gif-img');
                if (prevGIF) {
                    prevGIF.remove();
                }

                console.log(error.message);
            });
    }
}