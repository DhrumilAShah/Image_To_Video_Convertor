var express = require('express');
var session = require('express-session');
var Busboy = require('busboy');
var bodyParser = require('body-parser');
var path = require("path");
var fs = require("fs");
var ffmpeg = require("./ffmpeg.js");
var imageEdit = require('./imageEdit.js');
var unlink = require('./deleteImg.js');
var email = require('./mail.js');
var constants = require('./constants');
var app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json({
  limit: "50mb"
}));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit: 50000
}));
app.use(session({
  secret: constants.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true
  }
}));
app.use(express.static(path.join(__dirname, 'uploads')));
//app.use(express.static(path.join(__dirname, 'views')));


var pattern = "%03d";
var format = ".jpg";
var convertToFormat = ".mp4";
var emailId = '';

app.get('/', function(req, res) {
  res.render(__dirname + '/views/index.ejs');
  res.end();
});

app.post('/', function(req, res) {
  var sessionId = req.session.id;
  let imageCounter = 1;
  let audioFormat = '';
  var busboy = new Busboy({
    headers: req.headers
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    //console.log('Field [' + fieldname + ']: value: ' + val);
    emailId = val;
  });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    //console.log(fieldname, file, filename, encoding, mimetype);
    if (file) {
      if (fieldname == "images") {
        let zeros = (imageCounter > 9 && imageCounter < 100) ? "0" : (imageCounter > 99) ? "" : "00";
        fileName = sessionId + zeros + (imageCounter++) + '.jpg';
      } else {
        format = filename.split(".");
        audioFormat = format[format.length - 1];
        fileName = sessionId + "." + format[format.length - 1];
      }
      //console.log(fileName);
      stream = __dirname + '/uploads/' + fileName;
      fstream = fs.createWriteStream(stream);
      file.pipe(fstream);
      //file.on('end',() => { console.log('image downloaded'); });
    }
  });

  busboy.on('finish', function() {
    for (let i = 1; i < imageCounter; i++) {
      let zeros = (i > 9 && i < 100) ? "0" : (i > 99) ? "" : "00";
      imageEdit.resize(__dirname + '/uploads/' + sessionId + zeros + i + '.jpg', 1024, 512);
    }
    ffmpeg.makeVideo(__dirname + '/uploads/', sessionId, pattern, "jpg", "mp4", audioFormat)
      .then((videoDir) => {
        //console.log(emailId);
        email.send(emailId, sessionId).then((data) => {
          res.writeHead(200, {
            'Connection': 'close'
          });
          res.end("Video Send, check your email...!");
        }).catch((err) => {
          res.writeHead(500, {
            'Connection': 'close'
          });
          res.end("" + err);
        }); //send email
        unlink.deleteImage(__dirname + '/uploads/'); //delete images.
      }).catch((err) => {
        unlink.deleteImage(__dirname + '/uploads/'); //delete images.
        res.writeHead(500, {
          'Connection': 'close'
        });
        res.end(err.message + "");
      });
  });
  return req.pipe(busboy);
  //  }
});

app.get('/video', function(req, res) {
  var path = __dirname + '/uploads/' + req.query.id + '.mp4'
  var stat = fs.statSync(path);
  var fileSize = stat.size;
  var range = req.headers.range;
  if (range) {
    var parts = range.replace(/bytes=/, "").split("-");
    var start = parseInt(parts[0])
    var end = parts[1] ? parseInt(parts[1]) : fileSize - 1;
    var chunksize = (end - start) + 1
    var file = fs.createReadStream(path, {
      start,
      end
    })
    var head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    var headd = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, headd)
    fs.createReadStream(path).pipe(res)
  }
});

app.listen(constants.port, () => console.log('App listening on port 3000!'));