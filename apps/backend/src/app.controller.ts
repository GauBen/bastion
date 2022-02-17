import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/image/:letter')
  getImage(@Param('letter') letter: string) {
    letter = `${letter}?`.at(0).toUpperCase();
    return new StreamableFile(this.appService.getImage(letter), {
      type: 'image/png',
      disposition: '',
    });
  }
}
