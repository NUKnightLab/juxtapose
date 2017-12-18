# JuxtaposeJS

[JuxtaposeJS][1] is a simple, open source tool for creating before/after image sliders. Just provide two image URLs and Juxtapose will do the rest of the work for you. Below are instructions for implementing Juxtapose with HTML and Javascript but we also have a [tool that lets you make a slider without needing to know any code](https://juxtapose.knightlab.com#create-new).

If you want to contribute to Juxtapose, check out the `DEVELOPERS.md` file for installation instructions. Fork the project, create a new branch with your features, and submit a pull request. Thanks for your help!

#### Contents
* [Installation](#installation)
* [Create a Juxtapose Slider](#create-a-juxtapose-slider)
    * [Create an iFrame](#create-an-iframe)
    * [HTML Implementation](#html-implementation)
    * [Javascript Implementation](#javascript-implementation)
* [Modifications and Custom Behavior](#modifications-and-custom-behavior)

### Installation
The easiest way to create a Juxtapose slider is to go to to [http://juxtapose.knightlab.com][1] and use the tool to generate an embedable code snippet that you can use on any website. There are a number of other ways to install Juxtapose on your website. 

**CDN** — Juxtapose is available on the Knight Lab CDN. Just add this code to the `<head>` of your HTML page:
```html
<script src="https://cdn.knightlab.com/libs/juxtapose/latest/js/juxtapose.min.js"></script>
<link rel="stylesheet" href="https://cdn.knightlab.com/libs/juxtapose/latest/css/juxtapose.css">
```

**Package Managers** — Juxtapose is available on both the [npm](https://www.npmjs.com/package/juxtaposejs) and [Bower](http://bower.io/) package registries. The following commands will, respectively, save Juxtapose to your package.json and bower.json requirements files.

```bash
npm install --save juxtaposejs
bower install --save juxtapose
```

There is also a [Meteor package](https://atmospherejs.com/kyleking/juxtapose-js) available. 

### Create a Juxtapose Slider

#### Create an iFrame
The easiest way to create a Juxtapose slider is to go to to [http://juxtapose.knightlab.com][1] and use the tool to generate an embedable code snippet that you can use on any website. The tool is easy to use and requires no coding knowledge whatsoever. If you want to use JuxtaposeJS without using the embed generator, keep reading to learn about different implementation methods.

#### HTML Implementation
The easiest way to implement the image slider is to add this code to your markup:

```html
<div class="juxtapose">
    <img src="http://example.com/firstimage.jpg" />
    <img src="http://example.com/secondimage.jpg" />
</div>
<script src="https://cdn.knightlab.com/libs/juxtapose/latest/js/juxtapose.min.js"></script>
<link rel="stylesheet" href="https://cdn.knightlab.com/libs/juxtapose/latest/css/juxtapose.css">
```

Each `img` can also take additional attributes like so:

```html
<img src="http://image.jpg" data-label="2009" data-credit="Alex Duner/Northwestern Knight Lab" />
```

If each image has an `data-label` attribute defined, the slider will display a label on each image. If each image has a `data-credit` attribute defined, the slider will display a credit for each image.

The slider wrapper can also take some additional attributes as well to specify a few options:

```html
<div id="juxtapose-wrapper" class="juxtapose" data-startingposition="35%" data-showlabels="false" data-showcredits="false" data-animate="false">...</div>
```

Specifying a starting position with `data-startingposition` lets you focus the users attention on the part of the image where the change is most noticeable. To toggle the visibility of the labels and the credits respectively, set `data-showlabels` and `data-showcredits` to false. And to disable the animation, set `data-animate` to false.

If you are using Juxtapose in an existing responsive iFrame solution like [pym.js](http://blog.apps.npr.org/pym.js/) and don't want to use Juxtapose's built in (but faily opinionated) responsive iFrame solution, you can set `data-makeresponsive` to false.

#### Javascript Implementation
The `JXSlider` class takes three arguments. First, is the string of the ID of the element you want to turn into a slider. Second is an array of two objects. Each object *must* have `src` defined and can optionally define a `label` and a `credit`. The third argument lets you set additional options for the image slider.

```js
<div id="foo"></div>
<script>
slider = new juxtapose.JXSlider('#foo',
    [
        {
            src: 'http://firstimage.jpg',
            label: '2009',
            credit: 'Image Credit'
        },
        {
            src: 'http://secondimage.jpg',
            label: '2014',
            credit: "Image Credit"
        }
    ],
    {
        animate: true,
        showLabels: true,
        showCredits: true,
        startingPosition: "50%",
        makeResponsive: true
    });
</script>
```

### Modifications and Custom Behavior
#### CSS
You can customize how JuxtaposeJS looks by modifying its CSS. For instructions, [click here](https://github.com/NUKnightLab/juxtapose/wiki/Styling-the-Slider).

#### JavaScript

The JXSlider class contains a few methods you can use to modify your sliders.

If you instantiated your sliders with the HTML method but still want to access one of your sliders programmatically, JuxtaposeJS creates an array of the JXSliders on your page that you can access with `juxtapose.sliders`.
```javascript
JXSlider.updateSlider(percentage, animate);
```

*Percentage* indicates where you want to set the handle relative to the left side of the slider. If you set *animate* to `true`, the handle will animate to the new location; if animate is set to `false`, the handle will not.


[1]: http://juxtapose.knightlab.com
