---
name: dependency-artifact-policy
description: Use for code changes that touch dependency artifacts, package-manager files, lockfiles such as package-lock.json, node_modules, npm install/ci behavior, Node.js version changes, package.json dependencies/devDependencies/engines, or CI failures caused by dependency resolution. Prevent manual edits to generated dependency files.
---

# Dependency Artifact Policy

Treat dependency artifacts as generated state, not hand-authored source.

## Rules

- Do not manually edit `package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml`, `yarn.lock`, or equivalent lockfiles.
- Do not manually edit generated dependency directories such as `node_modules/`.
- Do not use `apply_patch` or text-editing commands to modify lockfile dependency graphs, resolved versions, integrity hashes, package metadata blocks, or transitive dependency entries.
- Only change `package.json` intentionally, then let the package manager update generated artifacts.
- For Node.js version changes, update authoritative source files such as `.nvmrc`, `package.json` `engines`, CI setup, and documentation; regenerate lockfiles with the package manager instead of patching them.
- If `package-lock.json` must change, use npm commands such as `npm install`, `npm install --package-lock-only`, or another repository-approved npm command.
- Verify with `npm ci` after lockfile regeneration. `npm ci` validates the lockfile but does not repair it.
- If `npm ci` fails because `package.json` and `package-lock.json` disagree, regenerate the lockfile with npm rather than editing it.
- If a clean dependency state is needed, remove generated artifacts only after confirming the target paths are inside the workspace, then run the package manager to recreate them.

## Recommended Workflows

### Change Node.js Version

1. Update `.nvmrc`.
2. Update `package.json` `engines.node`.
3. If relevant, update `@types/node` in `package.json`.
4. Run `npm install` or `npm install --package-lock-only` so npm updates `package-lock.json`.
5. Run `npm ci`.
6. Run the required verification command.

### Change Dependencies

1. Use `npm install <package>` or `npm install --save-dev <package>` for dependency changes.
2. Use `npm uninstall <package>` for removals.
3. Avoid hand-editing lockfile transitive entries.
4. Run `npm ci`.
5. Run the required verification command.

### Repair a Bad Lockfile

Use a clean package-manager regeneration path:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm ci
```

Before running destructive cleanup commands, confirm the resolved paths stay inside the workspace.

## Red Flags

Stop and switch to package-manager commands if a planned edit touches:

- `resolved`
- `integrity`
- `node_modules/<package>`
- transitive dependency entries
- lockfile package blocks
- optional or peer dependency resolution details
