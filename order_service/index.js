const {rabbitmq} = require('@afs01/common');

function placeOrder(transaction_id) {

    //Gia lap logic da tao order that bai
    throw Error(`Failed to place order for transaction id is ${transaction_id}`);
}

(async () => {

    const routing_key = 'payment.received';
    const exchange_name = 'purchase_channel';
    const order_queue_name = 'order_queue';

    const database_orders = {
        orders: {
            // transaction_id: ordered/canceled
        }
    }

    let channel = await rabbitmq.create_channel(exchange_name);

    await rabbitmq.receive_message(exchange_name, routing_key, order_queue_name, channel, async (msgInObject) => {

        console.log(`Order service - payment.received`);

        const {transaction_id} = msgInObject;

        //Xu ly order
        try {

            placeOrder(transaction_id);
            database_orders.orders[transaction_id] = "ordered";
            console.log(database_orders);
            await rabbitmq.send_message(exchange_name, msgInObject,'order.created', channel);

        } catch (error) {
            //Code gia lap, thuc te se khong co
            //Gia lap tao order bi loi xay ra o ORDER service
            console.error(error.message);

            await rabbitmq.send_message(exchange_name, msgInObject, 'rollback', channel);
        }
    });

    await rabbitmq.receive_message(exchange_name, 'rollback', 'order_rollback_queue', channel,  async (msgInObject) => {

        console.log(`Order service - rollback`);
        const {transaction_id} = msgInObject;

        database_orders.orders[transaction_id] = "canceled";
        console.log(database_orders);
    })


})();