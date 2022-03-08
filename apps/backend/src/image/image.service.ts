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
import { copyFile, unlink } from 'fs/promises'
import { imageSize } from 'image-size'

if (process.env.BASTION_STORAGE === undefined)
  throw new Error('BASTION_STORAGE not defined')

const { createCanvas, registerFont } = canvas
const __dirname = new URL('.', import.meta.url).pathname
const storage = `${process.env.BASTION_STORAGE}/profile-pictures`

@Injectable()
export class ImageService {
  async saveImage({ name }: User, { size, path }: Express.Multer.File) {
    if (size > 102400)
      throw new PayloadTooLargeException([
        'file too big, the maximum size is 100 kB',
      ])

    try {
      const { width, height, type: ext } = imageSize(path)

      if (ext !== 'png' && ext !== 'jpg')
        throw new BadRequestException(['the image has to be png or jpg'])
      if (width !== height)
        throw new BadRequestException(['the image must be a square'])

      await copyFile(path, `${storage}/${name}.${ext}`)
      return true
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException(['file is not an image'])
    }
  }

  async deleteImage({ name }: User) {
    for (const ext of ['png', 'jpg'])
      if (existsSync(`${storage}/${name}.${ext}`))
        await unlink(`${storage}/${name}.${ext}`)
  }

  getImage(name: string, extensions: string[]): StreamableFile {
    for (const ext of extensions) {
      const filename = `${storage}/${name}.${ext}`
      if (existsSync(filename))
        return new StreamableFile(createReadStream(filename), {
          type: `image/${ext}`,
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
