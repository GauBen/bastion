import { Injectable } from '@nestjs/common';
import { createCanvas, PNGStream, registerFont } from 'canvas';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getImage(letter: string): PNGStream {
    registerFont(`${__dirname}/../resouces/Gilroy-ExtraBold.ttf`, {
      family: 'Gilroy',
    });
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#C1DDD7';
    ctx.fillRect(0, 0, 64, 64);
    ctx.font = '44px Gilroy';
    const box = ctx.measureText(letter);
    ctx.fillStyle = '#889c98';
    ctx.fillText(letter, 32 - box.width / 2, 48);
    return canvas.createPNGStream();
  }
}
