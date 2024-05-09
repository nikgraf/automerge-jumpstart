/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const RegisterLazyImport = createFileRoute('/register')()
const LoginLazyImport = createFileRoute('/login')()
const IndexLazyImport = createFileRoute('/')()
const ListDocumentIdLazyImport = createFileRoute('/list/$documentId')()
const InvitationTokenLazyImport = createFileRoute('/invitation/$token')()

// Create/Update Routes

const RegisterLazyRoute = RegisterLazyImport.update({
  path: '/register',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/register.lazy').then((d) => d.Route))

const LoginLazyRoute = LoginLazyImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login.lazy').then((d) => d.Route))

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
      preLoaderRoute: typeof LoginLazyImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      preLoaderRoute: typeof RegisterLazyImport
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
  LoginLazyRoute,
  RegisterLazyRoute,
  InvitationTokenLazyRoute,
  ListDocumentIdLazyRoute,
])

/* prettier-ignore-end */