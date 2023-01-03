// about handler

// module scaffield

const handler = {};

handler.aboutHandler = (requestProperties, callback) => {
    console.log(requestProperties);

    callback(200, {
        message: 'this is a sample url all bros (CORRECT - ABOUT US)',
    });
};

module.exports = handler;
