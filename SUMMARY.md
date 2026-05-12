## 项目简介

YunHe-Vue（云禾管理系统）是一套面向前端开发者进阶全栈的企业级后台管理系统模板。采用 **pnpm workspace Monorepo** 架构将前后端同仓管理，前端基于 **Vue 3.5 + TypeScript + Element Plus 2 + Vite 8 + Pinia 3 + Vue Router 5** 构建，后端基于 **NestJS 11 + TypeORM + MySQL 8 + Redis 7 + BullMQ** 搭建。核心设计理念是"TypeScript 贯穿全栈"——同一门语言、同一套类型系统，配合 NestJS 与 Vue 高度相似的「模块化 + 依赖注入 + 装饰器」开发范式，让前端开发者在熟悉的生态里完成全栈能力的平滑过渡。Monorepo 同仓架构的另一大优势是：**AI 辅助编程时可直接阅读前后端关联代码**，无需在不同仓库间切换上下文，从 API 请求到接口处理再到数据库实体一气贯通，大幅提升 AI 代码生成的准确性与工程一致性。最终以 **Docker + Nginx** 多阶段构建实现一键容器化部署。

---

## 功能模块

### 🔐 RBAC 权限模型（前后端一体化）

- 用户 → 角色 → 菜单，菜单粒度为「目录 / 菜单 / 按钮」三级
- 后端 `@RequirePermissions`、`@RequireRoles` 装饰器声明权限，`@Public` 标记免鉴权接口，`@CurrentUser('userId')` 自动注入当前用户
- JWT 签发时写入用户角色与权限集合，Guard 层统一校验；权限/角色缓存于 Redis
- 前端路由由后端动态下发，递归生成路由表并动态注册
- `v-permissions` 指令控制按钮级 DOM 显隐，`v-roles` 指令按角色粗粒度控制
- 权限配置全部收敛到后台管理界面，运维与开发分离

### 📂 系统管理

- **用户管理** — 增删改查、重置密码、修改密码、角色分配、状态管理
- **角色管理** — 角色权限分配、角色编码管理
- **菜单管理** — 目录 / 菜单 / 按钮三级粒度，支持外链、内嵌 iframe
- **字典管理** — 字典类型 + 字典数据两级结构，`useDict()` Hook 全局缓存 + 并发请求去重（同一类型多个组件同时挂载只发一次请求，其余复用 Promise），后端 Redis 缓存
- **图标浏览** — SVG 图标集中预览

### 📊 系统监控

- **服务监控** — CPU 使用率、内存占用、磁盘空间、服务器运行信息，`@ResponseCache` 缓存 180 秒
- **缓存监控** — Redis 实例信息、内存使用量、Key 数量，支持在线缓存管理
- **健康检查** — `/live`（存活探针）、`/ready`（就绪探针），适配 K8s / Docker Swarm 编排
- **在线用户** — 实时查看活跃会话，支持强制下线
- **定时任务** — BullMQ 动态 Cron 调度，运行时启停 / 暂停 / 恢复 / 手动执行
- **操作日志** — `@OperLog` 装饰器标记即自动记录，IP 归属地解析（`ip2region-ts`）+ 浏览器 / OS 解析
- **登录日志** — 登录成功 / 失败全量记录，含设备信息

### 📁 大文件分片上传

- **Web Worker 离线哈希** — `crypto.subtle.digest('SHA-256')` 硬件加速计算文件与分片哈希
- **并发上传** — 5MB 固定分片，3 路并发 Promise.race 协程池
- **秒传** — `checkFile` 接口查询文件哈希，已存在则跳过上传
- **断点续传** — `checkFile` 返回已上传分片索引，前端只传缺失分片
- **流式合并** — 后端 Node.js Stream 管道边读边写，不占内存

### ⏱ 动态定时任务调度

- 基于 **BullMQ + Redis** 实现运行时动态调度
- 业务 Service 通过 NestJS `DiscoveryService` 自动扫描注册
- 后台界面填写「类名.方法名(参数)」即可新增任务，`analysisInvokeTarget` 格式校验
- Cron 表达式启停、修改、手动执行全部通过 API 操作，无需重启

### 🤖 AI 流式对话

- 集成 **LangChain + OpenAI**，SSE 流式输出，支持 `AbortController` 中止
- **上下文压缩摘要** — 消息量达 12 条触发阈值，自动调用 LLM 将历史对话压缩为摘要存入数据库；每次请求仅携带「摘要 + 最近 6 条消息」，大幅降低 Token 消耗
- **全链路 Token 统计** — `TokenCounterHandler` 回调自动统计 `promptTokens` / `completionTokens` 并入库
- **Agent 工具** — 内置联网天气查询 Tool，架构支持扩展
- 前端 Markdown 渲染（代码高亮 + Mermaid 流程图 + KaTeX 数学公式）
- 会话管理：新建 / 切换 / 删除 / 重命名 / 导出 JSON

### 🛡 请求安全体系

- **前后端双闭环请求去重**
  - 前端：Axios 拦截器基于 `Set` 内存去重，仅拦截 POST / PUT / DELETE
  - 后端：`@RepeatSubmit()` 装饰器 + `RepeatSubmitGuard`，基于 Redis 分布式去重
  - 两者共享同一套稳定序列化算法（对象键排序 / FormData / File 元数据 / 循环引用检测）
- **接口限流** — `ThrottlerLimitGuard` 基于 Redis 原子自增，IP + 路径维度限流（10 次 / 10 秒），超限自动拉黑 30 分钟；`@SkipThrottle()` 可豁免
- **接口响应缓存** — `@ResponseCache({ ttl, key })` 装饰器标记即自动 Redis 缓存，TTL 引入 20% 随机抖动防缓存雪崩
- **演示环境保护** — `DemoEnvironmentGuard` 开关式拦截非 GET 操作（登录 / 登出白名单除外）
- **客户端真实 IP** — 兼容 Nginx / Caddy / K8s 多层反向代理，优先级 `x-forwarded-for → x-real-ip → remoteAddress`
- **Helmet 安全头** + Winston 按日滚动日志

### 📋 统一响应与异常体系

- 全局 `AllExceptionsFilter`：区分开发 / 生产日志，异常语义化翻译（外键约束→"当前数据关联其它资源"）
- `ReponseTransformInterceptor`：统一包装为 `AjaxResult` 格式（code / success / message / requestId / timestamp），`@Raw()` 可跳过包装
- `class-validator` DTO 管道校验（`whitelist + transform + stopAtFirstError`）
- `PaginationPipe` 统一分页参数处理

### 📑 Excel 导入导出

- `@Excel()` 装饰器声明式配置字段映射（列名 / 顺序 / 宽度 / 日期格式 / 字典翻译）
- ExcelJS 引擎驱动，一键导出含字典回显的标准化 Excel
- 支持仅导出 / 仅导入 / 双向三种模式

### 📧 邮件 + 图形验证码

- `@nestjs-modules/mailer` + Handlebars 模板引擎，内置验证码 / 告警 / 通知三套模板
- SMTP 配置化，`EmailService.sendCaptcha()` 一行发送
- `svg-captcha` 数学表达式验证码，Redis 缓存答案 60 秒过期

### 🖼 前端示例页面

- **ECharts 图表** — 折线 / 柱状 / 饼图 / 雷达 / K 线 / 散点图演示
- **分片上传 Demo** — 完整上传流程可视化（计算哈希 → 检查 → 上传 → 合并）
- **水印** — 文本水印 / 多行水印 / 图片水印 / 表格保护四场景
- **倒计时** — `el-countdown` + `@vueuse/core useTransition` 数值动画
- **手写签名板** — Canvas 原生实现，画笔颜色 / 粗细可调，支持撤销 / 保存为图片
- **Markdown 编辑器** — md-editor-v3 封装，支持导出 .md 文件
- **图片懒加载** — `el-image` 懒加载演示

### 📱 布局与导航

- **Navbar 顶栏** — 侧栏折叠（Hamburger）、面包屑导航（Breadcrumb）、全屏切换（Screenfull）、暗黑主题切换（ThemeSwitch）、组件尺寸切换（SizeSelect）、用户下拉菜单（UserDropDown）
- **Sidebar 侧栏** — `SidebarItem` 递归渲染多级菜单，`uniqueOpened` 手风琴模式，折叠动画，`hidden` 字段控制显隐
- **TagsView 多标签页** — 类浏览器 Tab 交互，支持刷新 / 关闭当前 / 关闭其它 / 关闭所有 / 右键菜单，固定标签页（affix）不可关闭，左右箭头滚动
- **SettingPanel 布局设置** — `el-drawer` 侧边面板，动态标题 / Logo / 手风琴菜单 / 面包屑 / 标签页 / 标签页图标 / 页面转场动效（6 种）均可可视化开关，支持重置与持久化保存

### 🏠 首页与登录

- **Dashboard 首页** — 项目简介 + 技术栈分类展示（通用 / 前端 / 后端，带官方链接卡片）
- **Login 登录页** — 图形验证码（点击刷新）、记住密码、回车登录，`getTimeGreeting()` 根据时段展示问候语，登录后自动跳转回跳地址
- **用户个人中心** — 个人信息展示、修改密码（Argon2 加密）

### 📦 共享工具包

- `@yunhe-vue/utils` 独立包 — `formatTime()` 时间格式化、`getTimeGreeting()` 时段问候语，前后端复用

### 🧱 前端组件体系

- **ProTable** — el-table 封装，动态列配置、slot 插槽、加载状态、代理暴露原生方法
- **ProSearch** — 表单搜索，input / select / date 类型，展开 / 收起，24 格自适应布局
- **ProPagination** — 分页封装，移动端自适应简化布局
- **ProChart** — ECharts 封装，暗黑主题自动切换、ResizeObserver 自适应、自动销毁防内存泄漏
- **DictTag** — 字典值回显组件，自动匹配标签样式
- **Markdown** — md-editor-v3 封装，暗黑模式适配
- **SvgIcon** — SVG sprite 图标组件
- **IconSelect** — 图标选择器

### 🏗 前端工程化

- **路由守卫** — `beforeGuard` 统一鉴权流程（白名单放行 → Token 校验 → 拉取用户信息 → 动态注册路由 → 重定向回跳），`afterGuard` 收尾进度条与动态标题
- **SCSS + BEM** 为主方案，**UnoCSS** 原子化为辅
- **暗黑模式** — CSS 变量 + Element Plus SCSS 主题变量，一键切换
- **响应式布局** — PC / Pad / Mobile 三端适配，侧边栏自动折叠，移动端 `html[data-device='mobile']`
- **Pinia Store** — 6 个模块分层管理：`user`（用户/角色/权限）、`app`（设备/侧栏/组件尺寸）、`permission`（动态路由）、`setting`（布局配置持久化）、`tagsView`（标签页状态）、`ai`（AI 会话）
- **自动导入** — `unplugin-auto-import`（ref / computed / onMounted 等）+ `unplugin-vue-components`（Element Plus 组件按需）
- Vite 8 + Rolldown 构建，内置拆包 / 压缩 / `rollup-plugin-visualizer` 分析
- **NProgress** 路由切换 + 请求加载双进度条，可通过环境变量独立开关

### 🐳 后端工程化与部署

- **配置管理** — YAML 文件加载 + 环境变量覆盖（Docker 环境自动注入数据库 / Redis / JWT / 邮箱 / OpenAI 配置）
- **日志** — Winston 按日滚动文件日志，生产环境不输出敏感信息
- **Docker** — 多阶段构建（前端 Nginx + 后端 Node），健康探针 + Nginx 反向代理 + gzip_static
- **Monorepo 脚本** — `pnpm dev:admin` / `dev:server` / `docker:up` / `docker:down` 统一编排
