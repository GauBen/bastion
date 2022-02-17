import { handler } from './apps/frontend/build/handler.js'
import { AppModule } from './apps/backend/dist/app.module.js'
import { NestFactory } from '@nestjs/core'

console.log(handler, AppModule)

const run = async () => {
  const thing = await NestFactory.create(AppModule)
  thing.use(handler)
  thing.listen(3000)
}

run()
