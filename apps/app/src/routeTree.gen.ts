/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as RegisterImport } from './routes/register'
import { Route as LoginImport } from './routes/login'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()
const ListDocumentIdLazyImport = createFileRoute('/list/$documentId')()
const InvitationTokenLazyImport = createFileRoute('/invitation/$token')()

// Create/Update Routes

const RegisterRoute = RegisterImport.update({
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const ListDocumentIdLazyRoute = ListDocumentIdLazyImport.update({
  path: '/list/$documentId',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/list/$documentId.lazy').then((d) => d.Route),
)

const InvitationTokenLazyRoute = InvitationTokenLazyImport.update({
  path: '/invitation/$token',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/invitation/$token.lazy').then((d) => d.Route),
)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      preLoaderRoute: typeof RegisterImport
      parentRoute: typeof rootRoute
    }
    '/invitation/$token': {
      preLoaderRoute: typeof InvitationTokenLazyImport
      parentRoute: typeof rootRoute
    }
    '/list/$documentId': {
      preLoaderRoute: typeof ListDocumentIdLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexLazyRoute,
  LoginRoute,
  RegisterRoute,
  InvitationTokenLazyRoute,
  ListDocumentIdLazyRoute,
])

/* prettier-ignore-end */