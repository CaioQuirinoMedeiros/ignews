import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../services/prismic'

import styles from './styles.module.scss'

interface PostsProps {
  posts: Array<{
    slug: string
    title: string
    excerpt: string
    updatedAt: string
  }>
}

export default function Posts(props: PostsProps) {
  const { posts } = props

  return (
    <>
      <Head>
        <title>Posts | ig.news</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.postsList}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={{ pathname: '/posts/[slug]', query: { slug: post.slug } }}
            >
              <a href={`/posts/${post.slug}`}>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    { fetch: ['post.title', 'post.content'], pageSize: 100 }
  )

  const posts = response.results.map((post) => ({
    slug: post.uid,
    title: RichText.asText(post.data.title),
    excerpt:
      post.data.content.find((content) => content.type === 'paragraph')?.text ??
      '',
    updatedAt: new Date(post.last_publication_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    )
  }))

  return { props: { posts: posts }, revalidate: 60 * 60 * 24 }
}
