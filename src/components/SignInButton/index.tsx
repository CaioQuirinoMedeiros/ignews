import { FaGithub, FaTimes } from 'react-icons/fa'
import { signIn, signOut, useSession } from 'next-auth/client'

import styles from './styles.module.scss'

export function SignInButton() {
  const [session] = useSession()

  return session ? (
    <button
      type='button'
      className={styles.signInButton}
      onClick={() => {
        signOut()
      }}
    >
      <FaGithub color='#04d361' />
      {session.user?.name}
      <FaTimes color='#737380' className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type='button'
      className={styles.signInButton}
      onClick={() => {
        signIn('github')
      }}
    >
      <FaGithub color='#eba417' />
      Sign in with Github
    </button>
  )
}
