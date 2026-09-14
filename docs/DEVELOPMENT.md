# Development Workflow

## Local setup
The canonical setup will be generated with Vite + React + TypeScript. Developers should clone the repository rather than manually recreating application files.

Expected commands after the project scaffold is available:

```bash
npm install
npm run dev
```

## Git workflow
1. Read the latest `main`.
2. Review the current architecture and relevant feature files.
3. Create a focused feature/fix branch.
4. Make the smallest coherent change.
5. Update documentation when behavior or architecture changes.
6. Verify the changed code.
7. Open a pull request into `main`.
8. Review the diff before merge.
9. Merge only after the change is coherent and verified.
10. Start the next task by re-reading the latest `main`.

## Naming discipline
Keep feature code grouped by business domain. Avoid renaming existing files/functions casually. If a public function or data contract changes, document the reason and update all callers.

## Simplicity rule
Prefer the simplest implementation that correctly supports the business. Do not introduce a library or abstraction merely because it is fashionable.
