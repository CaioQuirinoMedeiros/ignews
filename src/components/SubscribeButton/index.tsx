import styles from './styles.module.scss'

interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton(props: SubscribeButtonProps) {
  const { priceId } = props

  return (
    <button type='button' className={styles.subscribeButton}>
      Subscribe now
    </button>
  )
}
