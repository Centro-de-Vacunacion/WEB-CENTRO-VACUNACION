const axios = require('axios');
var qs = require('qs');

const getUsuarios = async() => {
    try {
        let url = `http://localhost:3001/api/usuarios/`;
        const respuesta = await axios.get(url);

        return respuesta.data;
    } catch (error) {
        return error.message;
    }
}

const insertUser = async(usuarios) => {
    let respuesta;
    try {
        for (const usuario in usuarios) {
            var data = qs.stringify({
                cedula: usuarios[usuario].cedula,
                nombre: usuarios[usuario].nombre,
                apellido: usuarios[usuario].apellido,
                cita: true,
                year: '',
                vacunacion_completa: false
            });
            var config = {
                method: 'post',
                url: `http://localhost:3001/api/usuarios/`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };
            respuesta = await axios(config);
            respuesta = respuesta.data;
        }
        if (respuesta.ok) {
            return true;
        }

    } catch (error) {
        return error.message;
    }

}

module.exports = { getUsuarios, insertUser }