console.log('Lambda Loading...');

try {
    const Stripe = require('stripe');
    console.log('Stripe required successfully');

    // Safety check for env var
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('ERROR: STRIPE_SECRET_KEY is missing');
    }

    // Initialize Stripe
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const YOUR_DOMAIN = process.env.DOMAIN;

    exports.handler = async (event) => {
        console.log('Event received:', JSON.stringify(event));

        // CORS Headers
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
        };

        // Handle preflight OPTIONS request
        if (event.httpMethod === 'OPTIONS') {
            console.log('Handling OPTIONS request');
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({ message: 'CORS check successful' }),
            };
        }

        try {
            console.log('Parsing body...');
            const payload = JSON.parse(event.body || '{}');
            console.log('Payload:', JSON.stringify(payload));

            const line_items_raw = payload.line_items;
            const customer_email = payload.customer_email;
            const success_url = payload.success_url || `${YOUR_DOMAIN}/success`;
            const cancel_url = payload.cancel_url || `${YOUR_DOMAIN}/cancel`;

            if (!line_items_raw || line_items_raw.length === 0) {
                // Fallback for legacy payload
                if (payload.product_name) {
                    return {
                        statusCode: 200,
                        headers: headers,
                        body: JSON.stringify({
                            message: "Legacy payload received. Please use 'line_items' with Product or Price IDs."
                        }),
                    };
                }
                throw new Error("Missing 'line_items' in payload");
            }

            // Resolve Product IDs to Price IDs
            const line_items = await Promise.all(line_items_raw.map(async (item) => {
                if (item.price && item.price.startsWith('prod_')) {
                    console.log(`Looking up price for product: ${item.price}`);
                    const prices = await stripe.prices.list({
                        product: item.price,
                        active: true,
                        limit: 1
                    });

                    if (prices.data.length === 0) {
                        throw new Error(`No price found for product ${item.price}`);
                    }
                    console.log(`Found price for ${item.price}: ${prices.data[0].id}`);

                    return {
                        price: prices.data[0].id,
                        quantity: item.quantity
                    };
                }
                return item;
            }));

            console.log('Creating session...');
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: line_items,
                customer_email: customer_email,
                success_url: success_url,
                cancel_url: cancel_url,
            });

            console.log('Session created:', session.url);
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({ url: session.url }),
            };

        } catch (err) {
            console.error('STRIPE ERROR:', err);
            return {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({ error: err.message }),
            };
        }
    };
} catch (topLevelError) {
    console.error('TOP LEVEL ERROR:', topLevelError);
    exports.handler = async () => {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Lambda initialization failed. Check logs.', details: topLevelError.toString() })
        }
    }
}
