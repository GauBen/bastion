import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common'
import canvas from 'canvas'
import { createReadStream, existsSync } from 'fs'

const { createCanvas, registerFont } = canvas
const __dirname = new URL('.', import.meta.url).pathname

@Injectable()
export class ImageService {
  getImage(name: string, extensions: string[]): StreamableFile {
    for (const extension of extensions) {
      const filename = `${__dirname}/../../../../storage/profile-pictures/${name}.${extension}`
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
