import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const PREVIEW = 'file:///home/claude/dw/app3/tools/preview/index.html';
const OUT = '/home/claude/dw/app3/tools/preview/out';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function env(collector, module, metrics) {
  return '*** Script: DIAG_ENVELOPE_BEGIN\n' + JSON.stringify({
    collector, version: '1.0', instance: 'https://dev438211.service-now.com',
    captured_at: new Date().toISOString(), module, category: 'Diagnostics',
    schema_version: '2.0', read_only: true, classification: 'aggregate',
    contains_pii: false, record_count: 100, metrics,
    results: [], entities: [], relationships: [], notes: [],
  }) + '\n*** Script: DIAG_ENVELOPE_END';
}
const PASTE = [
  env('ITSM_SLA_001', 'ITSM', { definitions_active: 12, attach_ratio: 31, breached_ratio: 44 }),
  env('SECOPS_VR_001', 'Security Operations', { vi_unmatched_ratio: 22, vi_stale_ratio: 12 }),
  env('CMDB_DUP_001', 'CMDB & CSDM', { srv_name_dup_ratio: 9, hw_serial_dup_ratio: 2 }),
].join('\n');

const errors = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ acceptDownloads: true });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('APP: ' + m.text()); });
page.on('pageerror', e => errors.push('APP pageerror: ' + e.message));
await page.goto(PREVIEW, { waitUntil: 'load' });
await page.waitForTimeout(900);

// 1. shell renders with the new nav entries
const nav = await page.$$eval('.nav-item span', els => els.map(e => e.textContent.trim()));
console.log('nav:', JSON.stringify(nav));

// 2. visit every view
for (const v of ['dashboard','scope','modules','collection','scripts','guided','packs','validation','inventory','dependencies','findings','evidence','solutions','authoring','rescans','roadmap','reports','history','administration']) {
  await page.evaluate(view => {
    document.querySelector(`.nav-item[data-view="${view}"]`)?.click();
  }, v);
  await page.waitForTimeout(120);
}
console.log('views cycled, errors so far:', errors.length);

// 3. collector present in script library
await page.evaluate(() => document.querySelector('.nav-item[data-view="scripts"]')?.click());
await page.waitForTimeout(200);
const bodyTxt = await page.textContent('body');
console.log('collector ITSM-SLA-001 in library:', bodyTxt.includes('ITSM-SLA-001'));

// open collector detail and load its source
await page.evaluate(() => document.querySelector('[data-action="select-script"][data-id="ITSM-SLA-001"], button[data-id="ITSM-SLA-001"]')?.click());
await page.waitForTimeout(200);
const loadBtn = await page.$('[data-action="load-script-source"]');
if (loadBtn) { await loadBtn.click(); await page.waitForTimeout(600); }
const srcShown = await page.evaluate(() => {
  const sourceView = document.querySelector('#script-source code');
  return sourceView ? sourceView.textContent : null;
});
const slaSourceMatched = Boolean(srcShown?.includes('ITSM-SLA-001 - SLA health')) && !srcShown?.includes('ITSM-INC-001 - Incident health');
console.log('collector source matches selection:', slaSourceMatched, '| preview:', JSON.stringify(srcShown?.slice(0, 60) ?? null));
if (!slaSourceMatched) throw new Error('ITSM-SLA-001 loaded the wrong collector source');

// 4. paste envelopes
await page.evaluate(() => document.querySelector('.nav-item[data-view="packs"]')?.click());
await page.waitForTimeout(150);
await page.click('[data-action="paste-envelope"]');
await page.waitForTimeout(150);
await page.fill('#paste-text', PASTE);
await page.click('[data-action="submit-paste"]');
await page.waitForTimeout(600);
const valTxt = await page.textContent('body');
console.log('validation view shows envelope dataset:', /envelope/i.test(valTxt), '| validated:', /Validated/.test(valTxt));

// 5. findings: rule + correlation findings present
await page.evaluate(() => document.querySelector('.nav-item[data-view="findings"]')?.click());
await page.waitForTimeout(250);
const findTxt = await page.textContent('body');
console.log('rule findings:', /RULE-/.test(findTxt), '| CORR-001:', /CORR-001|Vulnerability Response matching/.test(findTxt));

// 6. pack health scored
await page.evaluate(() => document.querySelector('.nav-item[data-view="packs"]')?.click());
await page.waitForTimeout(250);
const packTxt = await page.textContent('body');
console.log('pack health scored:', /%/.test(packTxt), '| not-assessed packs listed:', /No evidence/.test(packTxt));

// 7. guided diagnosis
await page.evaluate(() => document.querySelector('.nav-item[data-view="guided"]')?.click());
await page.waitForTimeout(200);
await page.fill('[data-filter="guided-query"]', 'SLA not attaching');
await page.waitForTimeout(250);
const rb = await page.$('[data-action="open-runbook"]');
console.log('runbook match for "SLA not attaching":', !!rb);
if (rb) { await rb.click(); await page.waitForTimeout(250); }
const step = await page.$('[data-action="toggle-runbook-step"]');
if (step) { await step.click(); await page.waitForTimeout(250); }
const guidedTxt = await page.textContent('body');
console.log('runbook opened with steps:', /Open in Script library|Catalogue reference/.test(guidedTxt));

// 8. summary document
await page.evaluate(() => document.querySelector('.nav-item[data-view="reports"]')?.click());
await page.waitForTimeout(250);
const [dl1] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="export-summary"]')]);
const f1 = path.join(OUT, dl1.suggestedFilename());
await dl1.saveAs(f1);
console.log('summary downloaded:', dl1.suggestedFilename(), fs.statSync(f1).size);

// 9. explorer generation: satisfy the gate, then generate
const gate = await page.evaluate(() => {
  // build on the live state via the test hook + globals
  const s = structuredClone ? structuredClone : (x => JSON.parse(JSON.stringify(x)));
  // reach current state through renderWorkbenchForTest round-trip is lossy; instead drive globals
  return typeof renderWorkbenchForTest === 'function' && typeof createEmptyState === 'function';
});
console.log('test hooks reachable:', gate);
await page.evaluate(() => {
  // satisfy blockers on the current state through the app's own merge results
  // (state is module-scoped; use the test hook to swap an upgraded clone in)
  const upgraded = JSON.parse(JSON.stringify(window.__lastState || null)) || null;
});
// use in-page script: rebuild state from scratch with app functions, then render
const genReady = await page.evaluate((paste) => {
  let s = createEmptyState();
  s.assessment.client = 'Acme Corp';
  s.assessment.lead = 'E. Bennetts';
  s.assessment.application = { name: 'Diagnostics', scopes: ['x_1577958_dw2'], prefixes: ['u_diag_'], tokens: ['diag'], alwaysInclude: [] };
  s.assessment.environments = [{ id: 'e1', name: 'https://dev438211.service-now.com', role: 'Production', upgradeType: 'Unknown' }];
  s.customerProfile = null;
  s.customerProfile = customerProfileFromState(s);
  s.customerProfile.changeReference = 'CHG0001';
  s.customerProfile.serviceUser = 'svc.diag';
  s.customerProfile.requiredRole = 'admin';
  s.instanceManifest = normaliseInstanceManifest({ schema: 'servicenow-instance-manifest/1', applications: [], plugins: [], scopes: [], tables: [] });
  s.moduleCoverage = [];
  s.approvals = [{ id: 'a1', type: 'publication', status: 'Approved', by: 'E. Bennetts', at: new Date().toISOString() }];
  s = mergeSubmittedDataset(s, buildEnvelopeSubmission(paste, 'scripts-background.txt', s));
  s.components = [{ sysId: 'abc123', name: 'SLA Reassign BR', type: 'Business Rule', table: 'sys_script', updated: '', application: '', active: 'true', source: { script: "var grTask = new GlideRecord('task_sla');" } }];
  const firstFinding = s.findings[0];
  s.links = [{ id: 'l1', findingId: firstFinding ? firstFinding.id : 'RULE-X', componentSysId: 'abc123', how: 'manual', status: 'Active' }];
  s.reference = { gaps: [{ question: 'PROD change history not provided; DEV evidence only.' }] };
  s.stages = s.stages.map(st => ({ ...st, status: 'Analysis complete' }));
  renderWorkbenchForTest(s, 'reports');
  const btn = document.querySelector('[data-action="export-explorer"]');
  return { blockers: blockersForExplorer(s), disabled: btn ? btn.disabled : null, findings: s.findings.length };
}, PASTE);
console.log('explorer gate:', JSON.stringify(genReady));
if (genReady.disabled === false) {
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="export-explorer"]')]);
  const f2 = path.join(OUT, dl2.suggestedFilename());
  await dl2.saveAs(f2);
  console.log('explorer downloaded:', dl2.suggestedFilename(), fs.statSync(f2).size);

  const exErrors = [];
  const p2 = await ctx.newPage();
  p2.on('console', m => { if (m.type() === 'error') exErrors.push('EXP: ' + m.text()); });
  p2.on('pageerror', e => exErrors.push('EXP pageerror: ' + e.message));
  await p2.goto('file://' + f2, { waitUntil: 'load' });
  await p2.waitForTimeout(600);
  const exp = await p2.evaluate(() => {
    const first = document.querySelector('.item');
    if (first) first.click();
    return {
      items: document.querySelectorAll('.item').length,
      title: document.title,
      hasRule: /RULE-/.test(document.body.innerText),
      detail: (document.getElementById('detail')?.innerText || '').slice(0, 80),
    };
  });
  await p2.waitForTimeout(300);
  const exp2 = await p2.evaluate(() => ({
    artefactBlock: /Affected artefacts/.test(document.body.innerText),
    remediation: /Remediation/.test(document.body.innerText),
  }));
  console.log('generated explorer:', JSON.stringify({ ...exp, ...exp2 }));
  console.log('EXPLORER ERRORS:', exErrors.length, JSON.stringify(exErrors.slice(0, 4)));
  await p2.screenshot({ path: path.join(OUT, 'explorer.png') });
}

// 10. summary renders clean
const sumErrors = [];
const p3 = await ctx.newPage();
p3.on('console', m => { if (m.type() === 'error') sumErrors.push('SUM: ' + m.text()); });
p3.on('pageerror', e => sumErrors.push('SUM pageerror: ' + e.message));
await p3.goto('file://' + f1, { waitUntil: 'load' });
await p3.waitForTimeout(400);
const sm = await p3.evaluate(() => {
  const t = document.body.innerText;
  return {
    sections: ['Purpose', 'Evidence base', 'Health scorecard', 'Findings', 'Solutions', 'Known gaps'].map(s => [s, t.includes(s)]),
    notAssessed: /Not assessed/i.test(t),
    len: t.length,
  };
});
console.log('summary render:', JSON.stringify(sm));
await p3.screenshot({ path: path.join(OUT, 'summary.png'), fullPage: true });

console.log('APP ERRORS:', errors.length, JSON.stringify(errors.slice(0, 6)));
console.log('SUMMARY ERRORS:', sumErrors.length, JSON.stringify(sumErrors.slice(0, 4)));
await browser.close();
