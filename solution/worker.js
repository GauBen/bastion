// @ts-check
import { createHash } from 'crypto'
import { parentPort, workerData } from 'worker_threads'

if (!parentPort) process.exit(1)

const { name, token, prefix } = workerData
const cst = `${name}/${token}/${prefix}`
const expected = Buffer.from('adminA=', 'base64').readInt32BE(0) >> 2

let n = 0
while (
  (createHash('md5')
    .update(cst + n)
    .digest()
    .readInt32BE(0) >>
    2) ^
  expected
) {
  n++
  if (n % 1000000 === 0) parentPort.postMessage(1000000)
}

parentPort.postMessage({ key: `${prefix}${n}` })
