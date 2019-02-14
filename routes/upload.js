var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida.',
            errors: { message: 'Tipo de colección no válida.' }
        });

    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada.',
            errors: { message: 'Debe seleccionar una imagen.' }
        });

    }

    // Obtener nombre de archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo éstas extensiones se aceptan
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión de imagen no válida.',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') + '.' }
        });

    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, (err) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo.',
                errors: err
            });

        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });




});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {

                if (!usuario) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no existe.',
                        errores: { message: 'Usuario no existe.' }
                    });

                }

                var pathViejo = './uploads/usuarios/' + usuario.img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {

                    fs.unlinkSync(pathViejo);

                }

                usuario.img = nombreArchivo;
                usuario.save((err, usuarioActualizado) => {

                    usuarioActualizado.password = ':)';

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada.',
                        usuario: usuarioActualizado
                    });

                });

            });
            break;

        case 'medicos':
            Medico.findById(id, (err, medico) => {

                if (!medico) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Médico no existe.',
                        errores: { message: 'Médico no existe.' }
                    });

                }

                var pathViejo = './uploads/medicos/' + medico.img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {

                    fs.unlinkSync(pathViejo);

                }

                medico.img = nombreArchivo;
                medico.save((err, medicoActualizado) => {

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de médico actualizada.',
                        medico: medicoActualizado
                    });

                });

            });
            break;

        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {

                if (!hospital) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Hospital no existe.',
                        errores: { message: 'Hospital no existe.' }
                    });

                }

                var pathViejo = './uploads/hospitales/' + hospital.img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {

                    fs.unlinkSync(pathViejo);

                }

                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) => {

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada.',
                        hospital: hospitalActualizado
                    });

                });

            });
            break;

        default:
            break;
    }

}

module.exports = app;