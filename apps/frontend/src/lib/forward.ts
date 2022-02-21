/** Performs a GET request with the same cookies to another endpoint. */
export const forward = (request: Request, to: string) =>
  fetch(new URL(to, request.url).toString(), {
    headers: { Cookie: request.headers.get('Cookie') ?? '' },
  })
