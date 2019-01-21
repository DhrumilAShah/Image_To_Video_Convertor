var nodemailer = require("nodemailer");
var constants = require("./constants");
var send = (id, sessionId) => {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: constants.fromEmail,
        pass: constants.emailPassword
      }
    });

    var mailOptions = {
      from: constants.fromEmail,
      to: id,
      subject: constants.emailSubject,
      html: "<br><a href='http://" + constants.host + ":" + constants.port + "/video?id=" + sessionId + "'>Click the link to view your video</a>"
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
        console.log('Email sent: ' + info.response);
      }
    });

  });
};

//send('dhrumilshah2495@gmail.com','gk1sCpZlkOPeWA9rYA7Shk_XvaIwkG1i').then((data)=>{console.log(data)}).catch((data)=>{console.log(data)});

module.exports = {
  send: send
}