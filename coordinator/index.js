const express = require('express')
var bodyParser = require('body-parser')
const {rabbitmq} = require('@afs01/common');

const app = express()
const port = 3000

//rabbitmq
const EXCHANGE_NAME = 'purchase_channel';


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.post('/purchase', async (req, res) => {
  
    const {transaction_id, product_id, product_quantity, product_price} = req.body;
    const channel = await rabbitmq.create_channel(EXCHANGE_NAME);
    await rabbitmq.send_message(EXCHANGE_NAME, req.body, 'payment.request', channel);

    res.status(200).send('Your request is proccessing...');
})

app.listen(port, () => {
  console.log(`Purchase Order listening at http://localhost:${port}`)
})