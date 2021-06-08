import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { query as q } from 'faunadb'

import { fauna } from '../../services/fauna'

import { stripe } from '../../services/stripe'

type User = {
  ref: {
    id: string
  }
  data: {
    stripe_customer_id?: string
  }
}

export default async function (
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'POST') {
    return response
      .status(405)
      .setHeader('Allow', 'POST')
      .send('Method not allowed')
  }

  try {
    const session = await getSession({ req: request })

    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index('user_by_email'), q.Casefold(session.user.email)))
    )

    let customer_id = user.data.stripe_customer_id

    if (!customer_id) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name
      })

      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), user.ref.id), {
          data: { stripe_customer_id: stripeCustomer.id }
        })
      )

      customer_id = stripeCustomer.id
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customer_id,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [{ price: 'price_1Iz1riCOf1N7u7kcTcdmN2ep', quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${process.env.APP_URL}/posts`,
      cancel_url: `${process.env.APP_URL}`
    })

    return response.status(200).json({ sessionId: stripeCheckoutSession.id })
  } catch {
    return response.status(400).json({ mensagem: 'Erro ao fazer checkout' })
  }
}
