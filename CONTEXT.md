# Repository context

This repository contains reviewable ServiceNow delivery products and their installation evidence.

## Layout

- The repository-root SDK project is the existing `x_bahs_dw2` Diagnostic Workbench 2 source. It remains a separate application and must not be merged into, renamed as, or overwritten by another scope.
- `products/dsb-delivery-workbench/` contains the client-neutral Unified Delivery Workbench product in scope `x_1577958_dsb`.
- Each product release is immutable after publication. Corrections belong in a new version directory with a changelog and a new manifest.

## Conventions

- Keep ServiceNow scope IDs, update-set IDs, versions, checksums, deployment status, and known gaps explicit.
- Preview transported update sets before commit. Do not accept or skip collisions without review.
- Run read-only and PLAN modes before any APPLY mode. APPLY requires an approved change reference, a named update set, rollback evidence, and human approval.
- Do not commit credentials, PATs, instance passwords, personal data, or raw customer evidence.
- Treat live-instance validation evidence as environment-specific. Publish only the minimum audit summary and checksums needed to prove the release.
