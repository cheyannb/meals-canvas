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

        const subscriptions = await stripe.subscriptions.list({
            limit: 100,
        });

        const activeSubscription = subscriptions.data.find(sub => 
            sub.metadata?.user_id === user.id && sub.status === 'active'
        );

        return Response.json({ 
            hasActiveSubscription: !!activeSubscription,
            subscription: activeSubscription || null
        });
    } catch (error) {
        console.error('Subscription check error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});