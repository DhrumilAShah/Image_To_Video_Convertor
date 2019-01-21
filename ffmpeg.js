var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
ffmpeg.setFfmpegPath(ffmpegPath);

//var makeVideo = (dir,id) => {
var makeVideo = (dir, id, pattern, format, convertToFormat) => {
  //console.log('Inside Make Video: '+dir+id+pattern+"."+format);
  return new Promise((resolve, reject) => {
    var command = ffmpeg();
    command
      .input(dir + id + pattern + "." + format)
      .inputFPS(1 / 5)
      .addOption('-c:v', 'libx264')
      .addOption('-b:a', '32k')
      .addOption('-vf', 'fps=25')
      // .addOption('-pix_fmt', 'yuv420p')
      //.addOption('-ss', '0:00:00')
      //.inputOption('-t', '5')
      .input(dir + 's.mp3')
      .addOption('-shortest')
      .output(dir + id + "." + convertToFormat)
      .outputFPS(30)
      //.noAudio()
      .on('error', function(err, stdout, stderr) {
        //console.log('Cannot process video: ' + err.message);
        reject(err);
      })
      .on('end', function(stdout, stderr) {
        //console.log('Transcoding succeeded !');
        resolve(dir + '' + id + '.mp4');
      })
      .run();
  });
};

makeVideo("/home/dhrumil/ImageToVideoConvertor/uploads/", "g", "%03d", "jpg", "mp4")
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = {
  makeVideo: makeVideo
}