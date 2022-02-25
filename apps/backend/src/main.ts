import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { config as dotenv } from 'dotenv'
import { AppModule } from './app.module'

export const bootstrap = async () => {
  dotenv({ path: `${__dirname}/../../../.env` })
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe())
  return app
}

if (require.main === module)
  bootstrap().then(async (app) => app.listen(Number(process.env.VITE_API_PORT)))
