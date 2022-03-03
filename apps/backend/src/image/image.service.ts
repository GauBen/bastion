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
import { copyFile } from 'fs/promises'
import { default as sizeOf } from 'image-size'

const { createCanvas, registerFont } = canvas
const __dirname = new URL('.', import.meta.url).pathname
const storage = `${__dirname}/../../../../storage/profile-pictures/`

@Injectable()
export class ImageService {
  saveImage({ name }: User, { size, path }: Express.Multer.File) {
    // Check file extension with image-size
    let fileInfo
    try {
      fileInfo = sizeOf(path)
    } catch (error) {
      throw new BadRequestException([
        'file type is not supported : use jpeg, jpg or png',
      ])
    }
    if (fileInfo.type === undefined)
      throw new BadRequestException(['file type seems undefined'])
    let extension = fileInfo.type
    if (extension === 'jpeg') extension = 'jpg' // Change extension to jpg if jpeg
    const validExt = ['jpg', 'png']
    if (!validExt.includes(extension))
      throw new BadRequestException(['file has wrong type'])

    // Check file type
    if (size > 1024 * 1024)
      throw new PayloadTooLargeException(['file is too big'])

    // Check if file already exists
    const filename = `${storage}${name}.`
    if (existsSync(filename + 'png') || existsSync(filename + 'jpg')) {
      throw new BadRequestException([
        'file already exists, delete it if you want to upload a new one',
      ])
    }

    // Check image dimensions
    if (fileInfo.height === undefined || fileInfo.width === undefined)
      throw new BadRequestException(['file has wrong dimensions'])
    if (fileInfo.height != fileInfo.width)
      throw new BadRequestException([
        'file image must have perfect square dimensions',
      ])

    // Save new profile picture
    return copyFile(path, `${storage}${name}.${extension}`)
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
