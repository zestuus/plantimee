const { createServer } = require('http');
const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');

const normalizePort = port => parseInt(port, 10);
const PORT = normalizePort(process.env.PORT || 4000);

const app = express();
const env = app.get('env');

if (env === 'production') {
    app.disable('x-powered-by');
    app.use(compression());
    app.use(morgan('common'));

    app.use(express.static(path.resolve(__dirname, 'build')));

    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    });
} else {
    app.use(morgan('dev'));
}

const server = createServer(app)

server.listen(PORT, err => {
    if (err) {
        throw err;
    }

    console.log(`Sever is listening on port ${PORT}`)
})