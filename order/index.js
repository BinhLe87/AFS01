const {rabbitmq} = require('@afs01/common');
const util = require('util');

const db_orders = {
};

(async () => {

    const exchange_name = 'purchase_channel';
    const order_queue_name = 'order_queue';

    let channel = await rabbitmq.create_channel(exchange_name);
    
    await rabbitmq.receive_message(exchange_name, 'payment.received', order_queue_name + ":payment_received", channel, (msg) => {
        console.log(`Order - payment received: ${util.inspect(JSON.stringify(msg))}`);

        db_orders[msg.transaction_id] = msg;
        console.log("db_payments", db_orders);
    });

    await rabbitmq.receive_message(exchange_name, 'rollback', order_queue_name + ":rollback", channel, (msg) => {
        console.log(`Order - rollback: ${util.inspect(JSON.stringify(msg))}`);

        db_orders[msg.transaction_id] = msg;
        console.log("db_payments", db_orders);
    });

})();

