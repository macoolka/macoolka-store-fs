---
title: index.ts
nav_order: 1
parent: 模块
---

# 概述

本地文件系统的 MacoolkaStore 实例

---

<h2 class="text-delta">目录</h2>

- [buildStore (函数)](#buildstore-%E5%87%BD%E6%95%B0)
- [showFile (导出)](#showfile-%E5%AF%BC%E5%87%BA)

---

# buildStore (函数)

从一个根路径建立 MonadFileStore

**签名**

```ts

export const buildStore = (root: string): MonadFileStore & { root: string } => ...

```

**示例**

```ts
import * as path from 'path'
import buildStore from 'macoolka-store-local'
const store = buildStore(path.join(__dirname, 'fixtures', 'tests'))
```

v0.2.0 中添加

# showFile (导出)

**签名**

```ts

Show<Partial<FileWhereUniqueInput>>

```

v0.2.0 中添加
