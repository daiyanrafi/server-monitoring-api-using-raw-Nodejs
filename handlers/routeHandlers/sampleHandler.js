// sample handler

// module scaffolding

const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);

    callback(200, {
        message: 'this is a sample url all bros (CORRECT - SAMPLE)',
    });
};

module.exports = handler;
