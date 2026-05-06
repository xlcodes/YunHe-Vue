import { ChatDto } from './ai.dto'
import { AiService } from './ai.service'
import { Body, Controller, Post, Res } from '@nestjs/common'

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat/stream')
  public chatStream(@Body() chatDto: ChatDto, @Res({ passthrough: true }) response: ExpressResponse) {
    return this.aiService.streamChat(chatDto, response)
  }
}
