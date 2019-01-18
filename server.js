var express    = require('express');
var app = express();
var session = require('express-session');
var Busboy = require('busboy');
var bodyParser = require('body-parser');
var path = require("path");
var fs = require("fs");
var ffmpeg = require("./ffmpeg.js");
var imageEdit = require('./imageEdit.js');

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(session({
  secret: 'KeyboardCat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } }));
app.use(express.static(path.join(__dirname, 'uploads')));
var pattern = "%03d";
var format = ".jpg";
var convertToFormat = ".mp4";

app.get('/', function (req, res) {
    res.send('<html><head></head><body>\
               <form method="POST" enctype="multipart/form-data">\
                <input type="text" name="textfield"><br />\
                <input type="file" name="filefield"><br />\
                <input type="file" name="filefield"><br />\
                <input type="submit">\
              </form>\
            </body></html>');
  res.end();
});

app.post('/', function (req, res) {
    var sessionId = req.session.id;
    let imageCounter = 1;
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      let zeros = (imageCounter>9 && imageCounter<100)? "0":(imageCounter>99)? "":"00";
      fileName = sessionId + zeros +(imageCounter++) +'.jpg';
      stream = __dirname + '/uploads/' + fileName;
      fstream = fs.createWriteStream(stream);
      file.pipe(fstream);
      file.on('end',()=> { console.log('image downloaded'); });
    });

    busboy.on('finish', function() {
      for(let i=1; i<imageCounter; i++) {
        let zeros = (i>9 && i<100)? "0":(i>99)? "":"00";
        imageEdit.resize(__dirname + '/uploads/' + sessionId+zeros+i+'.jpg',512,512);
      }
      ffmpeg.makeVideo(__dirname + '/uploads/',sessionId,pattern,"jpg","mp4");
      // .then((videoDir)=>{
      //   //send email
      //   //delete images.
      //   res.writeHead(200, { 'Connection': 'close' });
      //   res.end("That's all folks!");
      // }).catch((err) => {
      //   res.writeHead(500,{'Connection': 'close' });
      //   res.end(err.message+"");
      // });
      // //delete images.
      // res.writeHead(200, { 'Connection': 'close' });
      // res.end("That's all folks!");
    });
    res.end("That's all folks!");
    return req.pipe(busboy);
});

app.get('/video', function(req, res) {
  const path = 'Test/uploads/s.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0])
    const end = parts[1] ? parseInt(parts[1]) : fileSize-1;
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const headd = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, headd)
    fs.createReadStream(path).pipe(res)
  }
});




app.listen(3000, () => console.log(`App listening on port 3000!`));
