import { bootstrap } from './apps/backend/dist/main.js'
import { handler as frontend } from './apps/frontend/build/handler.js'

const run = async () => {
  const server = await bootstrap()
  // Remove what makes the application an unproper middleware
  server.getHttpAdapter().setNotFoundHandler = undefined
  await server.init()
  server.use(frontend)
  server.listen(3000)
}

run()
