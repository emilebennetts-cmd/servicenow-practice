# SWEP TEMP deployment validation

- Date: 28/09/2026
- Instance: `sweptemp.service-now.com`
- Validation engagement: `ENG0001001` — SWEP TEMP Unified Workbench Validation 2026-09-28
- Engagement sys_id: `29a48dde3b678310f4237ea693e45a7d`

## Verified

- Scope `x_1577958_dsb` exists at version `1.3.1`.
- The workbench UI and scripted REST API load successfully.
- The UI exposes six phases and eighteen controlled stages.
- The evidence page exposes one-button `Collect all (13)` read-only collection.
- All 13 standard evidence items completed and reached `Received`.
- Evidence review flags were raised as expected: 1 integration item and 2 role/group items; no collector failed.
- The script library exposes 29 profiled scripts with stage, safety, and write/read-only labels.
- A real `EXT-000` read-only run completed on `sweptemp` and produced the expected JSON attachment.
- The real result was uploaded through Collection run and saved as `DRN0001002` with status `validated`.
- `DRN0001002` recorded 4,926 metadata records, 0 warnings, and 0 errors.
- Source result SHA-256: `960A796ABE9D67B8515075319915D147FE684C695A8B3E0442E3FCC750D4B75D`.
- A smaller schema/upload smoke test was also retained as `DRN0001001`.
- The application update set and installation tracking update set are both `Complete`.
- The existing `x_bahs_dw2` Diagnostic Workbench 2 application was not changed.

## Safety interpretation

“Run all” is intentionally split by risk:

- Fixed built-in evidence collectors can run from the single `Collect all` button because they are read only.
- Read-only diagnostic scripts are organised by phase, guarded to the named instance, reviewed, run in Scripts - Background, and imported through the UI.
- Five write-capable scripts remain PLAN/APPLY controlled. They were not executed during this deployment. An unrestricted button that evaluates every script, including APPLY paths, would bypass the product’s change, approval, rollback, and instance guards.

## Known review items

- `sys_upgrade_history_log` read access was refused by the table's cross-scope policy.
- `subscription_entitlement` read access was denied pending a Restricted Caller Access privilege from Licensing Engine.
- These are explicit evidence-coverage gaps, not installation failures. Grant only the minimum read access when that evidence is required and re-run the affected collectors.
- Guided evidence that depends on client-approved files, Instance Scan exports, incidents, findings, remediation decisions, or human sign-off remains outstanding by design.
