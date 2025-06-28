import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import stripe from "stripe";

// place order stripe : /api/order/spripe


export const placeOrderStripe = async (req,res) =>{
    try {
        const {items, address} = req.body;
        const userId = req.userId;
        
        const {origin} = req.headers;

        if(!address || items.length === 0){
            return res.json({success:false, message : "Invalid Data" });
        }

        
        let productData = [];

        // calculate amount using items

        // let amount = await items.reduce(async (acc,item) => {
        //     const product = await Product.findById(item.product);
        //     productData.push({
        //         name: product.name,
        //         price: product.offerPrice,
        //         quantity: item.quantity,
        //     })
        //     return (await acc) + product.offerPrice * item.quantity;
        // }, 0)

        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            })
            amount += product.offerPrice * item.quantity;
        }

        // Add tax charge (2%)

        amount += Math.floor(amount * 0.02);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'Online',
        });

        // Stripe gateway initialize

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // create line items for stripe

        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency : "usd",
                    product_data : {
                        name: item.name,
                    },
                    unit_amount : Math.floor(item.price + item.price * 0.02) * 100,
                },
                quantity: item.quantity,
            }
        })

        // create session

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode : "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata:{
                orderId : order._id.toString(),
                userId,
            }
        })

        return res.json({success:true,url:session.url, message : "Order Placed Successfully" });
    } catch (error) {
        console.log(error.message);
        return res.json({success:false, message : error.message });
    }
}


// stripe webhook to verify payment action : /stripe

export const stripeWebhooks = async (request, response) => {

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId,
            })

            const { orderId, userId } = session.data[0].metadata;

            await Order.findByIdAndUpdate(orderId, { isPaid: true });
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId,
            })

            const { orderId } = session.data[0].metadata;

            await Order.findByIdAndDelete(orderId);
            break;
        }
        default: {
            console.error(`Unhandled event type ${event.type}`);
            break;
        }
    }
    response.json({ received: true });
};



// place order COD : /api/order/cod

export const placeOrderCOD = async (req,res) =>{
    try {
        const {items, address} = req.body;
        const userId = req.userId;


        if(!address || items.length === 0){
            return res.json({success:false, message : "Invalid Data" });
        }

        // calculate amount using items

        // let amount = await items.reduce(async (acc,item) => {
        //     const product = await Product.findById(item.product);
        //     return (await acc) + product.offerPrice * item.quantity;
        // }, 0)

        let amount = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            amount += product.offerPrice * item.quantity;
        }

        // Add tax charge (2%)

        amount += Math.floor(amount * 0.02);

        
        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'COD',
        });


        res.json({success:true, message : "Order Placed Successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message : error.message });
    }
}


// get orders by user id : /api/order/user

export const getUserOrders = async (req,res) =>{
    try {
        const userId = req.userId
        const orders = await Order.find({
            userId,
            $or: [{paymentType: 'COD'},{isPaid: true}]
        }).populate("items.product address").sort({createdAt : -1});

        res.json({success:true , orders})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message : error.message });
    }
}

// get all orders (for seller / admin) : /api/order/seller

export const getAllOrders = async (req,res) =>{
    try {
        const orders = await Order.find({
            $or: [{paymentType: 'COD'},{isPaid: true}]
        }).populate("items.product address").sort({createdAt : -1});

        res.json({success:true , orders})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message : error.message });
    }
}