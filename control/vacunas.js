const axios = require('axios');
var qs = require('qs');
const updateVacunas = async(vacunas) => {
    let respuesta;
    try {
        for (const vacuna in vacunas) {
            var data = qs.stringify({
                cantidad: vacunas[vacuna].cantidad
            });
            var config = {
                method: 'put',
                url: `http://localhost:3001/api/vacunas/${vacunas[vacuna].id}`,
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
const getVacunas = async() => {
    try {
        let url = `http://localhost:3001/api/vacunas/`;
        const respuesta = await axios.get(url);

        return respuesta.data;
    } catch (error) {
        return error.message;
    }
}

const updateCantidadVacuna = async(vacunaA) => {
    let respuesta;

    try {
        let vacunas = await getVacunas();
        let vacuna = vacunas.vacunas.find(obj => obj._id == vacunaA._id);
        if (vacuna.cantidad > 0) {
            var data = qs.stringify({
                cantidad: vacunaA.cantidad - 1
            });

            var config = {
                method: 'put',
                url: `http://localhost:3001/api/vacunas/${vacunaA._id}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };
            respuesta = await axios(config);
            respuesta = respuesta.data;
            if (respuesta.ok) {
                return true;
            }

        } else {
            return false
        }

    } catch (error) {
        return error.message;
    }

}


module.exports = { updateVacunas, getVacunas, updateCantidadVacuna }