---
title: index.ts
nav_order: 1
parent: Modules
---

# Overview

Macoolka Store Instance about file system.

---

<h2 class="text-delta">Table of contents</h2>

- [buildStore (function)](#buildstore-function)
- [showFile (export)](#showfile-export)

---

# buildStore (function)

build a MonadFileStore with a root path

**Signature**

```ts

export const buildStore = (root: string): MonadFileStore & { root: string } => ...

```

**Example**

```ts
import * as path from 'path'
import buildStore from 'macoolka-store-local'
const store = buildStore(path.join(__dirname, 'fixtures', 'tests'))
```

Added in v0.2.0

# showFile (export)

**Signature**

```ts

Show<Partial<FileWhereUniqueInput>>

```

Added in v0.2.0
