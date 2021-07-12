import NextAuth from 'next-auth'
import { query as q } from 'faunadb'
import Providers from 'next-auth/providers'

import { fauna } from '../../../services/fauna'

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read:user'
    })
  ],
  callbacks: {
    async session(session) {
      let userActiveSubscription: any
      try {
        userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  'ref',
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user?.email)
                    )
                  )
                )
              ),
              q.Match(q.Index('subscription_by_status'), 'active')
            ])
          )
        )
      } catch {}

      return { ...session, activeSubscription: userActiveSubscription }
    },
    async signIn(user) {
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index('user_by_email'), q.Casefold(user.email))
              )
            ),
            q.Create(q.Collection('users'), {
              data: { email: user.email }
            }),
            q.Get(q.Match(q.Index('user_by_email'), q.Casefold(user.email)))
          )
        )

        return true
      } catch {
        return false
      }
    }
  }
})
