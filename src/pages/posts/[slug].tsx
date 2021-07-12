import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { RichText } from 'prismic-dom'
import Prismic from '@prismicio/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCalendar } from '@fortawesome/free-solid-svg-icons'

import { getPrismicClient } from '../../services/prismic'

import { getSession } from 'next-auth/client'

import styles from './post.module.scss'
import { RouteLink } from '../../components/RouteLink'

interface PostsProps {
  post: {
    slug: string
    title: string
    content: string
    publicatedAt: string
    updatedAt: string
    readTime: string
  }
  prevPost: {
    slug: string
    title: string
  }
  nextPost: {
    slug: string
    title: string
  }
}

export default function Post(props: PostsProps) {
  const { post, prevPost, nextPost } = props

  return (
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <div className={styles.postInfos}>
            <div>
              <FontAwesomeIcon icon={faCalendar} />
              <time>{post.updatedAt}</time>
            </div>
            <div>
              <FontAwesomeIcon icon={faClock} />
              <time>{post.readTime}</time>
            </div>
          </div>

          {!!post.updatedAt && <time>{`* editado em ${post.updatedAt}`}</time>}

          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <section className={styles.postFooter}>
          <div>
            {!!prevPost && (
              <RouteLink
                href={{
                  pathname: '/posts/[slug]',
                  query: { slug: prevPost.slug }
                }}
              >
                <a>
                  <h6>{prevPost.title}</h6>
                  <span>Previous post</span>
                </a>
              </RouteLink>
            )}
          </div>
          {!!nextPost && (
            <RouteLink
              href={{
                pathname: '/posts/[slug]',
                query: { slug: nextPost.slug }
              }}
            >
              <a className={styles.nextPost}>
                <h6 className={styles.nextPost}>{nextPost.title}</h6>
                <span className={styles.nextPost}>Next post</span>
              </a>
            </RouteLink>
          )}
        </section>

        <section
          ref={(elem) => {
            if (!elem) {
              return
            }

            while (elem.firstChild) {
              elem.removeChild(elem.lastChild)
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

  const postResponse = await prismic.getByUID('post', String(slug), {})
  const prevPostResponse = await prismic.queryFirst(
    [
      Prismic.Predicates.at('document.type', 'post'),
      Prismic.Predicates.dateBefore(
        'document.first_publication_date',
        postResponse.first_publication_date
      )
    ],
    { fetch: ['post.title'] }
  )
  const nextPostResponse = await prismic.queryFirst([
    Prismic.Predicates.at('document.type', 'post'),
    Prismic.Predicates.dateAfter(
      'document.first_publication_date',
      postResponse.first_publication_date
    )
  ])

  const postContentText = RichText.asText(postResponse.data.content)
  const wordsPerMinute = 225
  const numberOfWords = postContentText.split(/\s/g).length
  const readTime = Math.ceil(numberOfWords / wordsPerMinute)

  const post = {
    slug: slug,
    title: RichText.asText(postResponse.data.title),
    content: RichText.asHtml(postResponse.data.content),
    readTime: `${readTime} min`,
    publicatedAt: new Date(
      postResponse.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    updatedAt: new Date(postResponse.last_publication_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    )
  }

  return {
    props: {
      post,
      nextPost: nextPostResponse
        ? {
            slug: nextPostResponse.uid,
            title: RichText.asText(nextPostResponse.data.title)
          }
        : null,
      prevPost: prevPostResponse
        ? {
            slug: prevPostResponse.uid,
            title: RichText.asText(prevPostResponse.data.title)
          }
        : null
    }
  }
}
