const {rabbitmq} = require('@afs01/common');



(async () => {

    const routing_key = 'order.created';
    const exchange_name = 'purchase_channel';
    const product_queue_name = 'product_queue';

    const database_products = {
        products: {
            // product_id: <product numbers were ordered> : so luong san pham da duoc ban
        }
    }

    let channel = await rabbitmq.create_channel(exchange_name);

    await rabbitmq.receive_message(exchange_name, routing_key, product_queue_name, channel, async (msgInObject) => {

        console.log(`Product service - order.created`);

        const {product_id} = msgInObject;

        //Gia lap logic da tao order thanh cong
        database_products.products[product_id] = (database_products.products[product_id] || 0) + 1;
        console.log(database_products);

        await rabbitmq.send_message(exchange_name, msgInObject,'products.reserved', channel);
    })

    await rabbitmq.receive_message(exchange_name, 'rollback', 'product_rollback_queue', channel,  async (msgInObject) => {

        console.log(`Product service - rollback`);
        const {transaction_id, product_id} = msgInObject;

        console.log(database_products);
        //product rollback => Tru 1 so luong san pham da ban ra
        database_products.products[product_id] = database_products.products[product_id] && parseInt(database_products.products[product_id]) - 1;

        console.log(database_products);
    })


})();