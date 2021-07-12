import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
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
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <section
          ref={(elem) => {
            if (!elem) {
              return
            }
            const scriptElem = document.createElement('script')
            scriptElem.src = 'https://utteranc.es/client.js'
            scriptElem.async = true
            scriptElem.crossOrigin = 'anonymous'
            scriptElem.setAttribute('repo', 'CaioQuirinoMedeiros/ignews')
            scriptElem.setAttribute('issue-term', 'pathname')
            scriptElem.setAttribute('label', 'blog-comment')
            scriptElem.setAttribute('theme', 'github-dark')
            elem.appendChild(scriptElem)
          }}
        />
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params
}) => {
  const slug = params.slug
  const session = await getSession({ req })

  if (!session.activeSubscription) {
    return { redirect: { destination: '/', permanent: false } }
  }

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

  return { props: { post } }
}
