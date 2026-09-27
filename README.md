# ServiceNow Diagnostic Workbench 2

ServiceNow SDK source for the scoped **Diagnostic Workbench 2** application.

- Scope: `x_bahs_dw2`
- Application sys_id: `7691f128fe834e1d8e6217d71bbfffa4`
- SWEP TEMP endpoint: `https://sweptemp.service-now.com/x_bahs_dw2_diagnostic_workbench.do`
- Source baseline: the full DEV Workbench 2 interface, including all 22 sections and Platform Design Assurance content

## Automated evidence collection

The Workbench can run its bundled collectors directly from **Collection run** or **Script library**.

- 55 statically allowlisted scripts: 7 extractors, 22 FIX audits/templates, 20 diagnostic collectors and 6 Platform Design Assurance collectors.
- Phase controls run a single phase or the complete safe catalog in sequence.
- Read-only collectors execute with a server-sanitised customer profile.
- The 6 write-capable templates (`FIX-02`, `FIX-03`, `FIX-04`, `FIX-06`, `FIX-09`, `FIX-17`) are forced to `PLAN`; the API cannot apply their changes.
- Executable source is never accepted from the browser.
- Each result is imported into the local Workbench assessment and retained as a JSON attachment on the current administrator's `sys_user` record.
- **Upload output** accepts JSON or DIAG envelope text up to 2 MB, stores it as an attachment and imports it into the assessment.

The server boundary is an authenticated, admin-only Scripted REST API at `/api/x_bahs_dw2/workbench`.

## Build and deploy

```bash
pnpm install
pnpm run build
pnpm run deploy -- --auth sweptemp
```

`tools/gen-client.mjs` packages the browser bundle. `tools/gen-server-runners.mjs` derives the static server runner registry from the same embedded script sources, so the visible catalog and server allowlist remain aligned.

## Verified in SWEP TEMP

Verified 28 September 2026:

- SDK build and installation completed successfully.
- The deployed UI exposes all 22 Workbench sections and 55 scripts.
- `ITSM-INC-001` completed read-only and stored its output attachment.
- `FIX-02` completed in forced `PLAN` mode with `applied = 0` and stored its output attachment.
- The separate output-upload path returned `201 Created` and stored the uploaded JSON attachment.
- Deployment update set: `Diagnostic_Workbench_Automated_Evidence_EB` (`351e2cd23ba38310f4237ea693e45a57`).

## Safety notes

Run access is restricted to administrators. Evidence scripts are count-first or aggregate-oriented, and consumer content must not be added to diagnostic payloads. Review generated evidence before using it as the basis for findings or remediation.
