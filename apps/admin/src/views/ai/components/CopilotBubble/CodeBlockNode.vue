<template>
  <MarkdownCodeBlockNode :node="node">
    <template #header-right>
      <div class="flex-center gap-4px">
        <el-tooltip content="复制" placement="top">
          <div class="right-item">
            <SvgIcon name="Copy" @click="handleCopy" />
          </div>
        </el-tooltip>
        <el-tooltip content="下载" placement="top">
          <div class="right-item">
            <SvgIcon name="Download" @click="handleDownload" />
          </div>
        </el-tooltip>
      </div>
    </template>
  </MarkdownCodeBlockNode>
</template>

<script setup lang="ts">
defineOptions({ name: 'CodeBlockNode' })
import { copyText, linkDownload } from '@/utils'
import { MarkdownCodeBlockNode } from 'markstream-vue'
import type { CodeBlockNodeProps } from 'markstream-vue'

const props = defineProps({
  node: { type: Object as PropType<CodeBlockNodeProps['node']>, required: true },
})

function handleCopy() {
  copyText(props.node.code)
}

async function handleDownload() {
  const ext = props.node.language || 'txt'
  const data = props.node.code || ''
  const blob = new Blob([data], { type: `text/${ext || 'plain'};charset=utf-8` })
  linkDownload(blob, `${Date.now()}.${ext}`)
}
</script>

<style lang="scss" scoped>
.right-item {
  padding: 0 2px;
  border-radius: 4px;
  transition: all var(--el-transition-duration-fast) ease-in-out;
  .svg-icon {
    font-size: 1.32em;
    cursor: pointer;
  }
}
.right-item:hover {
  background-color: rgba(0, 0, 0, 0.16);
}
</style>
