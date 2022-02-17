import { Injectable } from '@nestjs/common';
import { createCanvas, PNGStream } from 'canvas';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getImage(letter: string): PNGStream {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1ce';
    ctx.fillRect(0, 0, 64, 64);
    ctx.font = '40px "Segoe UI", Verdana, sans-serif';
    const box = ctx.measureText(letter);
    ctx.fillStyle = '#000';
    ctx.fillText(letter, 32 - box.width / 2, 48);
    return canvas.createPNGStream();
  }
}
