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
    return;
    var req = new XMLHttpRequest();
    req.open('GET', event.data);
    req.responseType = 'arraybuffer';
    req.onload = function() {
        var arrayBuffer = req.response;
        console.log(req.response.byteLength);
        var byteArray = new ImageData(new Uint8ClampedArray(arrayBuffer), 256, 256);
        postMessage(byteArray);
    }
    req.send();
}