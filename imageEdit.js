var jimp = require('jimp');

var resize = (img,width,height) => {
console.log(img)
jimp.read(img)
  .then(image => {
    return image
      .resize(width,height)
      .quality(100)
      .write(img);
  })
  .catch(err => {
    console.error(err);
  });
}
//resize('/home/dhrumil/Test/uploads/2.jpg',256,256)
module.exports = {
    resize : resize
}
