var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
ffmpeg.setFfmpegPath(ffmpegPath);
//var makeVideo = (dir,id) => {
var makeVideo = (dir,id,pattern,format,convertToFormat) => {
  //console.log('inside: '+Date.now(),pattern+format+convertToFormat);
  //return new Promise((resolve, reject) => {
  var command = ffmpeg();
command
    .input(dir+id+pattern+"."+format)
    .inputFPS(1/5)
    .addOption('-c:v','libx264')
    .addOption('-vf', 'fps=25' )
    .addOption('-pix_fmt','yuv420p')
    .output(dir+id+"."+convertToFormat)
    .outputFPS(30)
    .noAudio()
    .on('error', function(err, stdout, stderr) {
       console.log('Cannot process video: ' + err.message);
      // reject(err);
     })
     .on('end', function(stdout, stderr) {
       console.log('Transcoding succeeded !');
       //resolve(dir+ '' +id+ '.mp4');
     })
    .run();
  };
//makeVideo("/home/dhrumil/Test/uploads/","img","%03d","jpg","mp4");
  module.exports = {
    makeVideo : makeVideo
  }
