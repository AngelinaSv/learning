import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';

@Controller()
export class ViewsController {
  private readonly publicPath = path.join(process.cwd(), 'public');

  @Get()
  getIndex(@Res() res: Response) {
    res.sendFile(path.join(this.publicPath, 'index.html'));
  }
}
