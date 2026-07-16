---
name: project-verification-policy
description: Use for code changes in this project. Avoid unmanaged long-running dev/preview servers, but run finite verification commands when required.
---

# Project Verification Policy

Do not launch unmanaged long-running dev or preview servers.

Run finite check, test, and build commands whenever a task spec or phase gate requires them.

`npm run build` is permitted when it is part of required verification, including `npm run test:build` and `npm run verify`.
