import * as React from 'react'
import { signIn, useSession } from 'next-auth/client'

import { api } from '../../services/api'

import styles from './styles.module.scss'
import { getStripeJs } from '../../services/stripe-js'
interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton(props: SubscribeButtonProps) {
  const { priceId } = props

  const [session] = useSession()

  const handleSubscribe = React.useCallback(async () => {
    try {
      if (!session) {
        return signIn('github')
      }

      const response = await api.post('subscribe')
      const sessionId = response.data?.sessionId as string
      const stripe = await getStripeJs()

      stripe.redirectToCheckout({ sessionId: sessionId })
    } catch {}
  }, [session])

  return (
    <button
      type='button'
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}
