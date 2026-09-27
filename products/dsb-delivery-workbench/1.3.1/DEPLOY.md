# Controlled deployment

## Before import

1. Confirm the target is a non-production instance and that the existing `x_bahs_dw2` application must remain untouched.
2. Create a dedicated installation update set and make it current.
3. Calculate and compare the SHA-256 values in `MANIFEST.md`.
4. Confirm there is no existing application with scope `x_1577958_dsb`, or agree the upgrade path before importing.

## Ordered transport

Import, preview, and commit these files in order:

1. `update-sets/01-DSB-1.3.1-scope-bootstrap.xml`
2. `update-sets/02-DSB-1.3.1-application.xml`
3. `update-sets/03-DSB-1.3.1-server-modules.xml`

For each file:

1. Upload it through Retrieved Update Sets.
2. Preview it.
3. Stop if there are collisions, errors, or missing references; do not accept or skip them by default.
4. Commit only after the preview is clean and independently verify the resulting records.

The original package ZIP is retained for provenance. SWEP TEMP rejected direct third-party ZIP installation; the ordered XML route above is the tested recovery path.

## Post-install checks

1. Confirm `sys_scope` shows scope `x_1577958_dsb`, version `1.3.1`.
2. Confirm all 14 `sys_module` records under `x_1577958_dsb/dsb-workbench/1.3.1/` exist.
3. Confirm property `x_1577958_dsb.run.backend_enabled` is `true`.
4. Open `/x_1577958_dsb_workbench.do` and create a dedicated validation engagement.
5. Complete Scope & context, generate the evidence list, and use `Collect all`.
6. Confirm all 13 built-in items reach `Received`; review non-zero flags rather than treating them as collection failures.
7. Run `EXT-000` read-only in Scripts - Background, download the generated JSON attachment, and import it in Collection run.
8. Confirm the diagnostic run is `validated`, ran on the intended instance, and has no errors.
9. Keep PLAN/APPLY scripts in PLAN until the engagement has a change reference, approval, rollback, and a named update set.

## Rollback

- Do not delete the separate `x_bahs_dw2` application.
- Use the committed update-set records and ServiceNow rollback guidance for the imported sets.
- Preserve the update-set XML, preview evidence, package checksum, and validation record before any rollback.
- Roll back in reverse order only after impact review: server modules, application, then scope bootstrap.
