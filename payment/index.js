const {rabbitmq} = require('@afs01/common');
const util = require('util');

const db_payments = {
    customer_amount: 100,
    payment_transactions: {}
};

function charge(transaction_id) {

    throw new Error('Failed to charge');

    const {product_amount} = db_payments.payment_transactions[transaction_id];
    db_payments.customer_amount -= product_amount;
}

(async () => {

    const routing_key = 'payment.request';
    const exchange_name = 'purchase_channel';
    const payment_queue_name = 'payment_queue';

    let channel = await rabbitmq.create_channel(exchange_name);
    
    await rabbitmq.receive_message(exchange_name, routing_key, payment_queue_name, channel, (msg) => {
        console.log(`Payment - Received payment request: ${util.inspect(JSON.stringify(msg))}`);

        db_payments.payment_transactions[msg.transaction_id] = msg;
        console.log("db_payments", db_payments);
        
        setTimeout(() => {

            try {

                charge(msg.transaction_id);
                console.log("db_payments", db_payments);
                rabbitmq.send_message(exchange_name, msg, 'payment.received', channel);
            } catch (error) {

                console.error(error);
                rabbitmq.send_message(exchange_name, msg, 'rollback', channel);
            }

        }, 5000);

    })
})();

