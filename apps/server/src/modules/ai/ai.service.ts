import { ConfigConstant } from '@/common'
import { Injectable } from '@nestjs/common'
import { ChatDto, Message } from './ai.dto'
import { ConfigService } from '@nestjs/config'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI, ChatOpenAIFields } from '@langchain/openai'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { createAgent, CreateAgentParams, initChatModel } from 'langchain'
import { tools } from './tools'

@Injectable()
export class AiService {
  private model: ChatOpenAI

  constructor(private readonly configService: ConfigService) {
    this.initChatModel()
  }

  public async test() {
    const messages = [new SystemMessage('你是一个专业的天气助手'), new HumanMessage('北京的天气怎么样？')]
    const result = await this.agent.invoke({
      messages,
    })
    console.log('result: ', result)
    return result
  }

  public async streamChat(chatDto: ChatDto, response: ExpressResponse) {
    const langChainMessages = this.convertToLangChainMessage(chatDto.messages)
    const chatPromptTemplate = ChatPromptTemplate.fromMessages(langChainMessages)
    const chain = chatPromptTemplate.pipe(this.model)
    const stream = await chain.stream({})
    for await (const chunk of stream) {
      const content = chunk?.content || ''
      if (!content) continue // 过滤空数据块
      response.write(`data: ${JSON.stringify({ content })}\n\n`) // SSE 标准格式：data: 内容\n\n
    }
    if (!response.writableEnded) response.write(`data: ${JSON.stringify({ status: 'DONE' })}\n\n`)
    if (!response.writableEnded) response.end()
  }

  private get agent() {
    const options: CreateAgentParams = { model: this.model }
    options.tools = tools
    return createAgent(options)
  }

  /** 初始化聊天模型 */
  private initChatModel() {
    const options: ChatOpenAIFields = {}
    options.apiKey = this.configService.get<string>(ConfigConstant.OPENAI_API_KEY)
    options.model = this.configService.get<string>(ConfigConstant.OPENAI_MODEL)
    options.temperature = this.configService.get<number>(ConfigConstant.OPENAI_TEMPERATURE)
    options.maxTokens = this.configService.get<number>(ConfigConstant.OPENAI_MAX_TOKENS)
    options.configuration = {}
    options.configuration.baseURL = this.configService.get<string>(ConfigConstant.OPENAI_BASE_URL)
    this.model = new ChatOpenAI({ ...options })
  }

  private convertToLangChainMessage(messages: Message[]) {
    return messages.map((message) => {
      switch (message.role) {
        case 'human':
          return new HumanMessage(message.content)
        case 'assistant':
          return new AIMessage(message.content)
        case 'system':
          return new SystemMessage(message.content)
        default:
          throw new Error(`未知的消息角色: ${message.role}`)
      }
    })
  }

  private setErrorResponse(response: ExpressResponse, message: string) {
    const content = `AI 数据响应异常：${message}`
    response.write(`data: ${JSON.stringify({ content })}\n\n`)
    if (!response.writableEnded) response.write(`data: ${JSON.stringify({ status: 'DONE' })}\n\n`)
    if (!response.writableEnded) response.end()
  }
}
