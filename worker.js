importScripts('bower_components/jpgjs/jpg.js');

onmessage = function(event) {
    var image = new JpegImage();
    image.onload = function() {
        console.log(image.width, image.height);
        var imageData = new ImageData(image.width, image.height);
        image.copyToImageData(imageData);
        postMessage(imageData);
    }
    image.load(event.data);
}