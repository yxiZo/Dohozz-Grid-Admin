# Mock 系统说明

## 目标

本项目的 mock 方案目标只有一个：**开发阶段能快速联调，后续切换后端接口时尽量不改业务代码**。

## 方案原则

1. 业务页面不直接写 mock 数据。
2. 页面只依赖 `services/*`。
3. `services/*` 只依赖统一的 `api` 实例。
4. mock 只在开发环境按开关启用。
5. mock 路由、返回结构、字段命名尽量与后端保持一致。

## 开关方式

```env
VITE_MOCK_ENABLED=true
VITE_API_BASE_URL=/api
```

关闭 mock，直连后端：

```env
VITE_MOCK_ENABLED=false
VITE_API_BASE_URL=https://your-backend.example.com/api
```

## 请求链路

`页面 -> service -> api(axios) -> MSW mock 或真实后端`

## 目录约定

```txt
src/
  lib/api.ts
  services/
  mocks/
    browser.ts
    handlers.ts
    handlers/*.ts
    db/*.ts
```

## 新增接口流程

1. 先在 `src/services/` 新增对应 API 方法。
2. 再在 `src/mocks/handlers/` 新增同路径 mock。
3. mock 返回必须保持统一响应结构：

```ts
type ApiResponse<T> = {
  code: number
  message: string
  data: T
}
```

## 切换到后端时

只需要：

1. 把 `VITE_MOCK_ENABLED=false`
2. 配好 `VITE_API_BASE_URL`
3. 保持接口路径一致

业务代码不需要改。

