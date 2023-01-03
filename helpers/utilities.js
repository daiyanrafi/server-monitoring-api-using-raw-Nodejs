// dependencies

// module scaffoldings
const crypto = require('crypto');

const utilities = {};

const enviroments = require('./enviroments');

// parse json string to object
utilities.parseJSON = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
};

// hashing string

utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        console.log(enviroments, process.env.NODE_ENV);
        const hash = crypto.createHmac('sha256', enviroments.secretKey).update(str).digest('hex');
        return hash;
    }
    return false;
};

// export
module.exports = utilities;
