const express = require('express');
const app = express();
const hbs = require("hbs");
const { leerArchivoCSV } = require('./control/leer')
const { calcularEdad, shuffle } = require('./control/config')
const fileUpload = require('express-fileupload');
const { getVacunas, updateVacunas, updateCantidadVacuna } = require('./control/vacunas');
const { getUsuarios, insertUser } = require('./control/usuarios');
const validateDocument = require('validate-document-ecuador');
const e = require('express');

let ciudadanos = [];
let edadMinina;

// Helpers
require('./hbs/helpers');
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
app.get('/verificar', function(req, res) {
    res.render('verificar', {});
});
app.get('/ciudadanos', function(req, res) {
    res.render('ciudadanos', {});
});
app.get('/inoculados/:admin', async(req, res) => {
    let usuarios = await getUsuarios();
    let users = [];
    usuarios.forEach(element => {
        if (element.vacunacion[0]) {
            console.log(element.vacunacion[0]);
            users.push({
                cedula: element.cedula,
                nombre: element.nombre,
                edad: element.year,
                vacuna: element.vacunacion[0].nombre_vacuna,
                dosis1: element.vacunacion[0].Dosis1ra,
                dosis2: element.vacunacion[1].Dosis2da,
            })
        }
    });

    console.log(users);
    if (req.params.admin == 'admin') {
        res.render('inoculados', {
            admin: true,
            users
        });
    } else {
        res.render('inoculados', {
            ciu: true,
            users
        });
    }
});
app.post('/vacunas', async(req, res) => {
    edadMinina = req.body.edad;
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
                let data;
                try {

                    console.log(__dirname + "\\archivo\\" + EDFile.name);
                    data = await leerArchivoCSV(__dirname + "\\archivo\\" + EDFile.name);
                } catch (error) {
                    console.log(error);
                }

                if (data[0].cedula != undefined && data[0].nombre != undefined && data[0].apellido != undefined) {
                    ciudadanos = data;
                    let msg = await insertUser(ciudadanos);
                    ciudadanos = [];
                    if (msg) {
                        res.render('verificar', {
                            estado: true
                        });
                    } else {
                        res.render('ciudadanos', {
                            msg: 'Error al guardar los datos'
                        })
                    }
                } else {
                    res.render('ciudadanos', {
                        msg: 'Los datos del archivo no son validos'
                    })
                }


            } else {
                return false
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
    if (req.body.cedula && req.body.name && req.body.apellido) {
        ciudadano = {
            cedula: req.body.cedula,
            nombre: req.body.name,
            apellido: req.body.apellido
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

    let msg = await insertUser(ciudadanos);
    ciudadanos = [];
    if (msg) {
        res.render('verificar', {
            estado: true

        });
    } else {
        res.render('ciudadanos', {

        })
    }

});
app.post('/verificarUser', async(req, res) => {
    let cedula = req.body.cedula;
    let fecha = req.body.anio;
    let edad = await calcularEdad(fecha);
    let usuarios = await getUsuarios();

    let usuario = usuarios.find(obj => obj.cedula == cedula);
    let vced = validateDocument.getValidateDocument('cedula', cedula);
    if (vced.status == "SUCCESS") {
        if (usuario) {
            res.render('verificar', {
                alert2: true,
                alert: true,
                msg: 'Tiene cita agendada',
                msg2: 'Si'
            })
        } else if (edad < edadMinina) {
            res.render('verificar', {
                alert2: true,
                alert: true,
                msg: 'Fuera del rango de edad',
                msg2: "No"
            })
        } else {
            res.render('verificar', {
                alert2: true,
                alert: true,
                msg: 'Dentro del rango de edad',
                msg2: 'Si'
            })
        }
    } else {
        res.render('verificar', {
            alertci: true,
            msgci: vced.message
        })

    }




});
app.post('/asignar', async(req, res) => {
    let dosis = req.body.dosis;

    if (dosis == "1") {
        let primerasDosis = [];
        let vacu = await getVacunas();
        let vacunas = vacu.vacunas;
        for (const i in vacunas) {
            if (vacunas[i].dosis == dosis) {
                primerasDosis.push(vacunas[i]);
            }
        }
        let primerasDosisCantidad = [];
        for (const i in primerasDosis) {
            if (primerasDosis[i].cantidad > 0) {
                primerasDosisCantidad.push(primerasDosis[i]);
            }
        }

        let aleatorizado = shuffle(primerasDosisCantidad);

        let vacunaAsignada = aleatorizado[0];
        if (vacunaAsignada) {
            let msg = await updateCantidadVacuna(vacunaAsignada);
            if (msg) {
                res.render('verificar', {
                    vacunaA: true,
                    alert2: true,
                    alert: true,
                    msg2: "Si",
                    vacunaAsignada
                });
            }
        } else {
            res.render('verificar', {
                vacunaF: true,
                alert2: true,
                alert: true,
                msg2: "Si",
                msg3: "Vacunas Agotadas"
            });
        }
    } else if (dosis == "2") {
        let vacu = await getVacunas();
        let vacunas = vacu.vacunas;
        let tipo = req.body.vacuna;
        cantidad2da = 0
        let vacunaAsignada2 = [];
        vacunas.forEach(element => {
            if (element.nombre == tipo && element.dosis == 2) {
                cantidad2da = element.cantidad
                vacunaAsignada2 = element
            }
        });
        if (cantidad2da > 0) {
            let msg = await updateCantidadVacuna(vacunaAsignada2);
            if (msg) {
                res.render('verificar', {
                    vacunaA2: true,
                    alert2: true,
                    alert: true,
                    msg2: "Si",
                    vacunaAsignada2
                });
            }

        } else {
            res.render('verificar', {
                vacunaF2: true,
                alert2: true,
                alert: true,
                msg2: "Si",
                msgfail: "Lo sentimos no hay vacunas suficientes",
                vacunaAsignada2
            });
        }

    }



});
app.listen(port, () => {
    console.log("Servidor Iniciado, escuchando el puerto 3000");
});