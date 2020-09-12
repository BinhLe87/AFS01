const {rabbitmq} = require('@afs01/common');



(async () => {

    const routing_key = 'payment.request';
    const exchange_name = 'purchase_channel';
    const payment_queue_name = 'payment_queue';

    const database_payments = {
        customer_balance: 100, //so du tai khoan cua khach hang
        payment_transactions: {
            // transaction_id: {payment_amount}
        }
    }

    let channel = await rabbitmq.create_channel(exchange_name);

    await rabbitmq.receive_message(exchange_name, routing_key, payment_queue_name, channel, async (msgInObject) => {

        console.log(`Payment service - payment.request`);
        const {product_amount, transaction_id} = msgInObject;

        const remainBalance = database_payments.customer_balance - product_amount;
        database_payments.customer_balance = remainBalance;

        database_payments.payment_transactions[transaction_id] = {
            payment_amount: product_amount,
            status: "charged"
        }

        console.log(database_payments);

        //send payment.received to exchange
        await rabbitmq.send_message(exchange_name, msgInObject, 'payment.received', channel);
    });

    await rabbitmq.receive_message(exchange_name, 'rollback', 'payment_rollback_queue', channel,  async (msgInObject) => {

        console.log(`Payment service - rollback`);
        const {transaction_id, product_amount} = msgInObject;

        //Payment rollback => Cong lai tien cho khach hang
        database_payments.customer_balance = parseInt(database_payments.customer_balance) + parseInt(product_amount);

        //gan lai payment status la canceled
        database_payments.payment_transactions[transaction_id].status = "canceled";

        console.log(database_payments);
    })


})();