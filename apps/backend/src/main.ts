import fetch from 'node-fetch'
import { bootstrap } from './app.module.js'

// Add `fetch` for svelte-tenor
Object.defineProperties(globalThis, {
  fetch: { enumerable: true, configurable: true, value: fetch },
})

bootstrap().then(async (app) => app.listen(Number(process.env.VITE_API_PORT)))
