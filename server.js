const express = require('express');
const app = express();
const hbs = require("hbs");
const { leerArchivoCSV } = require('./control/leer')
const fileUpload = require('express-fileupload');
let ciudadanos = [];
//Puerto
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());
// Estaticas
app.use(express.static(__dirname + '/public'));


// Establecer el motor para las vistas
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

// Rutas de la página web
app.get('/', function(req, res) {
    res.render('vacunas', {});
});

app.get('/vacunas', function(req, res) {
    res.render('vacunas', {});
});
app.get('/verificar/:est', function(req, res) {
    if (req.params.est) {
        console.log(req.params.est);
        res.render('verificar', {
            estado: true
        });
    } else {
        res.render('verificar', {

        });
    }

});
app.get('/verificar', function(req, res) {
    res.render('verificar', {});
});

app.get('/ciudadanos', function(req, res) {
    res.render('ciudadanos', {});
});

app.get('/inoculados/:admin', function(req, res) {
    if (req.params.admin == 'admin') {
        res.render('inoculados', {
            admin: true
        });
    } else {
        res.render('inoculados', {
            ciu: true
        });
    }
});
app.post('/vacunas', function(req, res) {
    const vacunas = {
        sinovac: {
            nombre: 'Sinovac',
            dosis: {
                primera: req.body.Psinovac,
                segunda: req.body.Ssinovac,
            }
        },
        pfizer: {
            nombre: 'Pfizer',
            dosis: {
                primera: req.body.Ppfizer,
                segunda: req.body.Spfizer,
            }
        },
        astrazeneca: {
            nombre: 'Astrazeneca',
            dosis: {
                primera: req.body.Pastra,
                segunda: req.body.Sastra,
            }
        },
        edadMínima: req.body.edad
    }
    res.send(vacunas);
});


app.post('/ciudadanos', async(req, res) => {
    let EDFile;
    let ciudadano;
    if (req.files.file) {
        EDFile = req.files.file;
    }

    if (req.body.cedula && req.body.name) {
        ciudadano = {
            cedula: req.body.cedula,
            nombre: req.body.name,

        }
    }

    if (EDFile) {
        let name = EDFile.name.split(".");
        let ext = name[name.length - 1];
        if (ext === "csv") {
            EDFile.mv(`./archivo/${EDFile.name}`, err => {
                if (err) return false
                return true
            });
            if (await EDFile.mv) {
                let data = await leerArchivoCSV(__dirname + "\\archivo\\" + EDFile.name);



                res.redirect('verificar/est=true');
            }
        } else {
            res.render("ciudadanos", {
                msg: "Solo se acepta archivos csv"
            })
        }
    } else if (ciudadano) {
        ciudadanos.push(ciudadano);
        res.render('ciudadanos', {
            ciudadanos
        })
    }

});
app.post('/addciudadanos', async(req, res) => {
    let ciudadano;
    if (req.body.cedula && req.body.name) {
        ciudadano = {
            cedula: req.body.cedula,
            nombre: req.body.name,
        }
    }
    if (ciudadano) {
        ciudadanos.push(ciudadano);
        res.render('ciudadanos', {
            ciudadanos
        })
    }
});
app.post('/guardarCiu', async(req, res) => {

    res.redirect('verificar/est=true');
});
app.listen(port, () => {
    console.log("Servidor Iniciado, escuchando el puerto 3000");
});