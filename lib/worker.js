//dependencies
const data = require('./data');
const url = require('url');
const http = require ('http');
const https = require ('https');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notification');

// worker obj =module scaffolding
const worker = {};

// look up all check frm database
worker.gatherAllChecks = () => {
    //get all checks
    data.list('checks', (err1, checks) => {
        if(!err1 && checks && checks.length > 0) {
            checks.foreEach(check => {
                data.read('checks', check, (err2, originalCheckData) => {
                    if(!err2 && originalCheckData){
                        //pass the data for validate
                        worker.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log ('error: reeading one of the check data');
                    }
                });
            });
        } else {
            console.log('error: coundnt find any checks');
        }
    });
};

//validate individual check data
worker.validateCheckData =(originalCheckData) => {

    let originalData = originalCheckData;

    if(originalCheckData && originalCheckData.id) {
        originalData.state = typeof(originalCheckData.state) === 'string' &&
        ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';

        originalData.lastChecked = typeof(originalCheckData.lastChecked) === 'number' && 
        originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

        //pass to the next process
        worker.performCheck(originalData);
    } else {
        console.log('error: checks was invalid or not formated')
    }
};

//perform check
worker.performCheck = (originalCheckData) => {
    //prepare the initial check
    let checkOutCome = {
        'error': false,
        'reponseCode': false
    };

    //markt he outcome has not sent
    let outComeSent = false; 

    //PARSE THE hostname from original data
    let parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
    let hostname = parsedUrl.hostname;
    const path = parsedUrl.path;
    
    //construct the request
    const requestDetails = {
        'protocol' : originalCheckData.protocol + ':',
        'hostname' : hostname,
        'method' : originalCheckData.method.toUpperCase(),
        'path' : path,
        'timeout' : originalCheckData.timeoutSecinds * 1000,
    };

    //choose the methods http/ https


    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {
        // grab the status code
        const status = res.statusCode;

        //update the check out come
        checkOutCome.reponseCode = status;
        if(!outComeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    });
    
    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };
        //update the check out come
        if(!outComeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outComeSent = true;
        }

    });

    req.on('timeout', (e) => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        //update the check out come
        if(!outComeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
        
    });

    //req send
    req.end();
};

//save check coutcome to db and send to next step
worker.processCheckOutcome = (originalCheckData, checkOutCome) => {
    //check outcome up or down
    let state = !checkOutCome.error && checkOutCome.reponseCode && originalCheckData.successCodes.indexOf
    (checkOutCome.reponseCode) > -1 ? 'up' : 'down';

    // decide alert user
    let alertWanted = originalCheckData.lastChecked && originalCheckData.state != state ? true : false;

    //update the check data
    let newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    //update the check 
    data.update('check', newCheckData.id, newCheckData, (err) => {
        if(!err) {
            if(!alertWanted) {
            //send the check data, aleart user to change data
            worker.alertUser(newCheckData);
        } else {
            console.log('aleart is not needed bcz not state change!');
        }
        } else {
            console.log('error trying to save data ')
        }
    });
};

//send notification to user
worker.alertUser = (newCheckData) => {
    let msg = `alert:  yo ${newCheckData.method.toUpperCase()}
     ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

     sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if(!err) {
            console.log(`user alerted : ${msg}`);
        } else {
            console.log ('problm to send sms');
        }
     });

};

//timer to execute the worker process one min
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000);
};

//start the workers
worker.init = () => {
    //executes all the checks
    worker.gatherAllChecks();

    //call the loop so checks continue
    worker.loop();
};

//export
module.exports = worker;