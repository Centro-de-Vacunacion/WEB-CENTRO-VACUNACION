const fs = require('fs');
const neatCsv = require("neat-csv");

const leerArchivoCSV = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, async(err, data) => {
            if (err) {
                reject("Error no se pudo leer el archivo");
            } else {
                resolve((informacion = await neatCsv(data)));
            }
        });
    });
};

module.exports = { leerArchivoCSV }