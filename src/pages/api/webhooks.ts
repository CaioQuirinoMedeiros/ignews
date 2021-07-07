import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'
import Stripe from 'stripe'

import { stripe } from '../../services/stripe'
import { saveSubscription } from './_lib/manageSubscription'

export const config = {
  api: {
    bodyParser: false
  }
}

const buffer = async (readable: Readable) => {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(Buffer.from(chunk))
  }

  return Buffer.concat(chunks)
}

export default async function (
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST')
      return response.status(500).end('Method not allowed')
    }

    const bodyBuffer = await buffer(request)
    const stripeSignature = request.headers['stripe-signature']

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        bodyBuffer,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch {
      return response.status(500).end()
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        await saveSubscription(
          subscription.id,
          subscription.customer.toString(),
          event.type === 'customer.subscription.created' ? 'create' : 'update'
        )
        return response.status(200).send({})
      default:
        return response.status(200).send('Evento nao tratado')
    }
  } catch {
    response.status(200).send({})
  }
}
