import { BadRequestException, Injectable } from '@nestjs/common'
import { createCanvas, PNGStream, registerFont } from 'canvas'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }

  getImage(name: string, font: string): PNGStream {
    try {
      registerFont(`${__dirname}/../resources/${font}.ttf`, {
        family: 'font',
      })
    } catch (error: unknown) {
      throw new BadRequestException(error)
    }
    const letter = (`${name}?`.at(0) as string).toUpperCase()
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
    return canvas.createPNGStream()
  }
}
