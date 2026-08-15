# Platform Responsive + Interaction Audit Report

Generated: 2026-08-15T06:14:41.727Z

## Coverage Summary

- Pages tested: 74
- Pages skipped/unreachable: 5
- Total issues: 54

### Coverage gaps

- Platform authenticated routes skipped: E2E credentials not configured (missing env vars). Guest-accessible routes still audited.
- Missing vars sample: E2E_BUYER_EMAIL, E2E_BUYER_PASSWORD, E2E_SELLER_EMAIL, E2E_SELLER_PASSWORD, E2E_COOP_APPROVED_EMAIL, E2E_COOP_APPROVED_PASSWORD…
- Admin routes skipped: ADMIN_GATE_SECRET, ADMIN_PASSPHRASE, or E2E admin credentials not configured.
- Institution role not audited: no E2E fixture account exists (institution treated like buyer in code; add fixture to extend coverage).
- Locale: zh (routes prefixed with /zh).

### Skipped routes

| Page | Viewport | Role | Reason |
|------|----------|------|--------|
| /zh/marketplace → marketplace-detail | 1440px | guest | no matching link on list page (empty state) |
| /zh/marketplace → marketplace-detail | 1024px | guest | no matching link on list page (empty state) |
| /zh/marketplace → marketplace-detail | 768px | guest | no matching link on list page (empty state) |
| /zh/marketplace → marketplace-detail | 390px | guest | no matching link on list page (empty state) |
| /zh/marketplace → marketplace-detail | 360px | guest | no matching link on list page (empty state) |

## Low (54)

### /zh @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "大胆交易。放心交换。共同成长。"

### /zh/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "大宗商品行情"

### /zh/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "刚果（金）"

### /zh/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "铜"

### /zh/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "USD"

### /zh/solutions @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "一个平台。四种交易方式。"

### /zh/resources @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "了解刚果（金）矿产贸易"

### /zh/about @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "我们的使命"

### /zh/calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "矿业日历"

### /zh/calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部"

### /zh/login @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "登录"

### /zh/marketplace @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部挂牌"

### /zh @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "大胆交易。放心交换。共同成长。"

### /zh/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "大宗商品行情"

### /zh/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "刚果（金）"

### /zh/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "铜"

### /zh/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "USD"

### /zh/solutions @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "一个平台。四种交易方式。"

### /zh/resources @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "了解刚果（金）矿产贸易"

### /zh/about @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "我们的使命"

### /zh/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "矿业日历"

### /zh/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部"

### /zh/login @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "登录"

### /zh/marketplace @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部挂牌"

### /zh @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "大胆交易。放心交换。共同成长。"

### /zh/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "大宗商品行情"

### /zh/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "刚果（金）"

### /zh/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "铜"

### /zh/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "USD"

### /zh/solutions @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "一个平台。四种交易方式。"

### /zh/resources @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "了解刚果（金）矿产贸易"

### /zh/about @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "我们的使命"

### /zh/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "矿业日历"

### /zh/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部"

### /zh/login @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "登录"

### /zh/marketplace @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部挂牌"

### /zh/prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "大宗商品行情"

### /zh/prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "刚果（金）"

### /zh/solutions @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "一个平台。四种交易方式。"

### /zh/resources @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "了解刚果（金）矿产贸易"

### /zh/about @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "我们的使命"

### /zh/calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "矿业日历"

### /zh/calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部"

### /zh/login @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "登录"

### /zh/marketplace @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部挂牌"

### /zh/prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "大宗商品行情"

### /zh/prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "刚果（金）"

### /zh/solutions @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "一个平台。四种交易方式。"

### /zh/resources @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "了解刚果（金）矿产贸易"

### /zh/about @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "我们的使命"

### /zh/calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "矿业日历"

### /zh/calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部"

### /zh/login @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "登录"

### /zh/marketplace @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "全部挂牌"

