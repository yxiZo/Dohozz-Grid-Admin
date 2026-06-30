# 前端部署方案

本项目采用 **Docker 镜像 + Nginx 静态资源服务 + Nginx 反向代理 API** 的部署方式。

## 部署原则

- v0.app 只维护页面和前端代码。
- 前端代码固定请求同源 `/api`。
- 测试/生产 API 地址不写进前端构建产物。
- 镜像只构建一次，通过容器运行时环境变量切换测试/生产后端。
- Nginx 负责：
  - 托管 Vite 构建后的静态文件
  - SPA 路由 fallback 到 `index.html`
  - 将 `/api/*` 反向代理到后端服务

## 镜像构建

```bash
docker build -t dohozzgrid-admin-fe:latest .
```

## 本地运行

```bash
docker compose up --build
```

访问：

```text
http://localhost:8080
```

默认 compose 中：

```yaml
API_UPSTREAM: "http://host.docker.internal:8081"
```

表示容器内 Nginx 会把：

```text
http://localhost:8080/api/login
```

代理到：

```text
http://host.docker.internal:8081/api/login
```

> 注意：`API_UPSTREAM` 只配置协议、域名、端口，不要带 `/api` 路径。Nginx 会保留原始 `/api/...` 路径。

## 测试环境运行

示例：

```bash
docker run -d \
  --name dohozzgrid-admin-fe-test \
  -p 8080:80 \
  -e API_UPSTREAM="https://test-api.example.com" \
  dohozzgrid-admin-fe:latest
```

请求链路：

```text
浏览器 -> 前端域名 /api/* -> Nginx -> https://test-api.example.com/api/*
```

## 生产环境运行

示例：

```bash
docker run -d \
  --name dohozzgrid-admin-fe-prod \
  -p 80:80 \
  -e API_UPSTREAM="https://api.example.com" \
  dohozzgrid-admin-fe:latest
```

## Kubernetes 配置示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dohozzgrid-admin-fe
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dohozzgrid-admin-fe
  template:
    metadata:
      labels:
        app: dohozzgrid-admin-fe
    spec:
      containers:
        - name: admin-fe
          image: dohozzgrid-admin-fe:latest
          ports:
            - containerPort: 80
          env:
            - name: API_UPSTREAM
              value: "https://api.example.com"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 80
          livenessProbe:
            httpGet:
              path: /healthz
              port: 80
---
apiVersion: v1
kind: Service
metadata:
  name: dohozzgrid-admin-fe
spec:
  selector:
    app: dohozzgrid-admin-fe
  ports:
    - port: 80
      targetPort: 80
```

## API 代理规则

前端请求：

```ts
/api/login
/api/getInfo
/api/logout
```

Nginx 代理：

```nginx
location /api/ {
  proxy_pass ${API_UPSTREAM};
}
```

因此：

| 前端请求 | API_UPSTREAM | 实际后端请求 |
| --- | --- | --- |
| `/api/login` | `https://test-api.example.com` | `https://test-api.example.com/api/login` |
| `/api/getInfo` | `https://api.example.com` | `https://api.example.com/api/getInfo` |

如果后端真实路径不是 `/api/*`，应优先让后端网关兼容 `/api/*`；不要让前端为不同环境重新构建。

## 环境变量与隐私

真实环境变量不上 Git。仓库只提交 `.env.example` 作为模板，`.env*` 默认被 `.gitignore` 和 `.dockerignore` 忽略。

容器运行时只需要配置：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `NGINX_PORT` | `80` | Nginx 监听端口 |
| `API_UPSTREAM` | `http://backend:8080` | API 后端上游地址，只填协议、域名、端口 |

前端 Vite 环境变量继续保持默认，不把测试/生产 API host 打进静态产物：

```env
VITE_API_HOST=
VITE_API_PREFIX=/api
```

即构建产物永远请求同源 `/api`。

## Git 提交边界

应提交：

- `Dockerfile`
- `.dockerignore`
- `compose.yaml`
- `deploy/nginx/default.conf.template`
- `.env.example`
- 部署文档

不应提交：

- `.env`
- `.env.local`
- `.env.test`
- `.env.production`
- `.env.*.local`
- 任何包含真实 API 域名、内部地址、密钥、token、账号密码的文件

## 发布建议

推荐流水线：

```bash
pnpm install --frozen-lockfile
pnpm run build

docker build -t registry.example.com/dohozzgrid/admin-fe:${GIT_SHA} .
docker push registry.example.com/dohozzgrid/admin-fe:${GIT_SHA}
```

部署时按环境注入不同的 `API_UPSTREAM`：

- 测试：`https://test-api.example.com`
- 生产：`https://api.example.com`

## 验证

健康检查：

```bash
curl http://localhost:8080/healthz
```

静态页面：

```bash
curl -I http://localhost:8080/
```

API 代理：

```bash
curl -I http://localhost:8080/api/health
```
