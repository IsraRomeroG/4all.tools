# P06R-F — Content Index Lifecycle Closure

Microfase correctiva posterior a P06R y previa a P07.

Su objetivo es cerrar los dos bloqueadores restantes de la auditoría:

1. routing y content queries deben compartir el mismo snapshot de `PublishedContentIndexes` durante una composición/build;
2. el delivery route registry no debe permanecer obsoleto durante desarrollo.

Secuencia:

```text
P06R
  ↓
P06R-F
  ↓
P07
```

Contenido:

```text
P06R-F-content-index-lifecycle-closure/
├── PHASE.md
├── T01-shared-published-content-snapshot.md
├── T02-development-route-registry-lifecycle.md
└── T03-lifecycle-regression-tests-and-closure.md
```
