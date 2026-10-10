import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const { email } = await req.json();

        if (!email) {
            return Response.json({ error: 'Email is required' }, { status: 400 });
        }

        const customers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        if (customers.data.length === 0) {
            return Response.json({ hasActiveSubscription: false });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            status: 'active',
            limit: 1
        });

        return Response.json({ 
            hasActiveSubscription: subscriptions.data.length > 0,
            subscription: subscriptions.data[0] || null
        });
    } catch (error) {
        console.error('Subscription check error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});