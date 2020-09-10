const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '.env')
});

console.log(process.env.AMQP_URL);

module.exports = exports = {};

exports.rabbitmq = require('./src/rabbitmq');