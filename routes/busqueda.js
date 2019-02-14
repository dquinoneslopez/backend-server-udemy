var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//=====================================
//  Búsqueda por colección
//=====================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regexp = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'hospitales':

            promesa = buscarHospitales(busqueda, regexp);
            break;

        case 'medicos':

            promesa = buscarMedicos(busqueda, regexp);
            break;

        case 'usuarios':

            promesa = buscarUsuarios(busqueda, regexp);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda solo son: usuarios, médicos y hospitales.',
                error: { message: 'Tipo de colección no válido.' }
            });
    }

    promesa.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    });

});

//=====================================
//  Búsqueda general
//=====================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regexp),
        buscarMedicos(busqueda, regexp),
        buscarUsuarios(busqueda, regexp)
    ]).then(respuestas => {

        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });

    });

});

function buscarHospitales(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {

                    reject('Error al cargar hospitales. ', err);

                } else {

                    resolve(hospitales);

                }

            });

    });

}

function buscarMedicos(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {

                    reject('Error al cargar médicos. ', err);

                } else {

                    resolve(medicos);

                }

            });

    });

}

function buscarUsuarios(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regexp }, { 'email': regexp }])
            .exec((err, usuarios) => {
                if (err) {

                    reject('Error al cargar usuarios. ', err);

                } else {

                    resolve(usuarios);

                }
            });

    });

}

module.exports = app;