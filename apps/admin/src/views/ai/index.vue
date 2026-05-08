<template>
  <div class="app-content h-full copilot-container">
    <main class="copilot-main">
      <el-scrollbar ref="scrollbarRef" class="message-list">
        <CopilotBubble v-for="(_, index) in messages" :key="index" :messages="messages" :index="index" @regenerate="reGenerate(index)" />
      </el-scrollbar>

      <div class="chat-input flex flex-col flex-shrink-0">
        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" v-model.trim="prompt" placeholder="请输入问题" @keyup.enter.exact="handleSubmit"></el-input>
        <div class="flex items-center gap-8px">
          <el-tag type="primary" disabled>深度思考</el-tag>
          <el-tag type="primary" :effect="enableInternetSearch ? 'dark' : 'light'" @click="toggleInternetSearch">联网搜索</el-tag>
          <div class="ml-auto flex-center gap-8px">
            <el-link type="danger" @click="clearInput" :disabled="!prompt">清空</el-link>
            <el-link type="primary" @click="handleSubmit" :disabled="loading || !prompt">发送</el-link>
            <el-link type="primary" @click="handleExport">导出</el-link>
          </div>
        </div>
      </div>

      <div class="tip">AI 生成内容仅供参考，请注意甄别</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { linkDownload, TipModal } from '@/utils'
import { AiRequest } from '@/api/ai.request'
import type { CopilotMessage } from '@/types'
import CopilotBubble from './components/CopilotBubble/index.vue'
import { messages as defaultMessages } from './messages.ts'

const prompt = ref<string>('你是谁？')
const loading = ref<boolean>(false)
const enableInternetSearch = ref<boolean>(true)
const scrollbarRef = useTemplateRef('scrollbarRef')
// const messages = ref<CopilotMessage[]>([])
const messages = ref<CopilotMessage[]>(defaultMessages)

async function scrollToBottom() {
  await nextTick()
  if (!scrollbarRef.value?.wrapRef) return
  scrollbarRef.value.setScrollTop(scrollbarRef.value.wrapRef.scrollHeight)
}

async function streamChat(requestMessages: CopilotMessage[], onChunk: (content: string) => void) {
  const response = await AiRequest.chat({ messages: requestMessages, enableInternetSearch: enableInternetSearch.value })
  const reader = response.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n').filter((i) => i.startsWith('data: '))
    for (const line of lines) {
      const data = JSON.parse(line.replace('data: ', ''))
      if (data.status === 'DONE') return
      onChunk(data.content)
      scrollToBottom()
    }
  }
}

async function handleSubmit() {
  const question = prompt.value.trim()
  if (!question) return TipModal.msgError('请先输入问题')
  loading.value = true
  messages.value.push({ role: 'human', content: question, loading: false })
  prompt.value = ''
  const aiMessage: CopilotMessage = { role: 'assistant', content: '', loading: true }
  messages.value.push(aiMessage)
  scrollToBottom()
  const lastIndex = messages.value.length - 1
  try {
    const requestMessages = messages.value.slice(0, -1)
    await streamChat(requestMessages, (content) => (messages.value[lastIndex].content += content))
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '未知错误'
    console.log('🚀 ~ error:', errMsg)
    messages.value[lastIndex].content = '❌ 加载失败'
    // return Promise.reject(errMsg)
  } finally {
    messages.value[lastIndex].loading = false
    loading.value = false
    scrollToBottom()
  }
}

async function reGenerate(aiMessageIndex: number) {
  if (loading.value) return
  messages.value = messages.value.slice(0, aiMessageIndex)
  messages.value.push({ role: 'assistant', content: '', loading: true })
  loading.value = true
  scrollToBottom()
  const lastIndex = messages.value.length - 1
  try {
    const requestMessages = messages.value.slice(0, -1)
    await streamChat(requestMessages, (content) => (messages.value[lastIndex].content += content))
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '未知错误'
    console.log('🚀 ~ error:', errMsg)
    messages.value[lastIndex].content = '❌ 加载失败'
    // return Promise.reject(errMsg)
  } finally {
    messages.value[lastIndex].loading = false
    loading.value = false
    scrollToBottom()
  }
}

function clearInput() {
  prompt.value = ''
  TipModal.msgSuccess('清空成功')
}

function handleExport() {
  if (!messages.value.length) return TipModal.msgError('请先发送问题')
  if (loading.value) return TipModal.msgError('请稍后再导出')
  const data = JSON.stringify(messages.value)
  const blob = new Blob([data], { type: 'application/json' })
  linkDownload(blob, `${Date.now()}.json`)
}

// 切换联网搜索
function toggleInternetSearch() {
  enableInternetSearch.value = !enableInternetSearch.value
}
</script>

<style lang="scss" scoped>
@use './markdown-render.scss';

.copilot-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.chat-input {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  :deep(.el-textarea) {
    margin-bottom: 8px;
  }
  :deep(.el-textarea__inner) {
    box-shadow: none;
    border: none;
    resize: none;
    padding: 0;
  }
  .el-tag {
    user-select: none;
    cursor: pointer;
  }
  .el-button {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.tip {
  text-align: center;
  font-size: var(--el-font-size-small);
  color: var(--el-color-info);
}
</style>
