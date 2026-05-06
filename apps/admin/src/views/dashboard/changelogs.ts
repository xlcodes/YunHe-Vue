export const changelogs = [
  {
    version: '1.1.0',
    date: '2026-05-05',
    description: [
      { content: '🎉 新增全局请求日志输出功能，全接口自动记录请求与响应详情' },
      { content: '🎉 新增任务调度日志导出功能，支持执行记录导出为本地文件离线分析' },
      { content: '🎉 新增系统健康检查模块与监控页面，提供 /live /ready 双探针支持' },
      { content: '🎉 实现深色模式主题切换及圆形扩散过渡动画，CSS 变量全局控制' },
      { content: '🎉 新增 Vue 项目 JSX 语法支持，扩展组件编写方式' },
      { content: '🎉 新增 Docker 容器化交付与运维部署方案，多阶段构建 + 健康探针 + Nginx 一站式集成' },
      { content: '🎉 参照 Redis 设计思想封装 localStorage 工具，支持过期时间与命名空间' },
      { content: '🎉 新增容器化数据库自动备份脚本 backup_db.sh，支持定时备份与过期清理' },
      { content: '🐛 修复异常过滤器无法获取 requestId 的问题，确保错误日志可追踪' },
      { content: '🔧 迁移 Bull 至 BullMQ，重构任务队列模块，优化调度性能与稳定性' },
      { content: '🔧 重构部署架构为多容器集群模式，引入 Nginx 反向代理与负载均衡' },
      { content: '📦 其它细节优化' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-04-27',
    description: [
      { content: '🚀 云禾全栈管理系统正式发布，基于 NestJS + Vue3 + TS 架构' },
      // {content:"🚀 云禾全栈管理系统正式发布，基于 NestJS + Vue3 + TS 架构"},
    ],
  },
]
