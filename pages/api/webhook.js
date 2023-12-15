import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
const stripe = require('stripe')(process.env.STRIPE_SK);
import {buffer} from 'micro';

const endpointSecret = "whsec_cb10058d18d5958348f8f98e396aca0ff70ee63411cdb6406785c5e94585ccaa";


export default async function handler(req,res){
    await mongooseConnect();
    const sig = req.headers['stripe-signature'];

    let event;
  
    try {
      event = stripe.webhooks.constructEvent(await buffer(req), sig, endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const data = event.data.object;
        const orderId = data.metadata.orderId;
        const paid = data.payment_status === 'paid';
        if(orderId && paid){
          await Order.findByIdAndUpdate(orderId,{
            paid: true,
          })
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('ok');
}

export const config = {
    api: {bodyParser: false,}
}


// When allowing access: wise-openly-revive-sporty
// Done! The Stripe CLI is configured for next-ecommerce with account id acct_1OMGiPSAZvLFZHPU
// Please note: this key will expire after 90 days, at which point you'll need to re-authenticate.