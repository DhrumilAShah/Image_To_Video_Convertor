var fs = require('fs');
var deleteImage = (dir) => {

fs.readdir(dir, (err, data) => {
if (err) throw err;
 data.forEach(file => {
  if(file.includes(".jpg")){
  fs.unlink(dir+file, (err) => {
   if (err) throw err;
   console.log('Successfully deleted');
  });
}
 });
});

};
//'/Users/budgettemp/Downloads/NodeJSPortable/App/NodeJS/Test/jpgimg/'
//deleteImage("/home/dhrumil/ImageToVideoConvertor/uploads/");
module.exports = {
  deleteImage : deleteImage
}
