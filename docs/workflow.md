# 项目工作流

本文档说明本项目在 **v0.app 维护页面**、**本地连接测试环境验证**、以及 **测试/生产发布** 时的推荐工作流。

## 核心原则

1. 页面和 UI 主要由 v0.app 维护。
2. Git 只提交 `.env.example` 这类模板文件，不提交任何真实环境变量文件。
3. 本地开发人员如需连接测试环境，应使用本地私有环境变量文件，不提交真实测试环境地址。
4. 测试环境和生产环境的真实 API host 应配置在 CI/CD、部署平台或容器运行时环境变量中，而不是硬编码进仓库。

## 环境变量约定

项目使用 Vite 环境变量，所有暴露给前端的变量必须以 `VITE_` 开头。

### 已使用变量

| 变量 | 说明 |
| --- | --- |
| `VITE_API_HOST` | API host，例如 `https://api.example.com` |
| `VITE_API_PREFIX` | API 路径前缀，默认 `/api` |
| `VITE_API_BASE_URL` | 完整 API base URL。若设置，则优先级高于 `VITE_API_HOST + VITE_API_PREFIX` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

API base URL 优先级：

1. 如果设置了 `VITE_API_BASE_URL`，直接使用它。
2. 否则如果设置了 `VITE_API_HOST`，使用 `VITE_API_HOST + VITE_API_PREFIX`。
3. 如果 `VITE_API_HOST` 为空，回退到同源 `/api`。

## 环境文件说明

| 文件 | 是否提交 | 用途 |
| --- | --- | --- |
| `.env.example` | 是 | 环境变量模板，不包含真实值 |
| `.env` | 否 | 本地私有配置 |
| `.env.local` | 否 | 本地私有配置 |
| `.env.test.local` | 否 | 本地连接测试环境使用 |
| `.env.production.local` | 否 | 本地临时模拟生产配置 |

`.gitignore` 已配置忽略 `.env*`，并只放行 `.env.example`。

> 原则：真实域名、内部地址、密钥、token、账号信息都不上 Git。

## v0.app 页面维护流程

适用于：页面布局、组件样式、表单、列表、导航等 UI 调整。

1. 在 v0.app 中修改页面。
2. 确认 v0.app 可以正常预览。
3. 不要在 v0.app 产物中写入真实测试或生产 API host。
4. 如需要 API 地址，保持使用仓库默认配置：

```env
VITE_API_HOST=
VITE_API_PREFIX=/api
```

这样 v0.app 会默认请求同源 `/api`，不会因为无法访问公司内网、测试网关、跨域限制或 API 不稳定而影响页面编辑。

## 本地连接测试环境流程

适用于：v0.app 修改页面后，本地开发者需要连接真实测试环境进行功能验证。

### 1. 创建本地测试环境文件

```bash
touch .env.test.local
```

### 2. 修改 `.env.test.local`

示例：

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_HOST=https://test-api.example.com
VITE_API_PREFIX=/api
```

如果测试环境需要完整覆盖，也可以使用：

```env
VITE_API_BASE_URL=https://test-api.example.com/api
```

### 3. 启动本地测试模式

```bash
pnpm run dev:test
```

该命令会使用 Vite 的 `test` mode，可加载本地私有的 `.env.test.local`。

本地验证完成后，不要提交 `.env.test.local`。

## 构建流程

### 前端静态构建

```bash
pnpm run build
```

推荐部署方式是 Docker + Nginx 反向代理。前端构建产物保持请求同源 `/api`，测试/生产后端地址通过容器运行时的 `API_UPSTREAM` 注入。

## 部署平台配置建议

在测试和生产部署平台中分别配置环境变量。

### 测试环境

```env
VITE_API_HOST=https://test-api.example.com
VITE_API_PREFIX=/api
```

或：

```env
VITE_API_BASE_URL=https://test-api.example.com/api
```

### 生产环境

```env
VITE_API_HOST=https://api.example.com
VITE_API_PREFIX=/api
```

或：

```env
VITE_API_BASE_URL=https://api.example.com/api
```

## 推荐协作方式

### v0.app 负责

- 页面结构
- 样式调整
- 组件布局
- 静态交互
- 表单和列表 UI

### 本地开发负责

- 连接测试 API
- 登录和鉴权验证
- 接口联调
- 构建检查
- 发布前验证

## 提交前检查

提交前建议确认：

```bash
git status --short
```

重点检查：

1. 没有提交任何 `.env*` 真实环境文件，除 `.env.example` 外。
2. 页面改动没有硬编码测试环境或生产环境地址。
3. Docker/Nginx 部署通过运行时 `API_UPSTREAM` 指向后端。
4. 如已安装依赖，可执行：

```bash
pnpm run lint
pnpm run build
```

## 常见问题

### 为什么不提交 `.env.test` 或 `.env.production`？

因为环境文件很容易混入真实域名、内部地址、密钥或 token。仓库只提交 `.env.example` 作为模板；测试和生产配置由 CI/CD、部署平台或容器运行时注入。

### 本地如何临时切换测试 API？

修改 `.env.test.local`，然后重新启动：

```bash
pnpm run dev:test
```

### 生产环境 API host 放在哪里？

放在部署平台环境变量中，不提交到仓库。

### 如果 API prefix 不是 `/api` 怎么办？

修改对应环境变量：

```env
VITE_API_PREFIX=/your-prefix
```

或直接使用完整覆盖：

```env
VITE_API_BASE_URL=https://api.example.com/your-prefix
```
