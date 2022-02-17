import { NestFactory } from '@nestjs/core'
import express from 'express'
import { AppModule } from './apps/backend/dist/app.module.js'
import { handler } from './apps/frontend/build/handler.js'

const run = async () => {
  const app = express()
  const api = await NestFactory.create(AppModule)
  await api.init()
  app.use('/api', api.getHttpAdapter().getInstance())
  app.use(handler)
  app.listen(3000)
}

run()
