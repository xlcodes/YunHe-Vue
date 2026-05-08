export interface CopilotMessage {
  role: 'assistant' | 'system' | 'human'
  content: string
  loading: boolean
}

export interface CopilotChat {
  /** 是否启用联网搜索 */
  enableInternetSearch: boolean
  /** 消息列表 */
  messages: CopilotMessage[]
}
