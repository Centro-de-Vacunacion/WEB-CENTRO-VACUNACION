const express = require('express');
const app = express();
const hbs = require("hbs");
const { leerArchivoCSV } = require('./control/leer')
const fileUpload = require('express-fileupload');
const { getVacunas, updateVacunas } = require('./control/vacunas');
let ciudadanos = [];
let edadMinina;
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
    res.redirect('vacunas');
});

app.get('/vacunas', function(req, res) {
    res.render('vacunas', {});
});
app.get('/verificar/:est', function(req, res) {
    if (req.params.est) {
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
app.post('/vacunas', async(req, res) => {
    const vacunas = [{
            id: '60f8fb9dd85234e011c5d781',
            cantidad: req.body.Psinovac,
        },
        {
            id: '60f8fb9dd85234e011c5d782',
            cantidad: req.body.Ssinovac,
        },
        {
            id: '60f8fb9dd85234e011c5d783',
            cantidad: req.body.Ppfizer,
        },
        {
            id: '60f9be08f7f78a363c11e41a',
            cantidad: req.body.Spfizer,
        },
        {
            id: '60f8fb9dd85234e011c5d785',
            cantidad: req.body.Pastra,
        },
        {
            id: '60f8fb9dd85234e011c5d786',
            cantidad: req.body.Sastra,
        },

    ];

    edadMinina = req.body.edad;
    if (await updateVacunas(vacunas)) {
        res.render('vacunas', {
            estado: true
        })
    } else {
        res.render('vacunas', {
            estadoF: true
        })
    }


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