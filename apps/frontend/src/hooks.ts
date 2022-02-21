import { forward } from '$lib/forward'
import type { GetSession, Handle } from '@sveltejs/kit'
import { parse } from 'cookie'

export const handle: Handle = async ({ event, resolve }) => {
  const { token } = parse(event.request.headers.get('Cookie') ?? '')
  if (token) {
    const response = await forward(event.request, '/api/me')
    if (response.status < 400) event.locals.user = await response.json()
  }
  return resolve(event)
}

export const getSession: GetSession = ({ locals }) => ({ user: locals.user })
