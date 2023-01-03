//dependencies
const https = require('http');
const querystring = require('querystring');
const { twilio } = require ('./enviroments');

//module scaffloding
const notifications = {};

//send sms using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
    //input validation
    const userPhone = typeof(phone) === 'string' && msg.trim().length === 11 ? 
    phone.trim() : false;

    const userMsg = typeof(phone) === 'string' && msg.trim().length > 0 && msg.trim().length
    <= 1600 ? msg.trim() :false;

    if (userPhone && userMsg) {
        //config the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        //stringfy the payload
        const stringifyPayload = querystring.stringify(payload);

        //config the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        };

        //req instantiate obj
        const req = https.request(requestDetails, (res) => {
            // get the status of send req
            const status = res.statusCode;
            //successfull callback if req hit
            if(status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`status code retured ${status}`);
            }
        });

        req.on ('error', (e) => {
            callback(e);
        });

        req.write(stringifyPayload);
        req.end();
    } else {
        callback ('parameters missing, Invalid');
    }
};

module.exports = notifications;