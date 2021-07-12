import * as React from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { RichText } from 'prismic-dom'
import { useSession } from 'next-auth/client'

import { getPrismicClient } from '../../../services/prismic'
import { RouteLink } from '../../../components/RouteLink'

import styles from '../post.module.scss'
import { useRouter } from 'next/router'

interface PostsPreviewProps {
  post: {
    slug: string
    title: string
    content: string
    updatedAt: string
  }
}

export default function PostPreview(props: PostsPreviewProps) {
  const { post } = props

  const [session] = useSession()
  const router = useRouter()

  React.useEffect(() => {
    if (session?.activeSubscription) {
      router.push({ pathname: '/posts/[slug]', query: { slug: post.slug } })
    }
  }, [session])

  return (
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <RouteLink href={'/'}>
              <a>Subscribe now 🤗</a>
            </RouteLink>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params.slug

  const prismic = getPrismicClient()

  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    slug: slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    )
  }

  return {
    props: { post },
    revalidate: 60 * 60 // 1 hora
  }
}
