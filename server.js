require('dotenv').config({ path: './.env.local' });

const { createServer } = require('http');
const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');

const normalizePort = port => parseInt(port, 10);
const PORT = normalizePort(process.env.PORT || 4000);

const app = express();
const apiRoutes = require('./backend');
const env = app.get('env');

if (env === 'production') {
    app.disable('x-powered-by');
    app.use(compression());
    app.use(morgan('common'));
} else {
    app.use(morgan('dev'));
}

app.use(cors());
app.use('/api', apiRoutes);

if (env === 'production') {
    app.use(express.static(path.resolve(__dirname, 'build')));

    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    });
}

const server = createServer(app);

server.listen(PORT, err => {
    if (err) {
        throw err;
    }

    console.log(`Sever is listening on port ${PORT}`);
});