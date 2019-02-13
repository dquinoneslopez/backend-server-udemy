var express = require('express');
var app = express();

app.get('/', (req, res, next) => {
    // https://es.wikipedia.org/wiki/Anexo:C%C3%B3digos_de_estado_HTTP
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente.'
    });
});

module.exports = app;