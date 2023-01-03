// dependencies
const fs = require('fs');
const path = require('path');

// module scaffolding

const lib = {};

// base dir data folder
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file

lib.create = (dir, file, data, callback) => {
    // open file for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // write data to file
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptor, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('error closing the new file');
                        }
                    });
                } else {
                    callback('error writing to new file');
                }
            });
        } else {
            callback('this file is alreay exiexted');
        }
    });
};

// read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

// update data from file
lib.update = (dir, file, data, callback) => {
    // file open for write
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // covernt data to string
            const stringData = JSON.stringify(data);

            // truncate/empty the file
            fs.ftruncate(fileDescriptor, (err1) => {
                if (!err1) {
                    // write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err2) => {
                        if (!err2) {
                            // close the file
                            fs.close(fileDescriptor, (err3) => {
                                if (!err3) {
                                    callback(false);
                                } else {
                                    callback('error closing file!');
                                }
                            });
                        } else {
                            callback('error writing file');
                        }
                    });
                } else {
                    callback('error the trunk file');
                }
            });
        } else {
            console.log('error updating, file not exist');
        }
    });
};

// delete data from file
lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('error deleteing file');
        }
    });
};

//list all item in dir
lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            let trimmedFileNames = [];
            fileNames.forEach(fileName => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames); 
        } else {
            callback(' error dir');
        }
    });
};

module.exports = lib;
