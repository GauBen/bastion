import type { GetSession, Handle } from '@sveltejs/kit'
import { parse } from 'cookie'

export const handle: Handle = async ({ event, resolve }) => {
  const { token = undefined } = parse(event.request.headers.get('Cookie') ?? '')
  event.locals.user =
    token &&
    (await fetch(
      new URL(`/api/user/${token}`, event.request.url).toString(),
    ).then((r) => r.json()))
  return resolve(event)
}

export const getSession: GetSession = ({ locals }) => ({ user: locals.user })
