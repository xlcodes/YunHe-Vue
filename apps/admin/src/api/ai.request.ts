import { request } from '@/utils/request'
import type { CopilotChat } from '@/types'
import type { AxiosRequestConfig } from 'axios'

export abstract class AiRequest {
  static chat(data: CopilotChat, config: AxiosRequestConfig = {}): Promise<ReadableStream> {
    config.responseType = 'stream'
    config.adapter = 'fetch'
    return request.post('/ai/chat/stream', data, config)
  }
}
