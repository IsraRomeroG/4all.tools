# P09R Traceability Matrix

| Audit finding | P09 authority | P09R task | Required evidence |
|---|---|---|---|
| Duplicate article identity fixture missing | P09-T02 exact content identities | T01 | Unit fixture emits `DUPLICATE_CONTENT_IDENTITY` with both source IDs/statuses |
| Unknown tool content fixture missing | P09-T02 content-domain ownership | T01 | Unit fixture emits `UNKNOWN_TOOL_CONTENT_ID` |
| Orphan module fixture missing | P09-T02 module ownership | T01 | Unit fixture emits `ORPHAN_TOOL_MODULE` |
| Module identity mismatch fixture missing | P09-T02 module metadata | T01 | Unit fixture emits `TOOL_MODULE_IDENTITY_MISMATCH` |
| Missing component/messages branches unproved | P09-T02 module completeness | T01 | Direct fixtures for both issue codes |
| SEO cluster may describe wrong target | P09-T04 composition/SEO integrity | T02 | Wrong-subject fixture fails deterministically |
| Variant target may disagree with cluster/current route | P09-T04 stable target cluster | T02 | Wrong-variant-target fixture fails deterministically |
| T04 negative matrix incomplete | P09-T04 acceptance matrix | T02 | Focused fixtures for all listed cases |
| Feature engine may import components | P09-T05 pure-engine boundary | T03 | Narrow engine rule + negative fixture |
| Public validation output not directly disproven | P09-T05/T06 build-only validator | T03 | `dist` negative assertions for reserved validation outputs |
| Final CI evidence should cover final head | P09-T06 closure | T04 | GitHub Actions successful run on exact final SHA |

---

## Cross-task non-regression authorities

Every P09R task must preserve:

- P06R-F snapshot lifecycle tests;
- P07/P07R missing/noindex locale semantics;
- P08/P08R frozen blog output;
- P09 production architecture zero-issue test;
- existing `verify` ordering and GitHub workflow.
