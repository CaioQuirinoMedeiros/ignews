import * as React from 'react'
import { signIn, useSession } from 'next-auth/client'

import { api } from '../../services/api'

import styles from './styles.module.scss'
import { getStripeJs } from '../../services/stripe-js'
import { useRouter } from 'next/router'

export function SubscribeButton() {
  const [session] = useSession()
  const router = useRouter()

  const handleSubscribe = React.useCallback(async () => {
    try {
      if (!session) {
        return signIn('github')
      }

      if (session.activeSubscription) {
        return router.push('/posts')
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
