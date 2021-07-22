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


module.exports = { updateVacunas, getVacunas }