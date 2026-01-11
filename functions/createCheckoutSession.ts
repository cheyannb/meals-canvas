import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const { email } = await req.json();

        if (!email) {
            return Response.json({ error: 'Email is required' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: 'price_1SoNpzIcS4vm8vk7wELL6YhH',
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}?canceled=true`,
            customer_email: email,
            metadata: {
                base44_app_id: Deno.env.get("BASE44_APP_ID"),
                customer_email: email
            }
        });

        return Response.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});