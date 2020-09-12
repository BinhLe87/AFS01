const express = require('express')
var bodyParser = require('body-parser')
const {rabbitmq} = require('@afs01/common')

const app = express()
const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.post('/purchase', async (req, res) => {

  const {transaction_id, product_id, product_amount} = req.body;
  
  console.log('User service - Receive req');
  console.log(req.body);

  const routing_key = 'payment.request';
  const exchange_name = 'purchase_channel';

  let channel = await rabbitmq.create_channel(exchange_name);
  
  await rabbitmq.send_message(exchange_name, req.body, routing_key, channel);

  res.status(200).send('The request is processing...');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})