import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  StreamableFile,
} from '@nestjs/common'
import { User } from '@prisma/client'
import canvas from 'canvas'
import { createReadStream, existsSync } from 'fs'
import { writeFile } from 'fs/promises'
import { extname } from 'path'

const { createCanvas, registerFont } = canvas
const __dirname = new URL('.', import.meta.url).pathname
const storage = `${__dirname}/../../../../storage/profile-pictures/`

@Injectable()
export class ImageService {
  saveImage(
    { name }: User,
    { buffer, originalname, size }: Express.Multer.File,
  ) {
    const extension = extname(originalname)
    if (extension === '.jpeg' || extension === '.jpg' || extension === '.png') {
      if (size <= 1024 * 1024) {
        const filenameJPG = `${storage}${name}.jpg`
        const filenameJPEG = `${storage}${name}.jpeg`
        const filenamePNG = `${storage}${name}.png`
        if (
          !existsSync(filenameJPG) &&
          !existsSync(filenameJPEG) &&
          !existsSync(filenamePNG)
        ) {
          return writeFile(`${storage}${name}${extension}`, buffer)
        } else {
          throw new BadRequestException([
            'file already exists, delete it if you want to upload a new one',
          ])
        }
      } else {
        throw new PayloadTooLargeException(['file is too big'])
      }
    } else {
      throw new BadRequestException(['file has wrong type'])
    }
  }

  getImage(name: string, extensions: string[]): StreamableFile {
    for (const extension of extensions) {
      const filename = `${storage}${name}.${extension}`
      if (existsSync(filename))
        return new StreamableFile(createReadStream(filename), {
          type: `image/${extension}`,
        })
    }
    throw new NotFoundException()
  }

  generateImage(name: string, font: string): StreamableFile {
    try {
      registerFont(`${__dirname}/../../resources/${font}.ttf`, {
        family: 'font',
      })
    } catch (error: unknown) {
      throw new BadRequestException(error)
    }

    const letter = name[0].toUpperCase()
    const hue =
      [...name].reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % 360
    const canvas = createCanvas(64, 64)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = `hsla(${hue}, 29%, 81%, 1)`
    ctx.fillRect(0, 0, 64, 64)
    ctx.font = '44px font'
    const box = ctx.measureText(letter)
    ctx.fillStyle = `hsla(${hue}, 29%, 30%, 1)`
    ctx.fillText(letter, 32 - box.width / 2, 48)
    return new StreamableFile(canvas.createPNGStream(), {
      type: 'image/png',
    })
  }
}
