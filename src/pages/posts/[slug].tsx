import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../services/prismic'

import { getSession } from 'next-auth/client'

import styles from './post.module.scss'

interface PostsProps {
  post: {
    slug: string
    title: string
    content: string
    updatedAt: string
  }
}

export default function Post(props: PostsProps) {
  const { post } = props

  return (
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params
}) => {
  // const prismic = getPrismicClient()
  const slug = params.slug
  const session = await getSession({ req })

  // if (!session) {}

  const prismic = getPrismicClient(req)

  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    slug: slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    )
  }

  // const response = await prismic.query(
  //   Prismic.predicates.at('document.type', 'post'),
  //   { fetch: ['post.title', 'post.content'], pageSize: 100 }
  // )

  // const posts = response.results.map((post) => ({
  //   slug: post.uid,
  //   title: RichText.asText(post.data.title),
  //   excerpt:
  //     post.data.content.find((content) => content.type === 'paragraph')?.text ??
  //     '',
  //   updatedAt: new Date(post.last_publication_date).toLocaleDateString(
  //     'pt-BR',
  //     {
  //       day: '2-digit',
  //       month: 'long',
  //       year: 'numeric'
  //     }
  //   )
  // }))

  return { props: { post } }
}