import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from './stripe';
import { ENV } from './_core/env';
import { getPurchaseBySessionId, updatePurchaseStatus, updateUserStripeCustomerId } from './purchaseDb';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Webhook] No signature found');
    return res.status(400).send('No signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log('[Webhook] Test event detected, returning verification response');
    return res.json({ verified: true });
  }

  console.log('[Webhook] Event received:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Webhook] Checkout completed:', session.id);

        // Update purchase status
        await updatePurchaseStatus(
          session.id,
          'completed',
          session.payment_intent as string
        );

        // Save customer ID if available
        if (session.customer && session.metadata?.user_id) {
          await updateUserStripeCustomerId(
            Number(session.metadata.user_id),
            session.customer as string
          );
        }

        console.log('[Webhook] Purchase completed successfully');
        break;
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Webhook] Checkout failed/expired:', session.id);

        await updatePurchaseStatus(session.id, 'failed');
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Webhook] Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Webhook] Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error processing event:', error);
    res.status(500).json({ error: error.message });
  }
}
