import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// ServiceNow Diagnostic Workbench 2
//
// Faithful duplicate of the in-instance "ServiceNow Diagnostic Workbench"
// (scope x_1577958_servic_0, UI page diagnostic_workbench), rebased for SWEP
// TEMP as x_bahs_dw2 and extended with the
// Workbench 2 assessment-pack features. The delivery pattern is the same one
// the original uses and that this instance is proven to serve correctly:
//
//   - page.html is a genuine Jelly document (CDATA-wrapped stylesheet plus the
//     #app shell), so the sys_ui_page html field parses cleanly.
//   - The entire application bundle lives in src/bundle/workbench.js and is
//     delivered through the page's client_script as a gzip+base64 payload,
//     decompressed in the browser (tools/gen-client.mjs, wired into
//     `npm run build`). Nothing in the bundle is exposed to Jelly (${...})
//     processing or scoped-script rewriting.
// ---------------------------------------------------------------------------

UiPage({
    $id: Now.ID['diagnostic-workbench-2-page'],
    endpoint: 'x_bahs_dw2_diagnostic_workbench.do',
    description:
        'ServiceNow Diagnostic Workbench 2 - local-first assessment workspace: scope, collect, validate, map, diagnose, and deliver. Duplicate of the in-instance Diagnostic Workbench with guided diagnosis, DIAG envelope collectors, rule engine, pack health, and assessment-pack generators.',
    category: 'general',
    html: Now.include('./page.html'),
    clientScript: Now.include('./client_script.js'),
    direct: true,
})
