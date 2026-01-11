import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: 'price_1SoNpzIcS4vm8vk7wELL6YhH',
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}?success=true`,
            cancel_url: `${req.headers.get('origin')}?canceled=true`,
            customer_email: user.email,
            metadata: {
                base44_app_id: Deno.env.get("BASE44_APP_ID"),
                user_id: user.id
            }
        });

        return Response.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});