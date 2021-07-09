import Link from 'next/link'
import { useRouter } from 'next/router'

import { SignInButton } from '../SignInButton'
import styles from './styles.module.scss'

export function Header() {
  const { pathname, route } = useRouter()
  console.log({ pathname, route })
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src='/images/logo.svg' alt='ig.news' />

        <nav>
          <Link href={'/'}>
            <a className={pathname === '/' ? styles.active : undefined}>Home</a>
          </Link>
          <Link href={'/posts'}>
            <a className={pathname === '/posts' ? styles.active : undefined}>Posts</a>
          </Link>
        </nav>

        <SignInButton />
      </div>
    </header>
  )
}
