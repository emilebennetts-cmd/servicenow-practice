#!/usr/bin/env python3
"""
Workbench 2 feature merge for the duplicated Diagnostic Workbench bundle.

Grafts onto src/bundle/workbench.js (the decompressed duplicate of the
in-instance x_1577958_servic_0 application):

  1. 20 read-only DIAG-envelope module-pack collectors in the Script library
     (catalog entries + sources merged into the embedded sources pack).
  2. Envelope-aware evidence intake: .txt/.log/.json uploads and a new
     paste panel accept Scripts - Background output containing DIAG envelopes,
     validated through the existing dataset-validation ledger.
  3. A configuration-driven rule engine (42 rules + 4 cross-module
     correlations) that turns accepted envelopes into classified findings with
     drafted solutions, merged into the existing findings/fixes stores.
  4. Pack health: per-module-pack evidence coverage and severity-weighted
     scores, with its own view.
  5. Guided diagnosis: symptom search across 15 runbooks with ordered,
     progress-tracked check sequences.
  6. A print-ready few-page assessment summary generator beside the existing
     report/explorer/delivery generators.

Anchor-asserted; refuses to run twice.
"""
import json, gzip, base64, io, os, sys, glob

BUNDLE = "src/bundle/workbench.js"
src = open(BUNDLE).read()
if "DIAG_RULES" in src:
    sys.exit("merge_wb2_features: already applied")

cat = json.load(open("tools/wb2_catalog.json"))

# ---------------------------------------------------------------- sources ---
sources = json.load(open("tools/base_script_sources.json"))
collector_files = sorted(glob.glob("tools/collector-sources/*.js"))
assert len(collector_files) == 20, collector_files
for path in collector_files:
    cid = os.path.basename(path).split("_")[0]
    sources[cid] = open(path).read()
packed = base64.b64encode(gzip.compress(
    json.dumps(sources).encode(), 9)).decode()

import re
m = re.search(r'const WORKBENCH_SCRIPT_SOURCES_GZIP = "[^"]+";', src)
assert m, "sources const not found"
src = src[:m.start()] + f'const WORKBENCH_SCRIPT_SOURCES_GZIP = "{packed}";' + src[m.end():]

# ------------------------------------------------------------- data consts --
def js(value):
    return json.dumps(value, separators=(",", ":"))

collectors = [s for s in cat["scripts"]]
collector_meta = [{
    "id": s["id"], "title": s["title"].replace(".js", "").replace("_", " "),
    "module": s.get("module", ""), "description": s.get("description", ""),
} for s in collectors]

DIAG_DATA = f"""
// ===================== Workbench 2 diagnostics extension =====================
// Configuration-driven: collectors, rules, correlations, runbooks and packs
// are generated from one specification (tools/wb2_catalog.json) so collector
// metric names and rule definitions cannot drift apart.
const DIAG_RULES = {js(cat["rules"])};
const DIAG_CORRELATIONS = {js(cat["correlations"])};
const DIAG_RUNBOOKS = {js(cat["runbooks"])};
const DIAG_PACKS = {js(cat["packs"])};
const DIAG_COLLECTORS = {js(collector_meta)};
const DIAG_SEVERITY_MAP = {{ Critical: ["Critical", "P1"], Error: ["High", "P2"], Warning: ["Medium", "P3"], Info: ["Low", "P4"] }};

SCRIPT_CATALOG.push(...DIAG_COLLECTORS.map((collector) => ({{
  id: collector.id,
  title: collector.title,
  file: `collectors/${{collector.id}}.js`,
  stage: 4,
  description: collector.description,
  kind: "collector",
  safety: "Read-only aggregate collection - emits one DIAG envelope; no consumer content, no writes",
  sourceUrl: "",
  module: collector.module,
}})));
"""

DIAG_FUNCS = r"""
function diagCollectorKey(value) {
  return String(value || "").replace(/_/g, "-").trim();
}

function diagEnvelopesFromText(text) {
  const cleaned = String(text || "").replace(/^\*\*\* Script: /gm, "");
  const envelopes = [];
  let cursor = 0;
  for (;;) {
    const begin = cleaned.indexOf("DIAG_ENVELOPE_BEGIN", cursor);
    if (begin < 0) break;
    const end = cleaned.indexOf("DIAG_ENVELOPE_END", begin);
    if (end < 0) break;
    const slice = cleaned.slice(begin + 19, end);
    const opening = slice.indexOf("{");
    const closing = slice.lastIndexOf("}");
    if (opening >= 0 && closing > opening) {
      try {
        const envelope = JSON.parse(slice.slice(opening, closing + 1));
        if (envelope && envelope.schema_version && envelope.collector && envelope.metrics) envelopes.push(envelope);
      } catch (error) { /* tolerated: the validation ledger reports it */ }
    }
    cursor = end + 17;
  }
  if (!envelopes.length) {
    const trimmed = cleaned.trim();
    if (trimmed[0] === "{") {
      try {
        const envelope = JSON.parse(trimmed);
        if (envelope && envelope.schema_version && envelope.collector && envelope.metrics) envelopes.push(envelope);
      } catch (error) { /* not an envelope */ }
    }
  }
  return envelopes;
}

function diagEvalOp(value, op, threshold) {
  switch (op) {
    case ">": return value > threshold;
    case "<": return value < threshold;
    case ">=": return value >= threshold;
    case "<=": return value <= threshold;
    case "==": return value === threshold;
    default: return false;
  }
}

function diagRuleFinding(rule, entry, value) {
  const mapped = DIAG_SEVERITY_MAP[rule.severity] || ["Medium", "P3"];
  const envelope = entry.env;
  return {
    id: "RULE-" + rule.id.replace(/[^A-Za-z0-9_-]/g, "-"),
    title: rule.title,
    domain: envelope.module || rule.collector,
    severity: mapped[0],
    likelihood: "Confirmed by measurement",
    rootCause: (rule.causes || []).join("; "),
    evidence: rule.collector + " · " + rule.metric + " = " + value + " (threshold " + rule.op + " " + rule.threshold + ") · captured " + (envelope.captured_at || "") + " on " + (envelope.instance || ""),
    impact: rule.impact || "",
    remediation: rule.recommendation || "",
    effort: rule.complexity || "TBC",
    priority: mapped[1],
    priorityLabel: mapped[1],
    status: "Draft",
    environment: entry.environment || "",
    confidence: "Measured",
    owner: "Unassigned",
    sourceRef: rule.collector,
    sourceDocument: entry.datasetName || "DIAG envelope",
  };
}

function diagCorrelationFinding(correlation, parts) {
  const mapped = DIAG_SEVERITY_MAP[correlation.severity] || ["High", "P2"];
  return {
    id: "CORR-" + correlation.id.replace(/^CORR-/, ""),
    title: correlation.title,
    domain: "Cross-module",
    severity: mapped[0],
    likelihood: "Correlated measurements",
    rootCause: correlation.detail || "",
    evidence: parts.map((part) => part.collector + " · " + part.metric + " = " + part.value).join(" | "),
    impact: correlation.impact || "",
    remediation: correlation.recommendation || "",
    effort: correlation.complexity || "High",
    priority: mapped[1],
    priorityLabel: mapped[1],
    status: "Draft",
    environment: "",
    confidence: "Correlated",
    owner: "Unassigned",
    sourceRef: parts.map((part) => part.collector).join(" + "),
    sourceDocument: "DIAG envelopes (correlated)",
  };
}

function diagEvaluate(state) {
  const envelopes = state.envelopes || {};
  const findings = [];
  const stats = { evaluated: 0, triggered: 0, notApplicable: 0 };
  DIAG_RULES.forEach((rule) => {
    const entry = envelopes[diagCollectorKey(rule.collector)];
    if (!entry) return;
    const value = entry.env.metrics[rule.metric];
    if (value === undefined || value === null) return;
    if (value === -1) { stats.notApplicable += 1; return; }
    stats.evaluated += 1;
    if (diagEvalOp(value, rule.op, rule.threshold)) {
      stats.triggered += 1;
      findings.push(diagRuleFinding(rule, entry, value));
    }
  });
  DIAG_CORRELATIONS.forEach((correlation) => {
    const parts = [];
    const satisfied = (correlation.requires || []).every((requirement) => {
      const entry = envelopes[diagCollectorKey(requirement.collector)];
      if (!entry) return false;
      const value = entry.env.metrics[requirement.metric];
      if (value === undefined || value === null || value === -1) return false;
      if (!diagEvalOp(value, requirement.op, requirement.threshold)) return false;
      parts.push({ collector: requirement.collector, metric: requirement.metric, value });
      return true;
    });
    if (satisfied) findings.push(diagCorrelationFinding(correlation, parts));
  });
  return { findings, stats };
}

function diagPackHealth(state) {
  const envelopes = state.envelopes || {};
  return DIAG_PACKS.map((pack) => {
    const packCollectors = pack.collectors || [];
    const collected = packCollectors.filter((collector) => envelopes[diagCollectorKey(collector)]).length;
    const packFindings = state.findings.filter((finding) => {
      const ref = String(finding.sourceRef || "");
      return packCollectors.some((collector) => ref.includes(diagCollectorKey(collector)));
    });
    let score = null;
    let status = "No evidence";
    if (collected) {
      score = 100;
      packFindings.forEach((finding) => {
        if (finding.severity === "Critical") score -= 30;
        else if (finding.severity === "High") score -= 20;
        else if (finding.severity === "Medium") score -= 10;
      });
      score = Math.max(score, 5);
      status = score >= 80 ? "Healthy" : score >= 55 ? "Warning" : "At risk";
    }
    return { id: pack.id, label: pack.label, collectors: packCollectors, collected, total: packCollectors.length, findings: packFindings.length, score, status };
  });
}

function diagDraftFixes(state, findings) {
  findings.forEach((finding) => {
    if (state.fixes[finding.id]) return;
    state.fixes[finding.id] = {
      approach: "DRAFT (rule-generated) - " + (finding.remediation || "Investigate the measured condition and agree the remediation approach."),
      verify: "Re-run " + (finding.sourceRef || "the source collector") + " after the change and confirm the metric is back inside its threshold; attach the fresh envelope as evidence.",
      rollback: "Configuration-level change - back out via the named update set / change record used for the fix.",
    };
  });
}

function diagValidationResults(envelopes, text) {
  const results = [];
  const add = (rule, outcome, detail) => results.push({ id: uuid(), rule, outcome, detail, at: nowIso() });
  if (!envelopes.length) add("DIAG envelope present", "Fail", "No parseable DIAG envelope was found between DIAG_ENVELOPE_BEGIN/END markers.");
  else add("DIAG envelope present", "Pass", envelopes.length + " envelope(s) parsed.");
  envelopes.forEach((envelope) => {
    if (envelope.read_only !== true) add("Read-only collection", "Fail", envelope.collector + ": the envelope does not declare read_only=true.");
    if (envelope.contains_pii === true) add("Consumer/person data excluded", "Fail", envelope.collector + ": the envelope declares contains_pii=true and is not acceptable evidence.");
  });
  if (envelopes.length && !results.some((result) => result.outcome === "Fail")) {
    add("Read-only collection", "Pass", "Every envelope declares read-only collection.");
    add("Consumer/person data excluded", "Pass", "No envelope declares consumer or person content.");
  }
  if (secretLeak(text)) add("Secret redaction", "Fail", "A credential-shaped string may be present in the raw output. Redact at source before retrying.");
  else add("Secret redaction", "Pass", "No credential-shaped string was detected.");
  return results;
}

function buildEnvelopeSubmission(text, name, state) {
  const envelopes = diagEnvelopesFromText(text);
  return {
    kind: "envelope",
    name,
    rows: envelopes.length,
    parsed: { envelopes },
    text,
    validationResults: diagValidationResults(envelopes, text),
    hash: "",
    environment: state.assessment.environments[0]?.name || "Unspecified",
  };
}

function renderPackHealth() {
  const health = state.packHealth && state.packHealth.length ? state.packHealth : diagPackHealth(state);
  const tiles = health.map((pack) => `
    <article class="phase-card pack-tile ${pack.score === null ? "is-idle" : pack.status === "Healthy" ? "is-good" : pack.status === "Warning" ? "is-warn" : "is-risk"}">
      <div class="phase-number">${pack.score === null ? "&mdash;" : pack.score + "%"}</div>
      <div><strong>${escapeHtml(pack.label)}</strong>
      <small>${pack.collected}/${pack.total} collectors · ${pack.findings} finding${pack.findings === 1 ? "" : "s"} · ${escapeHtml(pack.status)}</small></div>
    </article>`).join("");
  const rows = health.map((pack) => `
    <tr class="${pack.score === null ? "muted-row" : ""}"><td><strong>${escapeHtml(pack.label)}</strong></td>
    <td>${pack.collected} / ${pack.total}</td><td>${pack.findings}</td>
    <td>${pack.score === null ? "&mdash;" : pack.score + "%"}</td><td>${chip(pack.status)}</td>
    <td>${(pack.collectors || []).map((collector) => `<small class="mono-id">${escapeHtml(collector)}</small>`).join(" ")}</td></tr>`).join("");
  return `${viewHeading("Module packs", "Pack health", "Severity-weighted health per module pack, from accepted DIAG envelopes and the findings the rule engine derived from them. A pack with no evidence is reported as not assessed - never assumed healthy.", '<button class="button secondary" data-action="navigate" data-view="scripts">Open Script library</button><button class="button primary" data-action="paste-envelope">Paste script output</button>')}
  <section class="panel"><div class="phase-cards pack-grid">${tiles}</div></section>
  <section class="panel"><div class="table-wrap"><table><thead><tr><th>Pack</th><th>Evidence</th><th>Findings</th><th>Score</th><th>Status</th><th>Collectors</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function diagRunbookMatches(query) {
  const lowered = String(query || "").toLowerCase().trim();
  if (!lowered) return DIAG_RUNBOOKS;
  return DIAG_RUNBOOKS.filter((runbook) =>
    runbook.title.toLowerCase().includes(lowered) ||
    (runbook.symptoms || []).some((symptom) => symptom.toLowerCase().includes(lowered) || lowered.includes(symptom.toLowerCase())));
}

function renderGuided() {
  const guided = state.guided || { runbookId: "", done: {} };
  const matches = diagRunbookMatches(ui.guidedQuery);
  const active = DIAG_RUNBOOKS.find((runbook) => runbook.id === guided.runbookId);
  const list = matches.map((runbook) => `
    <button class="item nav-item ${active && active.id === runbook.id ? "is-active" : ""}" data-action="open-runbook" data-id="${escapeHtml(runbook.id)}">
      <span>${escapeHtml(runbook.title)}</span><small>${escapeHtml(runbook.pack)} · ${(runbook.steps || []).length} checks</small>
    </button>`).join("") || renderEmpty("No runbook matches", "Describe the symptom differently, or open the Script library and pick a collector directly.");
  let detail = renderEmpty("Pick a runbook", "Search by symptom (for example \"SLA not attaching\" or \"requests not generating RITMs\") and select a runbook to see its ordered, read-only check sequence.");
  if (active) {
    const steps = (active.steps || []).map((stepId, index) => {
      const script = SCRIPT_CATALOG.find((item) => item.id === stepId);
      const done = Boolean((guided.done[active.id] || {})[stepId]);
      const body = script
        ? `<strong>${escapeHtml(script.id)}</strong><small>${escapeHtml(script.description || script.title)}</small><div class="detail-actions"><button class="button secondary compact" data-action="select-script" data-id="${escapeHtml(script.id)}">Open in Script library</button></div>`
        : `<strong>${escapeHtml(stepId)}</strong><small>Catalogue reference - run this check from the engagement's master script library, then import its output here.</small>`;
      return `<article class="guide-step ${done ? "is-done" : ""}">
        <button class="step-check" data-action="toggle-runbook-step" data-runbook="${escapeHtml(active.id)}" data-step="${escapeHtml(stepId)}" aria-label="Toggle step">${done ? "✓" : index + 1}</button>
        <div>${body}</div></article>`;
    }).join("");
    detail = `<div class="panel"><span class="eyebrow">${escapeHtml(active.pack)} pack</span><h2>${escapeHtml(active.title)}</h2>
      <p>${escapeHtml(active.guidance || "")}</p>
      <p class="small"><em>Symptoms:</em> ${(active.symptoms || []).map((symptom) => chip(symptom)).join(" ")}</p>
      <div class="guide-steps">${steps}</div>
      <div class="script-next-step"><strong>Then</strong><span>Import every produced result through Evidence intake (upload or paste). The rule engine turns accepted envelopes into findings with drafted solutions automatically - it records evidence, it never asserts root cause on its own.</span></div></div>`;
  }
  return `${viewHeading("Guided diagnosis", "From symptom to evidence", "Describe the symptom in plain words or pick a runbook. Every step is a read-only check; nothing here executes against the instance.", '<button class="button primary" data-action="paste-envelope">Paste script output</button>')}
  <div class="guided-grid"><section class="panel"><label class="search-box">${icon("search")}<input data-filter="guided-query" placeholder="Describe the symptom, e.g. SLA not attaching" value="${escapeHtml(ui.guidedQuery || "")}"></label><div class="guided-list">${list}</div></section><section>${detail}</section></div>`;
}

function renderPastePanel() {
  if (!ui.pasteOpen) return "";
  return `<div class="busy-layer paste-layer"><div class="panel paste-panel">
    <span class="eyebrow">Evidence intake</span><h2>Paste Scripts - Background output</h2>
    <p class="small">Paste the complete output (including the DIAG_ENVELOPE_BEGIN/END markers). The submission passes the same validation ledger as file uploads; envelopes declaring consumer data are refused.</p>
    <textarea id="paste-text" rows="10" placeholder="*** Script: DIAG_ENVELOPE_BEGIN&#10;{ ... }&#10;*** Script: DIAG_ENVELOPE_END"></textarea>
    <div class="form-actions"><span></span><div><button class="button secondary" data-action="close-paste">Cancel</button>
    <button class="button primary" data-action="submit-paste">Validate &amp; accept</button></div></div>
  </div></div>`;
}

function buildAssessmentSummaryHtml(state) {
  const generatedAt = new Date();
  const health = diagPackHealth(state);
  const assessed = health.filter((pack) => pack.score !== null);
  const notAssessed = health.filter((pack) => pack.score === null);
  const activeDatasets = state.datasets.filter((dataset) => dataset.status !== "Superseded");
  const envelopeEntries = Object.values(state.envelopes || {});
  const findings = sortedFindings(state.findings);
  const severityCounts = deriveStats(state).severity;
  const gaps = state.reference?.gaps || [];
  const client = state.assessment.client || "[CLIENT NAME]";
  const registerRows = findings.slice(0, 16).map((finding) => `
    <tr><td class="mono-id">${escapeHtml(finding.id)}</td><td>${escapeHtml(finding.title)}</td>
    <td><span class="sev sev-${escapeHtml(finding.severity)}">${escapeHtml(finding.severity)}</span></td>
    <td>${escapeHtml(finding.priorityLabel || finding.priority)}</td><td>${escapeHtml(finding.domain)}</td>
    <td>${escapeHtml(finding.evidence || "")}</td></tr>`).join("");
  const solutionRows = findings.filter((finding) => state.fixes[finding.id]).slice(0, 16).map((finding) => {
    const fix = state.fixes[finding.id];
    return `<tr><td class="mono-id">${escapeHtml(finding.id)}</td><td>${escapeHtml(fix.approach || "")}</td><td>${escapeHtml(finding.owner || "Unassigned")}</td><td>${escapeHtml(finding.targetDate || "TBC")}</td></tr>`;
  }).join("");
  const datasetRows = activeDatasets.map((dataset) => `
    <tr><td>${escapeHtml(dataset.name)}</td><td>${escapeHtml(dataset.kind)}</td><td>${formatNumber(dataset.rows)}</td>
    <td>${escapeHtml(dataset.environment)}</td><td>${escapeHtml(shortDate(dataset.collectedAt))}</td><td>${escapeHtml(dataset.status)}</td></tr>`).join("");
  const envelopeRows = envelopeEntries.map((entry) => `
    <tr><td class="mono-id">${escapeHtml(entry.env.collector)}</td><td>${escapeHtml(entry.env.module || "")}</td>
    <td>${escapeHtml(entry.env.instance || "")}</td><td>${escapeHtml(entry.env.captured_at || "")}</td>
    <td>${formatNumber(Object.keys(entry.env.metrics || {}).length)} metrics</td></tr>`).join("");
  const healthRows = health.map((pack) => `
    <tr class="${pack.score === null ? "not-assessed" : ""}"><td>${escapeHtml(pack.label)}</td>
    <td>${pack.score === null ? "Not assessed" : pack.score + "%"}</td><td>${escapeHtml(pack.status)}</td>
    <td>${pack.collected} / ${pack.total}</td><td>${pack.findings}</td></tr>`).join("");
  const sevLine = ["Critical", "High", "Medium", "Low"].map((level) => `<span class="sev sev-${level}">${level} ${severityCounts[level] || 0}</span>`).join(" ");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(client)} - Assessment Summary</title>
<style>
:root{--deep:#12363f;--teal:#0e7c86;--green:#5bd747;--ink:#17333b;--muted:#64777d;--rule:#d8e1e3;--crit:#c94736;--amber:#c78016}
*{box-sizing:border-box}body{margin:0;font-family:Inter,Aptos,"Segoe UI",Arial,sans-serif;color:var(--ink);font-size:12.5px;line-height:1.55;background:#fff}
.page{max-width:830px;margin:0 auto;padding:34px 42px}
.cover{background:var(--deep);color:#fff;padding:42px;border-bottom:6px solid var(--green)}
.cover .eyebrow{letter-spacing:.14em;text-transform:uppercase;font-size:11px;color:#9fd9c8}
.cover h1{margin:8px 0 4px;font-size:27px}.cover p{margin:2px 0;color:#cfe0e2}
h2{color:var(--deep);font-size:17px;border-bottom:2px solid var(--rule);padding-bottom:6px;margin:26px 0 10px}
h2 span{color:var(--teal);margin-right:8px}
table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11.5px}
th{background:var(--deep);color:#fff;text-align:left;padding:6px 8px;font-weight:600}
td{border-bottom:1px solid var(--rule);padding:6px 8px;vertical-align:top}
tr.not-assessed td{color:var(--muted);font-style:italic}
.sev{display:inline-block;padding:1px 8px;border-radius:9px;color:#fff;font-size:10.5px;font-weight:700}
.sev-Critical{background:var(--crit)}.sev-High{background:#d0653a}.sev-Medium{background:var(--amber)}.sev-Low{background:#2e9e5b}
.callout{border:1px solid var(--teal);background:#eef7f7;border-radius:8px;padding:10px 14px;margin:12px 0}
.mono-id{font-family:Consolas,monospace;font-size:10.5px}
footer{margin-top:30px;padding-top:10px;border-top:1px solid var(--rule);color:var(--muted);font-size:10.5px}
@media print{.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4;margin:14mm}h2{break-after:avoid}table{break-inside:auto}}
</style></head><body>
<div class="cover"><span class="eyebrow">Client confidential · point-in-time assessment artefact</span>
<h1>${escapeHtml(state.assessment.name)}</h1>
<p>${escapeHtml(client)} · Assessment summary · generated ${escapeHtml(generatedAt.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }))}</p>
<p>ServiceNow Diagnostic Workbench 2 · registry ${escapeHtml(MODULE_REGISTRY_VERSION)}</p></div>
<div class="page">
<h2><span>1</span>Purpose &amp; scope</h2>
<p>${escapeHtml(state.assessment.purpose || "This summary condenses the current Diagnostic Workbench assessment store into a few pages for stakeholders who will read nothing else: what was assessed, on what evidence, what was found, and what happens next.")}</p>
<p><strong>Environments:</strong> ${state.assessment.environments.map((environment) => escapeHtml(environment.name + " (" + environment.role + ")")).join(", ")}.
<strong>Packs with evidence:</strong> ${assessed.length ? assessed.map((pack) => escapeHtml(pack.label)).join(", ") : "None yet"}.</p>
<p><strong>Not assessed (no evidence loaded):</strong> ${notAssessed.length ? notAssessed.map((pack) => escapeHtml(pack.label)).join(", ") : "None - every pack carries evidence"}. A pack listed here carries no verdict of any kind.</p>
<h2><span>2</span>Evidence base</h2>
<table><thead><tr><th>Dataset</th><th>Kind</th><th>Rows</th><th>Environment</th><th>Received</th><th>Status</th></tr></thead><tbody>${datasetRows || '<tr><td colspan="6">No datasets accepted yet.</td></tr>'}</tbody></table>
${envelopeRows ? `<table><thead><tr><th>Collector</th><th>Module</th><th>Instance</th><th>Captured</th><th>Contents</th></tr></thead><tbody>${envelopeRows}</tbody></table>` : ""}
<h2><span>3</span>Health scorecard</h2>
<table><thead><tr><th>Pack</th><th>Score</th><th>Status</th><th>Evidence</th><th>Findings</th></tr></thead><tbody>${healthRows}</tbody></table>
<h2><span>4</span>Findings</h2>
<p>${formatNumber(state.findings.length)} finding(s): ${sevLine}. The register below lists the highest-priority entries; the full register lives in the Workbench and the generated Issue &amp; Artefact Explorer.</p>
<table><thead><tr><th>ID</th><th>Finding</th><th>Severity</th><th>Priority</th><th>Domain</th><th>Evidence</th></tr></thead><tbody>${registerRows || '<tr><td colspan="6">No findings recorded yet.</td></tr>'}</tbody></table>
<h2><span>5</span>Solutions &amp; next steps</h2>
<table><thead><tr><th>Finding</th><th>Approach</th><th>Owner</th><th>Target</th></tr></thead><tbody>${solutionRows || '<tr><td colspan="4">No solutions drafted yet.</td></tr>'}</tbody></table>
<h2><span>6</span>Known gaps &amp; interpretation control</h2>
${gaps.length ? `<ul>${gaps.map((gap) => `<li>${escapeHtml(gap.question || gap.title || gap)}</li>`).join("")}</ul>` : "<p><em>No gaps have been declared yet. Declare them in the Workbench reference view before issuing this summary - a summary with no declared gaps invites the wrong kind of confidence.</em></p>"}
<div class="callout"><strong>Interpretation control.</strong> Every finding in this summary traces to named evidence (dataset, collector envelope, or register row). Rule-derived findings record measurements against configured thresholds; correlations propose - and never assert - causation. Solutions marked DRAFT are rule-generated starting points awaiting human confirmation.</div>
<footer>Generated by ServiceNow Diagnostic Workbench 2 from the local assessment store · ${escapeHtml(generatedAt.toISOString())} · supersedes any earlier summary for this assessment.</footer>
</div></body></html>`;
}
"""

# ------------------------------------------------------------- patches ------
def patch(old, new, count=1):
    global src
    assert src.count(old) == count, f"anchor x{src.count(old)} (wanted {count}): {old[:90]}"
    src = src.replace(old, new, 1)

# 1. navigation entries
patch('  ["scripts", "Script library", "code"],',
      '  ["scripts", "Script library", "code"],\n  ["guided", "Guided diagnosis", "search"],\n  ["packs", "Pack health", "shield"],')

# 2. state: envelopes + guided + packHealth
patch("    datasets: [],\n    validationResults: [],",
      "    datasets: [],\n    validationResults: [],\n    envelopes: {},\n    packHealth: [],\n    guided: { runbookId: \"\", done: {} },")
patch("  next.reference = candidate.reference && typeof candidate.reference === \"object\" ? candidate.reference : {};\n  return next;",
      "  next.reference = candidate.reference && typeof candidate.reference === \"object\" ? candidate.reference : {};\n"
      "  next.envelopes = candidate.envelopes && typeof candidate.envelopes === \"object\" ? candidate.envelopes : {};\n"
      "  next.packHealth = Array.isArray(candidate.packHealth) ? candidate.packHealth : [];\n"
      "  next.guided = candidate.guided && typeof candidate.guided === \"object\" ? { runbookId: \"\", done: {}, ...candidate.guided } : { runbookId: \"\", done: {} };\n"
      "  return next;")

# 3. ui state additions
patch("let ui = {", "let ui = {\n  guidedQuery: \"\",\n  pasteOpen: false,")

# 4. envelope intake in handleFiles (before JSON/CSV parsing)
patch("      let parsed;\n      if (lower.endsWith(\".json\")) parsed = JSON.parse(text);",
      "      if (text.includes(\"DIAG_ENVELOPE_BEGIN\")) {\n"
      "        state = mergeSubmittedDataset(state, buildEnvelopeSubmission(text, file.name, state));\n"
      "        continue;\n"
      "      }\n"
      "      let parsed;\n      if (lower.endsWith(\".json\")) parsed = JSON.parse(text);")
patch("      else if (lower.endsWith(\".csv\")) parsed = parseCsv(text);\n      else throw new Error(`${file.name}: unsupported file type.`);",
      "      else if (lower.endsWith(\".csv\")) parsed = parseCsv(text);\n"
      "      else if (lower.endsWith(\".txt\") || lower.endsWith(\".log\")) throw new Error(`${file.name}: no DIAG envelope found in the text output.`);\n"
      "      else throw new Error(`${file.name}: unsupported file type.`);")

# 5. merge branch + stage ranges
patch("    } else if (submission.kind === \"result\") {",
      "    } else if (submission.kind === \"envelope\") {\n"
      "      (submission.parsed?.envelopes || []).forEach((envelope) => {\n"
      "        next.envelopes[diagCollectorKey(envelope.collector)] = {\n"
      "          env: envelope,\n"
      "          receivedAt: timestamp,\n"
      "          datasetName: submission.name,\n"
      "          environment: submission.environment || envelope.instance || \"Unspecified\",\n"
      "        };\n"
      "      });\n"
      "      const evaluation = diagEvaluate(next);\n"
      "      next.findings = mergeBy(next.findings, evaluation.findings, \"id\");\n"
      "      diagDraftFixes(next, evaluation.findings);\n"
      "      next.packHealth = diagPackHealth(next);\n"
      "      next.audit.unshift({ id: uuid(), at: timestamp, action: \"Rule engine evaluated\", detail: `${evaluation.stats.evaluated} rule(s) evaluated, ${evaluation.stats.triggered} triggered, ${evaluation.stats.notApplicable} not applicable.` });\n"
      "    } else if (submission.kind === \"result\") {")
patch("        manifest: [2, 4],\n        result: [4, 18],",
      "        manifest: [2, 4],\n        result: [4, 18],\n        envelope: [4, 15],")

# 6. view renderers
patch("    validation: renderValidation,",
      "    validation: renderValidation,\n    guided: renderGuided,\n    packs: renderPackHealth,")

# 7. paste panel in shell
patch("      ${ui.toast ? `<div class=\"toast\" role=\"status\">${escapeHtml(ui.toast)}</div>` : \"\"}",
      "      ${ui.toast ? `<div class=\"toast\" role=\"status\">${escapeHtml(ui.toast)}</div>` : \"\"}\n      ${renderPastePanel()}")

# 8. actions
patch('  if (action === "reset-state") {',
      '''  if (action === "open-runbook") { state.guided.runbookId = target.dataset.id; return saveAndRender("Runbook opened"); }
  if (action === "toggle-runbook-step") {
    const runbookId = target.dataset.runbook;
    const progress = state.guided.done[runbookId] || {};
    progress[target.dataset.step] = !progress[target.dataset.step];
    state.guided.done[runbookId] = progress;
    return saveAndRender("Progress saved");
  }
  if (action === "paste-envelope") { ui.pasteOpen = true; return renderShell(); }
  if (action === "close-paste") { ui.pasteOpen = false; return renderShell(); }
  if (action === "submit-paste") {
    const pasted = document.getElementById("paste-text")?.value || "";
    if (!pasted.trim()) return showToast("Paste the Scripts - Background output first.");
    ui.pasteOpen = false;
    state = mergeSubmittedDataset(state, buildEnvelopeSubmission(pasted, "Pasted script output " + new Date().toLocaleTimeString(), state));
    state.activeView = "validation";
    return saveAndRender("Pasted output processed");
  }
  if (action === "export-summary") {
    download(`${safeFileName(state.assessment.client || state.assessment.name)}_assessment_summary.html`, buildAssessmentSummaryHtml(state), "text/html");
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Assessment summary generated", detail: `${state.findings.length} finding(s) and ${state.datasets.filter((dataset) => dataset.status !== "Superseded").length} active dataset(s) summarised.` });
    return saveAndRender("Assessment summary downloaded");
  }
  if (action === "reset-state") {''')

# 9. guided query filter
patch('  if (filter === "global") ui.query = event.target.value;',
      '  if (filter === "global") ui.query = event.target.value;\n  if (filter === "guided-query") ui.guidedQuery = event.target.value;')

# 10. reports view: summary button
patch("<button class=\"button secondary\" data-action=\"export-report\">Generate HTML report</button><button class=\"button primary\" data-action=\"export-delivery\">Generate delivery package</button>",
      "<button class=\"button secondary\" data-action=\"export-report\">Generate HTML report</button><button class=\"button secondary\" data-action=\"export-summary\">Generate summary document</button><button class=\"button primary\" data-action=\"export-delivery\">Generate delivery package</button>")

# 11. validation view: paste button
patch("'<button class=\"button primary\" data-action=\"import-picker\">Upload or paste</button>'",
      "'<button class=\"button secondary\" data-action=\"paste-envelope\">Paste script output</button><button class=\"button primary\" data-action=\"import-picker\">Upload file</button>'")

# 12. append the extension block before boot()
patch("boot();\n", DIAG_DATA + DIAG_FUNCS + "\nboot();\n")

open(BUNDLE, "w").write(src)
print(f"merge applied; bundle now {len(src):,} bytes")
