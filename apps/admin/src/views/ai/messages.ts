import type { CopilotMessage } from '@/types'

export const messages: CopilotMessage[] = [
  {
    role: 'human',
    content: '李白是哪个朝代的？',
    loading: false,
  },
  {
    role: 'assistant',
    content: '李白是唐代著名的诗人，活跃于唐朝（公元618年－907年）时期，具体生活在公元701年至762年之间。他被誉为“诗仙”，以其豪放飘逸的诗风和丰富的想象力在中国文学史上占有重要地位。',
    loading: false,
  },
  {
    role: 'human',
    content: '苏轼呢？',
    loading: false,
  },
  {
    role: 'assistant',
    content:
      '苏轼是北宋时期的著名文学家、书画家。他活跃于宋朝（公元960年－1279年）的北宋阶段，具体生活在公元1037年至1101年之间。苏轼是“唐宋八大家”之一，在诗、词、散文、书法、绘画等领域均有极高成就，与父亲苏洵、弟弟苏辙合称“三苏”。',
    loading: false,
  },
  {
    role: 'human',
    content: '我的第一个问题是什么？',
    loading: false,
  },
  {
    role: 'assistant',
    content: '你提出的第一个问题是：“李白是哪个朝代的？”',
    loading: false,
  },
]
