import type { GetSession, Handle } from '@sveltejs/kit'
import { parse, serialize } from 'cookie'

export const handle: Handle = async ({ event, resolve }) => {
  const { token } = parse(event.request.headers.get('Cookie') ?? '')
  if (token) {
    const response = await fetch(
      new URL(`/api/me/`, event.request.url).toString(),
      { headers: { Cookie: serialize('token', token) } },
    )
    if (response.status < 400) event.locals.user = await response.json()
  }
  return resolve(event)
}

export const getSession: GetSession = ({ locals }) => ({ user: locals.user })
