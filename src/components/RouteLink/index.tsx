import * as React from 'react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'

interface RouteLinkProps extends LinkProps {
  children?: React.ReactElement
  activeClassName?: string
}

export function RouteLink(props: RouteLinkProps) {
  const { children, activeClassName, href, ...rest } = props

  const { asPath } = useRouter()

  const className = asPath === href ? activeClassName : undefined

  return (
    <Link {...rest} href={href}>
      {React.cloneElement(children, { className })}
    </Link>
  )
}
