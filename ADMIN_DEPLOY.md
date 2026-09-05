---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 7241eb0d53e0d80f6b1e62b6f1c8dd46_092e7bcea45911f1bc17525400826444
    ReservedCode1: fxrOpbOW8GifilxJVpF6V92sqG4v/dxGkT6gU9yNpHsSlBHupRwlVgC2mIp8Lf7WwuzvGZquAbAO1Ghxye56TIjzxyQgQ6HPlRJrGExQEAAAT8v/vNwxmkXo58cc8x7364mhLbDR2q5fPjSxLIknYqBbFhVi0r0AjIX5X59crxt+53PZw/YfdHM27mk=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 7241eb0d53e0d80f6b1e62b6f1c8dd46_092e7bcea45911f1bc17525400826444
    ReservedCode2: fxrOpbOW8GifilxJVpF6V92sqG4v/dxGkT6gU9yNpHsSlBHupRwlVgC2mIp8Lf7WwuzvGZquAbAO1Ghxye56TIjzxyQgQ6HPlRJrGExQEAAAT8v/vNwxmkXo58cc8x7364mhLbDR2q5fPjSxLIknYqBbFhVi0r0AjIX5X59crxt+53PZw/YfdHM27mk=
---

# Zeen 客户管理后台 — 部署说明

## 一、本次新增/修改的文件

**后端 API（Vercel Serverless Functions）**
| 文件 | 作用 |
|---|---|
| `api/_kv.js` | Vercel KV (Upstash Redis) 封装：getJSON / setJSON / delete |
| `api/_auth.js` | 认证模块：账号、会话（TTL 24h）、种子账号、Bearer 鉴权 |
| `api/_orders.js` | 订单存取：`order:<id>`、`orders:zset` 倒序索引、自增单号 `GZ-YYYYMMDD-XXXX` |
| `api/login.js` | POST `/api/login` 登录，返回 token |
| `api/logout.js` | POST `/api/logout` 登出 |
| `api/orders.js` | GET 列表（筛选/搜索）；POST 手动录入（来源 dealer / manual） |
| `api/orders/[id].js` | GET 详情；PUT 更新（状态/物流/客户/服务追踪）；DELETE（仅 admin） |
| `api/webhook.js` | **已改造**：Airwallex 支付成功 → KV 订单落库（幂等）+ Resend 邮件 |

**管理后台页面（静态，位于 `/admin/`）**
| 文件 | 作用 |
|---|---|
| `admin/login.html` | 登录页 |
| `admin/dashboard.html` | 订单列表（来源/状态筛选、关键词搜索） |
| `admin/order-detail.html` | 订单详情 + 状态/物流编辑 + 服务追踪时间线 |
| `admin/order-new.html` | 手动录入订单（经销商/客服转账） |
| `admin/admin.css` / `admin/admin.js` | 共享样式与鉴权逻辑 |

## 二、Vercel 环境变量（Dashboard → Settings → Environment Variables）

| 变量 | 必填 | 说明 |
|---|---|---|
| `KV_REST_API_URL` | ✅ | Vercel KV Store 的 REST URL |
| `KV_REST_API_TOKEN` | ✅ | Vercel KV Store 的 REST Token |
| `ADMIN_PASSWORD` | ✅ | 管理员密码（默认账号 `admin`） |
| `DEALER_PASSWORD` | 可选 | 经销商账号密码（默认账号 `dealer`） |
| `SUPPORT_PASSWORD` | 可选 | 客服账号密码（默认账号 `support`） |
| `RESEND_API_KEY` | ✅ | 已有，用于 webhook 邮件通知 |
| `ADMIN_NAME` / `DEALER_NAME` / `SUPPORT_NAME` | 可选 | 各角色显示名 |

> 种子账号机制：首次用某账号登录时，若该账号已在环境变量中声明密码，则自动创建账号；未声明则无法登录。

## 三、创建 Vercel KV Store

1. Vercel Dashboard → Storage → Create Database → 选择 KV (Upstash Redis)
2. 创建后进入 Store → 复制 **REST API URL** 与 **REST API Token**
3. 填入项目环境变量 `KV_REST_API_URL` / `KV_REST_API_TOKEN`

## 四、部署

```bash
cd gozeen-clone
git add -A
git commit -m "feat: add admin dashboard with KV storage"
git push origin main
```

Vercel 自动构建部署。`api/` 目录自动识别为 Serverless Functions，`admin/` 为静态页面。

## 五、访问地址

- 后台入口：`https://gozeen.hk/admin/login`
- 订单 API：`https://gozeen.hk/api/orders`（需 `Authorization: Bearer <token>`）

## 六、数据模型说明

三个订单来源：
1. **官网在线支付**：Airwallex webhook 自动落库（`source=online`），以 payment intent id 做幂等，不重复建单
2. **经销商录入**：后台手动录入（`source=dealer`）
3. **客服转账录入**：后台手动录入（`source=manual`）

订单字段：产品名/编码(SKU)/数量/单价、支付方式/金额/币种/流水号、收件人/地址/电话、物流公司/运单号/状态、后续服务追踪记录（时间线）。
*（内容由AI生成，仅供参考）*
