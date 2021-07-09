import { RouteLink } from '../RouteLink'
import { SignInButton } from '../SignInButton'
import styles from './styles.module.scss'

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src='/images/logo.svg' alt='ig.news' />

        <nav>
          <RouteLink href='/' activeClassName={styles.active}>
            <a>Home</a>
          </RouteLink>
          <RouteLink href='/posts' activeClassName={styles.active}>
            <a>Posts</a>
          </RouteLink>
        </nav>

        <SignInButton />
      </div>
    </header>
  )
}
