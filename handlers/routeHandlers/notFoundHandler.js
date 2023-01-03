// not foung handler

// modul;e scaffolding

const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'your url was not correct (ERROR)',
    });
};

module.exports = handler;
