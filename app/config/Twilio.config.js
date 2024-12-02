const TwilioClient = require('twilio')(process.env.Twilio_User,process.env.Twilio_Token);



module.exports = TwilioClient;

