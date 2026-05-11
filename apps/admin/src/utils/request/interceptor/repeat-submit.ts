import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

/** 正在请求中的 key 集合 */
const pendingMap = new Set<string>()

/**
 * 稳定序列化
 * - 保证相同数据生成相同字符串
 * - 支持对象排序 / FormData / File / 循环引用
 */
function stableStringify(value: any, seen = new WeakSet()): string {
  // null / undefined
  if (value == null) return ''
  // Date
  if (value instanceof Date) return value.toISOString()
  // FormData
  if (value instanceof FormData) {
    const obj: Record<string, any> = {}
    value.forEach((v, k) => {
      const currentValue = v instanceof File ? { name: v.name, size: v.size, type: v.type, lastModified: v.lastModified } : v
      // 支持同 key
      obj[k] = k in obj ? (Array.isArray(obj[k]) ? [...obj[k], currentValue] : [obj[k], currentValue]) : currentValue
    })
    return stableStringify(obj, seen)
  }
  // 基础类型
  if (typeof value !== 'object') return JSON.stringify(value)
  // 循环引用
  if (seen.has(value)) return '"[Circular]"'
  seen.add(value)
  // Array
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item, seen)).join(',')}]`
  // 普通对象排序
  const keys = Object.keys(value).sort()
  return `{${keys.map((key) => `"${key}":${stableStringify(value[key], seen)}`).join(',')}}`
}

/** 生成请求唯一 key */
function getPendingKey(config: AxiosRequestConfig) {
  const { url, method, params, data } = config
  return [method, url, stableStringify(params), stableStringify(data)].join('&')
}

/** 防重复提交拦截器 */
export function repeatSubmitInterceptor(instance: AxiosInstance) {
  // 请求拦截
  instance.interceptors.request.use((config) => {
    const method = config.method?.toUpperCase() || ''
    // 只拦截提交类请求
    if (!['POST', 'PUT', 'DELETE'].includes(method)) return config
    const key = getPendingKey(config)
    // 存在重复请求
    if (pendingMap.has(key)) return Promise.reject(new axios.Cancel('请求正在处理中，请勿重复提交'))
    // 记录请求
    pendingMap.add(key)
    return config
  })

  // 响应拦截
  instance.interceptors.response.use(
    (response) => {
      const config = response.config
      // 请求完成后移除
      if (config?.url) {
        const key = getPendingKey(config)
        pendingMap.delete(key)
      }
      return response
    },
    (error) => {
      const config = error?.config
      // 请求异常后移除
      if (config?.url) {
        const key = getPendingKey(config)
        pendingMap.delete(key)
      }

      return Promise.reject(error)
    },
  )
}
