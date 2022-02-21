import { forward } from '$lib/forward'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async ({ request }) => ({
  body: {
    contacts: await forward(request, '/api/contacts').then((r) => r.json()),
  },
})
