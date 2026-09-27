"use strict";

// ServiceNow Diagnostic Workbench 2 native customer-template bundle.
// Duplicate of the in-instance Diagnostic Workbench (x_1577958_servic_0), extended.

const PHASES = [
  { id: "setup", label: "Set up", stages: [1, 2, 3] },
  { id: "collect", label: "Collect", stages: [4, 5, 12] },
  { id: "map", label: "Map", stages: [6, 7] },
  { id: "review", label: "Review", stages: [8, 9, 10, 11, 13] },
  { id: "diagnose", label: "Diagnose", stages: [14, 15] },
  { id: "deliver", label: "Deliver", stages: [16, 17, 18] },
];

const STAGES = [
  [1, "Engagement setup", "Create the assessment, handling rules, team, and environment map.", "setup"],
  [2, "Application identification", "Confirm scope, prefixes, tokens, and always-include records.", "setup"],
  [3, "Scope & business context", "Record purpose, users, impact language, risks, and known events.", "setup"],
  [4, "Application inventory", "Count the structural surface before extracting source.", "collect"],
  [5, "Component extraction", "Collect configuration artefacts and resolve every cited component.", "collect"],
  [6, "Dependencies & relationships", "Review cited, inferred, and manually curated links.", "map"],
  [7, "Data-flow analysis", "Trace imports, transforms, automation, staging, and outputs.", "map"],
  [8, "Security & access", "Review ACL joins, client-callable surfaces, and public access.", "review"],
  [9, "Automation & execution", "Assess rule order, jobs, workflows, notifications, and SLAs.", "review"],
  [10, "Integrations", "Inventory endpoints, authentication, inbound mail, and REST operations.", "review"],
  [11, "Configuration & code quality", "Find hardcoding, debug noise, client-only enforcement, and drift.", "review"],
  [12, "Logs & errors", "Validate scan, upgrade-skipped, and log evidence per environment.", "collect"],
  [13, "Performance", "Assess slow transactions, query hotspots, and job overruns.", "review"],
  [14, "Incident correlation", "Disposition every incident against findings or explicit gaps.", "diagnose"],
  [15, "Root-cause analysis", "Classify causation with timelines and human confirmation.", "diagnose"],
  [16, "Solution development", "Complete the eight-part fix block and script approvals.", "deliver"],
  [17, "Prioritised plan", "Sequence by dependency, assign ownership, and set target dates.", "deliver"],
  [18, "Report generation", "Verify and issue explorer, register, and decision report outputs.", "deliver"],
].map(([id, title, purpose, phase]) => ({ id, title, purpose, phase }));

const NAVIGATION = [
  ["dashboard", "Command centre", "grid"],
  ["scope", "Scope & context", "target"],
  ["discovery", "Discovery workshop", "chat"],
  ["modules", "Module coverage", "layers"],
  ["collection", "Collection run", "checklist"],
  ["scripts", "Script library", "code"],
  ["guided", "Guided diagnosis", "search"],
  ["packs", "Pack health", "shield"],
  ["validation", "Validation", "shield"],
  ["inventory", "Components", "box"],
  ["dependencies", "Relationships", "nodes"],
  ["findings", "Findings", "flag"],
  ["evidence", "Evidence", "search"],
  ["solutions", "Solutions", "wrench"],
  ["playbook", "Solution playbook", "book"],
  ["authoring", "Authoring & approvals", "edit"],
  ["rescans", "Baseline & rescan", "compare"],
  ["roadmap", "Roadmap", "route"],
  ["deliveryplan", "Delivery plan", "calendar"],
  ["reports", "Report & export", "report"],
  ["history", "History", "history"],
  ["administration", "Administration", "settings"],
].map(([id, label, icon]) => ({ id, label, icon }));

const TOOLKIT_ROOT = "./toolkit-package/toolkit";
const AUTOMATION_API = "/api/x_bahs_dw2/workbench";

const extraction = [
  ["EXT-000", "Instance and module discovery", "extract/EXT-000_instance_module_discovery.js", 2, "Discovers installed applications, plugins, scopes, modules and custom tables without reading customer records."],
  ["EXT-100", "Artefact extract", "extract/EXT-100_artefact_extract.js", 5, "Read-only, count-first inventory and full source extraction."],
  ["EXT-101", "Resolve evidence sys_ids", "extract/EXT-101_resolve_evidence_sysids.js", 5, "Resolves every sys_id cited by the register."],
  ["EXT-102", "Find unresolved citations", "extract/EXT-102_find_unresolved.js", 5, "Identifies citations that remain absent after extraction."],
  ["EXT-103", "Targeted top-up", "extract/EXT-103_targeted_topup.js", 5, "Collects named components that do not carry application tokens."],
  ["EXT-103b", "Field discovery", "extract/EXT-103b_field_discovery.js", 5, "Reads populated fields when an extracted component has no known body field."],
  ["EXT-104", "Attachment log fallback", "extract/EXT-104_dump_attachment_to_log.js", 5, "Read-only fallback when JSON attachment download is blocked."],
];

const fixes = [
  ["FIX-01", "ACL role join audit", 8],
  ["FIX-02", "Client-callable ACL generator", 8],
  ["FIX-03", "Web-service access audit", 8],
  ["FIX-04", "Audit enablement", 11],
  ["FIX-05", "Debug logging sweep", 11],
  ["FIX-06", "Scheduled-job service account", 9],
  ["FIX-07", "Workflow version state", 9],
  ["FIX-08", "Public reports upgrade", 8],
  ["FIX-09", "Skipped-record disposition", 12],
  ["FIX-10", "Hardcoded values scan", 11],
  ["FIX-11", "Business-rule order collisions", 9],
  ["FIX-12", "Access hygiene", 8],
  ["FIX-13", "Monthly budget duplicates", 7],
  ["FIX-14", "Staging and dark tables", 7],
  ["FIX-15", "Update-set hygiene", 11],
  ["FIX-16", "Notification matrix", 9],
  ["FIX-17", "Credential property scrub", 8],
  ["FIX-18", "Client-only enforcement", 11],
  ["FIX-19", "ACL state snapshot", 8],
  ["FIX-20", "Transform-map coalesce", 7],
  ["FIX-21", "PDF view resolver audit", 10],
  ["FIX-22", "SLA calendar audit", 9],
];
const WRITE_SCRIPT_IDS = new Set(["FIX-02", "FIX-03", "FIX-04", "FIX-06", "FIX-09", "FIX-17"]);

const SCRIPT_CATALOG = [
  ...extraction.map(([id, title, file, stage, description]) => ({
    id,
    title,
    file,
    stage,
    description,
    kind: "extract",
    safety: "Read-only metadata collection",
    sourceUrl: `${TOOLKIT_ROOT}/${file}`,
  })),
  ...fixes.map(([id, title, stage]) => ({
    id,
    title,
    file: `fixes/${id}_${title.toLowerCase().replaceAll("-", "_").replaceAll(" ", "_")}.js`,
    stage,
    description: `Reusable ${title.toLowerCase()} pattern from the authoritative remediation library.`,
    kind: "fix",
    safety: WRITE_SCRIPT_IDS.has(id) ? "PLAN; APPLY requires instance, change and update-set preflight" : "Read-only audit",
    sourceUrl: "",
  })),
].map((item) => {
  if (item.kind === "fix") {
    const actual = {
      "FIX-01": "FIX-01_acl_role_join_audit.js",
      "FIX-02": "FIX-02_client_callable_acl_generator.js",
      "FIX-03": "FIX-03_ws_access_audit.js",
      "FIX-04": "FIX-04_enable_audit.js",
      "FIX-05": "FIX-05_debug_logging_sweep.js",
      "FIX-06": "FIX-06_scheduled_job_service_account.js",
      "FIX-07": "FIX-07_workflow_version_state.js",
      "FIX-08": "FIX-08_public_reports_upgrade.js",
      "FIX-09": "FIX-09_skipped_records_disposition.js",
      "FIX-10": "FIX-10_hardcoded_values_scan.js",
      "FIX-11": "FIX-11_business_rule_order_collisions.js",
      "FIX-12": "FIX-12_access_hygiene.js",
      "FIX-13": "FIX-13_monthly_budget_duplicates.js",
      "FIX-14": "FIX-14_staging_and_dark_tables.js",
      "FIX-15": "FIX-15_update_set_hygiene.js",
      "FIX-16": "FIX-16_notification_matrix.js",
      "FIX-17": "FIX-17_credential_property_scrub.js",
      "FIX-18": "FIX-18_client_only_enforcement.js",
      "FIX-19": "FIX-19_acl_state_snapshot.js",
      "FIX-20": "FIX-20_transform_map_coalesce.js",
      "FIX-21": "FIX-21_pdf_view_resolver_audit.js",
      "FIX-22": "FIX-22_sla_calendar_audit.js",
    }[item.id];
    item.file = `fixes/${actual}`;
    item.sourceUrl = `${TOOLKIT_ROOT}/${item.file}`;
  }
  return item;
});

const REQUIRED_STAGE_INPUTS = {
  1: ["Client", "Assessment name", "Retention period", "Lead"],
  2: ["Application name", "Token or prefix"],
  3: ["Purpose", "User group"],
  4: ["Per-table counts"],
  5: ["Artefact extract", "Citation disposition"],
  6: ["Accepted link set"],
  7: ["Data-flow review or declared gap"],
  8: ["ACL join result", "Security review"],
  9: ["Automation audit results"],
  10: ["Integration inventory or declared gap"],
  11: ["Code-quality audit results"],
  12: ["Evidence export or declared gap"],
  13: ["Performance data or declared gap"],
  14: ["Incident dispositions"],
  15: ["Causation classification for critical findings"],
  16: ["Fix block per finding", "Write-script approvals"],
  17: ["Owner", "Verification", "Rollback"],
  18: ["Declared gaps", "Consistency checks", "Secret scan"],
};

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const PRIORITY_ORDER = { P1: 0, P2: 1, P3: 2, P4: 3 };
const VALID_SKIP_DISPOSITIONS = new Set(["Skipped", "Skipped Error"]);


const COLLECTION_GUIDES = [
  {
    id: "scope",
    order: 1,
    title: "Define the client and application boundary",
    views: ["dashboard", "scope", "collection"],
    stages: [1, 2, 3],
    summary: "Set the client, application, environments, scope names, table prefixes, and search tokens before collecting anything.",
    why: "The extractor uses this boundary to avoid pulling unrelated configuration and to make zero results meaningful.",
    dataPoints: ["Client and assessment name", "Application name and scope", "Table prefixes and search tokens", "Environment and upgrade type", "Business purpose, users, and known events"],
    scripts: [],
    formats: ["Saved directly in the Scope & context page"],
    steps: [
      "Open Scope & context and complete the three sections.",
      "Use application-specific tokens of four or more characters where possible.",
      "Add known sys_ids to Always include when a name filter cannot find them.",
      "Save the scope before editing or running an extractor.",
    ],
    unlocks: ["Safe extractor configuration", "Client-specific validation", "Business impact language", "Assessment report cover and context"],
  },
  {
    id: "modules",
    order: 2,
    title: "Discover installed products and custom applications",
    views: ["dashboard", "scope", "modules", "collection", "reports"],
    stages: [2, 4],
    summary: "Create the instance manifest that determines which product modules and custom scopes this assessment must cover.",
    why: "The ServiceNow product catalogue and each customer instance evolve. Installed metadata is the reliable boundary for module-aware collection and publication.",
    dataPoints: ["Installed applications and Store applications", "Active plugins and scopes", "Application navigator modules", "Custom and scoped tables", "Instance and release metadata", "Unavailable-table warnings"],
    scripts: ["EXT-000"],
    formats: ["EXT-000_instance_module_manifest_*.json"],
    steps: ["Generate the customer profile in Scope & context.", "Open EXT-000 and apply the customer profile.", "Run it in Scripts - Background, scope Global. It reads configuration metadata only.", "Download the JSON attachment from your sys_user record and import it here.", "Open Module coverage and mark each detected module Analysed, Deferred, Excluded or Unsupported with a reason."],
    unlocks: ["Installed module dashboard", "Custom application discovery", "Module-aware script selection", "Module-aware publication gate"],
  },
  {
    id: "components",
    order: 3,
    title: "Collect the configuration inventory and source",
    views: ["dashboard", "collection", "inventory", "dependencies", "findings", "solutions", "reports"],
    stages: [4, 5],
    summary: "Collect the actual ServiceNow configuration records, their source fields, metadata, URLs, and cited sys_ids.",
    why: "Findings need real components and verbatim source. A table count or record name alone is not enough to support a remediation decision.",
    dataPoints: ["sys_id, table, type, and display name", "Source or condition fields", "Updated date and updated by", "Instance URL", "Cited issue IDs", "Truncation and skipped-table warnings"],
    scripts: ["EXT-000", "EXT-100", "EXT-101", "EXT-102", "EXT-103", "EXT-103b", "EXT-104"],
    formats: ["ARTEFACTS_*.json", "CUSTOMER_APP_EVIDENCE_RESOLVED.json", "Targeted top-up JSON", "Evidence Explorer HTML"],
    steps: [
      "Generate the customer profile once, apply it to EXT-100, and review the generated targets and queries.",
      "Run EXT-100 in System Definition > Scripts - Background, scope Global, in its read-only mode.",
      "Review counts, invalid fields, skipped tables, and row-cap warnings; then run the full read-only extract.",
      "Download the JSON attachment created on your own sys_user record. Use EXT-104 only when attachment download is blocked.",
      "Run EXT-101 and the targeted top-ups for cited or missed records.",
      "Import the JSON files here, or import the final Evidence Explorer HTML to populate every supported layer together.",
    ],
    unlocks: ["Component inventory", "Source browser", "Component-to-finding links", "Code-quality review", "Evidence-backed remediation"],
  },
  {
    id: "scan",
    order: 3,
    title: "Collect Instance Scan and targeted audit evidence",
    views: ["collection", "validation", "findings", "evidence", "solutions"],
    stages: [8, 9, 10, 11, 12, 13],
    summary: "Bring in independent platform checks and read-only audit results instead of relying only on consultant-authored findings.",
    why: "Independent evidence confirms scale, affected records, and repeatable platform conditions. It also distinguishes an observed problem from an assumption.",
    dataPoints: ["Finding/check identifier", "Check or category", "Affected table and component sys_id", "Severity", "Description and details", "Instance/environment", "Issue mapping when known"],
    scripts: ["FIX-01", "FIX-03", "FIX-05", "FIX-10", "FIX-11", "FIX-12", "FIX-17", "FIX-18", "FIX-19", "FIX-21", "FIX-22"],
    formats: ["instance_scan.csv", "scan_findings.json", "Evidence Explorer HTML"],
    steps: [
      "Run the applicable read-only audit scripts from the Script library before considering a write action.",
      "Export the relevant Instance Scan results as CSV with component identifiers and full finding text.",
      "Name the file with scan in its filename, for example client_instance_scan.csv.",
      "Import the CSV or JSON. The Workbench validates it and places it in the Instance Scan evidence layer automatically.",
      "Review the Findings page and create or import a client-approved issue register; evidence alone is not treated as causation.",
    ],
    unlocks: ["Independent evidence browser", "Security and code-quality review", "Finding corroboration", "Evidence counts in reports"],
  },
  {
    id: "skips",
    order: 4,
    title: "Collect upgrade skipped-record evidence",
    views: ["collection", "validation", "findings", "evidence", "roadmap"],
    stages: [12, 15, 17],
    summary: "Export skipped and skipped-error upgrade records from the relevant family upgrade, then disposition the records that carry executable logic.",
    why: "A patch result is not evidence for a family upgrade. Case-wrong filters and custom-table assumptions can otherwise produce a misleading zero.",
    dataPoints: ["Upgrade history and environment", "Disposition exactly Skipped or Skipped Error", "File/table and target sys_id", "Customer and base versions", "Resolution status", "Cluster or issue mapping"],
    scripts: ["FIX-09"],
    formats: ["upgrade_skips.csv", "skipped_records.json", "Evidence Explorer HTML"],
    steps: [
      "Confirm the export belongs to the same family upgrade being assessed.",
      "Export sys_upgrade_history_log records with disposition Skipped or Skipped Error using the platform's exact case.",
      "Name the file with skip or upgrade in its filename.",
      "Import the CSV or JSON and resolve any validation failure before analysis.",
      "Use FIX-09 as the disposition workflow and retain manual decisions in the issued register.",
    ],
    unlocks: ["Upgrade evidence layer", "Skipped-record clusters", "Upgrade risk findings", "Prioritised remediation sequence"],
  },
  {
    id: "incidents",
    order: 5,
    title: "Collect the approved incident correlation dataset",
    views: ["collection", "validation", "findings", "evidence", "reports"],
    stages: [14, 15],
    summary: "Import the minimum approved incident fields needed to test whether operational events align with configuration findings.",
    why: "Incidents indicate operational impact but do not prove root cause. Keeping them in a separate personal-data layer makes that boundary visible.",
    dataPoints: ["Incident number", "Short description", "Opened/resolved dates", "State and priority", "Affected service or application", "Known finding mapping", "No work notes, comments, or unnecessary personal data"],
    scripts: [],
    formats: ["client_incidents.csv", "incidents.json", "Evidence Explorer HTML"],
    steps: [
      "Agree the minimum incident fields and date window with the client data owner.",
      "Remove work notes, comments, credentials, and unnecessary personal information.",
      "Name the file with incident in its filename.",
      "Import it here; the Workbench routes it to the approved incident evidence layer.",
      "Disposition each incident as supports, contradicts, unrelated, or insufficient evidence during root-cause review.",
    ],
    unlocks: ["Incident evidence browser", "Impact counts", "Root-cause review", "Operational context in the final report"],
  },
  {
    id: "findings",
    order: 6,
    title: "Import or build the evidence-linked findings register",
    views: ["dashboard", "collection", "findings", "dependencies", "solutions", "roadmap", "reports"],
    stages: [14, 15, 16],
    summary: "Create the controlled issue layer that turns evidence into a reviewed finding with severity, confidence, impact, priority, and ownership.",
    why: "Raw scan and extract rows are evidence, not conclusions. The findings register is where the assessment makes and qualifies its claims.",
    dataPoints: ["Stable finding ID and title", "Domain, severity, likelihood, and priority", "Root cause and confidence", "Confirmed evidence", "Impact if not addressed", "Recommended remediation", "Owner and status"],
    scripts: [],
    formats: ["findings_register.csv", "issues.json", "Evidence Explorer HTML"],
    steps: [
      "Review validated components, scan evidence, skipped records, and incidents together.",
      "Create one stable row per finding using the required data points; do not convert every raw evidence row into a finding.",
      "Name a CSV with findings or register in its filename, or use JSON with an issues/findings array.",
      "Import it. The Workbench normalises the register and generates the Findings, Roadmap, and report views automatically.",
      "Open Relationships and run capped name inference, then accept or reject every proposed link.",
    ],
    unlocks: ["Findings register", "Priority roadmap", "Relationship proposals", "Solution workspace", "Findings CSV and HTML report"],
  },
  {
    id: "fixes",
    order: 7,
    title: "Complete remediation blocks and safe script references",
    views: ["collection", "findings", "solutions", "roadmap", "reports"],
    stages: [16, 17],
    summary: "Attach an approach, numbered actions, manual work, scripts, verification, rollback, ownership, and approval status to each finding.",
    why: "A finding without a safe and testable remediation path is not ready for client delivery.",
    dataPoints: ["Approach", "Numbered implementation steps", "Manual actions", "Script IDs", "Verification", "Rollback", "Owner", "Destructive/write approval status"],
    scripts: ["FIX-01", "FIX-02", "FIX-03", "FIX-04", "FIX-05", "FIX-06", "FIX-07", "FIX-08", "FIX-09", "FIX-10", "FIX-11", "FIX-12", "FIX-13", "FIX-14", "FIX-15", "FIX-16", "FIX-17", "FIX-18", "FIX-19", "FIX-20", "FIX-21", "FIX-22"],
    formats: ["fixes.json", "Evidence Explorer HTML"],
    steps: [
      "Start with the read-only or PLAN-first pattern linked to the finding domain.",
      "Replace CUSTOMER_APP, CUSTOMER_NAME, and CUSTOMER_INSTANCE and review every customer-specific table, role, scope, sys_id, issue ID, filter, and target before use.",
      "Run write-capable scripts only in a named update set after client approval and a successful dry run.",
      "Import fixes as JSON keyed by finding ID, or import the layered Evidence Explorer HTML.",
      "Resolve every verification, rollback, owner, and approval gap before issuing outputs.",
    ],
    unlocks: ["Complete solution workspace", "Delivery-ready roadmap", "Publication gate", "Client remediation report"],
  },
  {
    id: "reference",
    order: 8,
    title: "Declare gaps, questions, decisions, and delivery context",
    views: ["collection", "roadmap", "reports"],
    stages: [17, 18],
    summary: "Record what the assessment did not cover, unresolved questions, sequencing decisions, and the evidence basis for delivery.",
    why: "A report that does not state its gaps encourages the reader to assume complete coverage.",
    dataPoints: ["Declared gaps", "Open questions and owner", "Decision and rationale", "Target dates and dependencies", "Evidence base", "Named human approver"],
    scripts: [],
    formats: ["reference.json", "Evidence Explorer HTML"],
    steps: [
      "Review every deferred workflow stage and failed or missing dataset.",
      "Record each gap and question with an owner and next action.",
      "Import a reference JSON object or layer it into the Evidence Explorer.",
      "Open Report & export and clear each automated publication blocker.",
      "Generate the HTML report, findings CSV, collection checklist, and JSON backup for human sign-off.",
    ],
    unlocks: ["Defensible publication boundary", "Decision-ready roadmap", "Collection checklist", "Final report package"],
  },
];


const MODULE_REGISTRY_VERSION = "2026.08";

const module = (id, name, group, description, detection, stages, scripts = []) => ({
  id, name, group, description, detection, stages, scripts,
});

const MODULE_REGISTRY = [
  module("platform", "Now Platform", "Platform", "Core platform configuration, security, automation and update governance.", { plugins: ["com.glide.core"], tables: ["sys_app", "sys_scope", "sys_db_object"] }, [1, 2, 4, 5, 8, 9, 11, 18], ["EXT-000", "EXT-100", "FIX-01", "FIX-15"]),
  module("cmdb", "Configuration Management Database", "Technology workflows", "Configuration items, relationships, identification and reconciliation.", { plugins: ["com.snc.cmdb"], tables: ["cmdb_ci", "cmdb_rel_ci"] }, [4, 5, 6, 7, 11, 13], ["EXT-100", "FIX-14"]),
  module("discovery", "Discovery", "Technology workflows", "Infrastructure discovery schedules, credentials and discovered relationships.", { plugins: ["com.snc.discovery"], tables: ["discovery_schedule", "discovery_status"] }, [4, 5, 6, 7, 10, 12], ["EXT-100", "FIX-17"]),
  module("itsm", "IT Service Management", "Technology workflows", "Incident, problem, change, request, knowledge and service operations.", { plugins: ["com.snc.itsm", "com.snc.incident"], tables: ["incident", "problem", "change_request"] }, [3, 9, 12, 14, 15, 16, 17], ["EXT-100", "FIX-22"]),
  module("itom", "IT Operations Management", "Technology workflows", "Operational visibility, event management and service health.", { plugins: ["com.snc.itom", "com.snc.service_watch"], tables: ["em_event", "em_alert"] }, [4, 6, 7, 10, 12, 13], ["EXT-100"]),
  module("itam", "IT Asset Management", "Technology workflows", "Hardware, software and enterprise asset lifecycle management.", { plugins: ["com.snc.itam", "com.snc.ham", "com.snc.samp"], tables: ["alm_asset", "alm_hardware"] }, [3, 4, 5, 7, 10, 11], ["EXT-100"]),
  module("spm", "Strategic Portfolio Management", "Technology workflows", "Demand, project, portfolio, resource and investment management.", { plugins: ["com.snc.spm", "com.snc.project_management_v3"], tables: ["pm_project", "dmn_demand"] }, [3, 4, 7, 9, 11, 13], ["EXT-100"]),
  module("csm", "Customer Service Management", "Customer workflows", "Customer cases, accounts, entitlements and service operations.", { plugins: ["com.snc.csm"], tables: ["sn_customerservice_case", "customer_account"] }, [3, 4, 7, 8, 9, 12, 14], ["EXT-100", "FIX-03"]),
  module("fsm", "Field Service Management", "Customer workflows", "Work orders, dispatch, scheduling, agents and field operations.", { plugins: ["com.snc.field_service_management"], tables: ["wm_order", "wm_task"] }, [3, 4, 7, 9, 10, 13], ["EXT-100", "FIX-22"]),
  module("hrsd", "HR Service Delivery", "Employee workflows", "HR cases, employee journeys, knowledge and service delivery.", { plugins: ["com.sn_hr_core"], tables: ["sn_hr_core_case"] }, [3, 4, 7, 8, 9, 12], ["EXT-100"]),
  module("wsd", "Workplace Service Delivery", "Employee workflows", "Workplace cases, reservations, maintenance and space services.", { plugins: ["com.snc.wsd"], tables: ["sn_wsd_core_case"] }, [3, 4, 7, 9, 10], ["EXT-100"]),
  module("secops", "Security Operations", "Security workflows", "Security incidents, vulnerability response and threat operations.", { plugins: ["com.snc.secops", "com.snc.sir", "com.snc.vulnerability_response"], tables: ["sn_si_incident", "sn_vul_vulnerable_item"] }, [4, 7, 8, 9, 10, 12, 14], ["EXT-100", "FIX-01"]),
  module("grc", "Governance, Risk and Compliance", "Security workflows", "Policy, risk, controls, audits and compliance operations.", { plugins: ["com.sn_grc"], tables: ["sn_compliance_policy", "sn_risk_risk"] }, [3, 4, 7, 8, 11, 14], ["EXT-100"]),
  module("creator", "App Engine and Creator Workflows", "Creator workflows", "Custom scoped applications, flows, integrations and experiences.", { plugins: ["com.snc.app_engine", "com.glide.hub.flow_engine"], tables: ["sys_hub_flow", "sys_script"] }, [2, 4, 5, 6, 7, 9, 10, 11], ["EXT-000", "EXT-100", "FIX-10"]),
  module("integrationhub", "IntegrationHub", "Creator workflows", "Spokes, connections, credentials and integration actions.", { plugins: ["com.glide.hub.integration"], tables: ["sys_alias", "sys_hub_action_type_definition"] }, [4, 7, 9, 10, 11], ["EXT-100", "FIX-17"]),
  module("automation", "Automation Engine", "Creator workflows", "Flow, RPA, decision and process automation governance.", { plugins: ["com.glide.hub.flow_engine", "com.snc.rpa"], tables: ["sys_hub_flow", "sysauto_script"] }, [4, 7, 9, 11, 13], ["EXT-100", "FIX-11"]),
  module("ai", "AI and Intelligence", "Platform", "Predictive, generative and agentic AI configuration and governance.", { plugins: ["com.glide.nlu", "com.sn_gen_ai"], tables: ["sys_nlu_model", "sys_generative_ai_config"] }, [3, 4, 8, 10, 11, 14], ["EXT-100"]),
  module("portal", "Employee Center, Portal and UI", "Experience", "Portal, workspace, UI Builder, pages, widgets and client experiences.", { plugins: ["com.glide.service-portal", "com.snc.employee_center"], tables: ["sp_portal", "sys_ux_app_config"] }, [3, 4, 5, 8, 11, 13], ["EXT-100", "FIX-18", "FIX-21"]),
  module("pa", "Performance Analytics and Reporting", "Platform", "Indicators, data collection, dashboards and reports.", { plugins: ["com.snc.pa", "com.snc.reporting"], tables: ["pa_indicators", "sys_report"] }, [3, 4, 7, 8, 9, 12, 13, 18], ["EXT-100", "FIX-08"]),
];

const values = (manifest, keys) => keys.flatMap((key) => Array.isArray(manifest?.[key]) ? manifest[key] : []);
const pickManifestField = (item, names) => names.map((name) => item?.[name]).find(Boolean) || "";
const lowerSet = (items, names) => new Set(items.map((item) => String(typeof item === "string" ? item : pickManifestField(item, names)).toLowerCase()).filter(Boolean));

function normaliseInstanceManifest(input = {}) {
  const source = input.manifest || input.data || input;
  return {
    schema: source.schema || "servicenow-instance-manifest/1",
    generatedAt: source.generatedAt || source.generated_at || "",
    instance: source.instance || {},
    applications: values(source, ["applications", "storeApplications"]),
    scopes: values(source, ["scopes"]),
    plugins: values(source, ["plugins"]),
    modules: values(source, ["modules", "applicationModules"]),
    tables: values(source, ["tables", "customTables"]),
    warnings: source.warnings || [],
    errors: source.errors || [],
  };
}

function detectInstalledModules(input = {}) {
  const manifest = normaliseInstanceManifest(input);
  const plugins = lowerSet(manifest.plugins, ["id", "plugin_id", "source", "name"]);
  const scopes = lowerSet([...manifest.scopes, ...manifest.applications], ["scope", "name", "source", "sys_id"]);
  const tables = lowerSet(manifest.tables, ["name", "table", "sys_name"]);
  const found = MODULE_REGISTRY.map((entry) => {
    const reasons = [];
    (entry.detection.plugins || []).forEach((id) => { if ([...plugins].some((value) => value === id.toLowerCase() || value.includes(id.toLowerCase()))) reasons.push(`plugin:${id}`); });
    (entry.detection.scopes || []).forEach((id) => { if ([...scopes].some((value) => value.includes(id.toLowerCase()))) reasons.push(`scope:${id}`); });
    (entry.detection.tables || []).forEach((id) => { if (tables.has(id.toLowerCase())) reasons.push(`table:${id}`); });
    return { ...entry, detected: entry.id === "platform" || reasons.length > 0, reasons };
  });
  const knownApps = new Set(MODULE_REGISTRY.flatMap((entry) => entry.detection.plugins || []).map((x) => x.toLowerCase()));
  const seenUnknown = new Set();
  const unknown = manifest.applications.filter((app) => {
    const source = String(pickManifestField(app, ["scope", "source", "name"])).toLowerCase();
    if (!source || seenUnknown.has(source) || [...knownApps].some((known) => source.includes(known))) return false;
    seenUnknown.add(source);
    return true;
  }).map((app, index) => ({
    id: `custom-${String(pickManifestField(app, ["scope", "source", "sys_id"]) || index).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    name: pickManifestField(app, ["name", "label", "scope"]) || "Custom application",
    group: "Installed and custom",
    description: "Instance application discovered outside the versioned core registry.",
    stages: [2, 4, 5, 6, 7, 8, 9, 10, 11], scripts: ["EXT-000", "EXT-100"], detected: true,
    reasons: [`application:${pickManifestField(app, ["scope", "source", "name"])}`], dynamic: true,
  }));
  return { registryVersion: MODULE_REGISTRY_VERSION, manifest, modules: [...found, ...unknown] };
}

function buildModuleCoverage(manifest, existing = []) {
  const prior = new Map((existing || []).map((row) => [row.id, row]));
  return detectInstalledModules(manifest).modules.map((entry) => ({
    id: entry.id,
    name: entry.name,
    group: entry.group,
    detected: entry.detected,
    reasons: entry.reasons,
    stages: entry.stages,
    scripts: entry.scripts,
    status: prior.get(entry.id)?.status || (entry.detected ? "Applicable" : "Not detected"),
    owner: prior.get(entry.id)?.owner || "",
    note: prior.get(entry.id)?.note || "",
    updatedAt: prior.get(entry.id)?.updatedAt || "",
    dynamic: Boolean(entry.dynamic),
  }));
}

const MODULE_TERMINAL_STATES = new Set(["Analysed", "Deferred", "Excluded", "Unsupported"]);



const DB_NAME = "servicenow-diagnostic-workbench-2";
const DB_VERSION = 1;
const STORE_NAME = "workspace";
const STATE_KEY = "active-assessment";

const INPUT_STATES = [
  "Not started",
  "Awaiting data",
  "Received",
  "Validation failed",
  "Validated",
  "Analysis complete",
  "Requires review",
  "Superseded",
  "Deferred",
];

const uuid = () => globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function nowIso() {
  return new Date().toISOString();
}

function createEmptyState() {
  const timestamp = nowIso();
  return {
    schemaVersion: 2,
    createdAt: timestamp,
    updatedAt: timestamp,
    activeView: "dashboard",
    assessment: {
      id: uuid(),
      name: "New application assessment",
      client: "",
      status: "Draft",
      confidentiality: "Client confidential",
      retentionDays: 90,
      lead: "",
      purpose: "",
      userGroups: "",
      knownEvents: "",
      application: {
        name: "",
        scopes: [],
        prefixes: [],
        tokens: [],
        alwaysInclude: [],
      },
      environments: [{ id: uuid(), name: "PROD", role: "Production", upgradeType: "Unknown" }],
    },
    stages: STAGES.map((stage) => ({
      ...stage,
      status: stage.id === 1 ? "Awaiting data" : "Not started",
      note: "",
      updatedAt: timestamp,
    })),
    datasets: [],
    validationResults: [],
    envelopes: {},
    packHealth: [],
    guided: { runbookId: "", done: {} },
    pda: { answers: {}, answeredAt: {}, pack: "", plan: { people: 2, hours: 60, sprintWeeks: 2, start: "" } },
    components: [],
    findings: [],
    links: [],
    scanFindings: [],
    skippedRecords: [],
    incidents: [],
    fixes: {},
    fixScripts: {},
    correlations: {},
    reference: {},
    customerProfile: null,
    instanceManifest: null,
    moduleCoverage: [],
    auditRuns: [],
    rescanComparisons: [],
    approvals: [],
    audit: [{
      id: uuid(),
      at: timestamp,
      action: "Assessment created",
      detail: "Local-first draft created; no instance connection.",
    }],
  };
}

function ensureStateVersion(candidate) {
  const base = createEmptyState();
  if (!candidate || typeof candidate !== "object") return base;
  const next = { ...base, ...candidate, assessment: { ...base.assessment, ...(candidate.assessment || {}) } };
  next.assessment.application = { ...base.assessment.application, ...(candidate.assessment?.application || {}) };
  next.schemaVersion = 2;
  next.customerProfile = candidate.customerProfile || customerProfileFromState(next);
  next.instanceManifest = candidate.instanceManifest ? normaliseInstanceManifest(candidate.instanceManifest) : null;
  next.moduleCoverage = next.instanceManifest ? buildModuleCoverage(next.instanceManifest, candidate.moduleCoverage || []) : (candidate.moduleCoverage || []);
  next.auditRuns = Array.isArray(candidate.auditRuns) ? candidate.auditRuns : [];
  next.rescanComparisons = Array.isArray(candidate.rescanComparisons) ? candidate.rescanComparisons : [];
  next.approvals = Array.isArray(candidate.approvals) ? candidate.approvals : [];
  next.reference = candidate.reference && typeof candidate.reference === "object" ? candidate.reference : {};
  next.envelopes = candidate.envelopes && typeof candidate.envelopes === "object" ? candidate.envelopes : {};
  next.packHealth = Array.isArray(candidate.packHealth) ? candidate.packHealth : [];
  next.guided = candidate.guided && typeof candidate.guided === "object" ? { runbookId: "", done: {}, ...candidate.guided } : { runbookId: "", done: {} };
  next.pda = candidate.pda && typeof candidate.pda === "object" ? candidate.pda : next.pda;
  return next;
}

function customerProfileFromState(state) {
  const assessment = state?.assessment || {};
  const application = assessment.application || {};
  const prior = state?.customerProfile || {};
  const production = assessment.environments?.find((item) => /prod/i.test(`${item.role} ${item.name}`)) || {};
  const inferredInstance = production.url || (/service-now|https?:|\./i.test(production.name || "") ? production.name : "");
  const approvedInstance = prior.approvedInstance && !String(prior.approvedInstance).startsWith("CUSTOMER_") ? prior.approvedInstance : inferredInstance || "CUSTOMER_INSTANCE";
  return {
    schema: "servicenow-diagnostic-profile/1",
    generatedAt: nowIso(),
    customerName: assessment.client || "CUSTOMER_NAME",
    assessmentName: assessment.name || "",
    applicationName: application.name || "CUSTOMER_APP",
    applicationToken: application.tokens?.[0] || "CUSTOMER_APP",
    scopes: application.scopes || [],
    prefixes: application.prefixes || [],
    tokens: application.tokens || [],
    alwaysInclude: application.alwaysInclude || [],
    environments: assessment.environments || [],
    approvedInstance,
    changeReference: prior.changeReference || "CUSTOMER_CHANGE_REFERENCE",
    serviceUser: prior.serviceUser || "CUSTOMER_SERVICE_USER",
    requiredRole: prior.requiredRole || "CUSTOMER_ROLE",
    tablePrefix: application.prefixes?.[0] || "CUSTOMER_TABLE_PREFIX",
  };
}

function validateCustomerProfile(profile) {
  const text = JSON.stringify(profile || {});
  const missing = [...new Set(text.match(/CUSTOMER_[A-Z_]+/g) || [])];
  return { valid: missing.length === 0, missing };
}

function applyCustomerProfileToScript(source, profile) {
  const replacements = {
    CUSTOMER_NAME: profile?.customerName,
    CUSTOMER_APP: profile?.applicationToken || profile?.applicationName,
    CUSTOMER_INSTANCE: profile?.approvedInstance,
    CUSTOMER_SCOPES: (profile?.scopes || []).join(","),
    CUSTOMER_SCOPE: profile?.scopes?.[0],
    CUSTOMER_CHANGE_REFERENCE: profile?.changeReference,
    CUSTOMER_SERVICE_USER: profile?.serviceUser,
    CUSTOMER_ROLE: profile?.requiredRole,
    CUSTOMER_TABLE_PREFIX: profile?.tablePrefix,
  };
  return Object.entries(replacements).reduce((text, [token, value]) => value && !String(value).startsWith("CUSTOMER_") ? text.replaceAll(token, String(value)) : text, String(source || ""));
}

function extractExplorerPayload(htmlText) {
  const match = String(htmlText || "").match(/<script\s+id=["']payload["']\s+type=["']application\/json["']>([\s\S]*?)<\/script>/i);
  if (!match) throw new Error("No Evidence Explorer payload was found in this HTML file.");
  return JSON.parse(match[1].replaceAll("<\\/", "</"));
}

function priorityCode(value = "") {
  return String(value).match(/\bP[1-4]\b/i)?.[0]?.toUpperCase() || "P4";
}

function normaliseArtefacts(artefacts) {
  const values = Array.isArray(artefacts) ? artefacts : Object.values(artefacts || {});
  return values.map((artefact) => ({
    sysId: artefact.sys_id || artefact.sysId || "",
    name: artefact.name || artefact.display || "(unnamed)",
    type: artefact.type || artefact.artefact_type || artefact.actual_class || "Record",
    table: artefact.table || artefact.actual_class || "",
    url: artefact.url || "",
    metadata: artefact.meta || artefact.metadata || {},
    source: artefact.source || {},
    citedBy: artefact.cited_by || artefact.citedBy || [],
    specification: artefact.desc || artefact.specification || {},
    status: artefact.source && Object.keys(artefact.source).length ? "Extracted" : "Unread body",
  })).filter((artefact) => artefact.sysId);
}

function normaliseFindings(issues = []) {
  return issues.map((issue) => ({
    id: issue.ID || issue.id || uuid(),
    title: issue.Issue || issue.title || "Untitled finding",
    domain: issue.Domain || issue.domain || "Unclassified",
    severity: issue.Severity || issue.severity || "Medium",
    likelihood: issue.Likelihood || issue.likelihood || "TBC",
    rootCause: issue["Root cause"] || issue.rootCause || "",
    evidence: issue["Evidence (component / sys_id / measure)"] || issue.evidence || "",
    impact: issue["Impact if not addressed"] || issue.impact || "",
    remediation: issue["Recommended remediation"] || issue.remediation || "",
    effort: issue.Effort || issue.effort || "TBC",
    priority: priorityCode(issue.Priority || issue.priority),
    priorityLabel: issue.Priority || issue.priority || "P4",
    status: issue.Status || issue.status || "Draft",
    environment: issue.Environment || issue.environment || "",
    confidence: issue.Confidence || issue.confidence || "TBC",
    owner: issue.Owner || issue.owner || "Unassigned",
    sourceRef: issue["Source ref"] || issue.sourceRef || "",
    sourceDocument: issue["Source document"] || issue.sourceDocument || "",
    targetDate: issue.targetDate || "",
  }));
}

function flattenLinks(links = {}) {
  return Object.entries(links).flatMap(([findingId, values]) =>
    (values || []).map((link) => ({
      id: `${findingId}:${link.sys_id || link.sysId}`,
      findingId,
      componentSysId: link.sys_id || link.sysId,
      how: link.how || "manual",
      status: "Active",
    })),
  );
}

function referenceStages(timestamp) {
  const deferred = new Set([13]);
  return STAGES.map((stage) => ({
    ...stage,
    status: deferred.has(stage.id) ? "Deferred" : "Analysis complete",
    note: deferred.has(stage.id) ? "No worked performance dataset was present in the imported explorer." : "Imported from an issued Evidence Explorer payload.",
    updatedAt: timestamp,
  }));
}

function stateFromExplorerPayload(payload, sourceName = "Evidence Explorer") {
  const state = createEmptyState();
  const timestamp = nowIso();
  const meta = payload.meta || {};
  const components = normaliseArtefacts(payload.artefacts);
  const findings = normaliseFindings(payload.issues);
  const scanFindings = payload.scan?.findings || [];
  const skippedRecords = payload.skips?.records || [];
  const incidents = payload.incidents || [];

  state.assessment.name = meta.Application ? `${meta.Application} — diagnostic assessment` : sourceName;
  state.assessment.client = meta.Client || "";
  state.assessment.status = "Issued reference imported";
  state.assessment.lead = meta["Prepared by"] || "";
  state.assessment.purpose = meta.Purpose || "";
  state.assessment.application.name = meta.Application || "";
  state.assessment.application.scopes = meta["Application scope"] ? [meta["Application scope"]] : [];
  state.assessment.environments = String(meta["Environments referenced"] || "PROD")
    .split(/,|;/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ id: uuid(), name, role: /prod/i.test(name) ? "Production" : "Non-production", upgradeType: "Unknown" }));
  state.stages = referenceStages(timestamp);
  state.components = components;
  state.findings = findings;
  state.links = flattenLinks(payload.links);
  state.scanFindings = scanFindings;
  state.skippedRecords = skippedRecords;
  state.incidents = incidents;
  state.fixes = payload.fixes || {};
  state.fixScripts = payload.fixScripts || {};
  state.correlations = payload.correlation || {};
  state.reference = payload.reference || {};
  state.customerProfile = payload.customerProfile || customerProfileFromState(state);
  state.instanceManifest = payload.instanceManifest ? normaliseInstanceManifest(payload.instanceManifest) : null;
  state.moduleCoverage = state.instanceManifest ? buildModuleCoverage(state.instanceManifest, payload.moduleCoverage || []) : (payload.moduleCoverage || []);
  state.auditRuns = payload.auditRuns || [];
  state.rescanComparisons = payload.rescanComparisons || [];
  state.approvals = payload.approvals || [];
  state.datasets = [
    datasetSummary("explorer", sourceName, 1, "Validated", timestamp, "Issued self-contained explorer payload"),
    datasetSummary("components", "Configuration artefacts", components.length, "Validated", timestamp, "EXT extraction pipeline"),
    datasetSummary("scan", "Instance Scan findings", scanFindings.length, "Validated", timestamp, `${payload.scan?.raw_rows || scanFindings.length} raw rows`),
    datasetSummary("skips", "Upgrade skipped records", skippedRecords.length, "Validated", timestamp, `${payload.skips?.exec_count || 0} carry executable logic`),
    datasetSummary("incidents", "Production incidents", incidents.length, "Validated", timestamp, "Reference incident export"),
  ];
  state.validationResults = state.datasets.map((dataset) => ({
    id: uuid(), datasetId: dataset.id, rule: "Reference payload integrity", outcome: "Pass", detail: `${dataset.rows.toLocaleString()} record(s) accepted.`, at: timestamp,
  }));
  state.audit = [{
    id: uuid(),
    at: timestamp,
    action: "Reference explorer imported",
    detail: `${findings.length} findings, ${components.length} components, ${scanFindings.length} scan findings, ${skippedRecords.length} skipped records, and ${incidents.length} incidents loaded from ${sourceName}.`,
  }];
  state.updatedAt = timestamp;
  return state;
}

function datasetSummary(kind, name, rows, status, collectedAt, note = "") {
  return {
    id: uuid(), kind, name, rows, status, collectedAt, environment: "Reference snapshot", hash: "", note, supersedes: "",
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const input = String(text || "").replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  row.push(field.replace(/\r$/, ""));
  if (row.some((value) => value !== "")) rows.push(row);
  if (!rows.length) return [];
  const headers = rows[0].map((header, index) => header.trim() || `column_${index + 1}`);
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

async function hashText(text) {
  if (!globalThis.crypto?.subtle) return "unavailable";
  const bytes = new TextEncoder().encode(String(text));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function recordsFromParsed(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.records)) return parsed.records;
  if (Array.isArray(parsed?.artefacts)) return parsed.artefacts;
  if (Array.isArray(parsed?.findings)) return parsed.findings;
  return [];
}

function secretLeak(text) {
  const patterns = [
    /(?:password|passwd|secret|api[_ -]?key|bearer[_ -]?token)\s*[:=]\s*["']?[^\s"',}\]]{8,}/i,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function consumerDataRisk(records) {
  const taskFields = ["opened_at", "caller_id", "requested_for", "assigned_to", "work_notes", "comments"];
  return records.some((record) => {
    if (!record || typeof record !== "object") return false;
    const table = String(record.table || record.source_table || record.sys_class_name || "");
    const keys = Object.keys(record);
    return (/^(incident|task|sc_req_item|sc_request|u_application)$/i.test(table) && taskFields.some((field) => keys.includes(field)));
  });
}

function validateDataset({ kind = "generic", text = "", parsed = null, expectedRows = null }) {
  const results = [];
  const add = (rule, outcome, detail) => results.push({ id: uuid(), rule, outcome, detail, at: nowIso() });
  const records = recordsFromParsed(parsed);

  if (!String(text).trim()) add("Non-empty input", "Fail", "The submitted dataset is empty.");
  else add("Non-empty input", "Pass", "Input contains data.");

  if (/TRUNCATION WARNING|hit the \d+ cap|cap[_ -]?hit/i.test(text)) {
    add("Completeness and caps", "Fail", "The extract reports a row cap or truncation marker. Narrow or raise the cap and re-run.");
  } else if (expectedRows !== null && records.length === 0 && Number(expectedRows) > 0) {
    add("Suspicious zero", "Fail", `Inventory expected ${expectedRows} rows but the submitted dataset contains none.`);
  } else {
    add("Completeness and caps", "Pass", records.length ? `${records.length.toLocaleString()} parsed record(s).` : "No truncation marker found.");
  }

  if (kind === "skips" || records.some((record) => "disposition" in (record || {}) || "disp" in (record || {}))) {
    const invalid = records
      .map((record) => String(record.disposition ?? record.disp ?? "").trim())
      .filter((value) => value && !VALID_SKIP_DISPOSITIONS.has(value));
    if (invalid.length) add("Case-exact skip disposition", "Fail", `Unexpected value(s): ${[...new Set(invalid)].slice(0, 5).join(", ")}. Expected Skipped or Skipped Error.`);
    else add("Case-exact skip disposition", "Pass", "Disposition values use the platform's case-exact labels.");
  }

  if (kind !== "incidents" && consumerDataRisk(records)) {
    add("Configuration metadata only", "Fail", "The upload appears to contain consumer or task data rows. Remove them before submission.");
  } else if (kind === "incidents") {
    add("Approved personal-data layer", "Pass", "Incident rows are accepted only into the explicitly tagged personal-data evidence layer.");
  } else {
    add("Configuration metadata only", "Pass", "No obvious consumer-data row shape was detected.");
  }

  const propertyLeak = records.some((record) => {
    const table = String(record?.table || "");
    const value = record?.value ?? record?.source?.value;
    return table === "sys_properties" && value && !String(value).includes("REDACTED");
  });
  if (propertyLeak || secretLeak(text)) {
    add("Secret redaction", "Fail", "A property value or credential-shaped string may be present. The value was not displayed; redact at source before retrying.");
  } else {
    add("Secret redaction", "Pass", "No unredacted property value or credential-shaped string was detected.");
  }

  return results;
}

function classifyDataset(fileName, parsed) {
  const lower = String(fileName).toLowerCase();
  if (lower.endsWith(".html")) return "explorer";
  if (/manifest|discovery|module/.test(lower) || parsed?.manifest?.schema === "servicenow-instance-manifest/1" || parsed?.schema === "servicenow-instance-manifest/1") return "manifest";
  if (parsed?.schema === "servicenow-diagnostic-result/1") return "result";
  if (/skip|upgrade/.test(lower)) return "skips";
  if (/scan/.test(lower)) return "scan";
  if (/incident/.test(lower)) return "incidents";
  if (/finding|issue|register/.test(lower) || parsed?.issues || parsed?.findings) return "findings";
  if (/fix|remediation|solution/.test(lower) || parsed?.fixes) return "fixes";
  if (/reference|gap|question|decision/.test(lower) || parsed?.reference) return "reference";
  if (/artefact|artifact|extract/.test(lower) || parsed?.artefacts) return "components";
  return "generic";
}

function mergeSubmittedDataset(state, submission) {
  const timestamp = nowIso();
  const next = structuredClone(state);
  const previous = next.datasets.find((dataset) => dataset.kind === submission.kind && dataset.status !== "Superseded");
  if (previous) previous.status = "Superseded";
  const failed = submission.validationResults.some((result) => result.outcome === "Fail");
  const dataset = {
    id: uuid(),
    kind: submission.kind,
    name: submission.name,
    rows: submission.rows,
    status: failed ? "Validation failed" : "Validated",
    collectedAt: timestamp,
    environment: submission.environment || "Unspecified",
    hash: submission.hash || "",
    note: submission.note || "",
    supersedes: previous?.id || "",
  };
  next.datasets.unshift(dataset);
  next.validationResults.unshift(...submission.validationResults.map((result) => ({ ...result, datasetId: dataset.id })));

  if (!failed) {
    if (submission.kind === "components") {
      const incoming = normaliseArtefacts(submission.parsed?.artefacts || submission.parsed);
      next.components = mergeBy(next.components, incoming, "sysId");
    } else if (submission.kind === "scan") {
      next.scanFindings = submission.parsed?.scan?.findings || submission.parsed?.findings || submission.parsed || [];
    } else if (submission.kind === "skips") {
      next.skippedRecords = submission.parsed?.skips?.records || submission.parsed?.records || submission.parsed || [];
    } else if (submission.kind === "incidents") {
      next.incidents = submission.parsed?.incidents || submission.parsed || [];
    } else if (submission.kind === "findings") {
      const records = submission.parsed?.issues || submission.parsed?.findings || submission.parsed || [];
      const incoming = normaliseFindings(Array.isArray(records) ? records : []);
      next.findings = mergeBy(next.findings, incoming, "id");
    } else if (submission.kind === "fixes") {
      next.fixes = { ...next.fixes, ...(submission.parsed?.fixes || submission.parsed || {}) };
    } else if (submission.kind === "reference") {
      next.reference = { ...next.reference, ...(submission.parsed?.reference || submission.parsed || {}) };
    } else if (submission.kind === "manifest") {
      next.instanceManifest = normaliseInstanceManifest(submission.parsed?.manifest || submission.parsed);
      next.moduleCoverage = buildModuleCoverage(next.instanceManifest, next.moduleCoverage);
    } else if (submission.kind === "envelope") {
      (submission.parsed?.envelopes || []).forEach((envelope) => {
        next.envelopes[diagCollectorKey(envelope.collector)] = {
          env: envelope,
          receivedAt: timestamp,
          datasetName: submission.name,
          environment: submission.environment || envelope.instance || "Unspecified",
        };
      });
      const evaluation = diagEvaluate(next);
      next.findings = mergeBy(next.findings, evaluation.findings, "id");
      diagDraftFixes(next, evaluation.findings);
      pdaApplyEnvelopes(next, timestamp);
      next.packHealth = diagPackHealth(next);
      next.audit.unshift({ id: uuid(), at: timestamp, action: "Rule engine evaluated", detail: `${evaluation.stats.evaluated} rule(s) evaluated, ${evaluation.stats.triggered} triggered, ${evaluation.stats.notApplicable} not applicable.` });
    } else if (submission.kind === "result") {
      const run = normaliseAuditRun(submission.parsed, submission.name, timestamp);
      next.auditRuns.unshift(run);
      const previousRun = next.auditRuns.find((item) => item.scriptId === run.scriptId && item.id !== run.id);
      if (previousRun) next.rescanComparisons.unshift(compareAuditRuns(previousRun, run));
    }
    next.stages = next.stages.map((stage) => {
      const ranges = {
        components: [5, 15],
        scan: [12, 15],
        skips: [12, 17],
        incidents: [14, 15],
        findings: [14, 17],
        fixes: [16, 18],
        reference: [17, 18],
        manifest: [2, 4],
        result: [4, 18],
        envelope: [4, 15],
      };
      const range = ranges[submission.kind];
      const affected = range && stage.id >= range[0] && stage.id <= range[1];
      if (!affected) return stage;
      return { ...stage, status: stage.id === range[0] ? "Validated" : "Requires review", updatedAt: timestamp };
    });
  }
  next.audit.unshift({
    id: uuid(), at: timestamp, action: failed ? "Dataset rejected" : "Dataset accepted",
    detail: `${submission.name}: ${submission.rows.toLocaleString()} row(s); ${submission.kind}.`,
  });
  next.updatedAt = timestamp;
  return next;
}

function mergeBy(existing, incoming, key) {
  const map = new Map(existing.map((item) => [item[key], item]));
  incoming.forEach((item) => map.set(item[key], { ...map.get(item[key]), ...item }));
  return [...map.values()];
}

function deriveStats(state) {
  const severity = Object.fromEntries(["Critical", "High", "Medium", "Low"].map((level) => [level, 0]));
  const priority = Object.fromEntries(["P1", "P2", "P3", "P4"].map((level) => [level, 0]));
  state.findings.forEach((finding) => {
    severity[finding.severity] = (severity[finding.severity] || 0) + 1;
    priority[priorityCode(finding.priority)] = (priority[priorityCode(finding.priority)] || 0) + 1;
  });
  const activeDatasets = state.datasets.filter((dataset) => dataset.status !== "Superseded");
  const failedDatasets = activeDatasets.filter((dataset) => dataset.status === "Validation failed").length;
  const completedStages = state.stages.filter((stage) => ["Analysis complete", "Validated", "Deferred"].includes(stage.status)).length;
  const linkedFindingIds = new Set(state.links.filter((link) => link.status !== "Removed").map((link) => link.findingId));
  const withFix = state.findings.filter((finding) => state.fixes[finding.id]).length;
  const unassigned = state.findings.filter((finding) => !finding.owner || /^(tbc|unassigned)/i.test(finding.owner)).length;
  return {
    severity,
    priority,
    activeDatasets: activeDatasets.length,
    failedDatasets,
    completedStages,
    stagePercent: Math.round((completedStages / STAGES.length) * 100),
    linkedFindings: linkedFindingIds.size,
    withFix,
    unassigned,
  };
}

function sortedFindings(findings) {
  return [...findings].sort((a, b) =>
    (PRIORITY_ORDER[priorityCode(a.priority)] ?? 9) - (PRIORITY_ORDER[priorityCode(b.priority)] ?? 9)
    || (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
    || a.id.localeCompare(b.id),
  );
}

function proposeNameLinks(findings, components, existingLinks = []) {
  const existing = new Set(existingLinks.map((link) => `${link.findingId}:${link.componentSysId}`));
  const stop = new Set(["application", "program", "client", "default", "script include", "business rule"]);
  const componentHits = new Map();
  components.forEach((component) => {
    const name = component.name.trim().toLowerCase();
    if (name.length < 8 || stop.has(name)) return;
    const expression = new RegExp(`(^|[^a-z0-9_.])${escapeRegex(name)}([^a-z0-9_.]|$)`, "i");
    const hits = findings.filter((finding) => expression.test(`${finding.title} ${finding.evidence} ${finding.rootCause} ${finding.sourceRef}`));
    if (hits.length > 0 && hits.length <= 4) componentHits.set(component.sysId, hits);
  });
  const proposals = [];
  findings.forEach((finding) => {
    const hits = [];
    componentHits.forEach((matchedFindings, sysId) => {
      if (matchedFindings.some((candidate) => candidate.id === finding.id)) hits.push(sysId);
    });
    hits
      .sort((left, right) => (components.find((item) => item.sysId === right)?.name.length || 0) - (components.find((item) => item.sysId === left)?.name.length || 0))
      .slice(0, 15)
      .forEach((sysId) => {
        const key = `${finding.id}:${sysId}`;
        if (!existing.has(key)) proposals.push({ id: key, findingId: finding.id, componentSysId: sysId, how: "name match (inferred)", status: "Proposed" });
      });
  });
  return proposals;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blockersForPublish(state) {
  const blockers = [];
  const profile = state.customerProfile || customerProfileFromState(state);
  const profileCheck = validateCustomerProfile(profile);
  if (!profileCheck.valid) blockers.push(`Customer profile still contains ${profileCheck.missing.length} unresolved placeholder(s).`);
  const activeFindings = state.findings.filter((finding) => finding.status !== "Superseded");
  const missingFix = activeFindings.filter((finding) => !state.fixes[finding.id]);
  if (missingFix.length) blockers.push(`${missingFix.length} finding(s) have no complete remediation block.`);
  const unexplained = state.incidents.filter((incident) => !(incident.issues?.length || incident.disposition || incident.status === "Out of scope"));
  if (unexplained.length) blockers.push(`${unexplained.length} incident(s) are not dispositioned.`);
  if (!state.reference?.gaps?.length) blockers.push("The declared-gaps section is empty.");
  if (state.datasets.some((dataset) => dataset.status === "Validation failed")) blockers.push("At least one active dataset failed validation.");
  const orphanFindings = activeFindings.filter((finding) =>
    !state.links.some((link) => link.findingId === finding.id && link.status !== "Removed")
    && !finding.evidence,
  );
  if (orphanFindings.length) blockers.push(`${orphanFindings.length} finding(s) have no evidence chain.`);
  if (!state.instanceManifest) blockers.push("The installed application and module manifest has not been imported (run EXT-000).");
  const openModules = (state.moduleCoverage || []).filter((module) => module.detected && !MODULE_TERMINAL_STATES.has(module.status));
  if (openModules.length) blockers.push(`${openModules.length} detected module(s) are not analysed or explicitly dispositioned.`);
  const approved = (state.approvals || []).some((approval) => approval.type === "publication" && approval.status === "Approved");
  if (!approved) blockers.push("Publication approval has not been recorded.");
  return blockers;
}

function blockersForExplorer(state) {
  const blockers = [...blockersForPublish(state)];
  const activeFindings = state.findings.filter((finding) => finding.status !== "Superseded");
  const acceptedStageStates = new Set(["Analysis complete", "Validated", "Deferred"]);
  const incompleteStages = state.stages.filter((stage) => !acceptedStageStates.has(stage.status));
  const activeLinks = state.links.filter((link) => link.status === "Active");
  const proposedLinks = state.links.filter((link) => link.status === "Proposed");
  const incompleteFixes = activeFindings.filter((finding) => {
    const fix = state.fixes[finding.id];
    return !fix || !fix.approach || !fix.verify || !fix.rollback;
  });

  if (!state.components.length) blockers.push("No configuration artefacts are available for the Explorer.");
  if (!activeFindings.length) blockers.push("No active findings are available for the Explorer.");
  if (activeFindings.length && !activeLinks.length) blockers.push("No accepted finding-to-artefact links are available.");
  if (proposedLinks.length) blockers.push(`${proposedLinks.length} proposed link(s) still require acceptance or rejection.`);
  if (incompleteFixes.length) blockers.push(`${incompleteFixes.length} finding(s) have an incomplete approach, verification, or rollback.`);
  if (incompleteStages.length) blockers.push(`${incompleteStages.length} workflow stage(s) are not completed, validated, analysed, or explicitly deferred.`);
  return [...new Set(blockers)];
}

const CUSTOMER_TEMPLATE_BANNER = `/**
 * CUSTOMER TEMPLATE - REQUIRED CONFIGURATION BEFORE EXECUTION
 * Replace CUSTOMER_APP, CUSTOMER_NAME, and CUSTOMER_INSTANCE; then review all
 * target tables, roles, scopes, sys_ids, issue IDs, filters, limits, attachment
 * names, and update-set settings. Keep read-only or PLAN mode enabled first.
 * Do not execute while any CUSTOMER_* placeholder remains.
 */

`;

function customerTemplateScript(value, includeBanner = true) {
  let text = String(value ?? "");
  if (includeBanner && text && !text.includes("CUSTOMER TEMPLATE - REQUIRED CONFIGURATION")) text = CUSTOMER_TEMPLATE_BANNER + text;
  return text;
}

function stableRecordKey(record, index) {
  return String(record?.sys_id || record?.id || record?.key || record?.name || index);
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}

function normaliseAuditRun(input = {}, sourceName = "Script result", importedAt = nowIso()) {
  const records = Array.isArray(input.records) ? input.records : Array.isArray(input.manifest?.records) ? input.manifest.records : [];
  return {
    id: uuid(), schema: "servicenow-diagnostic-run/1", scriptId: input.scriptId || "UNKNOWN", version: input.version || "", mode: input.mode || "READ_ONLY",
    sourceName, importedAt, startedAt: input.startedAt || "", completedAt: input.completedAt || "", ok: input.ok !== false,
    records, counts: input.counts || {}, warnings: input.warnings || [], errors: input.errors || [], raw: input,
  };
}

function compareAuditRuns(baseline, rescan) {
  const before = new Map((baseline.records || []).map((record, index) => [stableRecordKey(record, index), JSON.stringify(canonical(record))]));
  const after = new Map((rescan.records || []).map((record, index) => [stableRecordKey(record, index), JSON.stringify(canonical(record))]));
  const keys = new Set([...before.keys(), ...after.keys()]);
  const counts = { new: 0, resolved: 0, changed: 0, unchanged: 0 };
  const changes = [];
  keys.forEach((key) => {
    let status = "unchanged";
    if (!before.has(key)) status = "new";
    else if (!after.has(key)) status = "resolved";
    else if (before.get(key) !== after.get(key)) status = "changed";
    counts[status] += 1;
    if (status !== "unchanged") changes.push({ key, status });
  });
  return { id: uuid(), schema: "servicenow-diagnostic-comparison/1", scriptId: rescan.scriptId, baselineId: baseline.id, rescanId: rescan.id, createdAt: nowIso(), counts, changes };
}

function customerTemplateScripts(scripts = {}) {
  return Object.fromEntries(Object.entries(scripts || {}).map(([id, script]) => {
    if (typeof script === "string") return [id, customerTemplateScript(script)];
    if (!script || typeof script !== "object") return [id, script];
    return [id, {
      ...script,
      title: customerTemplateScript(script.title, false),
      code: customerTemplateScript(script.code || script.script || ""),
      ...(script.script && !script.code ? { script: customerTemplateScript(script.script) } : {}),
    }];
  }));
}

function explorerPayloadFromState(state) {
  const activeFindings = state.findings.filter((finding) => finding.status !== "Superseded");
  const links = activeFindings.reduce((result, finding) => {
    result[finding.id] = state.links
      .filter((link) => link.findingId === finding.id && link.status === "Active")
      .map((link) => ({ sys_id: link.componentSysId, how: link.how || "manual" }));
    return result;
  }, {});
  const citedBy = new Map();
  Object.entries(links).forEach(([findingId, values]) => values.forEach((link) => {
    citedBy.set(link.sys_id, [...(citedBy.get(link.sys_id) || []), findingId]);
  }));
  const artefacts = Object.fromEntries(state.components.map((component) => [component.sysId, {
    sys_id: component.sysId,
    name: component.name,
    type: component.type,
    table: component.table,
    url: component.url,
    meta: component.metadata || {},
    source: component.source || {},
    cited_by: citedBy.get(component.sysId) || component.citedBy || [],
    desc: component.specification || {},
  }]));
  const issues = activeFindings.map((finding) => ({
    ID: finding.id,
    Issue: finding.title,
    Domain: finding.domain,
    Severity: finding.severity,
    Likelihood: finding.likelihood,
    "Root cause": finding.rootCause,
    "Evidence (component / sys_id / measure)": finding.evidence,
    "Impact if not addressed": finding.impact,
    "Recommended remediation": finding.remediation,
    Effort: finding.effort,
    Priority: finding.priorityLabel || finding.priority,
    Status: finding.status,
    Environment: finding.environment,
    Confidence: finding.confidence,
    Owner: finding.owner,
    "Source ref": finding.sourceRef,
    "Source document": finding.sourceDocument,
    targetDate: finding.targetDate,
  }));
  const assessment = state.assessment;
  return {
    meta: {
      Client: assessment.client,
      Application: assessment.application.name || assessment.name,
      Purpose: assessment.purpose,
      "Prepared by": assessment.lead,
      "Application scope": assessment.application.scopes.join(", "),
      "Environments referenced": assessment.environments.map((environment) => environment.name).join(", "),
      Confidentiality: assessment.confidentiality,
      "Register version": "Diagnostic Workbench export",
      "Generated at": nowIso(),
      "Generated from": "ServiceNow Diagnostic Workbench",
    },
    cols: ["Issue", "Domain", "Severity", "Likelihood", "Root cause", "Evidence (component / sys_id / measure)", "Impact if not addressed", "Recommended remediation", "Effort", "Priority", "Status", "Environment", "Confidence", "Owner"],
    issues,
    artefacts,
    links,
    register: `${assessment.name || "assessment"} findings register`,
    scan: { findings: state.scanFindings, raw_rows: state.scanFindings.length },
    skips: { records: state.skippedRecords, exec_count: state.skippedRecords.filter((record) => record.exec || record.executable || record.has_script).length },
    incidents: state.incidents,
    fixes: state.fixes,
    fixScripts: customerTemplateScripts(state.fixScripts),
    correlation: state.correlations,
    reference: state.reference,
    customerProfile: state.customerProfile || customerProfileFromState(state),
    instanceManifest: state.instanceManifest,
    moduleRegistryVersion: MODULE_REGISTRY_VERSION,
    moduleCoverage: state.moduleCoverage || [],
    auditRuns: state.auditRuns || [],
    rescanComparisons: state.rescanComparisons || [],
    approvals: state.approvals || [],
    datasets: state.datasets,
    audit: state.audit,
  };
}

function renderEvidenceExplorer(state) {
  const payload = explorerPayloadFromState(state);
  const data = JSON.stringify(payload).replaceAll("<", "\\u003c");
  const title = escapeHtml(`${state.assessment.application.name || state.assessment.name} — Issue & Artefact Explorer`);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
:root{--deep:#12363f;--teal:#0e7c86;--green:#5bd747;--ink:#17333b;--muted:#64777d;--rule:#d8e1e3;--paper:#fff;--bg:#f3f6f6;--crit:#c94736;--amber:#c78016}*{box-sizing:border-box}body{margin:0;font:14px/1.5 "Segoe UI",Arial,sans-serif;color:var(--ink);background:var(--bg)}header{padding:22px 28px;background:var(--deep);color:#fff;border-bottom:5px solid var(--green)}header h1{margin:2px 0 5px;font-size:24px}header p{margin:0;color:#bfd2d6}.counts{display:flex;flex-wrap:wrap;gap:22px;margin-top:18px}.counts b{display:block;font-size:22px}.counts span{color:#a9c2c7;font-size:10px;text-transform:uppercase}.layout{display:grid;grid-template-columns:390px minmax(0,1fr);min-height:calc(100vh - 171px)}aside{background:#fff;border-right:1px solid var(--rule)}.tools{position:sticky;top:0;padding:14px;background:#fff;border-bottom:1px solid var(--rule)}input,select{width:100%;padding:10px;border:1px solid var(--rule);border-radius:6px;margin-bottom:7px}.list{max-height:calc(100vh - 260px);overflow:auto}.item{width:100%;display:grid;grid-template-columns:70px 1fr;gap:3px 10px;padding:11px 14px;border:0;border-bottom:1px solid var(--rule);background:#fff;text-align:left;cursor:pointer}.item:hover,.item.active{background:#eaf5f5}.item .id{grid-row:1/3;color:var(--teal);font:700 10px monospace}.item strong{font-size:11px}.item small{color:var(--muted)}main{padding:28px;min-width:0}.empty{max-width:600px;margin:100px auto;text-align:center;color:var(--muted)}.head{display:flex;justify-content:space-between;gap:20px;padding-bottom:18px;border-bottom:1px solid var(--rule)}.head h2{margin:5px 0;font-size:30px;line-height:1.1}.chips{display:flex;flex-wrap:wrap;gap:6px}.chip{padding:4px 8px;border-radius:20px;background:#e7f2f2;color:var(--teal);font-size:9px;font-weight:800;text-transform:uppercase}.chip.Critical,.chip.High{background:#ffede9;color:#a43225}.section{margin-top:18px;padding:18px;background:#fff;border:1px solid var(--rule);border-radius:9px}.section h3{margin:0 0 8px;color:var(--deep);font-size:15px}.section p{white-space:pre-wrap}.artefact{margin-top:8px;border:1px solid var(--rule);border-radius:7px;overflow:hidden}.artefact summary{padding:10px 12px;background:#f5f8f8;cursor:pointer;font-weight:700}.artefact .body{padding:13px}.artefact dl{display:grid;grid-template-columns:120px 1fr;margin:0;font-size:11px}.artefact dt,.artefact dd{margin:0;padding:5px;border-bottom:1px solid #edf1f2}.artefact pre{max-height:430px;overflow:auto;padding:12px;background:#0b252b;color:#d5e8e9;font-size:10px;white-space:pre-wrap}.fixgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fixgrid div{padding:11px;background:#f4f8f8;border-radius:6px}.evidence{display:grid;gap:7px}.evidence article{padding:10px;background:#f7f9f9;border-left:3px solid var(--teal)}footer{padding:18px 28px;background:#fff;border-top:1px solid var(--rule);color:var(--muted);font-size:10px}@media(max-width:800px){.layout{display:block}.list{max-height:330px}.fixgrid{grid-template-columns:1fr}}
</style></head><body>
<header><small>SERVICENOW DIAGNOSTIC WORKBENCH</small><h1>${title}</h1><p>${escapeHtml(state.assessment.client)} · generated ${escapeHtml(new Date().toLocaleString())}</p><div class="counts"><div><b>${payload.issues.length}</b><span>Findings</span></div><div><b>${Object.keys(payload.artefacts).length}</b><span>Artefacts</span></div><div><b>${Object.values(payload.links).flat().length}</b><span>Accepted links</span></div><div><b>${payload.scan.findings.length + payload.skips.records.length + payload.incidents.length}</b><span>Evidence items</span></div></div></header>
<div class="layout"><aside><div class="tools"><input id="search" placeholder="Search findings"><select id="severity"><option value="">All severities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div><div id="list" class="list"></div></aside><main id="detail"><div class="empty"><h2>Select a finding</h2><p>Review its evidence, affected artefacts, source, and remediation.</p></div></main></div>
<footer>This self-contained Explorer was generated from the Diagnostic Workbench assessment store. Correlations and proposed causation require human confirmation.</footer>
<script id="payload" type="application/json">${data}</script>
<script>
const D=JSON.parse(document.getElementById('payload').textContent),list=document.getElementById('list'),detail=document.getElementById('detail'),search=document.getElementById('search'),severity=document.getElementById('severity');let selected='';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const issueId=i=>i.ID||i.id, issueTitle=i=>i.Issue||i.title||'Untitled finding';
function evidenceFor(id){const rows=[];(D.scan?.findings||[]).forEach(x=>{if((x.issues||[]).includes(id))rows.push(['Instance Scan',x])});(D.skips?.records||[]).forEach(x=>{if((x.issues||[]).includes(id))rows.push(['Upgrade skip',x])});(D.incidents||[]).forEach(x=>{if((x.issues||[]).includes(id))rows.push(['Incident',x])});return rows}
function renderList(){const q=search.value.toLowerCase(),sev=severity.value;const rows=D.issues.filter(i=>(!sev||i.Severity===sev)&&JSON.stringify(i).toLowerCase().includes(q));list.innerHTML=rows.map(i=>'<button class="item '+(issueId(i)===selected?'active':'')+'" data-id="'+esc(issueId(i))+'"><span class="id">'+esc(issueId(i))+'</span><strong>'+esc(issueTitle(i))+'</strong><small>'+esc(i.Severity||'')+' · '+esc(i.Priority||'')+' · '+esc(i.Domain||'')+'</small></button>').join('')||'<div class="empty"><p>No findings match.</p></div>';list.querySelectorAll('button').forEach(b=>b.onclick=()=>renderDetail(b.dataset.id))}
function renderDetail(id){selected=id;renderList();const i=D.issues.find(x=>issueId(x)===id);if(!i)return;const links=D.links[id]||[],fix=D.fixes?.[id]||{},ev=evidenceFor(id);const artefacts=links.map(l=>D.artefacts[l.sys_id]).filter(Boolean);detail.innerHTML='<div class="head"><div><div class="chips"><span class="chip '+esc(i.Severity||'')+'">'+esc(i.Severity||'')+'</span><span class="chip">'+esc(i.Priority||'')+'</span><span class="chip">'+esc(i.Confidence||'')+'</span></div><h2>'+esc(issueTitle(i))+'</h2><p>'+esc(i.Domain||'')+' · '+esc(i.Environment||'')+'</p></div><strong>'+esc(id)+'</strong></div>'+section('Root cause',i['Root cause'])+section('Confirmed evidence',i['Evidence (component / sys_id / measure)'])+section('Impact if not addressed',i['Impact if not addressed'])+'<section class="section"><h3>Affected artefacts ('+artefacts.length+')</h3>'+artefacts.map((a,n)=>artefact(a,links[n])).join('')+'</section><section class="section"><h3>Independent evidence ('+ev.length+')</h3><div class="evidence">'+(ev.map(x=>'<article><strong>'+esc(x[0])+'</strong><p>'+esc(x[1].description||x[1].details||x[1].short_description||JSON.stringify(x[1]))+'</p></article>').join('')||'<p>No separately indexed evidence item is mapped.</p>')+'</div></section><section class="section"><h3>Remediation</h3><p>'+esc(fix.approach||i['Recommended remediation']||'Not supplied')+'</p><div class="fixgrid"><div><strong>Verification</strong><p>'+esc(fix.verify||'Not supplied')+'</p></div><div><strong>Rollback</strong><p>'+esc(fix.rollback||'Not supplied')+'</p></div></div></section>'}
function section(title,text){return '<section class="section"><h3>'+esc(title)+'</h3><p>'+esc(text||'Not supplied')+'</p></section>'}
function artefact(a,l){const source=Object.entries(a.source||{}).map(x=>'<h4>'+esc(x[0])+'</h4><pre>'+esc(x[1])+'</pre>').join('');return '<details class="artefact"><summary>'+esc(a.name)+' · '+esc(a.type)+' · '+esc(l?.how||'')+'</summary><div class="body"><dl><dt>Table</dt><dd>'+esc(a.table)+'</dd><dt>sys_id</dt><dd>'+esc(a.sys_id)+'</dd><dt>Updated</dt><dd>'+esc(a.meta?.sys_updated_on||'')+'</dd></dl>'+source+'</div></details>'}
search.oninput=renderList;severity.onchange=renderList;renderList();if(D.issues.length)renderDetail(issueId(D.issues[0]));
</script></body></html>`;
}

function renderAssessmentReport(state) {
  const stats = deriveStats(state);
  const findings = sortedFindings(state.findings);
  const blockers = blockersForPublish(state);
  const gaps = Array.isArray(state.reference?.gaps) ? state.reference.gaps : [];
  const escape = escapeHtml;
  const rows = findings.map((finding) => `
    <tr>
      <td><strong>${escape(finding.id)}</strong></td>
      <td>${escape(finding.title)}</td>
      <td>${escape(finding.severity)}</td>
      <td>${escape(finding.priorityLabel || finding.priority)}</td>
      <td>${escape(finding.confidence)}</td>
      <td>${escape(finding.owner || "Unassigned")}</td>
    </tr>`).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(state.assessment.name)} — Diagnostic report</title>
<style>body{font:15px/1.55 Arial,sans-serif;color:#17333b;max-width:1100px;margin:40px auto;padding:0 28px}h1{font-size:34px}h2{margin-top:36px;border-bottom:2px solid #5bd747;padding-bottom:8px}.meta{color:#5d7076}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.card{border:1px solid #d6e0e3;padding:16px;border-radius:8px}.card b{display:block;font-size:28px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:8px;border-bottom:1px solid #d6e0e3;vertical-align:top}th{background:#eef5f5}.warn{border-left:4px solid #d65f45;background:#fff2ed;padding:12px}ul{padding-left:22px}@media print{body{margin:0}.no-print{display:none}}@media(max-width:700px){.cards{grid-template-columns:1fr 1fr}}</style>
</head><body>
<p class="meta">ServiceNow Diagnostic Workbench · generated ${escape(new Date().toLocaleString())}</p>
<h1>${escape(state.assessment.name)}</h1>
<p>${escape(state.assessment.client)} · ${escape(state.assessment.confidentiality)}</p>
<p>${escape(state.assessment.purpose || "No business context has been supplied.")}</p>
<div class="cards"><div class="card"><b>${state.findings.length}</b>Findings</div><div class="card"><b>${state.components.length}</b>Components</div><div class="card"><b>${stats.priority.P1 || 0}</b>P1 items</div><div class="card"><b>${stats.unassigned}</b>Unassigned</div></div>
<h2>Publication status</h2>
${blockers.length ? `<div class="warn"><strong>Not ready to issue</strong><ul>${blockers.map((item) => `<li>${escape(item)}</li>`).join("")}</ul></div>` : "<p>All automated publication gates passed. Human sign-off is still required.</p>"}
<h2>Findings register</h2><table><thead><tr><th>ID</th><th>Finding</th><th>Severity</th><th>Priority</th><th>Confidence</th><th>Owner</th></tr></thead><tbody>${rows}</tbody></table>
<h2>Declared gaps</h2>${gaps.length ? `<ul>${gaps.map((gap) => `<li>${escape(typeof gap === "string" ? gap : gap.gap || gap.title || JSON.stringify(gap))}</li>`).join("")}</ul>` : "<p>No gaps have been declared.</p>"}
<h2>Evidence base</h2><ul>${state.datasets.filter((dataset) => dataset.status !== "Superseded").map((dataset) => `<li>${escape(dataset.name)} — ${dataset.rows.toLocaleString()} row(s), ${escape(dataset.status)}, ${escape(dataset.environment)}</li>`).join("")}</ul>
<p class="meta">This report is generated from the Workbench assessment store. Correlations and machine proposals require human confirmation.</p>
</body></html>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) { let c = n; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) { return new Uint8Array([value & 255, (value >>> 8) & 255]); }
function u32(value) { return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]); }
function joinBytes(parts) { const size = parts.reduce((total, part) => total + part.length, 0); const out = new Uint8Array(size); let offset = 0; parts.forEach((part) => { out.set(part, offset); offset += part.length; }); return out; }

function createDeliveryZip(entries) {
  const encoder = new TextEncoder();
  const locals = [], central = [];
  let offset = 0;
  Object.entries(entries).forEach(([name, content]) => {
    const fileName = encoder.encode(name.replaceAll("\\", "/"));
    const data = content instanceof Uint8Array ? content : encoder.encode(String(content));
    const crc = crc32(data);
    const local = joinBytes([u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(fileName.length), u16(0), fileName, data]);
    locals.push(local);
    central.push(joinBytes([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(fileName.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), fileName]));
    offset += local.length;
  });
  const centralBytes = joinBytes(central);
  return joinBytes([...locals, centralBytes, u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length), u32(centralBytes.length), u32(offset), u16(0)]);
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadPersistedState() {
  if (!globalThis.indexedDB) return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(STATE_KEY);
    request.onsuccess = () => resolve(request.result ? ensureStateVersion(request.result) : null);
    request.onerror = () => reject(request.error);
  });
}

async function persistState(state) {
  state.updatedAt = nowIso();
  if (!globalThis.indexedDB) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(state, STATE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function clearPersistedState() {
  if (!globalThis.indexedDB) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(STATE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}


const WORKBENCH_SCRIPT_SOURCES_GZIP = "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";
let workbenchScriptSourcesCache;
async function getWorkbenchScriptSources() {
  if (workbenchScriptSourcesCache) return workbenchScriptSourcesCache;
  const compressed = Uint8Array.from(atob(WORKBENCH_SCRIPT_SOURCES_GZIP), (char) => char.charCodeAt(0));
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
  workbenchScriptSourcesCache = JSON.parse(await new Response(stream).text());
  return workbenchScriptSourcesCache;
}



const app = document.querySelector("#app");
const fileInput = document.querySelector("#file-input");

let state = createEmptyState();
let ui = {
  pdaPattern: "",
  guidedQuery: "",
  pasteOpen: false,
  busy: false,
  mobileNav: false,
  query: "",
  inventoryType: "",
  findingSeverity: "",
  evidenceMode: "scan",
  selectedComponent: "",
  selectedFinding: "",
  selectedScript: "",
  toast: "",
  uploadToInstance: false,
  automation: {
    running: false,
    current: "",
    completed: 0,
    total: 0,
    message: "Ready",
    results: [],
  },
};

const icons = {
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"/>',
  checklist: '<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  code: '<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
  shield: '<path d="M12 3 4 6v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6z"/><path d="m8 12 2.5 2.5L16 9"/>',
  box: '<path d="m12 3 8 4-8 4-8-4zM4 7v10l8 4 8-4V7M12 11v10"/>',
  nodes: '<circle cx="5" cy="12" r="3"/><circle cx="19" cy="6" r="3"/><circle cx="19" cy="18" r="3"/><path d="m8 11 8-4M8 13l8 4"/>',
  flag: '<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  wrench: '<path d="M14 7a5 5 0 0 0-6-4l3 3-5 5-3-3a5 5 0 0 0 6 6l6 6 5-5-6-6z"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/>',
  report: '<path d="M6 3h9l3 3v15H6zM14 3v4h4M9 12h6M9 16h6M9 8h2"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.5-.7-1.7 1-1.8-2.1-2.1-1.8 1-1.7-.7-.5-2h-3l-.5 2-1.7.7-1.8-1-2.1 2.1 1 1.8L2.5 10l-2 .5v3l2 .5.7 1.7-1 1.8 2.1 2.1 1.8-1 1.7.7.5 2h3l.5-2 1.7-.7 1.8 1 2.1-2.1-1-1.8.7-1.7z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
  compare: '<path d="M8 3H4v18h4M16 3h4v18h-4M9 8l3-3 3 3M12 5v14M9 16l3 3 3-3"/>',
};

function icon(name, className = "") {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.grid}</svg>`;
}

function chip(value, extra = "") {
  const key = String(value || "unknown").toLowerCase().replaceAll(" ", "-");
  return `<span class="chip chip-${escapeHtml(key)} ${extra}">${escapeHtml(value || "Unknown")}</span>`;
}

function initials(value) {
  return String(value || "DW").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function formatNumber(value) {
  const numeric = Number(value);
  return value !== "" && Number.isFinite(numeric) ? numeric.toLocaleString() : String(value ?? "0");
}

function shortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? escapeHtml(value) : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function renderShell() {
  const nav = NAVIGATION.map((item) => `
    <button class="nav-item ${state.activeView === item.id ? "is-active" : ""}" data-action="navigate" data-view="${item.id}">
      ${icon(item.icon)}<span>${escapeHtml(item.label)}</span>
    </button>`).join("");
  const stats = deriveStats(state);
  app.innerHTML = `
    <div class="app-shell ${ui.mobileNav ? "nav-open" : ""}">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">DW</span>
          <div><strong>Diagnostic</strong><small>Workbench 2</small></div>
        </div>
        <div class="workspace-label">Assessment workspace</div>
        <nav>${nav}</nav>
        <div class="side-foot">
          <div class="progress-label"><span>Overall progress</span><strong>${stats.stagePercent}%</strong></div>
          <div class="progress"><span style="width:${stats.stagePercent}%"></span></div>
          <small>Saved locally · no instance connection</small>
        </div>
      </aside>
      <button class="nav-scrim" data-action="toggle-nav" aria-label="Close navigation"></button>
      <section class="workspace">
        <header class="topbar">
          <button class="icon-button menu-button" data-action="toggle-nav" aria-label="Open navigation">${icon("checklist")}</button>
          <div class="assessment-heading">
            <span>${escapeHtml(state.assessment.client || "Unassigned client")}</span>
            <strong>${escapeHtml(state.assessment.name)}</strong>
          </div>
          <div class="top-actions">
            ${state.datasets.length ? chip(state.assessment.status, "status-chip") : chip("Draft", "status-chip")}
            <button class="button secondary compact" data-action="import-picker">Import</button>
            ${state.datasets.length ? '<button class="button danger compact" data-action="reset-state">Clear data</button>' : ""}
            <span class="avatar" title="Assessment lead">${escapeHtml(initials(state.assessment.lead))}</span>
          </div>
        </header>
        <main id="main-view" tabindex="-1">${renderCurrentView()}</main>
      </section>
      ${ui.busy ? '<div class="busy-layer"><span class="spinner"></span><strong>Working with the assessment data…</strong></div>' : ""}
      ${ui.toast ? `<div class="toast" role="status">${escapeHtml(ui.toast)}</div>` : ""}
      ${renderPastePanel()}
    </div>`;
}

function renderCurrentView() {
  const renderers = {
    dashboard: renderDashboard,
    scope: renderScope,
    modules: renderModules,
    collection: renderCollection,
    scripts: renderScripts,
    validation: renderValidation,
    guided: renderGuided,
    packs: renderPackHealth,
    discovery: renderDiscovery,
    playbook: renderPlaybook,
    deliveryplan: renderDeliveryPlan,
    inventory: renderInventory,
    dependencies: renderDependencies,
    findings: renderFindings,
    evidence: renderEvidence,
    solutions: renderSolutions,
    authoring: renderAuthoring,
    rescans: renderRescans,
    roadmap: renderRoadmap,
    reports: renderReports,
    history: renderHistory,
    administration: renderAdministration,
  };
  return (renderers[state.activeView] || renderDashboard)();
}

function viewHeading(eyebrow, title, description, actions = "") {
  return `<div class="view-heading"><div><span class="eyebrow">${escapeHtml(eyebrow)}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ""}</div>`;
}

function guideHasData(guideId) {
  const checks = {
    scope: Boolean(state.assessment.client && state.assessment.application.name && state.assessment.application.tokens.length),
    modules: Boolean(state.instanceManifest),
    components: state.components.length > 0,
    scan: state.scanFindings.length > 0,
    skips: state.skippedRecords.length > 0,
    incidents: state.incidents.length > 0,
    findings: state.findings.length > 0,
    fixes: Object.keys(state.fixes).length > 0,
    reference: Object.keys(state.reference || {}).length > 0,
  };
  return Boolean(checks[guideId]);
}

function renderGuideCard(guide, compact = false) {
  const ready = guideHasData(guide.id);
  const scripts = guide.scripts.slice(0, compact ? 3 : 6);
  return `<article class="guidance-card ${ready ? "is-ready" : "is-missing"}">
    <header><div class="guide-order">${String(guide.order).padStart(2, "0")}</div><div><span class="eyebrow">Stages ${guide.stages.join(", ")}</span><h3>${escapeHtml(guide.title)}</h3><p>${escapeHtml(guide.summary)}</p></div>${chip(ready ? "Available" : "Needed")}</header>
    ${compact ? `<div class="guide-compact-meta"><span>${escapeHtml(guide.formats[0])}</span><strong>${guide.unlocks.length} output${guide.unlocks.length === 1 ? "" : "s"} unlocked</strong></div>` : `
      <div class="guide-purpose"><strong>Why the client is being asked</strong><p>${escapeHtml(guide.why)}</p></div>
      <div class="guidance-columns">
        <section><span class="eyebrow">Required data points</span><ul>${guide.dataPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
        <section><span class="eyebrow">Accepted import</span><ul>${guide.formats.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join("")}</ul></section>
        <section><span class="eyebrow">Automatically populates</span><ul>${guide.unlocks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
      </div>
      <details class="runbook" ${ready ? "" : "open"}><summary>How to collect and import this evidence</summary><ol>${guide.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></details>`}
    <footer>
      ${guide.id === "scope" ? '<button class="button secondary compact" data-action="navigate" data-view="scope">Open scope form</button>' : '<button class="button primary compact" data-action="import-picker">Import evidence</button>'}
      ${scripts.map((id) => `<button class="button secondary compact" data-action="select-script" data-id="${id}">${id}</button>`).join("")}
      ${guide.scripts.length > scripts.length ? `<button class="text-button" data-action="navigate" data-view="scripts">+${guide.scripts.length - scripts.length} more scripts →</button>` : ""}
    </footer>
  </article>`;
}

function renderGuidance(view, { compact = false, guideId = "", title = "What this page needs" } = {}) {
  let guides = COLLECTION_GUIDES.filter((guide) => guide.views.includes(view));
  if (guideId) guides = guides.filter((guide) => guide.id === guideId);
  if (!guides.length) return "";
  return `<section class="guidance-section"><div class="guidance-heading"><div><span class="eyebrow">Guided evidence map</span><h2>${escapeHtml(title)}</h2><p>Follow the steps below. Imported files are validated, classified, and routed to the relevant Workbench views automatically.</p></div><button class="button secondary" data-action="navigate" data-view="collection">Open full collection map</button></div><div class="guidance-grid ${compact ? "compact" : ""}">${guides.map((guide) => renderGuideCard(guide, compact)).join("")}</div></section>`;
}

function renderOutputPipeline() {
  const outputs = [
    ["Configuration inventory", state.components.length, "Validated component extracts"],
    ["Independent evidence", state.scanFindings.length + state.skippedRecords.length + state.incidents.length, "Scan, upgrade, and incident datasets"],
    ["Findings register", state.findings.length, "Reviewed issue register"],
    ["Evidence links", state.links.filter((link) => link.status !== "Removed").length, "Components plus findings"],
    ["Remediation blocks", Object.keys(state.fixes).length, "Findings plus approved fix content"],
  ];
  return `<section class="output-pipeline"><div class="guidance-heading"><div><span class="eyebrow">Automatic output chain</span><h2>One import feeds every downstream view</h2><p>The Workbench normalises accepted files once, then reuses the same assessment store for analysis and delivery outputs.</p></div></div><div class="pipeline-steps">${outputs.map(([label, count, requires], index) => `<article class="${count ? "is-ready" : "is-waiting"}"><span>${index + 1}</span><div><strong>${escapeHtml(label)}</strong><small>${count ? `${formatNumber(count)} generated` : `Waiting for ${requires}`}</small></div></article>`).join("")}</div><div class="pipeline-actions"><button class="button secondary" data-action="export-collection">Download collection checklist</button>${state.findings.length ? '<button class="button secondary" data-action="export-findings">Download findings CSV</button><button class="button primary" data-action="export-report">Generate HTML report</button>' : '<button class="button primary" data-action="navigate" data-view="findings">Complete findings input</button>'}</div></section>`;
}

function renderExplorerGenerator() {
  const blockers = blockersForExplorer(state);
  const activeLinks = state.links.filter((link) => link.status === "Active").length;
  const requirements = [
    ["Analysis completed", state.stages.every((stage) => ["Analysis complete", "Validated", "Deferred"].includes(stage.status)), `${state.stages.filter((stage) => ["Analysis complete", "Validated", "Deferred"].includes(stage.status)).length}/${state.stages.length} stages`],
    ["Findings and artefacts present", Boolean(state.findings.length && state.components.length), `${state.findings.length} findings · ${state.components.length} artefacts`],
    ["Evidence links accepted", activeLinks > 0 && !state.links.some((link) => link.status === "Proposed"), `${activeLinks} accepted link${activeLinks === 1 ? "" : "s"}`],
    ["Solutions completed", state.findings.length > 0 && state.findings.every((finding) => { const fix = state.fixes[finding.id]; return fix?.approach && fix?.verify && fix?.rollback; }), `${Object.keys(state.fixes).length}/${state.findings.length} remediation blocks`],
    ["Validation and gaps resolved", !state.datasets.some((dataset) => dataset.status === "Validation failed") && Boolean(state.reference?.gaps?.length), `${state.reference?.gaps?.length || 0} declared gap${state.reference?.gaps?.length === 1 ? "" : "s"}`],
  ];
  return `<section class="explorer-generator ${blockers.length ? "is-blocked" : "is-ready"}">
    <div class="generator-copy"><span class="eyebrow">Final technical deliverable</span><h2>Generate the ServiceNow Issue &amp; Artefact Explorer</h2><p>Creates one self-contained HTML file from the current Workbench store. It embeds the findings register, configuration artefacts and source, accepted links, scan and upgrade evidence, incidents, remediation blocks, customer-template scripts, correlations, gaps, and audit provenance. Imported legacy script text is sanitised to CUSTOMER_* placeholders during generation.</p></div>
    <div class="generator-checks">${requirements.map(([label, pass, detail]) => `<article class="${pass ? "pass" : "wait"}"><span>${pass ? "✓" : "!"}</span><div><strong>${escapeHtml(label)}</strong><small>${escapeHtml(detail)}</small></div></article>`).join("")}</div>
    ${blockers.length ? `<div class="generator-blockers"><strong>Complete these items before generation</strong><ul>${blockers.map((blocker) => `<li>${escapeHtml(blocker)}</li>`).join("")}</ul></div>` : '<div class="generator-ready"><strong>Ready to generate</strong><span>Evidence, module disposition, remediation and named publication approval are complete.</span></div>'}
    <div class="generator-actions"><button class="button primary" data-action="export-explorer" ${blockers.length ? "disabled" : ""}>Generate Issue &amp; Artefact Explorer</button><button class="button secondary" data-action="export-collection">Download remaining-work checklist</button></div>
  </section>`;
}

function renderDashboard() {
  const stats = deriveStats(state);
  const blockers = blockersForPublish(state);
  const phaseCards = PHASES.map((phase) => {
    const stages = state.stages.filter((stage) => phase.stages.includes(stage.id));
    const completed = stages.filter((stage) => ["Analysis complete", "Validated", "Deferred"].includes(stage.status)).length;
    return `<article class="phase-card">
      <div class="phase-number">${completed}/${stages.length}</div>
      <div><span>${escapeHtml(phase.label)}</span><strong>${escapeHtml(stages.map((stage) => stage.title).join(" · "))}</strong></div>
    </article>`;
  }).join("");
  const noData = !state.datasets.length;
  return `
    ${viewHeading("Assessment command centre", noData ? "Start with evidence, not assumptions" : "The assessment at a glance", noData ? "Create the client scope, then import only that client's read-only extracts and exports." : "Progress, evidence coverage, risk, and delivery blockers from one assessment store.", `
      ${noData ? '<button class="button secondary" data-action="navigate" data-view="scope">Define client scope</button>' : '<button class="button danger" data-action="reset-state">Clear assessment</button>'}
      <button class="button primary" data-action="import-picker">Import client data</button>`)}
    ${noData ? `<section class="hero-panel">
      <div class="hero-copy"><span class="kicker">Local-first by design</span><h2>Turn client-owned ServiceNow extracts into a defensible remediation plan.</h2><p>The Workbench begins empty. It validates each client's inputs, preserves provenance, labels inference, and keeps a human approval gate between evidence and action.</p><div class="hero-actions"><button class="button light" data-action="navigate" data-view="scope">Set up the client assessment</button><button class="button ghost-light" data-action="navigate" data-view="collection">Open collection guidance</button></div></div>
      <div class="layer-stack" aria-label="Six-layer Workbench architecture">
        ${["Reporting & delivery", "Remediation", "Correlation", "Analysis engine", "Validation", "Collection"].map((label, index) => `<div style="--i:${index}"><span>${6 - index}</span>${label}</div>`).join("")}
      </div>
    </section>${renderGuidance("dashboard", { compact: true, title: "Start here: the first client inputs" })}` : ""}
    <section class="metric-grid">
      ${metric("Findings", state.findings.length, `${stats.severity.Critical || 0} critical`, "critical")}
      ${metric("Components", state.components.length, `${stats.linkedFindings} findings linked`, "teal")}
      ${metric("Independent evidence", state.scanFindings.length + state.skippedRecords.length, `${state.scanFindings.length} scan · ${state.skippedRecords.length} upgrade`, "blue")}
      ${metric("Delivery readiness", `${stats.stagePercent}%`, `${blockers.length} blocker${blockers.length === 1 ? "" : "s"}`, blockers.length ? "amber" : "green")}
    </section>
    <div class="dashboard-grid">
      <section class="panel span-2"><div class="panel-heading"><div><span class="eyebrow">Workflow</span><h2>Six phases, eighteen controlled stages</h2></div><button class="text-button" data-action="navigate" data-view="collection">Open collection run →</button></div><div class="phase-grid">${phaseCards}</div></section>
      <section class="panel"><div class="panel-heading"><div><span class="eyebrow">Issue pressure</span><h2>Priority mix</h2></div></div>${renderPriorityBars(stats)}</section>
      <section class="panel"><div class="panel-heading"><div><span class="eyebrow">Release gate</span><h2>${blockers.length ? "Needs attention" : "Automated checks pass"}</h2></div></div>${blockers.length ? `<ul class="blocker-list">${blockers.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : '<div class="empty-success">No automated blocker is active. Human sign-off is still required.</div>'}<button class="button secondary full" data-action="navigate" data-view="reports">Review publication gate</button></section>
      <section class="panel span-2"><div class="panel-heading"><div><span class="eyebrow">Evidence ledger</span><h2>Latest submissions</h2></div><button class="text-button" data-action="navigate" data-view="validation">View validation →</button></div>${renderDatasetTable(state.datasets.slice(0, 5))}</section>
    </div>`;
}

function metric(label, value, note, tone) {
  return `<article class="metric-card ${tone}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(formatNumber(value))}</strong><small>${escapeHtml(note)}</small></article>`;
}

function renderPriorityBars(stats) {
  const total = Math.max(1, state.findings.length);
  return `<div class="bar-list">${["P1", "P2", "P3", "P4"].map((priority) => {
    const count = stats.priority[priority] || 0;
    return `<div><span><b>${priority}</b>${count}</span><div class="bar"><i class="bar-${priority.toLowerCase()}" style="width:${Math.round((count / total) * 100)}%"></i></div></div>`;
  }).join("")}</div>`;
}

function renderScope() {
  const assessment = state.assessment;
  const profile = state.customerProfile || customerProfileFromState(state);
  return `
    ${viewHeading("Stages 1–3", "Scope the assessment", "Set the handling boundary, identify the application, and capture business context before collecting data.")}
    <form id="scope-form" class="form-layout">
      <section class="panel form-section"><div class="section-index">01</div><div class="form-content"><h2>Engagement setup</h2><p>The assessment container and its handling rules.</p><div class="field-grid">
        ${field("client", "Client", assessment.client, true)}
        ${field("name", "Assessment name", assessment.name, true)}
        ${field("lead", "Assessment lead", assessment.lead, true)}
        ${field("retentionDays", "Retention (days)", assessment.retentionDays, true, "number")}
        ${selectField("confidentiality", "Confidentiality", assessment.confidentiality, ["Client confidential", "Internal", "Restricted"])}
        ${selectField("environment", "Primary environment", assessment.environments[0]?.name || "PROD", ["PROD", "DEV", "TEST", "UAT", "Clone"])}
      </div></div></section>
      <section class="panel form-section"><div class="section-index">02</div><div class="form-content"><h2>Application identity</h2><p>These values tune the reusable extractor and inference limits.</p><div class="field-grid">
        ${field("applicationName", "Application name", assessment.application.name, true)}
        ${field("scopes", "Scope(s)", assessment.application.scopes.join(", "), false, "text", "Global, x_client_app")}
        ${field("prefixes", "Table prefix(es)", assessment.application.prefixes.join(", "), false, "text", "u_, x_client_")}
        ${field("tokens", "Token vocabulary", assessment.application.tokens.join(", "), true, "text", "Names and table tokens, comma-separated", "wide")}
        ${field("alwaysInclude", "Always-include sys_ids", assessment.application.alwaysInclude.join(", "), false, "text", "Records a name filter cannot reach", "wide")}
        ${field("approvedInstance", "Approved instance URL", profile.approvedInstance, true, "text", "https://customer.service-now.com")}
        ${field("changeReference", "Approved change reference", profile.changeReference, true, "text", "CHG...")}
        ${field("serviceUser", "Service account", profile.serviceUser, true)}
        ${field("requiredRole", "Application role", profile.requiredRole, true)}
      </div><div class="callout"><strong>Token discipline</strong><span>Tokens under four characters over-match. The instance, change, service account and role values feed the shared safety harness.</span></div></div></section>
      <section class="panel form-section"><div class="section-index">03</div><div class="form-content"><h2>Business context</h2><p>This language carries into impact statements and prioritisation.</p><div class="field-grid">
        ${textArea("purpose", "Purpose and outcomes", assessment.purpose, true)}
        ${textArea("userGroups", "Users and processes affected", assessment.userGroups, true)}
        ${textArea("knownEvents", "Known events and dates", assessment.knownEvents, false)}
      </div></div></section>
      <div class="form-actions"><span>Save once, then generate the profile used across the full script pack.</span><button class="button secondary" type="button" data-action="export-profile">Generate customer profile</button><button class="button primary" type="submit">Save scope</button></div>
    </form>`;
}

function renderModules() {
  const coverage = state.moduleCoverage || [];
  const detected = coverage.filter((item) => item.detected);
  const complete = detected.filter((item) => MODULE_TERMINAL_STATES.has(item.status));
  if (!state.instanceManifest) return `${viewHeading("Instance discovery", "Module coverage", "Run EXT-000 to discover the customer’s installed applications, plugins, scopes, modules and custom tables.", '<button class="button primary" data-action="select-script" data-id="EXT-000">Open EXT-000</button>')}
    <section class="hero-panel compact-hero"><div class="hero-copy"><span class="kicker">Registry ${MODULE_REGISTRY_VERSION}</span><h2>Start from what is installed.</h2><p>EXT-000 reads platform metadata only and produces the manifest that drives module-aware collection and publication.</p><div class="hero-actions"><button class="button light" data-action="select-script" data-id="EXT-000">Review discovery script</button><button class="button ghost-light" data-action="import-picker">Import manifest JSON</button></div></div></section>`;
  return `${viewHeading("Registry " + MODULE_REGISTRY_VERSION, "Module coverage", "Detected products and custom applications must be analysed or explicitly dispositioned before publication.", '<button class="button primary" data-action="import-picker">Import refreshed manifest</button>')}
    <section class="metric-grid compact-metrics">${metric("Detected", detected.length, `${coverage.filter((x) => x.dynamic).length} custom/unknown`, "teal")}${metric("Complete", complete.length, `${detected.length - complete.length} open`, complete.length === detected.length ? "green" : "amber")}${metric("Applications", state.instanceManifest.applications?.length || 0, "installed metadata rows", "blue")}${metric("Plugins", state.instanceManifest.plugins?.length || 0, "active metadata rows", "amber")}</section>
    <section class="panel"><div class="panel-heading"><div><span class="eyebrow">Publication coverage</span><h2>Installed module dispositions</h2></div></div><div class="table-wrap"><table><thead><tr><th>Module</th><th>Evidence</th><th>Relevant scripts</th><th>Status</th><th>Note</th></tr></thead><tbody>${coverage.map((item) => `<tr class="${item.detected ? "" : "muted-row"}"><td><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.group)}${item.dynamic ? " · discovered custom app" : ""}</small></td><td>${item.detected ? chip("Detected") : chip("Not detected")}<small>${escapeHtml((item.reasons || []).join(", ") || "No registry signal")}</small></td><td>${(item.scripts || []).map((id) => `<button class="text-button" data-action="select-script" data-id="${id}">${id}</button>`).join(" ")}</td><td><select data-module-status="${escapeHtml(item.id)}"><option ${item.status === "Not detected" ? "selected" : ""}>Not detected</option><option ${item.status === "Applicable" ? "selected" : ""}>Applicable</option><option ${item.status === "Collected" ? "selected" : ""}>Collected</option><option ${item.status === "Analysed" ? "selected" : ""}>Analysed</option><option ${item.status === "Deferred" ? "selected" : ""}>Deferred</option><option ${item.status === "Excluded" ? "selected" : ""}>Excluded</option><option ${item.status === "Unsupported" ? "selected" : ""}>Unsupported</option></select></td><td><input data-module-note="${escapeHtml(item.id)}" value="${escapeHtml(item.note || "")}" placeholder="Reason, owner or evidence reference"></td></tr>`).join("")}</tbody></table></div></section>`;
}

function field(name, label, value, required = false, type = "text", placeholder = "", className = "") {
  return `<label class="field ${className}"><span>${escapeHtml(label)}${required ? " *" : ""}</span><input name="${name}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""}></label>`;
}

function selectField(name, label, value, options) {
  return `<label class="field"><span>${escapeHtml(label)}</span><select name="${name}">${options.map((option) => `<option ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`;
}

function textArea(name, label, value, required = false) {
  return `<label class="field wide"><span>${escapeHtml(label)}${required ? " *" : ""}</span><textarea name="${name}" rows="4" ${required ? "required" : ""}>${escapeHtml(value)}</textarea></label>`;
}

function renderCollection() {
  const phases = PHASES.map((phase) => {
    const stages = state.stages.filter((stage) => phase.stages.includes(stage.id));
    return `<section class="collection-phase"><div class="phase-label"><span>${escapeHtml(phase.label)}</span><i></i></div><div class="stage-list">${stages.map(renderStage).join("")}</div></section>`;
  }).join("");
  return `
    ${viewHeading("Guided run", "Collection and analysis workflow", "Run the bundled evidence collectors on this instance in controlled phases. Read-only collectors execute as supplied; remediation templates are locked to PLAN.", '<button class="button secondary" data-action="upload-output-picker">Upload output</button><button class="button primary" data-action="run-auto-all">Run all safe scripts</button>')}
    ${renderAutomationPanel()}
    <div class="workflow-legend"><span>${chip("Validated")}</span><span>${chip("Requires review")}</span><span>${chip("Validation failed")}</span><span>${chip("Deferred")}</span></div>
    ${renderGuidance("collection", { compact: true, title: "Client collection map" })}
    <div class="collection-board">${phases}</div>
    ${renderOutputPipeline()}
    ${renderExplorerGenerator()}`;
}

function renderAutomationPanel() {
  const progress = ui.automation.total ? Math.round((ui.automation.completed / ui.automation.total) * 100) : 0;
  const phaseCards = PHASES.map((phase) => {
    const scripts = SCRIPT_CATALOG.filter((script) => phase.stages.includes(script.stage));
    const modes = scripts.reduce((counts, script) => {
      counts[WRITE_SCRIPT_IDS.has(script.id) ? "plan" : "read"] += 1;
      return counts;
    }, { read: 0, plan: 0 });
    return `<article class="automation-phase"><div><span class="eyebrow">${escapeHtml(phase.label)}</span><strong>${scripts.length} script${scripts.length === 1 ? "" : "s"}</strong><small>${modes.read} read-only${modes.plan ? ` · ${modes.plan} PLAN` : ""}</small></div><button class="button secondary tiny" data-action="run-auto-phase" data-phase="${phase.id}" ${!scripts.length || ui.automation.running ? "disabled" : ""}>Run phase</button></article>`;
  }).join("");
  const latest = ui.automation.results.slice(-4).reverse();
  return `<section class="panel automation-panel"><div class="panel-heading"><div><span class="eyebrow">In-instance automation</span><h2>Phased evidence runner</h2><p>Admin-only · static 55-script allowlist · no client-supplied code · write-capable templates remain PLAN-only</p></div><span class="chip">${ui.automation.running ? "Running" : "Ready"}</span></div>
    <div class="automation-progress"><div><strong>${escapeHtml(ui.automation.message)}</strong><span>${ui.automation.completed} of ${ui.automation.total || SCRIPT_CATALOG.length}</span></div><div class="progress"><span style="width:${progress}%"></span></div></div>
    <div class="automation-phases">${phaseCards}</div>
    ${latest.length ? `<div class="automation-results">${latest.map((item) => `<span class="${item.ok ? "is-ok" : "is-fail"}"><b>${escapeHtml(item.id)}</b>${escapeHtml(item.message)}</span>`).join("")}</div>` : ""}
    <div class="callout"><strong>Output handling</strong><span>Each completed run is imported into this assessment and saved as a JSON attachment on your ServiceNow user record. Upload output stores externally run JSON or DIAG text the same way.</span></div></section>`;
}

function renderStage(stage) {
  const inputs = REQUIRED_STAGE_INPUTS[stage.id] || [];
  const scripts = [...new Set(COLLECTION_GUIDES.filter((guide) => guide.stages.includes(stage.id)).flatMap((guide) => guide.scripts))].slice(0, 4);
  return `<article class="stage-card" data-stage="${stage.id}">
    <button class="stage-status" data-action="cycle-stage" data-stage="${stage.id}" title="Advance status"><span>${stage.id}</span>${chip(stage.status)}</button>
    <div class="stage-copy"><h3>${escapeHtml(stage.title)}</h3><p>${escapeHtml(stage.purpose)}</p><div class="requirements">${inputs.map((input) => `<span>${escapeHtml(input)}</span>`).join("")}</div>${scripts.length ? `<div class="stage-scripts"><small>Relevant scripts</small>${scripts.map((id) => `<button data-action="select-script" data-id="${id}">${id}</button>`).join("")}</div>` : ""}${stage.note ? `<small>${escapeHtml(stage.note)}</small>` : ""}</div>
    <button class="icon-button" data-action="open-stage" data-stage="${stage.id}" aria-label="Open related module">→</button>
  </article>`;
}

function renderScripts() {
  const query = ui.query.toLowerCase();
  const scripts = SCRIPT_CATALOG.filter((script) => `${script.id} ${script.title} ${script.description}`.toLowerCase().includes(query));
  const selected = scripts.find((script) => script.id === ui.selectedScript) || scripts[0];
  if (selected && !ui.selectedScript) ui.selectedScript = selected.id;
  return `
    ${viewHeading("Generated configuration", "Script and query library", "Run any bundled script through the admin-only allowlist, or inspect and copy its customer template. Results are attached to your user record and imported into the Workbench automatically.", '<button class="button secondary" data-action="export-profile">Generate customer profile</button><button class="button secondary" data-action="upload-output-picker">Upload output</button>')}
    <div class="split-layout library-layout">
      <section class="list-pane"><div class="list-tools"><label class="search-box">${icon("search")}<input data-filter="global" placeholder="Search scripts" value="${escapeHtml(ui.query)}"></label><span>${scripts.length} scripts</span></div><div class="record-list">${scripts.map((script) => `
        <button class="record-row ${selected?.id === script.id ? "is-selected" : ""}" data-action="select-script" data-id="${script.id}">
          <span class="mono-id">${script.id}</span><strong>${escapeHtml(script.title)}</strong><small>Stage ${script.stage} · ${escapeHtml(script.safety)}</small>
        </button>`).join("")}</div></section>
      <section class="detail-pane">${selected ? renderScriptDetail(selected) : renderEmpty("No script matches", "Try a broader search.")}</section>
    </div>`;
}

function renderScriptDetail(script) {
  const extract = script.kind === "extract";
  const useSteps = ["Complete Scope & context so scopes and table prefixes can be applied safely.", `Select ${WRITE_SCRIPT_IDS.has(script.id) ? "Run PLAN" : "Run now"}; the server accepts this script ID only and never accepts executable source.`, "Review warnings, unavailable tables, query caps, and validation results.", "The JSON output is attached to your ServiceNow user record and imported into this assessment automatically.", "Use View customer template and Script - Background only when manual review or customer-specific configuration is required."];
  return `<div class="detail-header"><div><span class="mono-id">${script.id}</span><h2>${escapeHtml(script.title)}</h2><p>${escapeHtml(script.description)}</p></div>${chip(script.kind === "extract" ? "Read-only collection" : "Remediation pattern")}</div>
    <div class="fact-grid"><div><span>Workflow stage</span><strong>${script.stage} · ${escapeHtml(STAGES.find((stage) => stage.id === script.stage)?.title)}</strong></div><div><span>Safety posture</span><strong>${escapeHtml(script.safety)}</strong></div><div class="wide"><span>Authoritative file</span><code>${escapeHtml(script.file)}</code></div></div>
    <div class="template-warning"><strong>Generated profile required</strong><span>Do not edit 29 scripts independently. Generate the profile once, apply it to this source, and do not run while a <code>CUSTOMER_*</code> placeholder remains.</span></div>
    <section class="script-runbook"><div><span class="eyebrow">Where it runs</span><strong>This ServiceNow instance · secured Workbench API</strong><p>Only administrators can run the static bundled allowlist. Arbitrary source cannot be submitted.</p></div><div><span class="eyebrow">What you get</span><strong>${extract ? "A configuration JSON attachment and imported evidence" : "A read-only audit result or PLAN-only remediation result"}</strong><p>The result is retained on your user record and routed to validation, findings, and baseline comparison.</p></div></section>
    <details class="runbook" open><summary>Run, review, and import instructions</summary><ol>${useSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></details>
    <div class="callout strong"><strong>Execution boundary</strong><span>The button invokes this bundled script by ID. Write-capable remediation templates are forcibly kept in PLAN and cannot apply changes through this API.</span></div>
    <div class="script-source-actions">
      <button class="button primary" data-action="run-automated-script" data-id="${escapeHtml(script.id)}">${WRITE_SCRIPT_IDS.has(script.id) ? "Run PLAN" : "Run now"}</button>
      <div class="script-source-actions-end">
        <span id="script-copy-status" class="script-copy-status" role="status" aria-live="polite"></span>
        <button class="button secondary" data-action="load-script-source" data-id="${escapeHtml(script.id)}" data-url="${escapeHtml(script.sourceUrl)}">View customer template</button>
        <button class="button secondary" data-action="copy-script-source" type="button">Copy Script</button>
        <a class="button secondary" href="/sys.scripts.modern.do" target="_blank" rel="noopener noreferrer" aria-label="Open Script - Background in a new tab">Open Script - Background</a>
      </div>
    </div>
    <div class="script-next-step"><strong>Next step</strong><span>Run here for automated collection. Use the manual template only when you need to tailor a target query or complete an approval-gated change outside this runner.</span></div>
    <pre id="script-source" class="source-view script-source-view"><code>Select “View customer template” to load the supplied file.</code></pre>`;
}

function renderValidation() {
  const byDataset = state.datasets.map((dataset) => ({
    dataset,
    results: state.validationResults.filter((result) => result.datasetId === dataset.id),
  }));
  const failures = state.validationResults.filter((result) => result.outcome === "Fail").length;
  if (!state.datasets.length) return `${viewHeading("Evidence intake", "Validation results", "Caps, suspicious zeros, schema traps, consumer data, and secrets block acceptance with an explicit reason.", '<button class="button primary" data-action="import-picker">Import evidence</button>')}${renderGuidance("validation", { title: "Choose the evidence layer to collect" })}${renderOutputPipeline()}`;
  return `
    ${viewHeading("Evidence intake", "Validation results", "Caps, suspicious zeros, schema traps, consumer data, and secrets block acceptance with an explicit reason.", '<button class="button secondary" data-action="paste-envelope">Paste script output</button><button class="button primary" data-action="import-picker">Upload file</button>')}
    <section class="metric-grid compact-metrics">${metric("Datasets", state.datasets.length, `${state.datasets.filter((d) => d.status === "Validated").length} validated`, "teal")}${metric("Rule results", state.validationResults.length, `${failures} failed`, failures ? "critical" : "green")}${metric("Superseded", state.datasets.filter((d) => d.status === "Superseded").length, "retained for audit", "blue")}${metric("Provenance", state.datasets.filter((d) => d.hash).length, "content hashes sealed", "amber")}</section>
    <section class="panel"><div class="panel-heading"><div><span class="eyebrow">Dataset ledger</span><h2>Received evidence</h2></div></div>${renderDatasetTable(state.datasets)}</section>
    <section class="validation-grid">${byDataset.map(({ dataset, results }) => `<article class="validation-card"><div><span class="mono-id">${escapeHtml(dataset.kind)}</span><h3>${escapeHtml(dataset.name)}</h3><p>${formatNumber(dataset.rows)} row(s) · ${escapeHtml(dataset.environment)}</p></div>${chip(dataset.status)}<ul>${results.length ? results.map((result) => `<li class="result-${result.outcome.toLowerCase()}"><b>${escapeHtml(result.outcome)}</b><span><strong>${escapeHtml(result.rule)}</strong>${escapeHtml(result.detail)}</span></li>`).join("") : "<li><span>No rule detail was retained for this dataset.</span></li>"}</ul></article>`).join("") || renderEmpty("No datasets submitted", "Import the reference explorer or a JSON/CSV extract to run validation.")}</section>`;
}

function renderDatasetTable(datasets) {
  if (!datasets.length) return renderEmpty("No evidence yet", "Import the supplied reference explorer or begin the guided collection.");
  return `<div class="table-wrap"><table><thead><tr><th>Dataset</th><th>Type</th><th>Rows</th><th>Environment</th><th>Status</th><th>Received</th></tr></thead><tbody>${datasets.map((dataset) => `<tr><td><strong>${escapeHtml(dataset.name)}</strong><small>${escapeHtml(dataset.note || dataset.hash?.slice(0, 18) || "")}</small></td><td>${escapeHtml(dataset.kind)}</td><td>${formatNumber(dataset.rows)}</td><td>${escapeHtml(dataset.environment)}</td><td>${chip(dataset.status)}</td><td>${shortDate(dataset.collectedAt)}</td></tr>`).join("")}</tbody></table></div>`;
}

function renderInventory() {
  const types = [...new Set(state.components.map((component) => component.type))].sort();
  const query = ui.query.toLowerCase();
  const components = state.components.filter((component) =>
    (!ui.inventoryType || component.type === ui.inventoryType)
    && `${component.name} ${component.type} ${component.table} ${component.sysId}`.toLowerCase().includes(query),
  );
  const selected = components.find((component) => component.sysId === ui.selectedComponent) || components[0];
  if (selected && !ui.selectedComponent) ui.selectedComponent = selected.sysId;
  if (!state.components.length) return `${viewHeading("Validated configuration", "Component inventory", "Browse actual configuration records, metadata, specifications, source, and every linked finding.")}${renderGuidance("inventory", { title: "How to populate the component inventory" })}${renderOutputPipeline()}`;
  return `
    ${viewHeading("Validated configuration", "Component inventory", "Browse actual configuration records, metadata, specifications, source, and every linked finding.")}
    <div class="split-layout inventory-layout"><section class="list-pane"><div class="list-tools stacked"><label class="search-box">${icon("search")}<input data-filter="global" placeholder="Search name, table, sys_id" value="${escapeHtml(ui.query)}"></label><select data-filter="inventory-type"><option value="">All component types</option>${types.map((type) => `<option ${type === ui.inventoryType ? "selected" : ""}>${escapeHtml(type)}</option>`).join("")}</select><span>${formatNumber(components.length)} of ${formatNumber(state.components.length)}</span></div><div class="record-list dense">${components.slice(0, 600).map((component) => `<button class="record-row ${selected?.sysId === component.sysId ? "is-selected" : ""}" data-action="select-component" data-id="${component.sysId}"><span class="type-dot"></span><strong>${escapeHtml(component.name)}</strong><small>${escapeHtml(component.type)} · ${escapeHtml(component.table)}</small></button>`).join("")}${components.length > 600 ? '<div class="list-limit">Showing the first 600 filtered components.</div>' : ""}</div></section><section class="detail-pane">${selected ? renderComponentDetail(selected) : renderEmpty("No components", "Import a validated artefact extract to populate this view.")}</section></div>`;
}

function renderComponentDetail(component) {
  const links = state.links.filter((link) => link.componentSysId === component.sysId && link.status !== "Removed");
  const source = Object.entries(component.source || {});
  const spec = component.specification || {};
  return `<div class="detail-header"><div><span class="mono-id">${escapeHtml(component.table)}</span><h2>${escapeHtml(component.name)}</h2><p>${escapeHtml(component.type)} · <code>${escapeHtml(component.sysId)}</code></p></div>${chip(component.status)}</div>
    <div class="fact-grid"><div><span>Updated</span><strong>${escapeHtml(component.metadata?.sys_updated_on || component.metadata?.updated_on || "Unknown")}</strong></div><div><span>Updated by</span><strong>${escapeHtml(component.metadata?.sys_updated_by || component.metadata?.updated_by || "Unknown")}</strong></div><div><span>Linked findings</span><strong>${links.length}</strong></div><div><span>Source fields</span><strong>${source.length}</strong></div></div>
    ${Object.keys(spec).length ? `<section class="detail-section"><span class="eyebrow">Component specification</span><h3>${escapeHtml(spec.purpose || spec.summary || "Specification")}</h3><p>${escapeHtml(spec.behaviour || spec.behavior || spec.description || JSON.stringify(spec))}</p>${spec.confidence ? chip(spec.confidence) : ""}</section>` : ""}
    <section class="detail-section"><div class="section-row"><div><span class="eyebrow">Evidence links</span><h3>Findings against this component</h3></div></div><div class="link-chips">${links.length ? links.map((link) => `<button data-action="select-finding" data-id="${link.findingId}">${escapeHtml(link.findingId)}<small>${escapeHtml(link.how)}</small></button>`).join("") : "<span>No finding is linked to this component.</span>"}</div></section>
    <section class="detail-section"><div class="section-row"><div><span class="eyebrow">Verbatim configuration</span><h3>Source held in evidence</h3></div>${component.url ? `<a class="text-button" href="${escapeHtml(component.url)}" target="_blank" rel="noreferrer">Open in instance ↗</a>` : ""}</div>${source.length ? source.map(([fieldName, value]) => `<details class="source-block" open><summary>${escapeHtml(fieldName)} · ${String(value).split("\n").length} lines</summary><pre><code>${escapeHtml(value)}</code></pre></details>`).join("") : '<div class="empty-inline">No body field was held. This is an explicit unread-body state, not proof that the record is empty.</div>'}</section>`;
}

function renderDependencies() {
  const proposals = state.links.filter((link) => link.status === "Proposed");
  const active = state.links.filter((link) => link.status === "Active");
  const methods = [...new Set(active.map((link) => link.how))];
  const avg = state.findings.length ? active.filter((link) => /inferred/i.test(link.how)).length / state.findings.length : 0;
  if (!state.links.length) return `${viewHeading("Stage 6", "Relationships and evidence links", "Every edge states how it was made. Components and findings must both be present before linkage can be reviewed.", state.components.length && state.findings.length ? '<button class="button primary" data-action="propose-links">Generate linkage proposals</button>' : "")}${renderGuidance("dependencies", { title: "Inputs required before links can be generated" })}${renderOutputPipeline()}`;
  return `
    ${viewHeading("Stage 6", "Relationships and evidence links", "Every edge states how it was made. Manual additions and removals remain authoritative across re-analysis.", '<button class="button primary" data-action="propose-links">Run capped name inference</button>')}
    <section class="metric-grid compact-metrics">${metric("Active links", active.length, `${methods.length} methods`, "teal")}${metric("Confirmed findings", new Set(active.map((link) => link.findingId)).size, "carry a component edge", "blue")}${metric("Proposals", proposals.length, "await human review", "amber")}${metric("Junk-link meter", avg.toFixed(2), avg > 2 ? "tighten tokens" : "within reference threshold", avg > 2 ? "critical" : "green")}</section>
    <div class="relationship-layout"><section class="panel"><div class="panel-heading"><div><span class="eyebrow">Link method</span><h2>Evidence edge composition</h2></div></div><div class="method-list">${methods.map((method) => { const count = active.filter((link) => link.how === method).length; return `<div><span>${escapeHtml(method)}</span><strong>${count}</strong></div>`; }).join("") || '<div><span>No active links</span><strong>0</strong></div>'}</div></section>
      <section class="panel span-2"><div class="panel-heading"><div><span class="eyebrow">Review queue</span><h2>Proposed inferred links</h2></div></div>${proposals.length ? `<div class="proposal-list">${proposals.slice(0, 100).map((link) => { const finding = state.findings.find((item) => item.id === link.findingId); const component = state.components.find((item) => item.sysId === link.componentSysId); return `<article><div><span class="mono-id">${escapeHtml(link.findingId)}</span><strong>${escapeHtml(component?.name || link.componentSysId)}</strong><small>${escapeHtml(finding?.title || "Finding not loaded")}</small></div><div><button class="button tiny primary" data-action="accept-link" data-id="${escapeHtml(link.id)}">Accept</button><button class="button tiny secondary" data-action="reject-link" data-id="${escapeHtml(link.id)}">Reject</button></div></article>`; }).join("")}</div>` : renderEmpty("No proposals waiting", "Run the capped inference pass or import curated links from an explorer.")}</section></div>`;
}

function renderFindings() {
  const query = ui.query.toLowerCase();
  const findings = sortedFindings(state.findings).filter((finding) =>
    (!ui.findingSeverity || finding.severity === ui.findingSeverity)
    && `${finding.id} ${finding.title} ${finding.domain} ${finding.rootCause} ${finding.evidence}`.toLowerCase().includes(query),
  );
  const selected = findings.find((finding) => finding.id === ui.selectedFinding) || findings[0];
  if (selected && !ui.selectedFinding) ui.selectedFinding = selected.id;
  if (!state.findings.length) return `${viewHeading("Evidence-linked register", "Findings", "No finding is complete without evidence, confidence, business impact, and a remediation path.")}${renderGuidance("findings", { title: "How evidence becomes a client finding" })}${renderOutputPipeline()}`;
  return `
    ${viewHeading("Evidence-linked register", "Findings", "No finding is complete without evidence, confidence, business impact, and a remediation path.")}
    <div class="split-layout finding-layout"><section class="list-pane"><div class="list-tools stacked"><label class="search-box">${icon("search")}<input data-filter="global" placeholder="Search findings" value="${escapeHtml(ui.query)}"></label><select data-filter="finding-severity"><option value="">All severities</option>${["Critical", "High", "Medium", "Low"].map((level) => `<option ${level === ui.findingSeverity ? "selected" : ""}>${level}</option>`).join("")}</select><span>${findings.length} findings</span></div><div class="record-list">${findings.map((finding) => `<button class="record-row finding-row ${selected?.id === finding.id ? "is-selected" : ""}" data-action="select-finding" data-id="${escapeHtml(finding.id)}"><span class="severity-line severity-${finding.severity.toLowerCase()}"></span><span class="mono-id">${escapeHtml(finding.id)}</span><strong>${escapeHtml(finding.title)}</strong><small>${chip(finding.severity)} ${chip(finding.priority)} <span>${escapeHtml(finding.domain)}</span></small></button>`).join("")}</div></section><section class="detail-pane">${selected ? renderFindingDetail(selected) : renderEmpty("No findings", "Import an explorer or create a finding from validated evidence.")}</section></div>`;
}

function renderFindingDetail(finding) {
  const links = state.links.filter((link) => link.findingId === finding.id && link.status !== "Removed");
  const fix = state.fixes[finding.id];
  const evidenceIndex = state.scanFindings.filter((item) => item.issues?.includes(finding.id)).length + state.skippedRecords.filter((item) => item.issues?.includes(finding.id)).length;
  return `<div class="detail-header finding-title"><div><div class="title-chips">${chip(finding.severity)}${chip(finding.priority)}${chip(finding.confidence)}</div><h2>${escapeHtml(finding.title)}</h2><p>${escapeHtml(finding.domain)} · ${escapeHtml(finding.environment || "Environment not set")}</p></div><span class="finding-id">${escapeHtml(finding.id)}</span></div>
    <div class="fact-grid"><div><span>Likelihood</span><strong>${escapeHtml(finding.likelihood)}</strong></div><div><span>Effort</span><strong>${escapeHtml(finding.effort)}</strong></div><div><span>Owner</span><strong>${escapeHtml(finding.owner || "Unassigned")}</strong></div><div><span>Evidence items</span><strong>${links.length + evidenceIndex}</strong></div></div>
    ${narrative("Root cause", finding.rootCause)}${narrative("Confirmed evidence", finding.evidence)}${narrative("Impact if not addressed", finding.impact)}
    <section class="detail-section"><span class="eyebrow">Affected components</span><h3>${links.length} linked configuration record${links.length === 1 ? "" : "s"}</h3><div class="component-link-list">${links.map((link) => { const component = state.components.find((item) => item.sysId === link.componentSysId); return `<button data-action="select-component" data-id="${escapeHtml(link.componentSysId)}"><span>${escapeHtml(component?.type || "Component")}</span><strong>${escapeHtml(component?.name || link.componentSysId)}</strong><small>${escapeHtml(link.how)}</small></button>`; }).join("") || '<div class="empty-inline">No component link is held. If the finding is measure-based, state that explicitly in its evidence.</div>'}</div></section>
    <section class="detail-section fix-preview"><div class="section-row"><div><span class="eyebrow">Remediation</span><h3>${fix ? "Complete fix block attached" : "Remediation block required"}</h3></div><button class="button secondary compact" data-action="navigate" data-view="solutions">Open solution workspace</button></div><p>${escapeHtml(fix?.approach || finding.remediation || "No remediation approach has been recorded.")}</p></section>`;
}

function narrative(title, text) {
  return `<section class="narrative"><span>${escapeHtml(title)}</span><p>${escapeHtml(text || "Not established.")}</p></section>`;
}

function renderEvidence() {
  const modes = [
    ["scan", "Instance Scan", state.scanFindings.length],
    ["skips", "Upgrade skips", state.skippedRecords.length],
    ["incidents", "Incidents", state.incidents.length],
  ];
  const records = ui.evidenceMode === "scan" ? state.scanFindings : ui.evidenceMode === "skips" ? state.skippedRecords : state.incidents;
  const query = ui.query.toLowerCase();
  const filtered = records.filter((record) => JSON.stringify(record).toLowerCase().includes(query));
  if (!records.length) return `${viewHeading("Independent proof", "Evidence browser", "Platform scan, upgrade, and incident facts stay distinct from consultant-authored findings.")}
    <div class="mode-tabs">${modes.map(([id, label, count]) => `<button class="${ui.evidenceMode === id ? "is-active" : ""}" data-action="evidence-mode" data-mode="${id}"><strong>${formatNumber(count)}</strong><span>${label}</span></button>`).join("")}</div>
    ${renderGuidance("evidence", { guideId: ui.evidenceMode, title: `How to collect ${modes.find(([id]) => id === ui.evidenceMode)?.[1] || "this evidence"}` })}${renderOutputPipeline()}`;
  return `
    ${viewHeading("Independent proof", "Evidence browser", "Platform scan, upgrade, and incident facts stay distinct from consultant-authored findings.")}
    <div class="mode-tabs">${modes.map(([id, label, count]) => `<button class="${ui.evidenceMode === id ? "is-active" : ""}" data-action="evidence-mode" data-mode="${id}"><strong>${formatNumber(count)}</strong><span>${label}</span></button>`).join("")}</div>
    <section class="panel"><div class="list-tools"><label class="search-box">${icon("search")}<input data-filter="global" placeholder="Search the selected evidence layer" value="${escapeHtml(ui.query)}"></label><span>${formatNumber(filtered.length)} records</span></div><div class="evidence-list">${filtered.slice(0, 500).map((record, index) => renderEvidenceRecord(record, index)).join("") || renderEmpty("No evidence in this layer", "Import the relevant platform export or declare the gap.")}${filtered.length > 500 ? '<div class="list-limit">Showing the first 500 filtered records.</div>' : ""}</div></section>`;
}

function renderEvidenceRecord(record, index) {
  const mode = ui.evidenceMode;
  const id = record.fid || record.kid || record.number || `${mode}-${index + 1}`;
  const title = record.name || record.short_description || record.description || record.check || "Evidence item";
  const category = record.check || record.cluster || record.state || record.ctype || mode;
  const detail = record.details || record.cause || record.action || record.activity || record.description || "";
  const issues = record.issues || [];
  return `<details class="evidence-row"><summary><span class="mono-id">${escapeHtml(id)}</span><strong>${escapeHtml(title)}</strong>${chip(record.sev || record.severity || category)}<small>${escapeHtml(record.table || record.group || "")}</small></summary><div><p>${escapeHtml(detail)}</p><dl>${Object.entries(record).filter(([key, value]) => !["details", "cause", "action", "activity", "description"].includes(key) && typeof value !== "object" && String(value)).slice(0, 10).map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl><div class="link-chips">${issues.map((issue) => `<button data-action="select-finding" data-id="${escapeHtml(issue)}">${escapeHtml(issue)}</button>`).join("")}</div></div></details>`;
}

function renderSolutions() {
  const findings = sortedFindings(state.findings);
  const withFix = findings.filter((finding) => state.fixes[finding.id]);
  const selected = findings.find((finding) => finding.id === ui.selectedFinding) || findings[0];
  if (selected && !ui.selectedFinding) ui.selectedFinding = selected.id;
  const fix = selected ? state.fixes[selected.id] : null;
  if (!findings.length || !withFix.length) return `${viewHeading("Stage 16", "Solution workspace", "A finding is done only when approach, steps, manual actions, verification, rollback, ownership, and status are explicit.")}${renderGuidance("solutions", { title: findings.length ? "How to complete the remediation layer" : "Inputs required before solutions can be generated" })}${renderOutputPipeline()}`;
  return `
    ${viewHeading("Stage 16", "Solution workspace", "A finding is done only when approach, steps, manual actions, verification, rollback, ownership, and status are explicit.")}
    <div class="solution-summary"><div><strong>${withFix.length}</strong><span>complete blocks</span></div><div><strong>${findings.length - withFix.length}</strong><span>still required</span></div><div><strong>${Object.keys(state.fixScripts).length}</strong><span>embedded scripts</span></div><div><strong>${Object.values(state.fixes).filter((item) => item.destructive).length}</strong><span>approval-gated</span></div></div>
    <div class="split-layout solution-layout"><section class="list-pane"><div class="record-list">${findings.map((finding) => `<button class="record-row ${selected?.id === finding.id ? "is-selected" : ""}" data-action="select-finding" data-id="${finding.id}"><span class="mono-id">${finding.id}</span><strong>${escapeHtml(finding.title)}</strong><small>${state.fixes[finding.id] ? chip("Fix attached") : chip("Fix required")}</small></button>`).join("")}</div></section><section class="detail-pane">${selected ? renderFixDetail(selected, fix) : renderEmpty("No findings", "A solution starts from an evidence-linked finding.")}</section></div>`;
}

function renderFixDetail(finding, fix) {
  if (!fix) return `<div class="detail-header"><div><span class="mono-id">${finding.id}</span><h2>${escapeHtml(finding.title)}</h2><p>No structured fix block is held.</p></div>${chip("Blocked")}</div><div class="empty-large"><strong>Only write code you can see.</strong><p>Attach validated source or record a read-only audit and manual remediation path. The Workbench will not invent a write script.</p></div>`;
  const steps = fix.steps || [];
  const scripts = fix.scripts || [];
  const manual = fix.manual || [];
  return `<div class="detail-header"><div><span class="mono-id">${finding.id}</span><h2>${escapeHtml(finding.title)}</h2><p>${escapeHtml(fix.approach || "Remediation approach")}</p></div>${chip(fix.status || "Drafted")}</div>
    <section class="fix-grid"><article><span>Approach</span><p>${escapeHtml(fix.approach || "Not supplied")}</p></article><article><span>Owner</span><p>${escapeHtml(fix.owner || finding.owner || "Unassigned")}</p></article></section>
    <section class="detail-section"><span class="eyebrow">Numbered implementation</span><h3>${steps.length} step${steps.length === 1 ? "" : "s"}</h3><ol class="step-list">${steps.map((step) => `<li>${escapeHtml(typeof step === "string" ? step : step.text || JSON.stringify(step))}</li>`).join("") || "<li>No steps recorded.</li>"}</ol></section>
    <section class="detail-section"><span class="eyebrow">Automation boundary</span><h3>${scripts.length} script reference${scripts.length === 1 ? "" : "s"} · ${manual.length} manual action${manual.length === 1 ? "" : "s"}</h3><div class="script-ref-list">${scripts.map((script) => `<button data-action="select-script" data-id="${escapeHtml(typeof script === "string" ? script : script.id || "")}">${icon("code")}<span>${escapeHtml(typeof script === "string" ? script : script.id || JSON.stringify(script))}</span></button>`).join("")}</div>${manual.length ? `<ul>${manual.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : item.text || JSON.stringify(item))}</li>`).join("")}</ul>` : ""}</section>
    <div class="verify-grid"><article><span>Verification</span><p>${escapeHtml(fix.verify || "Not supplied")}</p></article><article><span>Rollback</span><p>${escapeHtml(fix.rollback || "Not supplied")}</p></article></div>`;
}

function renderRoadmap() {
  const groups = ["P1", "P2", "P3", "P4"].map((priority) => ({ priority, findings: sortedFindings(state.findings).filter((finding) => finding.priority === priority) }));
  const stats = deriveStats(state);
  if (!state.findings.length) return `${viewHeading("Stage 17", "Prioritised remediation roadmap", "The roadmap is generated from imported findings, remediation, ownership, dependencies, and target dates.")}${renderGuidance("roadmap", { title: "How to generate the roadmap" })}${renderOutputPipeline()}`;
  return `
    ${viewHeading("Stage 17", "Prioritised remediation roadmap", "Dependency-aware sequencing, named ownership, verification, and rollback—not severity alone.")}
    <div class="roadmap-banner"><div><span>Ownership gap</span><strong>${stats.unassigned} items</strong><p>Assigning owners is the highest-leverage change to turn the assessment into delivery.</p></div><button class="button light" data-action="export-state">Export plan data</button></div>
    <div class="roadmap-grid">${groups.map(({ priority, findings }) => `<section class="roadmap-column ${priority.toLowerCase()}"><header><div><span>${priority}</span><strong>${findings.length}</strong></div><small>${priority === "P1" ? "Act before next known event" : priority === "P2" ? "Plan this quarter" : priority === "P3" ? "Scheduled improvement" : "Opportunistic"}</small></header><div>${findings.map((finding) => `<article data-action="select-finding" data-id="${finding.id}"><span class="mono-id">${finding.id}</span><h3>${escapeHtml(finding.title)}</h3><footer>${chip(finding.severity)}<span>${escapeHtml(finding.owner || "Unassigned")}</span></footer></article>`).join("") || '<div class="empty-column">No items</div>'}</div></section>`).join("")}</div>`;
}

function renderReports() {
  const blockers = blockersForPublish(state);
  const stats = deriveStats(state);
  if (!state.findings.length) return `${viewHeading("Stage 18", "Report, verify, and export", "Delivery outputs are generated from the same validated assessment store.")}${renderGuidance("reports", { title: "Inputs required for generated outputs" })}${renderOutputPipeline()}${renderExplorerGenerator()}`;
  return `
    ${viewHeading("Stage 18", "Report, verify, and export", "The decision layer and technical register are generated from the same assessment store.", '<button class="button secondary" data-action="export-state">Export JSON backup</button><button class="button secondary" data-action="export-report">Generate HTML report</button><button class="button secondary" data-action="export-summary">Generate summary document</button><button class="button secondary" data-action="export-proposal">Generate proposal</button><button class="button secondary" data-action="export-playbook">Solution playbook</button><button class="button primary" data-action="export-delivery">Generate delivery package</button>')}
    ${renderOutputPipeline()}
    <div class="report-layout"><section class="report-preview"><div class="report-paper"><span class="report-kicker">ServiceNow application diagnostic</span><h2>${escapeHtml(state.assessment.name)}</h2><p class="report-meta">${escapeHtml(state.assessment.client)} · ${escapeHtml(state.assessment.confidentiality)}</p><p>${escapeHtml(state.assessment.purpose || "Business context not yet supplied.")}</p><div class="report-numbers"><div><strong>${state.findings.length}</strong><span>Findings</span></div><div><strong>${state.components.length}</strong><span>Components</span></div><div><strong>${stats.priority.P1 || 0}</strong><span>P1 actions</span></div></div><h3>Priority findings</h3>${sortedFindings(state.findings).slice(0, 6).map((finding) => `<article><span>${finding.id}</span><strong>${escapeHtml(finding.title)}</strong><small>${finding.severity} · ${finding.priority}</small></article>`).join("") || "<p>No findings loaded.</p>"}</div></section>
      <aside class="report-gate"><span class="eyebrow">Publication gate</span><h2>${blockers.length ? "Not ready to issue" : "Ready to issue"}</h2><p>${blockers.length ? "Resolve or explicitly disposition every blocker before human sign-off." : "All evidence, module and named approval gates are complete."}</p><ul>${blockers.map((blocker) => `<li>${escapeHtml(blocker)}</li>`).join("") || '<li class="pass">Evidence chain complete</li><li class="pass">Fix blocks present</li><li class="pass">Declared gaps present</li><li class="pass">No failed dataset active</li>'}</ul><div class="callout"><strong>Generated outputs</strong><span>HTML report, Issue &amp; Artefact Explorer, findings CSV, collection checklist, and lossless JSON assessment backup.</span></div></aside></div>
    ${renderExplorerGenerator()}`;
}

function renderAuthoring() {
  const finding = ui.selectedFinding === "__new__" ? {} : state.findings.find((item) => item.id === ui.selectedFinding) || state.findings[0] || {};
  const fix = state.fixes[finding.id] || {};
  const gapOptions = Array.isArray(state.reference?.gaps) ? state.reference.gaps : [];
  return `${viewHeading("Controlled decisions", "Authoring and approvals", "Create and maintain the records that complete the diagnostic chain. Every save is added to assessment history.", `<label class="field compact-field"><span>Active finding</span><select data-authoring-finding><option value="__new__" ${ui.selectedFinding === "__new__" ? "selected" : ""}>Create new</option>${state.findings.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === finding.id ? "selected" : ""}>${escapeHtml(item.id)} · ${escapeHtml(item.title)}</option>`).join("")}</select></label>`)}
    <div class="authoring-grid">
      <form id="finding-form" class="panel"><span class="eyebrow">Finding editor</span><h2>${finding.id ? `Edit ${escapeHtml(finding.id)}` : "Create finding"}</h2><div class="field-grid">${field("id", "Finding ID", finding.id || "", true)}${field("title", "Title", finding.title || "", true)}${field("domain", "Domain / module", finding.domain || "", true)}${selectField("severity", "Severity", finding.severity || "Medium", ["Critical", "High", "Medium", "Low"])}${selectField("priority", "Priority", finding.priority || "P3", ["P1", "P2", "P3", "P4"])}${field("owner", "Owner", finding.owner || "")}${textArea("evidence", "Evidence", finding.evidence || "", true)}${textArea("rootCause", "Root cause", finding.rootCause || "")}${textArea("impact", "Impact", finding.impact || "")}</div><button class="button primary" type="submit">Save finding</button></form>
      <form id="fix-form" class="panel"><span class="eyebrow">Fix editor</span><h2>Solution for ${escapeHtml(finding.id || "a finding")}</h2><input type="hidden" name="findingId" value="${escapeHtml(finding.id || "")}">${textArea("approach", "Approach", fix.approach || "", true)}${textArea("steps", "Implementation steps", Array.isArray(fix.steps) ? fix.steps.join("\n") : fix.steps || "")}${textArea("verify", "Verification", fix.verify || "", true)}${textArea("rollback", "Rollback", fix.rollback || "", true)}${field("owner", "Implementation owner", fix.owner || "")}${selectField("status", "Status", fix.status || "Draft", ["Draft", "Proposed", "Approved", "Implemented", "Verified"])}<button class="button primary" type="submit" ${finding.id ? "" : "disabled"}>Save solution</button></form>
      <form id="link-form" class="panel"><span class="eyebrow">Evidence link editor</span><h2>Map finding to artefact</h2>${field("findingId", "Finding ID", finding.id || "", true)}${field("componentSysId", "Component sys_id", "", true)}${field("how", "Link reason", "manual verified reference", true)}<button class="button primary" type="submit">Add accepted link</button></form>
      <form id="incident-form" class="panel"><span class="eyebrow">Incident disposition</span><h2>Classify operational evidence</h2><label class="field"><span>Incident</span><select name="incidentIndex">${state.incidents.map((item, index) => `<option value="${index}">${escapeHtml(item.number || item.sys_id || `Incident ${index + 1}`)}</option>`).join("")}</select></label>${field("disposition", "Disposition", "Correlated to finding / Out of scope / Gap", true)}${field("findingIds", "Finding IDs", finding.id || "", false, "text", "Comma separated")}<button class="button primary" type="submit" ${state.incidents.length ? "" : "disabled"}>Save disposition</button></form>
      <form id="gap-form" class="panel"><span class="eyebrow">Gap and decision editor</span><h2>Declare a limitation</h2>${field("title", "Gap / question", "", true)}${textArea("detail", "Reason and delivery impact", "", true)}${field("owner", "Owner", "")}${field("targetDate", "Target date", "", false, "date")}<button class="button primary" type="submit">Add declared gap</button><div class="link-chips">${gapOptions.map((gap) => `<span>${escapeHtml(typeof gap === "string" ? gap : gap.title || gap.gap || gap.detail)}</span>`).join("")}</div></form>
      <form id="approval-form" class="panel"><span class="eyebrow">Approval editor</span><h2>Record sign-off</h2>${selectField("type", "Approval type", "publication", ["publication", "write script", "scope", "gap acceptance"])}${field("approver", "Named approver", "", true)}${selectField("status", "Decision", "Approved", ["Approved", "Rejected", "Pending"])}${textArea("note", "Approval note / change reference", "", true)}<button class="button primary" type="submit">Record approval</button><div class="link-chips">${(state.approvals || []).slice(0, 5).map((item) => `<span>${escapeHtml(item.type)} · ${escapeHtml(item.approver)} · ${escapeHtml(item.status)}</span>`).join("")}</div></form>
    </div>`;
}

function renderRescans() {
  const runs = state.auditRuns || [], comparisons = state.rescanComparisons || [];
  return `${viewHeading("Evidence over time", "Baseline and rescan", "Import standard script results repeatedly. The Workbench compares stable record keys and separates new, resolved, changed and unchanged evidence.", '<button class="button primary" data-action="import-picker">Import result JSON</button>')}
    <section class="metric-grid compact-metrics">${metric("Runs", runs.length, `${new Set(runs.map((x) => x.scriptId)).size} scripts`, "teal")}${metric("Comparisons", comparisons.length, "baseline to rescan", "blue")}${metric("New", comparisons.reduce((n, x) => n + (x.counts?.new || 0), 0), "across comparisons", "amber")}${metric("Resolved", comparisons.reduce((n, x) => n + (x.counts?.resolved || 0), 0), "across comparisons", "green")}</section>
    <div class="dashboard-grid"><section class="panel"><div class="panel-heading"><div><span class="eyebrow">Imported runs</span><h2>Script result history</h2></div></div>${runs.length ? `<div class="timeline">${runs.map((run) => `<article><span class="timeline-dot">${escapeHtml(run.scriptId)}</span><div><time>${shortDate(run.importedAt)}</time><h3>${escapeHtml(run.sourceName)}</h3><p>${run.records.length} record(s) · ${run.errors.length} error(s) · ${escapeHtml(run.mode)}</p></div></article>`).join("")}</div>` : renderEmpty("No standard results imported", "Run EXT-000 or another v2 script and import its JSON attachment.")}</section>
      <section class="panel"><div class="panel-heading"><div><span class="eyebrow">Change analysis</span><h2>Baseline comparisons</h2></div></div>${comparisons.length ? comparisons.map((item) => `<article class="comparison-card"><strong>${escapeHtml(item.scriptId)}</strong><div class="report-numbers"><div><strong>${item.counts.new}</strong><span>New</span></div><div><strong>${item.counts.changed}</strong><span>Changed</span></div><div><strong>${item.counts.resolved}</strong><span>Resolved</span></div><div><strong>${item.counts.unchanged}</strong><span>Unchanged</span></div></div><small>${shortDate(item.createdAt)}</small></article>`).join("") : renderEmpty("No baseline pair yet", "Import a second result from the same script to create the first comparison.")}</section></div>`;
}

function renderHistory() {
  return `
    ${viewHeading("Immutable activity", "Assessment history", "Submissions, validation decisions, supersession, curation, and exports are recorded with time and reason.")}
    <section class="panel"><div class="timeline">${state.audit.map((event, index) => `<article><span class="timeline-dot">${state.audit.length - index}</span><div><time>${shortDate(event.at)}</time><h3>${escapeHtml(event.action)}</h3><p>${escapeHtml(event.detail)}</p></div></article>`).join("") || renderEmpty("No history", "Activity will appear here as the assessment changes.")}</div></section>`;
}

function renderAdministration() {
  const size = new Blob([JSON.stringify(state)]).size;
  return `
    ${viewHeading("Local workspace", "Administration", "Control retention, backups, and the local assessment store. No telemetry or external service is used.")}
    <div class="admin-grid"><section class="panel"><span class="eyebrow">Storage</span><h2>IndexedDB assessment store</h2><div class="fact-grid vertical"><div><span>Approximate size</span><strong>${(size / 1024 / 1024).toFixed(2)} MB</strong></div><div><span>Last updated</span><strong>${shortDate(state.updatedAt)}</strong></div><div><span>Retention policy</span><strong>${state.assessment.retentionDays} days</strong></div></div><div class="detail-actions"><button class="button secondary" data-action="export-state">Download backup</button><button class="button danger" data-action="reset-state">Delete local assessment</button></div></section>
      <section class="panel"><span class="eyebrow">Security posture</span><h2>Hard boundaries</h2><ul class="check-list"><li>No ServiceNow credentials stored</li><li>No scripts executed by this application</li><li>Secret-shaped values block dataset acceptance</li><li>Consumer/task rows are rejected</li><li>Machine inference remains proposed until reviewed</li><li>Issued outputs require human approval</li></ul></section>
      <section class="panel span-2"><span class="eyebrow">Product configuration</span><h2>Implementation status</h2><div class="status-grid"><div>${chip("Implemented")}<p>Instance discovery, versioned module registry, generated customer profile, standard script results, native authoring, approvals, publication gates, rescans and ZIP delivery.</p></div><div>${chip("Local first")}<p>Data remains in this browser until a user deliberately downloads a package or clears the assessment. Retention is enforced when the workspace opens.</p></div><div>${chip("Execution boundary")}<p>The Workbench prepares and validates scripts but never connects to an instance, stores credentials or executes ServiceNow code.</p></div></div></section></div>`;
}

function renderEmpty(title, message) {
  return `<div class="empty-state"><span>${icon("box")}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div>`;
}

function splitList(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

async function saveAndRender(message = "Saved") {
  try {
    await persistState(state);
  } catch (error) {
    console.warn("Local persistence failed", error);
    message = "Updated in memory; browser storage was unavailable";
  }
  showToast(message);
  renderShell();
}

function showToast(message) {
  ui.toast = message;
  window.setTimeout(() => {
    ui.toast = "";
    document.querySelector(".toast")?.remove();
  }, 2600);
}

async function handleFiles(files) {
  if (!files.length) return;
  ui.busy = true;
  renderShell();
  try {
    for (const file of files) {
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".xlsx")) {
        const results = [{ id: crypto.randomUUID(), rule: "File format", outcome: "Fail", detail: "This local MVP does not parse XLSX directly. Export the sheet as CSV or import the generated explorer HTML.", at: nowIso() }];
        state = mergeSubmittedDataset(state, { kind: classifyDataset(file.name), name: file.name, rows: 0, parsed: null, validationResults: results, hash: "", environment: "Unspecified" });
        continue;
      }
      const text = await file.text();
      if (lower.endsWith(".html")) {
        const payload = extractExplorerPayload(text);
        state = stateFromExplorerPayload(payload, file.name);
        continue;
      }
      if (text.includes("DIAG_ENVELOPE_BEGIN")) {
        state = mergeSubmittedDataset(state, buildEnvelopeSubmission(text, file.name, state));
        continue;
      }
      let parsed;
      if (lower.endsWith(".json")) parsed = JSON.parse(text);
      else if (lower.endsWith(".csv")) parsed = parseCsv(text);
      else if (lower.endsWith(".txt") || lower.endsWith(".log")) throw new Error(`${file.name}: no DIAG envelope found in the text output.`);
      else throw new Error(`${file.name}: unsupported file type.`);
      if (parsed?.assessment && parsed?.schemaVersion) {
        state = ensureStateVersion(parsed);
        state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Assessment backup restored", detail: file.name });
        continue;
      }
      const kind = classifyDataset(file.name, parsed);
      const records = Array.isArray(parsed) ? parsed : parsed?.artefacts || parsed?.records || parsed?.issues || parsed?.findings || parsed?.scan?.findings || parsed?.skips?.records || [];
      const rowCount = records.length || (["fixes", "reference"].includes(kind) ? Object.keys(parsed?.[kind] || parsed || {}).length : 0);
      const validationResults = validateDataset({ kind, text, parsed });
      state = mergeSubmittedDataset(state, {
        kind,
        name: file.name,
        rows: rowCount,
        parsed,
        validationResults,
        hash: await hashText(text),
        environment: state.assessment.environments[0]?.name || "Unspecified",
      });
    }
    state.activeView = "validation";
    ui.busy = false;
    await saveAndRender(`${files.length} file${files.length === 1 ? "" : "s"} processed`);
  } catch (error) {
    ui.busy = false;
    showToast(error.message);
    renderShell();
  } finally {
    fileInput.value = "";
  }
}

function navigate(view) {
  state.activeView = view;
  ui.mobileNav = false;
  if (view === "findings" || view === "inventory" || view === "scripts" || view === "evidence") ui.query = "";
  renderShell();
  document.querySelector("#main-view")?.focus();
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadFindingsCsv() {
  const columns = ["ID", "Title", "Domain", "Severity", "Likelihood", "Priority", "Confidence", "Root cause", "Evidence", "Impact", "Remediation", "Owner", "Status", "Target date"];
  const rows = sortedFindings(state.findings).map((finding) => [
    finding.id, finding.title, finding.domain, finding.severity, finding.likelihood,
    finding.priority, finding.confidence, finding.rootCause, finding.evidence,
    finding.impact, finding.remediation, finding.owner, finding.status, finding.targetDate,
  ]);
  download(`${safeFileName(state.assessment.name)}-findings.csv`, [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n"), "text/csv;charset=utf-8");
}

function downloadCollectionChecklist() {
  const columns = ["Order", "Status", "Collection item", "Stages", "Why needed", "Required data points", "Accepted import", "Relevant scripts", "Automatically populates"];
  const rows = COLLECTION_GUIDES.map((guide) => [
    guide.order,
    guideHasData(guide.id) ? "Available" : "Needed",
    guide.title,
    guide.stages.join("; "),
    guide.why,
    guide.dataPoints.join("; "),
    guide.formats.join("; "),
    guide.scripts.join("; "),
    guide.unlocks.join("; "),
  ]);
  download(`${safeFileName(state.assessment.name)}-collection-checklist.csv`, [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n"), "text/csv;charset=utf-8");
}

function moduleCoverageCsv() {
  const columns = ["Module ID", "Module", "Group", "Detected", "Status", "Evidence signals", "Scripts", "Owner", "Note"];
  const rows = (state.moduleCoverage || []).map((item) => [item.id, item.name, item.group, item.detected, item.status, (item.reasons || []).join("; "), (item.scripts || []).join("; "), item.owner, item.note]);
  return [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

function findingsCsvText() {
  const columns = ["ID", "Title", "Domain", "Severity", "Priority", "Confidence", "Root cause", "Evidence", "Impact", "Remediation", "Owner", "Status", "Target date"];
  const rows = sortedFindings(state.findings).map((finding) => [finding.id, finding.title, finding.domain, finding.severity, finding.priority, finding.confidence, finding.rootCause, finding.evidence, finding.impact, finding.remediation, finding.owner, finding.status, finding.targetDate]);
  return [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

async function scriptSources() {
  if (typeof getWorkbenchScriptSources === "function") return getWorkbenchScriptSources();
  return Object.fromEntries(await Promise.all(SCRIPT_CATALOG.map(async (script) => {
    const response = await fetch(script.sourceUrl);
    if (!response.ok) throw new Error(`${script.id} returned ${response.status}`);
    return [script.id, await response.text()];
  })));
}

async function downloadDeliveryPackage() {
  const blockers = blockersForPublish(state);
  if (blockers.length) throw new Error(`Delivery package is blocked: ${blockers[0]}`);
  const profile = state.customerProfile || customerProfileFromState(state);
  const sources = await scriptSources();
  const files = {
    "README.txt": `ServiceNow Diagnostic Workbench delivery package\nAssessment: ${state.assessment.name}\nCustomer: ${state.assessment.client}\nGenerated: ${nowIso()}\nRegistry: ${MODULE_REGISTRY_VERSION}\n`,
    "assessment.json": JSON.stringify(state, null, 2),
    "customer-profile.json": JSON.stringify(profile, null, 2),
    "instance-manifest.json": JSON.stringify(state.instanceManifest, null, 2),
    "module-coverage.csv": moduleCoverageCsv(),
    "findings.csv": findingsCsvText(),
    "diagnostic-report.html": renderAssessmentReport(state),
    "issue-artefact-explorer.html": renderEvidenceExplorer(state),
    "validation-results.json": JSON.stringify(state.validationResults, null, 2),
    "rescan-comparisons.json": JSON.stringify(state.rescanComparisons || [], null, 2),
    "approvals.json": JSON.stringify(state.approvals || [], null, 2),
  };
  SCRIPT_CATALOG.forEach((script) => { files[`scripts/${script.file.split("/").pop()}`] = applyCustomerProfileToScript(sources[script.id], profile); });
  const manifest = [];
  for (const [name, content] of Object.entries(files)) manifest.push({ name, sha256: await hashText(content), bytes: new Blob([content]).size });
  files["package-manifest.json"] = JSON.stringify({ schema: "servicenow-diagnostic-delivery/1", generatedAt: nowIso(), assessmentId: state.assessment.id, files: manifest }, null, 2);
  download(`${safeFileName(state.assessment.name)}-delivery.zip`, createDeliveryZip(files), "application/zip");
}

async function loadScriptSource(button) {
  const view = document.querySelector("#script-source code");
  if (!view) return;
  try {
    const selected = SCRIPT_CATALOG.find((item) => item.id === button.dataset.id) || SCRIPT_CATALOG.find((item) => item.sourceUrl === button.dataset.url);
    const sources = await getWorkbenchScriptSources();
    view.textContent = selected ? applyCustomerProfileToScript(sources[selected.id], state.customerProfile || customerProfileFromState(state)) : "Source is not bundled for this script.";
  } catch (error) {
    view.textContent = "Unable to load the customer template: " + error.message;
  }
}
async function copyScriptSource(button) {
  const view = document.querySelector("#script-source code");
  const status = document.querySelector("#script-copy-status");
  const source = view ? view.textContent.trim() : "";
  const sourceIsReady = source
    && !source.startsWith("Select “View customer template”")
    && !source.startsWith("Unable to load");

  if (!sourceIsReady) {
    if (status) status.textContent = "Load the customer template first.";
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(source);
    } else {
      const copyArea = document.createElement("textarea");
      copyArea.value = source;
      copyArea.setAttribute("readonly", "");
      copyArea.style.position = "fixed";
      copyArea.style.opacity = "0";
      document.body.appendChild(copyArea);
      copyArea.select();
      const copied = document.execCommand("copy");
      copyArea.remove();
      if (!copied) throw new Error("Copy command was unavailable.");
    }

    const originalLabel = button.textContent;
    button.textContent = "Copied";
    button.disabled = true;
    if (status) status.textContent = "Script copied. Open Script - Background to paste and review it.";
    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.disabled = false;
    }, 2400);
  } catch (error) {
    if (status) status.textContent = "Copy failed. Select the script text and copy it manually.";
  }
}

function automationToken() {
  const embeddedToken = document.getElementById("app")?.dataset.userToken || "";
  try { return window.g_ck || window.top?.g_ck || embeddedToken; } catch (error) { return window.g_ck || embeddedToken; }
}

function automationErrorMessage(body, status) {
  const error = body?.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") return error.detail || error.message || JSON.stringify(error);
  return `The server returned HTTP ${status}.`;
}

async function automationRequest(path, options = {}) {
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const token = automationToken();
  if (token) headers["X-UserToken"] = token;
  const response = await fetch(`${AUTOMATION_API}${path}`, { credentials: "same-origin", ...options, headers });
  let body = {};
  try { body = await response.json(); } catch (error) { body = { error: `The server returned HTTP ${response.status}.` }; }
  if (body && body.result && body.ok === undefined && body.result.ok !== undefined) body = body.result;
  if (!response.ok || body.ok === false) throw new Error(automationErrorMessage(body, response.status));
  return body;
}

function automationProfile() {
  const profile = state.customerProfile || customerProfileFromState(state);
  return {
    customerName: profile.customerName || state.assessment.client || "",
    applicationName: profile.applicationName || state.assessment.application?.name || "",
    approvedInstance: profile.approvedInstance || "",
    changeReference: profile.changeReference || "",
    scopes: profile.scopes || state.assessment.application?.scopes || [],
    tablePrefixes: profile.tablePrefixes || state.assessment.application?.prefixes || [],
    includeInactive: false,
    maxRowsPerTable: 5000,
  };
}

async function ingestAutomatedPayload(payload, name) {
  const text = JSON.stringify(payload);
  if (payload?.schema_version && payload?.collector && payload?.metrics) {
    const envelopeText = `DIAG_ENVELOPE_BEGIN\n${text}\nDIAG_ENVELOPE_END`;
    state = mergeSubmittedDataset(state, buildEnvelopeSubmission(envelopeText, name, state));
    return;
  }
  const kind = classifyDataset(name, payload);
  const records = Array.isArray(payload) ? payload : payload?.artefacts || payload?.records || payload?.issues || payload?.findings || payload?.scan?.findings || payload?.skips?.records || [];
  const rowCount = records.length || (payload?.manifest ? Object.values(payload.manifest).filter(Array.isArray).reduce((count, rows) => count + rows.length, 0) : 0);
  state = mergeSubmittedDataset(state, {
    kind,
    name,
    rows: rowCount,
    parsed: payload,
    validationResults: validateDataset({ kind, text, parsed: payload }),
    hash: await hashText(text),
    environment: state.assessment.environments[0]?.name || payload?.instance || "Unspecified",
  });
}

async function runAutomatedScripts(scripts, label) {
  if (ui.automation.running || !scripts.length) return;
  ui.automation = { running: true, current: "", completed: 0, total: scripts.length, message: `Starting ${label}`, results: [] };
  renderShell();
  let succeeded = 0;
  for (const script of scripts) {
    ui.automation.current = script.id;
    ui.automation.message = `${script.id} · ${script.title}`;
    renderShell();
    try {
      const response = await automationRequest(`/run/${encodeURIComponent(script.id)}`, {
        method: "POST",
        body: JSON.stringify({ profile: automationProfile(), persist: true }),
      });
      await ingestAutomatedPayload(response.result.payload, `${script.id}_automated.json`);
      succeeded += 1;
      ui.automation.results.push({ id: script.id, ok: true, message: `${response.result.payload?.mode || (response.result.payload?.read_only ? "READ_ONLY" : "collected")} · output attached` });
    } catch (error) {
      ui.automation.results.push({ id: script.id, ok: false, message: error.message });
      if (/admin role|HTTP 40[13]/i.test(error.message)) break;
    }
    ui.automation.completed += 1;
  }
  const failed = ui.automation.results.filter((item) => !item.ok).length;
  ui.automation.running = false;
  ui.automation.current = "";
  ui.automation.message = `${label}: ${succeeded} completed${failed ? ` · ${failed} failed` : ""}`;
  state.audit.unshift({ id: uuid(), at: nowIso(), action: "Automated evidence run completed", detail: ui.automation.message });
  await saveAndRender(ui.automation.message);
}

async function uploadOutputFiles(files) {
  if (!files.length) return;
  ui.busy = true;
  renderShell();
  try {
    for (const file of files) {
      const text = await file.text();
      const response = await automationRequest("/upload", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name, content: text }),
      });
      state.audit.unshift({ id: uuid(), at: nowIso(), action: "Diagnostic output uploaded", detail: `${response.attachment.fileName} · ${response.attachment.sysId}` });
    }
    ui.busy = false;
    await handleFiles(files);
  } catch (error) {
    ui.busy = false;
    showToast(error.message);
    renderShell();
    fileInput.value = "";
  }
}

app.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "navigate") return navigate(target.dataset.view);
  if (action === "toggle-nav") { ui.mobileNav = !ui.mobileNav; return renderShell(); }
  if (action === "import-picker") return fileInput.click();
  if (action === "upload-output-picker") { ui.uploadToInstance = true; return fileInput.click(); }
  if (action === "run-auto-all") return runAutomatedScripts(SCRIPT_CATALOG, "All safe scripts");
  if (action === "run-auto-phase") {
    const phase = PHASES.find((item) => item.id === target.dataset.phase);
    return runAutomatedScripts(phase ? SCRIPT_CATALOG.filter((script) => phase.stages.includes(script.stage)) : [], phase ? `${phase.label} phase` : "Phase");
  }
  if (action === "run-automated-script") {
    const script = SCRIPT_CATALOG.find((item) => item.id === target.dataset.id);
    return runAutomatedScripts(script ? [script] : [], script ? script.id : "Script");
  }
  if (action === "select-component") { ui.selectedComponent = target.dataset.id; state.activeView = "inventory"; return renderShell(); }
  if (action === "select-finding") { ui.selectedFinding = target.dataset.id; state.activeView = "findings"; return renderShell(); }
  if (action === "select-script") { ui.selectedScript = target.dataset.id; state.activeView = "scripts"; return renderShell(); }
  if (action === "evidence-mode") { ui.evidenceMode = target.dataset.mode; ui.query = ""; return renderShell(); }
  if (action === "load-script-source") return loadScriptSource(target);
  if (action === "copy-script-source") return copyScriptSource(target);
  if (action === "export-profile") {
    state.customerProfile = customerProfileFromState(state);
    download(`${safeFileName(state.assessment.client || state.assessment.name)}-customer-profile.json`, JSON.stringify(state.customerProfile, null, 2), "application/json");
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Customer profile generated", detail: "One reusable configuration profile generated for the script pack." });
    return saveAndRender("Customer profile generated");
  }
  if (action === "open-stage") {
    const stageRoutes = { 1: "scope", 2: "scope", 3: "scope", 4: "collection", 5: "inventory", 6: "dependencies", 7: "dependencies", 8: "findings", 9: "findings", 10: "findings", 11: "findings", 12: "evidence", 13: "evidence", 14: "evidence", 15: "findings", 16: "solutions", 17: "roadmap", 18: "reports" };
    return navigate(stageRoutes[target.dataset.stage] || "collection");
  }
  if (action === "cycle-stage") {
    const order = ["Not started", "Awaiting data", "Received", "Validated", "Analysis complete", "Requires review", "Deferred"];
    const stage = state.stages.find((item) => item.id === Number(target.dataset.stage));
    stage.status = order[(order.indexOf(stage.status) + 1) % order.length];
    stage.updatedAt = nowIso();
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: `Stage ${stage.id} status changed`, detail: `${stage.title}: ${stage.status}.` });
    return saveAndRender("Stage status updated");
  }
  if (action === "propose-links") {
    const proposals = proposeNameLinks(state.findings, state.components, state.links);
    state.links.push(...proposals);
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Name inference completed", detail: `${proposals.length} capped proposal(s) created for human review.` });
    return saveAndRender(`${proposals.length} link proposal${proposals.length === 1 ? "" : "s"} created`);
  }
  if (action === "accept-link" || action === "reject-link") {
    const link = state.links.find((item) => item.id === target.dataset.id);
    if (link) link.status = action === "accept-link" ? "Active" : "Removed";
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: action === "accept-link" ? "Inferred link accepted" : "Inferred link rejected", detail: target.dataset.id });
    return saveAndRender("Link decision recorded");
  }
  if (action === "export-state") {
    download(`${safeFileName(state.assessment.name)}-workbench.json`, JSON.stringify(state, null, 2), "application/json");
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Assessment backup exported", detail: "Lossless JSON backup downloaded." });
    return saveAndRender("JSON backup generated");
  }
  if (action === "export-findings") {
    downloadFindingsCsv();
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Findings CSV generated", detail: `${state.findings.length} finding(s) exported from the current assessment store.` });
    return saveAndRender("Findings CSV generated");
  }
  if (action === "export-collection") {
    downloadCollectionChecklist();
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Collection checklist generated", detail: `${COLLECTION_GUIDES.length} guided collection item(s) exported.` });
    return saveAndRender("Collection checklist generated");
  }
  if (action === "export-report") {
    download(`${safeFileName(state.assessment.name)}-report.html`, renderAssessmentReport(state), "text/html");
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "HTML report generated", detail: `${blockersForPublish(state).length} automated publication blocker(s) reported.` });
    return saveAndRender("HTML report generated");
  }
  if (action === "export-explorer") {
    const blockers = blockersForExplorer(state);
    if (blockers.length) return showToast(`Explorer is blocked: ${blockers[0]}`);
    const fileName = `${safeFileName(state.assessment.application.name || state.assessment.name)}-issue-artefact-explorer.html`;
    download(fileName, renderEvidenceExplorer(state), "text/html;charset=utf-8");
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Issue & Artefact Explorer generated", detail: `${state.findings.length} finding(s), ${state.components.length} artefact(s), and ${state.links.filter((link) => link.status === "Active").length} accepted link(s) embedded in ${fileName}.` });
    return saveAndRender("Issue & Artefact Explorer generated");
  }
  if (action === "export-delivery") {
    try {
      ui.busy = true; renderShell();
      await downloadDeliveryPackage();
      state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Delivery package generated", detail: "ZIP package generated with assessment, profile, manifest, coverage, evidence, outputs, approvals, comparisons and configured scripts." });
      ui.busy = false;
      return saveAndRender("Complete delivery package generated");
    } catch (error) { ui.busy = false; showToast(error.message); return renderShell(); }
  }
  if (action === "open-runbook") { state.guided.runbookId = target.dataset.id; return saveAndRender("Runbook opened"); }
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
  if (action === "pda-answer") {
    const pda = pdaState(state);
    const qid = target.dataset.qid;
    pda.answers[qid] = pda.answers[qid] === target.dataset.value ? "" : target.dataset.value;
    pda.answeredAt[qid] = nowIso();
    pdaRefreshDiscovery(state);
    state.packHealth = diagPackHealth(state);
    state.audit.unshift({ id: uuid(), at: nowIso(), action: "Discovery answer recorded", detail: `${qid}: ${pda.answers[qid] || "cleared"}` });
    return saveAndRender("Answer saved");
  }
  if (action === "pda-filter-pack") { pdaState(state).pack = target.dataset.pack || ""; return renderShell(); }
  if (action === "pda-open-pattern") { ui.pdaPattern = target.dataset.id; state.activeView = "playbook"; return renderShell(); }
  if (action === "export-proposal") {
    if (!state.findings.some((finding) => Array.isArray(finding.effortHours))) return showToast("Add discovery answers or load the design assurance collectors first.");
    download(`${safeFileName(state.assessment.client || state.assessment.name)}_proposal.html`, buildProposalHtml(), "text/html");
    state.audit.unshift({ id: uuid(), at: nowIso(), action: "Proposal generated", detail: `${pdaPlan(state).sprints.length} sprint(s) planned.` });
    return saveAndRender("Proposal downloaded");
  }
  if (action === "export-playbook") {
    download(`${safeFileName(state.assessment.client || state.assessment.name)}_solution_playbook.html`, buildPlaybookHtml(), "text/html");
    return showToast("Playbook downloaded");
  }
  if (action === "reset-state") {
    if (!window.confirm("Delete the locally stored assessment? Export a backup first if it must be retained.")) return;
    await clearPersistedState();
    state = createEmptyState();
    ui = { ...ui, query: "", selectedComponent: "", selectedFinding: "", selectedScript: "" };
    return saveAndRender("Local assessment reset");
  }
});

app.addEventListener("input", (event) => {
  const filter = event.target.dataset.filter;
  if (!filter) return;
  if (filter === "global") ui.query = event.target.value;
  if (filter === "guided-query") ui.guidedQuery = event.target.value;
  if (filter === "inventory-type") ui.inventoryType = event.target.value;
  if (filter === "finding-severity") ui.findingSeverity = event.target.value;
  const cursor = event.target.selectionStart;
  renderShell();
  const next = document.querySelector(`[data-filter="${filter}"]`);
  next?.focus();
  if (next?.setSelectionRange && cursor !== null) next.setSelectionRange(cursor, cursor);
});

app.addEventListener("change", async (event) => {
  if (event.target.dataset.authoringFinding !== undefined) {
    ui.selectedFinding = event.target.value;
    return renderShell();
  }
  const moduleId = event.target.dataset.moduleStatus || event.target.dataset.moduleNote;
  if (!moduleId) return;
  const item = state.moduleCoverage.find((entry) => entry.id === moduleId);
  if (!item) return;
  if (event.target.dataset.moduleStatus) item.status = event.target.value;
  if (event.target.dataset.moduleNote) item.note = event.target.value;
  item.updatedAt = nowIso();
  state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Module coverage updated", detail: `${item.name}: ${item.status}${item.note ? ` — ${item.note}` : ""}.` });
  await saveAndRender("Module coverage saved");
});

app.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  if (event.target.id === "pda-plan-form") {
    const plan = pdaState(state).plan;
    ["people", "hours", "sprintWeeks"].forEach((key) => { plan[key] = Math.max(1, Number(data.get(key)) || plan[key]); });
    plan.start = String(data.get("start") || "");
    return saveAndRender("Plan updated");
  }
  if (event.target.id === "finding-form") {
    const id = String(data.get("id") || "").trim();
    const existing = state.findings.find((item) => item.id === id);
    const record = { ...(existing || {}), userEdited: true, id, title: data.get("title"), domain: data.get("domain"), severity: data.get("severity"), priority: data.get("priority"), priorityLabel: data.get("priority"), owner: data.get("owner") || "Unassigned", evidence: data.get("evidence"), rootCause: data.get("rootCause"), impact: data.get("impact"), status: existing?.status || "Draft", confidence: existing?.confidence || "Human authored" };
    if (existing) Object.assign(existing, record); else state.findings.push(record);
    ui.selectedFinding = id;
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: existing ? "Finding updated" : "Finding created", detail: `${id}: ${record.title}` });
    return saveAndRender("Finding saved");
  }
  if (event.target.id === "fix-form") {
    const findingId = String(data.get("findingId") || "");
    if (!findingId) return showToast("Select or create a finding first.");
    state.fixes[findingId] = { ...(state.fixes[findingId] || {}), approach: data.get("approach"), steps: String(data.get("steps") || "").split(/\r?\n/).filter(Boolean), verify: data.get("verify"), rollback: data.get("rollback"), owner: data.get("owner"), status: data.get("status") };
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Solution updated", detail: `${findingId}: approach, steps, verification and rollback saved.` });
    return saveAndRender("Solution saved");
  }
  if (event.target.id === "link-form") {
    const findingId = String(data.get("findingId")), componentSysId = String(data.get("componentSysId"));
    if (!state.findings.some((item) => item.id === findingId) || !state.components.some((item) => item.sysId === componentSysId)) return showToast("The finding ID or component sys_id is not present in this assessment.");
    const id = `${findingId}:${componentSysId}`;
    const existing = state.links.find((item) => item.id === id);
    const link = { id, findingId, componentSysId, how: data.get("how"), status: "Active" };
    if (existing) Object.assign(existing, link); else state.links.push(link);
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Manual evidence link saved", detail: id });
    return saveAndRender("Accepted link saved");
  }
  if (event.target.id === "incident-form") {
    const incident = state.incidents[Number(data.get("incidentIndex"))];
    if (!incident) return showToast("No incident is available.");
    incident.disposition = data.get("disposition"); incident.issues = splitList(data.get("findingIds"));
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Incident disposition saved", detail: `${incident.number || incident.sys_id || "Incident"}: ${incident.disposition}` });
    return saveAndRender("Incident disposition saved");
  }
  if (event.target.id === "gap-form") {
    state.reference.gaps = Array.isArray(state.reference.gaps) ? state.reference.gaps : [];
    state.reference.gaps.push({ id: crypto.randomUUID(), title: data.get("title"), detail: data.get("detail"), owner: data.get("owner"), targetDate: data.get("targetDate"), status: "Declared", at: nowIso() });
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Gap declared", detail: String(data.get("title")) });
    return saveAndRender("Gap declared");
  }
  if (event.target.id === "approval-form") {
    state.approvals.unshift({ id: crypto.randomUUID(), type: data.get("type"), approver: data.get("approver"), status: data.get("status"), note: data.get("note"), at: nowIso() });
    state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Approval recorded", detail: `${data.get("type")}: ${data.get("status")} by ${data.get("approver")}.` });
    return saveAndRender("Approval recorded");
  }
  if (event.target.id !== "scope-form") return;
  state.assessment.client = data.get("client");
  state.assessment.name = data.get("name");
  state.assessment.lead = data.get("lead");
  state.assessment.retentionDays = Number(data.get("retentionDays")) || 90;
  state.assessment.confidentiality = data.get("confidentiality");
  state.assessment.purpose = data.get("purpose");
  state.assessment.userGroups = data.get("userGroups");
  state.assessment.knownEvents = data.get("knownEvents");
  state.assessment.application.name = data.get("applicationName");
  state.assessment.application.scopes = splitList(data.get("scopes"));
  state.assessment.application.prefixes = splitList(data.get("prefixes"));
  state.assessment.application.tokens = splitList(data.get("tokens"));
  state.assessment.application.alwaysInclude = splitList(data.get("alwaysInclude"));
  state.assessment.environments[0].name = data.get("environment");
  state.customerProfile = customerProfileFromState(state);
  state.customerProfile.approvedInstance = data.get("approvedInstance");
  state.customerProfile.changeReference = data.get("changeReference");
  state.customerProfile.serviceUser = data.get("serviceUser");
  state.customerProfile.requiredRole = data.get("requiredRole");
  [1, 2, 3].forEach((id) => {
    const stage = state.stages.find((item) => item.id === id);
    stage.status = "Validated";
    stage.updatedAt = nowIso();
  });
  state.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), action: "Scope updated", detail: "Engagement, application identity, and business context saved." });
  await saveAndRender("Scope saved");
});

fileInput.addEventListener("change", () => {
  const files = [...fileInput.files];
  if (ui.uploadToInstance) {
    ui.uploadToInstance = false;
    uploadOutputFiles(files);
  } else handleFiles(files);
});

function safeFileName(value) {
  return String(value || "assessment").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "assessment";
}

async function boot() {
  try {
    const persisted = await loadPersistedState();
    const expiry = persisted?.updatedAt && persisted?.assessment?.retentionDays ? new Date(persisted.updatedAt).getTime() + Number(persisted.assessment.retentionDays) * 86400000 : Infinity;
    if (persisted && Date.now() > expiry) {
      await clearPersistedState();
      state = createEmptyState();
      state.audit[0].detail = "A new assessment was created after the previous local store reached its retention limit.";
    } else state = persisted || createEmptyState();
  } catch (error) {
    console.warn("Could not load local assessment state", error);
  }
  renderShell();
}


// ===================== Workbench 2 diagnostics extension =====================
// Configuration-driven: collectors, rules, correlations, runbooks and packs
// are generated from one specification (tools/wb2_catalog.json) so collector
// metric names and rule definitions cannot drift apart.
const DIAG_RULES = [{"metric":"open_unassigned_ratio","op":">","threshold":10,"severity":"Warning","title":"Open incidents without an assignee","causes":["Assignment rules not matching","Assignment groups without members","Integration-created incidents bypassing assignment"],"recommendation":"Review assignment rules and group membership for the affected categories; sample the unassigned population by category and source.","solutionType":"Configuration","complexity":"Medium","collector":"ITSM-INC-001","module":"ITSM","id":"ITSM-INC-001/open_unassigned_ratio"},{"metric":"open_aging_ratio","op":">","threshold":20,"severity":"Warning","title":"Significant open-incident ageing beyond 30 days","causes":["Stalled state model","Unmonitored queues","SLA schedule or escalation gaps"],"recommendation":"Review the aged population by assignment group and state; confirm escalation notifications and SLA visibility.","solutionType":"Process","complexity":"Medium","collector":"ITSM-INC-001","module":"ITSM","id":"ITSM-INC-001/open_aging_ratio"},{"metric":"duplicate_sd_records","op":">","threshold":50,"severity":"Warning","title":"Duplicate incident signatures detected","causes":["Event/alert integration re-raising incidents","No duplicate-detection on intake","Monitoring storms"],"recommendation":"Review the top duplicate short-description clusters; add correlation or de-duplication on the creating integration.","solutionType":"Integration","complexity":"Medium","collector":"ITSM-INC-001","module":"ITSM","id":"ITSM-INC-001/duplicate_sd_records"},{"metric":"definitions_active","op":"==","threshold":0,"severity":"Critical","title":"No active SLA definitions","causes":["Definitions deactivated","SLA plugin/config never completed"],"recommendation":"Confirm whether SLAs are in scope; if so, activate or create the required contract_sla definitions.","solutionType":"Configuration","complexity":"Small","collector":"ITSM-SLA-001","module":"ITSM","id":"ITSM-SLA-001/definitions_active"},{"metric":"attach_ratio","op":"<","threshold":50,"severity":"Error","title":"SLAs are not attaching to a large share of new incidents","causes":["Start conditions not matching","Wrong task table on the definition","Schedule or timezone mismatch","SLA engine business rules disabled"],"recommendation":"Validate definition active flags, start conditions, task table, schedule and retroactive settings against a sample of recent incidents without task_sla records.","solutionType":"Configuration","complexity":"Medium","collector":"ITSM-SLA-001","module":"ITSM","id":"ITSM-SLA-001/attach_ratio"},{"metric":"breached_ratio","op":">","threshold":30,"severity":"Warning","title":"High SLA breach ratio","causes":["Unachievable targets","Queues without monitoring","Pause conditions not configured"],"recommendation":"Review breach distribution by definition; confirm targets, schedules and pause conditions with the process owner.","solutionType":"Process","complexity":"Medium","collector":"ITSM-SLA-001","module":"ITSM","id":"ITSM-SLA-001/breached_ratio"},{"metric":"risk_empty_open","op":">","threshold":0,"severity":"Warning","title":"Open changes without a risk assessment","causes":["Risk assessment not mandatory in the change model","Legacy records predating risk configuration"],"recommendation":"Confirm the change models enforce risk calculation before authorisation; review the affected population.","solutionType":"Configuration","complexity":"Small","collector":"ITSM-CHG-001","module":"ITSM","id":"ITSM-CHG-001/risk_empty_open"},{"metric":"approvals_pending_7d","op":">","threshold":10,"severity":"Warning","title":"Change approvals pending for more than 7 days","causes":["Approvers no longer valid","No approval reminders/escalation","Delegation not configured"],"recommendation":"Review pending approvals by approver; add reminder notifications and delegation rules.","solutionType":"Process","complexity":"Small","collector":"ITSM-CHG-001","module":"ITSM","id":"ITSM-CHG-001/approvals_pending_7d"},{"metric":"emergency_ratio","op":">","threshold":20,"severity":"Warning","title":"High emergency change ratio","causes":["Normal change lead time too slow","Emergency route used for convenience"],"recommendation":"Review emergency change justifications; consider standard change candidates and lead-time improvements.","solutionType":"Process","complexity":"Medium","collector":"ITSM-CHG-001","module":"ITSM","id":"ITSM-CHG-001/emergency_ratio"},{"metric":"items_active_no_fulfillment","op":">","threshold":0,"severity":"Error","title":"Active catalog items without a fulfilment process","causes":["Item created without flow/workflow attached","Fulfilment flow deactivated or deleted","Items migrated without their delivery process"],"recommendation":"Attach a Flow Designer flow or workflow to each affected item, or retire items that are no longer offered.","solutionType":"Configuration","complexity":"Medium","collector":"ITSM-REQ-001","module":"ITSM","id":"ITSM-REQ-001/items_active_no_fulfillment"},{"metric":"ritm_per_req_ratio","op":"<","threshold":80,"severity":"Warning","title":"Requests may not be generating requested items","causes":["Cart/submission errors","Order guide rule conditions failing","Custom request creation path bypassing sc_req_item"],"recommendation":"Sample recent sc_request records without RITMs; review order guides, cart client scripts and any custom request creation integrations.","solutionType":"Configuration","complexity":"Medium","collector":"ITSM-REQ-001","module":"ITSM","id":"ITSM-REQ-001/ritm_per_req_ratio"},{"metric":"ritm_aging_ratio","op":">","threshold":25,"severity":"Warning","title":"Requested items ageing beyond 30 days","causes":["Stuck approvals","Fulfilment tasks unassigned","Flows waiting on unreachable steps"],"recommendation":"Cross-reference with pending approvals and unassigned catalog tasks; review stuck flow contexts for the top items.","solutionType":"Process","complexity":"Medium","collector":"ITSM-REQ-001","module":"ITSM","id":"ITSM-REQ-001/ritm_aging_ratio"},{"metric":"open_unassigned_ratio","op":">","threshold":20,"severity":"Warning","title":"Open problems without an assignee","causes":["No problem management ownership model","Problems raised from incident without triage"],"recommendation":"Establish a problem intake and ownership model; review the unassigned population.","solutionType":"Process","complexity":"Small","collector":"ITSM-PRB-001","module":"ITSM","id":"ITSM-PRB-001/open_unassigned_ratio"},{"metric":"open_aging_ratio","op":">","threshold":40,"severity":"Warning","title":"Problems open beyond 90 days","causes":["No root-cause workflow discipline","Known errors never closed against fixes"],"recommendation":"Review aged problems for closure or conversion to known errors with workarounds documented.","solutionType":"Process","complexity":"Small","collector":"ITSM-PRB-001","module":"ITSM","id":"ITSM-PRB-001/open_aging_ratio"},{"metric":"base_class_records","op":">","threshold":0,"severity":"Warning","title":"CIs stored on the cmdb_ci base class","causes":["Imports without class mapping","Manual creation from the base table","Integration default class"],"recommendation":"Identify the creation source of base-class CIs and reclassify them; correct the creating import/integration.","solutionType":"Data remediation","complexity":"Medium","collector":"CMDB-INV-001","module":"CMDB & CSDM","id":"CMDB-INV-001/base_class_records"},{"metric":"name_empty","op":">","threshold":0,"severity":"Warning","title":"CIs without a name","causes":["Identification on other keys with name never populated","Failed transform mappings"],"recommendation":"Trace the creation path of unnamed CIs and correct the mapping; consider a data-certification rule for name.","solutionType":"Data remediation","complexity":"Small","collector":"CMDB-INV-001","module":"CMDB & CSDM","id":"CMDB-INV-001/name_empty"},{"metric":"srv_name_dup_ratio","op":">","threshold":5,"severity":"Error","title":"High duplicate server CI ratio","causes":["Identification rules with incomplete identifiers","Multiple discovery/import sources without reconciliation","Manual CI creation alongside discovery"],"recommendation":"Review server identification rules and datasource precedence; profile the duplicate clusters by creation source before any merge.","solutionType":"Configuration","complexity":"Large","collector":"CMDB-DUP-001","module":"CMDB & CSDM","id":"CMDB-DUP-001/srv_name_dup_ratio"},{"metric":"hw_serial_dup_ratio","op":">","threshold":5,"severity":"Warning","title":"Duplicate hardware serial numbers","causes":["Placeholder serials from imports","Asset and discovery sources colliding"],"recommendation":"Profile the duplicate serial clusters; placeholder values need a data-entry fix, two-record clusters need per-pair review.","solutionType":"Data remediation","complexity":"Medium","collector":"CMDB-DUP-001","module":"CMDB & CSDM","id":"CMDB-DUP-001/hw_serial_dup_ratio"},{"metric":"rel_orphans","op":">","threshold":0,"severity":"Warning","title":"Orphaned CI relationships","causes":["CIs deleted without cascading relationship cleanup","Imports creating relationships against missing CIs"],"recommendation":"Report and remove relationships whose parent or child no longer resolves; correct the deleting/creating process.","solutionType":"Data remediation","complexity":"Small","collector":"CMDB-REL-001","module":"CMDB & CSDM","id":"CMDB-REL-001/rel_orphans"},{"metric":"identifiers_active","op":"==","threshold":0,"severity":"Critical","title":"No active CI identification rules","causes":["IRE never configured","Rules deactivated during troubleshooting"],"recommendation":"Configure identification rules for the classes in use before any data-quality remediation - without them every source creates its own CIs.","solutionType":"Configuration","complexity":"Medium","collector":"CMDB-IRE-001","module":"CMDB & CSDM","id":"CMDB-IRE-001/identifiers_active"},{"metric":"dedup_tasks_open","op":">","threshold":100,"severity":"Warning","title":"Large open de-duplication backlog","causes":["Duplicate detection running without a remediation owner"],"recommendation":"Assign ownership of the de-duplication queue; process clusters by class starting with the largest.","solutionType":"Data remediation","complexity":"Medium","collector":"CMDB-IRE-001","module":"CMDB & CSDM","id":"CMDB-IRE-001/dedup_tasks_open"},{"metric":"srv_stale_ratio","op":">","threshold":30,"severity":"Warning","title":"Server CIs not refreshed by discovery in 30 days","causes":["Discovery schedules not covering all ranges","MID Server outages","CIs created by import and never discovered"],"recommendation":"Cross-reference with discovery health; decide a staleness policy and lifecycle rule for undiscovered CIs.","solutionType":"Process","complexity":"Medium","collector":"CMDB-STL-001","module":"CMDB & CSDM","id":"CMDB-STL-001/srv_stale_ratio"},{"metric":"srv_no_owner_ratio","op":">","threshold":50,"severity":"Warning","title":"Server CIs without an owner","causes":["Ownership never modelled","Imports without ownership mapping"],"recommendation":"Agree the ownership model (owned_by / support_group) and backfill from an authoritative source.","solutionType":"Governance","complexity":"Medium","collector":"CMDB-STL-001","module":"CMDB & CSDM","id":"CMDB-STL-001/srv_no_owner_ratio"},{"metric":"retired_but_operational","op":">","threshold":0,"severity":"Warning","title":"Retired CIs still marked operational","causes":["Lifecycle fields updated independently"],"recommendation":"Correct the inconsistent pairs and align the retirement process to set both fields.","solutionType":"Data remediation","complexity":"Small","collector":"CMDB-STL-001","module":"CMDB & CSDM","id":"CMDB-STL-001/retired_but_operational"},{"metric":"business_apps","op":"==","threshold":0,"severity":"Info","title":"CSDM not started - no business applications modelled","causes":["CSDM adoption not yet begun"],"recommendation":"If service-aligned reporting is an objective, begin CSDM Crawl: model the top business applications first.","solutionType":"Architecture","complexity":"Large","collector":"CMDB-CSDM-001","module":"CMDB & CSDM","id":"CMDB-CSDM-001/business_apps"},{"metric":"app_services","op":"==","threshold":0,"severity":"Warning","requires":{"metric":"business_apps","op":">","threshold":0},"title":"Business applications exist but no application services are modelled","causes":["CSDM stopped at the Crawl stage","Service Mapping not deployed"],"recommendation":"Model application services for the top business applications so incidents, changes and vulnerabilities can be tied to services.","solutionType":"Architecture","complexity":"Large","collector":"CMDB-CSDM-001","module":"CMDB & CSDM","id":"CMDB-CSDM-001/app_services"},{"metric":"mid_down","op":">","threshold":0,"severity":"Error","title":"MID Servers down or not validated","causes":["Service stopped on the host","Credential/keystore expiry","Network path changes"],"recommendation":"Restore each affected MID Server; every discovery, integration and orchestration path through it is degraded meanwhile.","solutionType":"Configuration","complexity":"Small","collector":"ITOM-DSC-001","module":"ITOM & Discovery","id":"ITOM-DSC-001/mid_down"},{"metric":"ecc_errors_7d","op":">","threshold":100,"severity":"Warning","title":"High ECC queue error volume","causes":["Failing probes/patterns","Credential failures","Unreachable targets"],"recommendation":"Group the errored ecc_queue records by agent and topic to isolate the failing integration or discovery pattern.","solutionType":"Configuration","complexity":"Medium","collector":"ITOM-DSC-001","module":"ITOM & Discovery","id":"ITOM-DSC-001/ecc_errors_7d"},{"metric":"vi_unmatched_ratio","op":">","threshold":10,"severity":"Error","title":"Vulnerable items not matching CIs","causes":["CMDB duplicates and identification inconsistency","Scanner asset fields not aligned to CI identifiers","Discovery coverage gaps"],"recommendation":"Correlate with CMDB duplicate and IRE findings; align scanner-to-CI matching rules with the CMDB identification strategy.","solutionType":"Configuration","complexity":"Large","collector":"SECOPS-VR-001","module":"Security Operations","id":"SECOPS-VR-001/vi_unmatched_ratio"},{"metric":"vi_stale_ratio","op":">","threshold":30,"severity":"Warning","title":"Stale open vulnerable items","causes":["Scanner imports not running","Closed-loop reconciliation disabled"],"recommendation":"Verify scanner integration schedules and the re-open/close logic on repeat detections.","solutionType":"Integration","complexity":"Medium","collector":"SECOPS-VR-001","module":"Security Operations","id":"SECOPS-VR-001/vi_stale_ratio"},{"metric":"open_unassigned_ratio","op":">","threshold":10,"severity":"Warning","title":"Security incidents without an assignee","causes":["Alert ingestion creating incidents without assignment rules","Playbooks not assigning ownership"],"recommendation":"Review SIR assignment rules and playbook task ownership for the affected categories.","solutionType":"Configuration","complexity":"Medium","collector":"SECOPS-SIR-001","module":"Security Operations","id":"SECOPS-SIR-001/open_unassigned_ratio"},{"metric":"risks_no_profile","op":">","threshold":0,"severity":"Warning","title":"Risks not linked to a profile","causes":["Risks created directly without entity scoping","Profile deleted after risk creation"],"recommendation":"Re-link orphaned risks to profiles; without the Entity \u2192 Profile \u2192 Risk chain, scoring and roll-up are unreliable.","solutionType":"Data remediation","complexity":"Small","collector":"IRM-GRC-001","module":"IRM & Risk","id":"IRM-GRC-001/risks_no_profile"},{"metric":"controls_no_profile","op":">","threshold":0,"severity":"Warning","title":"Controls not linked to a profile","causes":["Controls created outside the entity model"],"recommendation":"Re-link orphaned controls; verify attestation generation still covers them.","solutionType":"Data remediation","complexity":"Small","collector":"IRM-GRC-001","module":"IRM & Risk","id":"IRM-GRC-001/controls_no_profile"},{"metric":"issues_open_aging_90d","op":">","threshold":10,"severity":"Warning","title":"GRC issues open beyond 90 days","causes":["Remediation tasks without owners","No escalation on issue ageing"],"recommendation":"Review aged issues with the risk/compliance owner; add ageing indicators.","solutionType":"Process","complexity":"Small","collector":"IRM-GRC-001","module":"IRM & Risk","id":"IRM-GRC-001/issues_open_aging_90d"},{"metric":"cases_unassigned_ratio","op":">","threshold":10,"severity":"Warning","title":"Open customer cases without an assignee","causes":["Routing/matching rules not covering all products or accounts"],"recommendation":"Review case routing rules and agent group coverage for the affected case types.","solutionType":"Configuration","complexity":"Medium","collector":"CSM-CS-001","module":"Customer Service","id":"CSM-CS-001/cases_unassigned_ratio"},{"metric":"cases_aging_ratio","op":">","threshold":25,"severity":"Warning","title":"Customer cases ageing beyond 30 days","causes":["Entitlement/SLA coverage gaps","Escalation rules missing"],"recommendation":"Cross-reference with SLA attachment; review the aged population by account and product.","solutionType":"Process","complexity":"Medium","collector":"CSM-CS-001","module":"Customer Service","id":"CSM-CS-001/cases_aging_ratio"},{"metric":"cases_aging_ratio","op":">","threshold":25,"severity":"Warning","title":"HR cases ageing beyond 30 days","causes":["COE assignment gaps","Lifecycle event activities stalling"],"recommendation":"Review the aged population by COE (aggregate view); check HR service SLAs and activity-set progression.","solutionType":"Process","complexity":"Medium","collector":"HRSD-HR-001","module":"HR Service Delivery","id":"HRSD-HR-001/cases_aging_ratio"},{"metric":"hw_no_ci_ratio","op":">","threshold":10,"severity":"Warning","title":"Hardware assets not linked to CIs","causes":["Asset and CI created by different sources without reconciliation","Discovery not matching asset records"],"recommendation":"Review the asset-CI reconciliation configuration; profile unlinked assets by source and state.","solutionType":"Configuration","complexity":"Medium","collector":"ITAM-AM-001","module":"Asset Management","id":"ITAM-AM-001/hw_no_ci_ratio"},{"metric":"assets_no_model","op":">","threshold":0,"severity":"Warning","title":"Assets without a model","causes":["Imports without model mapping","Free-text model data"],"recommendation":"Backfill models from procurement data; enforce model on the intake paths.","solutionType":"Data remediation","complexity":"Medium","collector":"ITAM-AM-001","module":"Asset Management","id":"ITAM-AM-001/assets_no_model"},{"metric":"outbound_errors_7d","op":">","threshold":50,"severity":"Warning","title":"Outbound HTTP failures in the last 7 days","causes":["Endpoint/credential changes","Certificate expiry","Timeouts on slow targets"],"recommendation":"Group the outbound log by host and status; renew credentials/certificates and add retry policies where appropriate.","solutionType":"Integration","complexity":"Medium","collector":"INT-INT-001","module":"Integrations","id":"INT-INT-001/outbound_errors_7d"},{"metric":"import_rows_error_7d","op":">","threshold":0,"severity":"Warning","title":"Import set rows failing transformation","causes":["Transform map field changes","Coalesce mismatches","Reference values missing"],"recommendation":"Review the failing transform maps; the error distribution by import set names the broken feed.","solutionType":"Integration","complexity":"Medium","collector":"INT-INT-001","module":"Integrations","id":"INT-INT-001/import_rows_error_7d"},{"metric":"flow_error_ratio","op":">","threshold":5,"severity":"Warning","title":"Elevated Flow Designer error rate","causes":["Actions failing on integration steps","Records deleted mid-flow","Credential/connection alias failures"],"recommendation":"Group errored contexts by flow; open the top failing flow executions and read the failing action.","solutionType":"Configuration","complexity":"Medium","collector":"PLAT-FLW-001","module":"Platform Flows","id":"PLAT-FLW-001/flow_error_ratio"}];
const DIAG_CORRELATIONS = [{"id":"CORR-001","severity":"Critical","title":"CMDB identification quality is degrading Vulnerability Response matching","requires":[{"collector":"SECOPS-VR-001","metric":"vi_unmatched_ratio","op":">","threshold":10},{"collector":"CMDB-DUP-001","metric":"srv_name_dup_ratio","op":">","threshold":5}],"detail":"Unmatched vulnerable items and duplicate server CIs are present together. Vulnerability-to-CI matching depends on the same identifiers that are duplicated in the CMDB, so these are one underlying data-quality problem, not two.","recommendation":"Treat CMDB identification remediation as the prerequisite: consolidate server identification rules and de-duplicate, then re-run vulnerability matching.","solutionType":"Architecture","complexity":"Large"},{"id":"CORR-002","severity":"Error","title":"Discovery degradation is driving CMDB staleness","requires":[{"collector":"ITOM-DSC-001","metric":"mid_down","op":">","threshold":0},{"collector":"CMDB-STL-001","metric":"srv_stale_ratio","op":">","threshold":30}],"detail":"MID Server availability problems coincide with a high stale-CI ratio. The staleness is a symptom; the collection outage is the cause to fix first.","recommendation":"Restore MID Server availability and re-run discovery before treating staleness as a data-quality problem.","solutionType":"Configuration","complexity":"Medium"},{"id":"CORR-003","severity":"Error","title":"Catalog fulfilment chain is failing end to end","requires":[{"collector":"ITSM-REQ-001","metric":"items_active_no_fulfillment","op":">","threshold":0},{"collector":"PLAT-FLW-001","metric":"flow_error_ratio","op":">","threshold":5}],"detail":"Catalog items without fulfilment processes and elevated flow errors are present together - requests are stalling both where no process exists and where the process fails.","recommendation":"Fix the failing flows for high-volume items first, then attach or retire the process-less items.","solutionType":"Configuration","complexity":"Medium"},{"id":"CORR-004","severity":"Warning","title":"Asset-to-CI reconciliation degraded by identifier quality","requires":[{"collector":"ITAM-AM-001","metric":"hw_no_ci_ratio","op":">","threshold":10},{"collector":"CMDB-DUP-001","metric":"hw_serial_dup_ratio","op":">","threshold":5}],"detail":"Hardware assets unlinked to CIs coincide with duplicated serial numbers - the reconciliation key itself is unreliable.","recommendation":"Clean serial-number quality first (placeholders vs true duplicates), then re-run asset-CI reconciliation.","solutionType":"Data remediation","complexity":"Large"}];
const DIAG_RUNBOOKS = [{"id":"RB-PLAT","title":"Platform Health Check","pack":"Platform","symptoms":["instance slow","platform health","performance","slow transactions","scheduled jobs","event queue","system health"],"steps":["PERF-AUD-001","PERF-AUD-002","DATA-PROF-001","CODE-AUD-004","PLAT-FLW-001","INT-INT-001"],"guidance":"Start with execution patterns and queue health, then table growth, static code risk, flow outcomes and integration failures."},{"id":"RB-ITSM","title":"ITSM Health Check","pack":"ITSM","symptoms":["itsm health","service desk","ticket problems"],"steps":["ITSM-INC-001","ITSM-SLA-001","ITSM-CHG-001","ITSM-REQ-001","ITSM-PRB-001"],"guidance":"Run the five process baselines in order; each feeds the findings register independently."},{"id":"RB-INC","title":"Incident Diagnostic","pack":"ITSM","symptoms":["incidents not creating","incident assignment","duplicate incidents","incident notifications","priority wrong"],"steps":["ITSM-INC-001","ITSM-SLA-001"],"guidance":"Baseline incident flow first; the duplicate-signature and assignment metrics usually isolate the symptom."},{"id":"RB-SLA","title":"SLA Diagnostic","pack":"ITSM","symptoms":["sla not attaching","sla not progressing","sla breached","sla wrong time"],"steps":["ITSM-SLA-001","ITSM-INC-001"],"guidance":"Definition activity, attach ratio, stage distribution and breach ratio cover the four standard SLA failure modes."},{"id":"RB-REQ","title":"Request Fulfilment Diagnostic","pack":"ITSM","symptoms":["requests not generating ritms","ritm not created","catalog item not working","stuck requests","catalog task unassigned"],"steps":["ITSM-REQ-001","PLAT-FLW-001"],"guidance":"The item-without-fulfilment and RITM-per-request metrics identify whether the failure is configuration or execution; flow errors show where execution breaks."},{"id":"RB-CMDB","title":"CMDB Health Diagnostic","pack":"CMDB & CSDM","symptoms":["cmdb health","ci data quality","cmdb mess"],"steps":["CMDB-INV-001","CMDB-DUP-001","CMDB-REL-001","CMDB-IRE-001","CMDB-STL-001","CMDB-CSDM-001"],"guidance":"Inventory first (the denominators), then duplicates, relationships, the IRE layer, lifecycle and CSDM alignment."},{"id":"RB-CI","title":"CI Diagnostic","pack":"CMDB & CSDM","symptoms":["duplicate servers","duplicate cis","ci wrong class","stale ci"],"steps":["CMDB-DUP-001","CMDB-IRE-001","CMDB-STL-001"],"guidance":"Duplicates, the identification rules that allowed them, and the freshness of the population."},{"id":"RB-DISC","title":"Discovery Diagnostic","pack":"ITOM & Discovery","symptoms":["discovery not running","discovery creating duplicates","mid server down","ecc queue errors"],"steps":["ITOM-DSC-001","CMDB-IRE-001","CMDB-DUP-001"],"guidance":"MID and schedule health first; duplicates from discovery are usually identification-rule problems, not discovery problems."},{"id":"RB-VR","title":"Vulnerability Response Diagnostic","pack":"Security Operations","symptoms":["vulnerabilities not matching cis","vulnerable items unmatched","stale vulnerabilities","scanner import"],"steps":["SECOPS-VR-001","CMDB-DUP-001","CMDB-IRE-001"],"guidance":"The match rate depends on CMDB identity quality - always run the CMDB pair alongside the VR baseline."},{"id":"RB-SIR","title":"Security Incident Diagnostic","pack":"Security Operations","symptoms":["security incidents not creating","alert ingestion","sir assignment"],"steps":["SECOPS-SIR-001","INT-INT-001"],"guidance":"Baseline SIR flow, then the integration layer that feeds it."},{"id":"RB-IRM","title":"IRM Health Diagnostic","pack":"IRM & Risk","symptoms":["risk assessment not generating","orphaned risks","controls not linked","grc issues aging","attestations"],"steps":["IRM-GRC-001"],"guidance":"The single baseline covers the Entity \u2192 Profile \u2192 Risk \u2192 Control chain and its orphans."},{"id":"RB-CSM","title":"Customer Service Diagnostic","pack":"Customer Service","symptoms":["customer cases unassigned","case routing","entitlements","csm aging"],"steps":["CSM-CS-001","ITSM-SLA-001"],"guidance":"Case flow baseline plus SLA attachment - the two usual sources of CSM service failures."},{"id":"RB-HRSD","title":"HR Service Delivery Diagnostic","pack":"HR Service Delivery","symptoms":["hr cases stuck","coe assignment","lifecycle events","hr profiles missing"],"steps":["HRSD-HR-001"],"guidance":"Aggregate-only HR baseline: profile coverage and case flow by COE. No case content is read."},{"id":"RB-ITAM","title":"Asset Management Diagnostic","pack":"Asset Management","symptoms":["assets not linked to ci","asset reconciliation","missing models"],"steps":["ITAM-AM-001","CMDB-DUP-001"],"guidance":"Asset-CI linkage plus the serial-number quality that reconciliation depends on."},{"id":"RB-INT","title":"Integration Diagnostic","pack":"Integrations","symptoms":["rest failures","integration errors","import failing","transform errors","outbound http"],"steps":["INT-INT-001","ITOM-DSC-001"],"guidance":"Outbound and import health, plus the MID layer many integrations run through."}];
const DIAG_PACKS = [{"id":"Platform","label":"Platform","collectors":["PERF-AUD-001","PERF-AUD-002","DATA-PROF-001","CODE-AUD-004","PLAT-FLW-001"]},{"id":"ITSM","label":"ITSM","collectors":["ITSM-INC-001","ITSM-SLA-001","ITSM-CHG-001","ITSM-REQ-001","ITSM-PRB-001"]},{"id":"CMDB & CSDM","label":"CMDB & CSDM","collectors":["CMDB-INV-001","CMDB-DUP-001","CMDB-REL-001","CMDB-IRE-001","CMDB-STL-001","CMDB-CSDM-001"]},{"id":"ITOM & Discovery","label":"ITOM & Discovery","collectors":["ITOM-DSC-001"]},{"id":"Security Operations","label":"Security Operations","collectors":["SECOPS-VR-001","SECOPS-SIR-001"]},{"id":"IRM & Risk","label":"IRM & Risk","collectors":["IRM-GRC-001"]},{"id":"Customer Service","label":"Customer Service","collectors":["CSM-CS-001"]},{"id":"HR Service Delivery","label":"HR Service Delivery","collectors":["HRSD-HR-001"]},{"id":"Asset Management","label":"Asset Management","collectors":["ITAM-AM-001"]},{"id":"Integrations","label":"Integrations","collectors":["INT-INT-001"]}];
const DIAG_COLLECTORS = [{"id":"ITSM-INC-001","title":"ITSM-INC-001 incident health","module":"ITSM","description":"Measures incident volumes, assignment coverage, ageing, priority mix and duplicate signatures so incident-process findings rest on aggregates, not anecdotes."},{"id":"ITSM-SLA-001","title":"ITSM-SLA-001 sla health","module":"ITSM","description":"Verifies SLA definitions, attachment to new incidents, breach ratios and retroactive settings - the standard first pass for \"SLA not attaching / not progressing\"."},{"id":"ITSM-CHG-001","title":"ITSM-CHG-001 change health","module":"ITSM","description":"Reviews change state flow, risk completion, emergency ratio and stalled approvals."},{"id":"ITSM-REQ-001","title":"ITSM-REQ-001 request and catalog health","module":"ITSM","description":"Checks catalog items for missing fulfilment processes and measures the request-to-RITM chain, stuck items and unassigned catalog tasks - the standard first pass for \"requests are not generating RITMs\"."},{"id":"ITSM-PRB-001","title":"ITSM-PRB-001 problem health","module":"ITSM","description":"Measures problem volumes, assignment, known errors and long-running open problems."},{"id":"CMDB-INV-001","title":"CMDB-INV-001 ci class inventory","module":"CMDB & CSDM","description":"Baselines the CI population by class, operational status and base-class misuse - the denominator every other CMDB diagnostic needs."},{"id":"CMDB-DUP-001","title":"CMDB-DUP-001 duplicate ci analysis","module":"CMDB & CSDM","description":"Quantifies duplicate server names and duplicate hardware serial numbers - the standard signature of identification-rule and multi-source problems."},{"id":"CMDB-REL-001","title":"CMDB-REL-001 relationship health","module":"CMDB & CSDM","description":"Measures orphaned, self-referencing and duplicated CI relationships."},{"id":"CMDB-IRE-001","title":"CMDB-IRE-001 identification and reconciliation health","module":"CMDB & CSDM","description":"Extracts the identification-rule and reconciliation configuration position plus open de-duplication tasks."},{"id":"CMDB-STL-001","title":"CMDB-STL-001 stale ci and lifecycle health","module":"CMDB & CSDM","description":"Measures discovery freshness, ownership and lifecycle consistency on server CIs."},{"id":"CMDB-CSDM-001","title":"CMDB-CSDM-001 csdm alignment","module":"CMDB & CSDM","description":"Baselines the CSDM population - business applications, application services, technical services and offerings - and emits the service entities and edges for the relationship map."},{"id":"ITOM-DSC-001","title":"ITOM-DSC-001 discovery and mid health","module":"ITOM & Discovery","description":"Checks MID Server availability, discovery schedule outcomes and ECC queue error volumes."},{"id":"SECOPS-VR-001","title":"SECOPS-VR-001 vulnerability response health","module":"Security Operations","description":"Measures vulnerable-item volumes, CI match rate and staleness - the CMDB dependency made visible."},{"id":"SECOPS-SIR-001","title":"SECOPS-SIR-001 security incident health","module":"Security Operations","description":"Measures security incident volumes, assignment and ageing (aggregate only)."},{"id":"IRM-GRC-001","title":"IRM-GRC-001 irm   grc health","module":"IRM & Risk","description":"Baselines entities, profiles, risks, controls, indicators and issues, and measures orphaned GRC relationships along the Entity \u2192 Profile \u2192 Risk \u2192 Control chain."},{"id":"CSM-CS-001","title":"CSM-CS-001 customer service health","module":"Customer Service","description":"Baselines accounts, contacts and case flow using aggregates only - no case content is read."},{"id":"HRSD-HR-001","title":"HRSD-HR-001 hr service delivery health","module":"HR Service Delivery","description":"Baselines HR profiles and case flow using aggregate counts by COE only. Deliberately reads no HR case content - metadata and aggregates only."},{"id":"ITAM-AM-001","title":"ITAM-AM-001 asset management health","module":"Asset Management","description":"Measures asset population, asset-to-CI linkage and model completeness."},{"id":"INT-INT-001","title":"INT-INT-001 integration health","module":"Integrations","description":"Baselines REST message configuration, outbound HTTP failures and import-set outcomes."},{"id":"PLAT-FLW-001","title":"PLAT-FLW-001 flow execution health","module":"Platform Flows","description":"Measures Flow Designer execution outcomes over the last 7 days."}];
const DIAG_SEVERITY_MAP = { Critical: ["Critical", "P1"], Error: ["High", "P2"], Warning: ["Medium", "P3"], Info: ["Low", "P4"] };

SCRIPT_CATALOG.push(...DIAG_COLLECTORS.map((collector) => ({
  id: collector.id,
  title: collector.title,
  file: `collectors/${collector.id}.js`,
  stage: 4,
  description: collector.description,
  kind: "collector",
  safety: "Read-only aggregate collection - emits one DIAG envelope; no consumer content, no writes",
  sourceUrl: "",
  module: collector.module,
})));

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
  <section class="panel"><div class="phase-grid pack-grid">${tiles}</div></section>
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


// ================= Platform design assurance catalogue v1.0.0 =================
const PDA_COLLECTORS = [{"id":"PDA-CMDB-001","title":"CMDB design and CSDM assurance","module":"CMDB & CSDM","stage":6,"description":"Checks the CMDB against the assessment model: source, identification, reconciliation, CMDB 360, class and schema, relationships, CSDM, health, lifecycle and consumption. Aggregate counts only.","metrics":["ci_total","ci_no_source_pct","sources_distinct","classes_in_use","classes_small_pct","classes_no_rule","dup_tasks_open","hw_serial_dup_clusters","ci_class_name_dup_clusters","ci_name_pattern","recon_multi_source_no_rules","multi_source_no_source_records","source_stale_pct","base_class_ci","custom_ci_classes","custom_fields_base","rel_per_100_ci","orphan_rel","ci_no_name","ci_no_owner_pct","health_results","stale_ci_pct","csdm_no_business_apps","csdm_no_offerings","legacy_service_ci","status_conflict","lifecycle_blank_pct","ci_class_no_asset_pct","incident_no_ci_pct","incident_no_service_pct"],"rules":["CM-01","CM-02","CM-03","CM-04","CM-05","CM-06","CM-07","CM-08","CM-09","CM-13","CM-14","CM-17","CM-20","CM-21","CM-22","CM-23","CM-24","CM-25","CM-26","CM-27","CM-28","CM-11","CM-15","CM-18","CM-12","CM-19","CM-16"]},{"id":"PDA-ASSET-001","title":"Asset and CI alignment","module":"Asset Management","stage":5,"description":"Checks hardware assets against their CIs, models and lifecycle data, how the asset load was designed, and software normalisation. Aggregate counts only.","metrics":["asset_total","asset_expected_ci_missing_pct","transform_asset_only","asset_no_model_pct","asset_no_location_pct","asset_no_assignee_pct","models_no_category","test_data_records","warranty_expired_pct","sw_unnormalised_pct"],"rules":["AM-08","AM-09","AM-01","AM-02","AM-03","AM-04","AM-05","AM-06","AM-07"]},{"id":"PDA-SVC-001","title":"Service delivery design (ITSM, portal, HR, customer, portfolio)","module":"Service delivery","stage":9,"description":"Checks how service work is captured and fulfilled: channels, forms, problem and major incident use, requests, knowledge, catalogue, HR and customer cases, field work, portfolio and AI use. Aggregate counts only.","metrics":["incident_90d","selfservice_pct","email_pct","problem_per_100_incidents","major_incident_unused","reassign_gt3_pct","site_in_text_pct","form_location_missing","change_no_ci_pct","ritm_aged_pct","kb_expired_pct","kb_unviewed_pct","cat_no_category","cat_legacy_wf","portals","hr_no_service_pct","hr_aged_pct","case_no_asset_pct","case_no_account","case_email_pct","wo_aged_pct","va_unused","pi_unconfigured","proj_overdue_pct","proj_no_pm","demand_aged"],"rules":["IT-05","IT-06","IT-07","IT-08","IT-09","PK-01","PK-02","PK-03","PK-04","PK-05","HR-01","HR-02","CS-03","CS-04","SP-01","SP-02","SP-03","AI-02","AI-03","IT-01","IT-02","IT-03","IT-04","CS-01","CS-02"]},{"id":"PDA-RISK-001","title":"Security, risk and AI governance","module":"Security & risk","stage":8,"description":"Checks vulnerability and security incident ageing, admin access, instance hardening settings, GRC issues and control ownership, and whether AI capabilities are governed. Aggregate counts only.","metrics":["vi_aged_pct","si_aged","admin_users","hardening_weakened","grc_issue_aged","controls_no_owner","custom_tables","ai_skills_ungoverned","now_assist_unused"],"rules":["SO-01","SO-02","PL-07","RM-01","RM-02","PL-13","AG-01","AG-02","PL-06"]},{"id":"PDA-OPS-001","title":"Operations and integration health","module":"Operations & integration","stage":10,"description":"Checks MID Servers, event and alert processing, Discovery schedules and service maps, cloud resources in the CMDB, integration and import errors, outbound email failures and legacy integrations. Aggregate counts only.","metrics":["mid_not_up","event_errors_7d","alerts_open_gt7d","discovery_not_running","discovery_no_service_maps","cloud_resources","ecc_errors_7d","import_row_errors_7d","email_send_failed_7d","soap_messages","legacy_tool_integrations"],"rules":["OM-01","OM-02","OM-03","IN-01","IN-02","IN-03","IN-04","OM-04","OM-05","OM-06","IN-05"]},{"id":"PDA-PLAT-001","title":"Platform debt, performance and adoption","module":"Platform","stage":11,"description":"Checks scripting patterns, open update sets, custom fields and apps, Instance Scan results, legacy workflows, scheduled jobs, group membership, user adoption, installed-but-unused products, operational technology data, and log and transaction pressure. Aggregate counts only; the heaviest checks run last within the time budget.","metrics":["br_current_update","client_gliderecord","stale_update_sets","custom_fields_all","instance_scan_open","legacy_workflows","custom_scoped_apps","sched_scripts","groups_no_members","dormant_users_pct","otm_no_devices","ot_details_pct","ot_no_group_pct","wsd_unused","legal_unused","industry_unused","syslog_errors_7d","slow_tx_24h"],"rules":["AI-01","PL-08","PL-09","PL-10","PL-11","PL-12","AE-01","WL-01","WL-02","ID-01","OT-01","OT-02","OT-03","PL-01","PL-02","PL-03","PL-04","PL-05"]}];
const PDA_RULES = [{"id":"CM-01","collector":"PDA-CMDB-001","metric":"ci_no_source_pct","op":">","threshold":10,"unit":"%","severity":"Warning","kind":"Issue","title":"CIs with no discovery source","why":"CIs were created manually or by a load that doesn't stamp its source.","impact":"Nobody can tell which system is authoritative for these CIs.","recommendation":"Set discovery_source on every load (IRE does this when a data source is passed)","steps":["Set discovery_source on every load (IRE does this when a data source is passed)","Backfill the source for existing CIs where it can be traced"],"where":"cmdb_ci.discovery_source is empty","rc":"CMDB_GOV","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Source","type":"Data","effort":[4,8,12],"phase":2,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-02","collector":"PDA-CMDB-001","metric":"classes_no_rule","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"CI classes with no identification rule","why":"Classes were populated without identification rules, so IRE can't match incoming data to existing CIs.","impact":"Every load into these classes can create duplicates.","recommendation":"Define identifier entries (e.g. serial number, asset tag, name + class) for each class","steps":["Define identifier entries (e.g. serial number, asset tag, name + class) for each class","Test with IRE in a sub-production instance","Send every load through IRE"],"where":"cmdb_identifier: no active rule on the class or any parent class","rc":"CMDB_GOV","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Identification","type":"Design","effort":[8,16,24],"phase":2,"role":"Architect / Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-03","collector":"PDA-CMDB-001","metric":"recon_multi_source_no_rules","op":"==","threshold":1,"unit":"","severity":"Error","kind":"Issue","title":"Several data sources and no reconciliation rules","why":"More than one source writes to the CMDB with no rule deciding which one wins.","impact":"Sources overwrite each other's values.","recommendation":"Agree an authoritative source per class and attribute","steps":["Agree an authoritative source per class and attribute","Create reconciliation definitions","Turn on data refresh rules where needed"],"where":"cmdb_reconciliation_definition count vs distinct discovery_source values","rc":"CMDB_GOV","patterns":["P05","P09"],"pack":"CMDB & CSDM","stage":"Reconciliation","type":"Design","effort":[6,10,16],"phase":2,"role":"Architect","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-04","collector":"PDA-CMDB-001","metric":"dup_tasks_open","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Open duplicate CI tasks","why":"IRE has flagged duplicates and nobody is working the de-duplication tasks.","impact":"Known duplicates stay in the CMDB and mislead impact analysis.","recommendation":"Assign the de-duplication tasks to the class owners","steps":["Assign the de-duplication tasks to the class owners","Use the de-duplication templates to merge them"],"where":"reconcile_duplicate_task active","rc":"HYGIENE","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Identification","type":"Data","effort":[4,8,16],"phase":3,"role":"CMDB owner","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-05","collector":"PDA-CMDB-001","metric":"hw_serial_dup_clusters","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"Duplicate serial numbers on hardware","why":"Hardware was loaded without serial-based identification, or the same device was loaded from two sources.","impact":"The same device appears as more than one CI.","recommendation":"Review each set","steps":["Review each set","Merge or retire the duplicates","Add serial number to the hardware identification rule"],"where":"cmdb_ci_hardware.serial_number used more than once","rc":"HYGIENE","patterns":["P05","P06"],"pack":"CMDB & CSDM","stage":"Identification","type":"Data","effort":[4,8,16],"phase":3,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-06","collector":"PDA-CMDB-001","metric":"base_class_ci","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"CIs stored in the base cmdb_ci class","why":"Data was loaded into the base table instead of a specific class.","impact":"These CIs miss class-specific fields, rules and health checks.","recommendation":"Map each CI to its correct class","steps":["Map each CI to its correct class","Reclassify with a logged fix script (dry-run first)"],"where":"cmdb_ci where sys_class_name = cmdb_ci","rc":"CLASS","patterns":["P05","P07"],"pack":"CMDB & CSDM","stage":"Class & schema","type":"Design","effort":[6,12,20],"phase":3,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-07","collector":"PDA-CMDB-001","metric":"custom_ci_classes","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Custom CI classes","why":"Classes were created where an out-of-box class may already fit.","impact":"Custom classes add upgrade effort and may duplicate out-of-box classes.","recommendation":"Compare each one with the out-of-box classes","steps":["Compare each one with the out-of-box classes","Migrate and retire where an out-of-box class fits"],"where":"sys_db_object name starts with u_cmdb_ci","rc":"CLASS","patterns":["P05","P07"],"pack":"CMDB & CSDM","stage":"Class & schema","type":"Design","effort":[4,8,16],"phase":4,"role":"Architect","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-08","collector":"PDA-CMDB-001","metric":"custom_fields_base","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Custom fields on the cmdb_ci base table","why":"Fields were added at the top of the hierarchy, so every CI class inherits them.","impact":"Every CI class inherits these fields, cluttering forms and upgrades.","recommendation":"Check each field against out-of-box fields","steps":["Check each field against out-of-box fields","Move class-specific fields down to the right class","Retire unused fields"],"where":"sys_dictionary name = cmdb_ci, element starts with u_","rc":"CLASS","patterns":["P05","P07"],"pack":"CMDB & CSDM","stage":"Class & schema","type":"Design","effort":[4,8,12],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-09","collector":"PDA-CMDB-001","metric":"classes_small_pct","op":">","threshold":30,"unit":"%","severity":"Info","kind":"Issue","title":"Many CI classes hold fewer than 5 CIs","why":"Classes were used inconsistently or for one-off records.","impact":"The class model is fragmented and hard to govern.","recommendation":"Review the small classes","steps":["Review the small classes","Consolidate them into the classes the business actually uses"],"where":"cmdb_ci grouped by sys_class_name, count < 5","rc":"CLASS","patterns":["P05","P07"],"pack":"CMDB & CSDM","stage":"Class & schema","type":"Design","effort":[2,4,8],"phase":4,"role":"Architect","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-13","collector":"PDA-CMDB-001","metric":"ci_no_name","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"CIs with no name","why":"A load or integration created CIs without mapping a name.","impact":"These CIs cannot be found or selected.","recommendation":"Trace the source from the created date and creator","steps":["Trace the source from the created date and creator","Name them or retire them"],"where":"cmdb_ci.name is empty","rc":"HYGIENE","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Health","type":"Data","effort":[1,2,4],"phase":1,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-14","collector":"PDA-CMDB-001","metric":"ci_no_owner_pct","op":">","threshold":20,"unit":"%","severity":"Error","kind":"Issue","title":"CIs with no owner or support group","why":"Ownership was never part of the CMDB design.","impact":"Incidents can't route automatically and nobody certifies the data.","recommendation":"Set support group per class or location","steps":["Set support group per class or location","Fill it in with a rule on load"],"where":"cmdb_ci owned_by and support_group both empty","rc":"CMDB_GOV","patterns":["P05","P20"],"pack":"CMDB & CSDM","stage":"Health","type":"Data","effort":[6,10,16],"phase":2,"role":"BA / Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-17","collector":"PDA-CMDB-001","metric":"health_results","op":"==","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"CMDB Health producing no results","why":"The health jobs are off or were never configured.","impact":"Nobody can see completeness, correctness or compliance scores.","recommendation":"Turn on the CMDB Health jobs and set the metrics","steps":["Turn on the CMDB Health jobs and set the metrics","Review the dashboard monthly with the class owners"],"where":"cmdb_health_result count (verify table name for the release)","rc":"CMDB_GOV","patterns":["P05","P04"],"pack":"CMDB & CSDM","stage":"Health","type":"Behaviour","effort":[4,6,10],"phase":4,"role":"CMDB owner","confidence":"Measured (verify table for release)","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-20","collector":"PDA-CMDB-001","metric":"csdm_no_business_apps","op":"==","threshold":1,"unit":"","severity":"Warning","kind":"Issue","title":"No business applications recorded","why":"The CSDM Foundation domain hasn't been started.","impact":"Applications can't be tied to owners, services or technical components.","recommendation":"Collect the application portfolio with owners","steps":["Collect the application portfolio with owners","Load it as business applications"],"where":"cmdb_ci_business_app count","rc":"CSDM","patterns":["P05","P04"],"pack":"CMDB & CSDM","stage":"CSDM","type":"Design","effort":[8,16,24],"phase":4,"role":"BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-21","collector":"PDA-CMDB-001","metric":"csdm_no_offerings","op":"==","threshold":1,"unit":"","severity":"Warning","kind":"Issue","title":"No service offerings defined","why":"Services were never modelled to the offering level.","impact":"Work can't be reported by service offering.","recommendation":"Define business and technical services with their offerings","steps":["Define business and technical services with their offerings","Add service offering to Incident, Change and Case"],"where":"service_offering count","rc":"CSDM","patterns":["P05","P04"],"pack":"CMDB & CSDM","stage":"CSDM","type":"Design","effort":[12,20,32],"phase":4,"role":"BA / Architect","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-22","collector":"PDA-CMDB-001","metric":"legacy_service_ci","op":">","threshold":0,"unit":"","severity":"Info","kind":"Issue","title":"CIs in the legacy base service class","why":"Services were created in the generic class before the CSDM service classes were adopted.","impact":"Service records may not align with the CSDM service classes.","recommendation":"Map each one to the right CSDM service class","steps":["Map each one to the right CSDM service class","Migrate it with its relationships"],"where":"cmdb_ci where sys_class_name = cmdb_ci_service","rc":"CSDM","patterns":["P05"],"pack":"CMDB & CSDM","stage":"CSDM","type":"Design","effort":[2,4,8],"phase":4,"role":"Architect","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-23","collector":"PDA-CMDB-001","metric":"status_conflict","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Install status and operational status disagree","why":"Status fields are set by different processes that don't keep each other in step.","impact":"Reports on live and retired equipment disagree.","recommendation":"Agree which field leads","steps":["Agree which field leads","Correct the conflicting CIs","Add a business rule to keep the two aligned"],"where":"install_status Retired with operational_status Operational, or the reverse","rc":"HYGIENE","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Lifecycle","type":"Data","effort":[2,4,8],"phase":3,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-24","collector":"PDA-CMDB-001","metric":"lifecycle_blank_pct","op":">","threshold":50,"unit":"%","severity":"Info","kind":"Opportunity","title":"CSDM life cycle stage not used","why":"The newer CSDM lifecycle fields haven't been adopted yet.","impact":"The standard CSDM lifecycle fields are not being used.","recommendation":"Map the current status values to life cycle stage and stage status","steps":["Map the current status values to life cycle stage and stage status","Backfill them and update the processes"],"where":"cmdb_ci.life_cycle_stage is empty (field exists in newer releases)","rc":"CSDM","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Lifecycle","type":"Improvement","effort":[4,8,12],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-25","collector":"PDA-CMDB-001","metric":"incident_no_ci_pct","op":">","threshold":30,"unit":"%","severity":"Error","kind":"Issue","title":"Incidents raised with no CI","why":"The CI isn't required, or the right CIs don't exist to pick from.","impact":"Incidents can't be trended or tied to faulty equipment.","recommendation":"Make the CI mandatory at resolution","steps":["Make the CI mandatory at resolution","Default it from the caller's assets or the location"],"where":"incident.cmdb_ci is empty (last 90 days)","rc":"CONSUME","patterns":["P05","P14"],"pack":"CMDB & CSDM","stage":"Consumption","type":"Behaviour","effort":[4,6,10],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-26","collector":"PDA-CMDB-001","metric":"incident_no_service_pct","op":">","threshold":50,"unit":"%","severity":"Warning","kind":"Issue","title":"Incidents raised with no service","why":"No services are modelled for users to select.","impact":"Incidents can't be reported by service.","recommendation":"Once offerings exist, add service and offering to the form","steps":["Once offerings exist, add service and offering to the form","Fill them in from the CI"],"where":"incident.business_service is empty (last 90 days)","rc":"CSDM","patterns":["P04"],"pack":"CMDB & CSDM","stage":"Consumption","type":"Behaviour","effort":[2,4,6],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"IT-05","collector":"PDA-SVC-001","metric":"selfservice_pct","op":"<","threshold":20,"unit":"%","severity":"Warning","kind":"Issue","title":"Low self-service share of incidents","why":"Users go to the service desk directly because the portal doesn't meet their needs.","impact":"Agents handle work users could do themselves.","recommendation":"Review the top call drivers","steps":["Review the top call drivers","Publish catalogue items and knowledge for them","Promote the portal and measure the share monthly"],"where":"incident.contact_type = self-service (last 90 days)","rc":"SELFSERVICE","patterns":["P03","P12"],"pack":"ITSM","stage":"","type":"Behaviour","effort":[16,24,40],"phase":4,"role":"BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"IT-06","collector":"PDA-SVC-001","metric":"email_pct","op":">","threshold":30,"unit":"%","severity":"Warning","kind":"Issue","title":"Email is a main intake channel","why":"Email intake was left open as the easiest route, so requests arrive unstructured.","impact":"Incidents arrive unstructured and need manual triage.","recommendation":"Redirect common email requests to catalogue items","steps":["Redirect common email requests to catalogue items","Use inbound actions to reply with portal links","Report the channel mix monthly"],"where":"incident.contact_type = email (last 90 days)","rc":"MANUAL","patterns":["P02"],"pack":"ITSM","stage":"","type":"Behaviour","effort":[8,16,24],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"IT-07","collector":"PDA-SVC-001","metric":"problem_per_100_incidents","op":"<","threshold":1,"unit":" per 100","severity":"Warning","kind":"Issue","title":"Few problem records for the incident volume","why":"Problem management isn't practised, so repeat incidents aren't removed.","impact":"Repeat issues are handled again and again.","recommendation":"Stand up problem management with a practice owner","steps":["Stand up problem management with a practice owner","Add a trend review of repeat incidents","Record known errors in knowledge"],"where":"problem count vs incident count (last 90 days)","rc":"PROCESS","patterns":["P25"],"pack":"ITSM","stage":"","type":"Behaviour","effort":[8,16,24],"phase":4,"role":"Process owner","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"IT-08","collector":"PDA-SVC-001","metric":"major_incident_unused","op":"==","threshold":1,"unit":"","severity":"Warning","kind":"Issue","title":"Major Incident Management not used","why":"Major incidents are coordinated outside the platform, or the feature isn't set up.","impact":"Outage coordination is not visible on the platform.","recommendation":"Confirm how major incidents are run today","steps":["Confirm how major incidents are run today","Configure Major Incident Management and communication plans"],"where":"incident.major_incident_state = accepted (last 90 days)","rc":"OPS","patterns":["P14"],"pack":"ITSM","stage":"","type":"Design","effort":[8,16,24],"phase":2,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"IT-09","collector":"PDA-SVC-001","metric":"ritm_aged_pct","op":">","threshold":25,"unit":"%","severity":"Warning","kind":"Issue","title":"Requested items open more than 30 days","why":"Fulfilment depends on manual steps or approvals that stall.","impact":"Requests stall, frustrating users.","recommendation":"Find the stalled stages","steps":["Find the stalled stages","Automate approvals and fulfilment tasks in Flow Designer","Close abandoned requests"],"where":"sc_req_item active, created more than 30 days ago","rc":"MANUAL","patterns":["P02","P21"],"pack":"ITSM","stage":"","type":"Data","effort":[8,16,32],"phase":3,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"PK-01","collector":"PDA-SVC-001","metric":"kb_expired_pct","op":">","threshold":10,"unit":"%","severity":"Warning","kind":"Issue","title":"Published knowledge past its valid-to date","why":"Articles have no owner or review cycle.","impact":"Users may follow out-of-date guidance.","recommendation":"Assign owners per knowledge base","steps":["Assign owners per knowledge base","Review or retire expired articles","Turn on review notifications"],"where":"kb_knowledge published with valid_to before today","rc":"SELFSERVICE","patterns":["P03"],"pack":"Portal & Knowledge","stage":"","type":"Data","effort":[4,8,16],"phase":3,"role":"Knowledge manager","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PK-02","collector":"PDA-SVC-001","metric":"kb_unviewed_pct","op":">","threshold":30,"unit":"%","severity":"Info","kind":"Issue","title":"Published articles never viewed","why":"Content is hard to find or doesn't match what users look for.","impact":"Content effort is wasted and users can't find answers.","recommendation":"Compare search terms with article titles","steps":["Compare search terms with article titles","Retire unused content","Improve search configuration"],"where":"kb_knowledge published with sys_view_count = 0","rc":"SELFSERVICE","patterns":["P03","P12"],"pack":"Portal & Knowledge","stage":"","type":"Behaviour","effort":[4,8,12],"phase":4,"role":"Knowledge manager","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PK-03","collector":"PDA-SVC-001","metric":"cat_no_category","op":">","threshold":0,"unit":"","severity":"Info","kind":"Issue","title":"Active catalogue items with no category","why":"Items were published without a place in the taxonomy.","impact":"These items can only be found by search.","recommendation":"Assign categories using the agreed taxonomy","steps":["Assign categories using the agreed taxonomy","Retire duplicates"],"where":"sc_cat_item active with category empty","rc":"SELFSERVICE","patterns":["P03"],"pack":"Portal & Knowledge","stage":"","type":"Design","effort":[2,4,8],"phase":3,"role":"BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PK-04","collector":"PDA-SVC-001","metric":"cat_legacy_wf","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Catalogue items still on legacy Workflow","why":"Items were built before Flow Designer and never migrated.","impact":"Legacy Workflow adds upgrade and maintenance effort.","recommendation":"Group items by workflow","steps":["Group items by workflow","Rebuild the common patterns as flows","Migrate and retest"],"where":"sc_cat_item active with workflow populated","rc":"DEBT","patterns":["P07"],"pack":"Portal & Knowledge","stage":"","type":"Design","effort":[16,32,64],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Large"},{"id":"PK-05","collector":"PDA-SVC-001","metric":"portals","op":">","threshold":4,"unit":"","severity":"Info","kind":"Issue","title":"Many service portals","why":"Teams built their own portals instead of sharing one front door.","impact":"Users may not know where to go.","recommendation":"List each portal's audience and use","steps":["List each portal's audience and use","Consolidate into Employee Center or one portal"],"where":"sp_portal count","rc":"FRAGMENT","patterns":["P01","P03"],"pack":"Portal & Knowledge","stage":"","type":"Design","effort":[8,16,40],"phase":4,"role":"Architect","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"HR-01","collector":"PDA-SVC-001","metric":"hr_no_service_pct","op":">","threshold":10,"unit":"%","severity":"Warning","kind":"Issue","title":"HR cases with no HR service","why":"Cases are raised generically, often from email, without selecting a service.","impact":"HR cases can't be routed or reported by service.","recommendation":"Map inbound channels to HR services","steps":["Map inbound channels to HR services","Make the service mandatory for agents"],"where":"sn_hr_core_case.hr_service empty (last 90 days)","rc":"EXPERIENCE","patterns":["P16","P04"],"pack":"HR Service Delivery","stage":"","type":"Data","effort":[4,8,16],"phase":3,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"HR-02","collector":"PDA-SVC-001","metric":"hr_aged_pct","op":">","threshold":20,"unit":"%","severity":"Warning","kind":"Issue","title":"HR cases open more than 30 days","why":"Hand-offs between HR teams stall without SLAs or lifecycle orchestration.","impact":"Employees wait too long for HR outcomes.","recommendation":"Add SLAs per HR service","steps":["Add SLAs per HR service","Review hand-off points","Use lifecycle events for multi-team journeys"],"where":"sn_hr_core_case active, created more than 30 days ago","rc":"EXPERIENCE","patterns":["P16"],"pack":"HR Service Delivery","stage":"","type":"Behaviour","effort":[8,16,24],"phase":4,"role":"BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CS-03","collector":"PDA-SVC-001","metric":"case_email_pct","op":">","threshold":50,"unit":"%","severity":"Warning","kind":"Issue","title":"Customer cases mostly raised by email","why":"Portal and chat channels aren't offered or promoted to customers.","impact":"Cases arrive without structured data.","recommendation":"Launch the customer portal for top case types","steps":["Launch the customer portal for top case types","Add chat for simple requests"],"where":"sn_customerservice_case.contact_type = email (last 90 days)","rc":"EXPERIENCE","patterns":["P15","P02"],"pack":"Customer Service","stage":"","type":"Behaviour","effort":[16,32,56],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Large"},{"id":"CS-04","collector":"PDA-SVC-001","metric":"wo_aged_pct","op":">","threshold":20,"unit":"%","severity":"Warning","kind":"Issue","title":"Work orders open more than 30 days","why":"Scheduling, parts or skills matching is slowing dispatch.","impact":"Field work waits too long to be completed.","recommendation":"Analyse where work orders wait","steps":["Analyse where work orders wait","Tune scheduling and skills","Link work orders to assets"],"where":"wm_order active, created more than 30 days ago","rc":"EXPERIENCE","patterns":["P17"],"pack":"Customer Service","stage":"","type":"Behaviour","effort":[8,16,32],"phase":4,"role":"BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"AM-08","collector":"PDA-ASSET-001","metric":"warranty_expired_pct","op":">","threshold":20,"unit":"%","severity":"Warning","kind":"Issue","title":"In-use hardware past warranty","why":"Refresh and renewal decisions aren't driven from asset data.","impact":"In-use equipment out of warranty raises outage and repair cost risk.","recommendation":"Report expiring warranties by site and owner","steps":["Report expiring warranties by site and owner","Add renewal or refresh tasks to the asset lifecycle"],"where":"alm_hardware install_status In use and warranty_expiration before today","rc":"ASSET","patterns":["P06","P14"],"pack":"Asset Management","stage":"","type":"Data","effort":[4,8,16],"phase":4,"role":"Asset manager","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"AM-09","collector":"PDA-ASSET-001","metric":"sw_unnormalised_pct","op":">","threshold":20,"unit":"%","severity":"Warning","kind":"Issue","title":"Software installations not normalised","why":"Normalisation isn't running, or content subscriptions are missing.","impact":"Installations can't be matched to licences.","recommendation":"Check the normalisation jobs and content service","steps":["Check the normalisation jobs and content service","Review unrecognised software"],"where":"cmdb_sam_sw_install.norm_product empty","rc":"ASSET","patterns":["P06","P23"],"pack":"Asset Management","stage":"","type":"Data","effort":[8,12,24],"phase":3,"role":"SAM manager","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"SO-01","collector":"PDA-RISK-001","metric":"vi_aged_pct","op":">","threshold":30,"unit":"%","severity":"Critical","kind":"Issue","title":"Vulnerable items open more than 90 days","why":"Remediation isn't assigned to accountable owners through the CMDB.","impact":"Exposure stays open past reasonable remediation windows.","recommendation":"Assign remediation groups from CI support groups","steps":["Assign remediation groups from CI support groups","Set risk-based SLAs","Group remediation by patch"],"where":"sn_vul_vulnerable_item active, created more than 90 days ago","rc":"SECURITY","patterns":["P10"],"pack":"Security Operations","stage":"","type":"Behaviour","effort":[16,32,56],"phase":1,"role":"Security analyst","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Large"},{"id":"SO-02","collector":"PDA-RISK-001","metric":"si_aged","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"Security incidents open more than 30 days","why":"Playbooks or escalation paths aren't in place.","impact":"Security incidents remain unresolved.","recommendation":"Review each one with the SOC lead","steps":["Review each one with the SOC lead","Add playbooks for the common types"],"where":"sn_si_incident active, created more than 30 days ago","rc":"SECURITY","patterns":["P10"],"pack":"Security Operations","stage":"","type":"Behaviour","effort":[4,8,16],"phase":1,"role":"Security analyst","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PL-07","collector":"PDA-RISK-001","metric":"admin_users","op":">","threshold":10,"unit":"","severity":"Error","kind":"Issue","title":"Many active admin accounts","why":"Admin has been granted for convenience instead of scoped roles.","impact":"Broad admin access widens security and audit exposure.","recommendation":"Recertify every admin","steps":["Recertify every admin","Replace with scoped roles","Review quarterly"],"where":"sys_user_has_role role admin, user active","rc":"SECURITY","patterns":["P10","P11"],"pack":"Platform","stage":"","type":"Design","effort":[4,8,12],"phase":1,"role":"Platform owner","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"RM-01","collector":"PDA-RISK-001","metric":"grc_issue_aged","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"GRC issues open more than 90 days","why":"Issue owners and due dates aren't enforced.","impact":"Risk and compliance issues are overdue for attention.","recommendation":"Confirm owners and due dates","steps":["Confirm owners and due dates","Escalate overdue issues to the risk committee"],"where":"sn_grc_issue active, created more than 90 days ago","rc":"GOV_RISK","patterns":["P11"],"pack":"IRM & Risk","stage":"","type":"Behaviour","effort":[4,8,16],"phase":1,"role":"Risk manager","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"RM-02","collector":"PDA-RISK-001","metric":"controls_no_owner","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Compliance controls with no owner","why":"Controls were generated without assigning owners.","impact":"Nobody attests these controls.","recommendation":"Assign owners by entity","steps":["Assign owners by entity","Set up attestation schedules"],"where":"sn_compliance_control.owner empty","rc":"GOV_RISK","patterns":["P11"],"pack":"IRM & Risk","stage":"","type":"Data","effort":[4,8,16],"phase":2,"role":"Risk manager","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"SP-01","collector":"PDA-SVC-001","metric":"proj_overdue_pct","op":">","threshold":20,"unit":"%","severity":"Warning","kind":"Issue","title":"Active projects past their planned end","why":"Plans aren't updated or stage gates aren't enforced.","impact":"Leaders lack a reliable view of delivery.","recommendation":"Re-baseline or close the projects","steps":["Re-baseline or close the projects","Add stage-gate reviews"],"where":"pm_project active with end_date before today","rc":"PORTFOLIO","patterns":["P18"],"pack":"Strategic Portfolio","stage":"","type":"Data","effort":[4,8,16],"phase":4,"role":"PMO","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"SP-02","collector":"PDA-SVC-001","metric":"proj_no_pm","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Active projects with no project manager","why":"Projects were created without mandatory ownership.","impact":"These projects have no accountable manager.","recommendation":"Assign managers","steps":["Assign managers","Make the field mandatory"],"where":"pm_project active with project_manager empty","rc":"PORTFOLIO","patterns":["P18"],"pack":"Strategic Portfolio","stage":"","type":"Data","effort":[1,2,4],"phase":3,"role":"PMO","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"SP-03","collector":"PDA-SVC-001","metric":"demand_aged","op":">","threshold":0,"unit":"","severity":"Info","kind":"Issue","title":"Demands open more than 90 days","why":"There is no regular prioritisation forum.","impact":"Demand waits for a decision.","recommendation":"Set up a monthly demand review","steps":["Set up a monthly demand review","Score and decide each demand"],"where":"dmn_demand active, created more than 90 days ago","rc":"PORTFOLIO","patterns":["P18"],"pack":"Strategic Portfolio","stage":"","type":"Behaviour","effort":[4,8,12],"phase":4,"role":"PMO","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"OM-01","collector":"PDA-OPS-001","metric":"mid_not_up","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"MID Servers not up","why":"MID Servers were retired or lost connectivity without cleanup or alerting.","impact":"Discovery and integrations through these MID Servers fail.","recommendation":"Restore or retire each one","steps":["Restore or retire each one","Turn on MID Server issue alerting"],"where":"ecc_agent status not Up","rc":"OPS","patterns":["P14","P09"],"pack":"ITOM & Discovery","stage":"","type":"Behaviour","effort":[2,4,8],"phase":1,"role":"ITOM engineer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"OM-02","collector":"PDA-OPS-001","metric":"event_errors_7d","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Events failing to process","why":"Event rules or source formats don't match.","impact":"Alerts may be missed.","recommendation":"Group errors by source","steps":["Group errors by source","Fix the event rules"],"where":"em_event state Error (last 7 days)","rc":"OPS","patterns":["P14"],"pack":"ITOM & Discovery","stage":"","type":"Behaviour","effort":[4,8,16],"phase":1,"role":"ITOM engineer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"OM-03","collector":"PDA-OPS-001","metric":"alerts_open_gt7d","op":">","threshold":50,"unit":"","severity":"Warning","kind":"Issue","title":"Open alerts older than 7 days","why":"Alerts aren't correlated or auto-closed, so noise builds up.","impact":"Alert noise hides real problems.","recommendation":"Tune alert correlation and auto-close rules","steps":["Tune alert correlation and auto-close rules","Review noisy sources"],"where":"em_alert state Open, created more than 7 days ago","rc":"OPS","patterns":["P14"],"pack":"ITOM & Discovery","stage":"","type":"Behaviour","effort":[8,16,24],"phase":4,"role":"ITOM engineer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"IN-01","collector":"PDA-OPS-001","metric":"ecc_errors_7d","op":">","threshold":50,"unit":"","severity":"Error","kind":"Issue","title":"ECC queue errors","why":"Integrations or probes are failing with no monitoring.","impact":"Integrations or probes are failing.","recommendation":"Group errors by topic and source","steps":["Group errors by topic and source","Fix the top sources","Add alerting"],"where":"ecc_queue state error (last 7 days)","rc":"INTEGRATION","patterns":["P09"],"pack":"Integrations","stage":"","type":"Behaviour","effort":[8,16,24],"phase":1,"role":"Integration developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"IN-02","collector":"PDA-OPS-001","metric":"import_row_errors_7d","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"Import rows in error","why":"Source data doesn't match transform rules, and errors aren't reviewed.","impact":"Target data is incomplete.","recommendation":"Review the error messages","steps":["Review the error messages","Fix the mapping or source data","Add an exceptions report"],"where":"sys_import_set_row state error (last 7 days)","rc":"INTEGRATION","patterns":["P09","P04"],"pack":"Integrations","stage":"","type":"Behaviour","effort":[4,8,16],"phase":1,"role":"Integration developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"IN-03","collector":"PDA-OPS-001","metric":"email_send_failed_7d","op":">","threshold":20,"unit":"","severity":"Warning","kind":"Issue","title":"Outbound email failures","why":"Mail server settings or recipient data are wrong.","impact":"Notifications are not reaching people.","recommendation":"Check the email account and logs","steps":["Check the email account and logs","Fix invalid recipients"],"where":"sys_email type send-failed (last 7 days)","rc":"INTEGRATION","patterns":["P09","P14"],"pack":"Integrations","stage":"","type":"Behaviour","effort":[2,4,8],"phase":1,"role":"Platform admin","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"IN-04","collector":"PDA-OPS-001","metric":"soap_messages","op":">","threshold":0,"unit":"","severity":"Info","kind":"Opportunity","title":"Legacy SOAP integrations","why":"Older integrations predate REST and IntegrationHub.","impact":"Older integrations may need modernising.","recommendation":"Check which are still used","steps":["Check which are still used","Move active ones to REST or spokes"],"where":"sys_soap_message count","rc":"INTEGRATION","patterns":["P09","P07"],"pack":"Integrations","stage":"","type":"Improvement","effort":[8,16,40],"phase":4,"role":"Integration developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"AI-01","collector":"PDA-PLAT-001","metric":"legacy_workflows","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Legacy workflows still active","why":"Automation was built before Flow Designer.","impact":"Legacy workflows add upgrade and maintenance effort.","recommendation":"Rank by usage","steps":["Rank by usage","Migrate to Flow Designer in waves"],"where":"wf_workflow active and published","rc":"DEBT","patterns":["P07","P19"],"pack":"AI & Automation","stage":"","type":"Design","effort":[16,40,80],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Large"},{"id":"AI-02","collector":"PDA-SVC-001","metric":"va_unused","op":"==","threshold":1,"unit":"","severity":"Info","kind":"Opportunity","title":"Virtual Agent not used","why":"Conversational self-service hasn't been set up.","impact":"Simple requests still need an agent.","recommendation":"Pick the top 5 intents","steps":["Pick the top 5 intents","Build topics and launch on the portal"],"where":"sys_cs_conversation (last 90 days)","rc":"CAPABILITY","patterns":["P19","P03","P23"],"pack":"AI & Automation","stage":"","type":"Improvement","effort":[16,32,56],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Large"},{"id":"AI-03","collector":"PDA-SVC-001","metric":"pi_unconfigured","op":"==","threshold":1,"unit":"","severity":"Info","kind":"Opportunity","title":"Predictive Intelligence not set up","why":"Categorisation and routing are done by hand.","impact":"Categorisation and routing are done by hand.","recommendation":"Check the entitlement","steps":["Check the entitlement","Train classification on clean history","Pilot on one assignment area"],"where":"ml_solution_definition active","rc":"CAPABILITY","patterns":["P19","P23"],"pack":"AI & Automation","stage":"","type":"Improvement","effort":[16,24,40],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"PL-08","collector":"PDA-PLAT-001","metric":"slow_tx_24h","op":">","threshold":200,"unit":"","severity":"Error","kind":"Issue","title":"Slow transactions in the last 24 hours","why":"Heavy scripts, queries or data volumes are slowing requests.","impact":"Users experience slow pages.","recommendation":"Group by URL and table","steps":["Group by URL and table","Tune the slowest scripts and queries","Apply archive rules"],"where":"syslog_transaction response_time > 5 s (last 24 hours)","rc":"PERF","patterns":["P08"],"pack":"Platform","stage":"","type":"Behaviour","effort":[8,16,32],"phase":1,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"PL-09","collector":"PDA-PLAT-001","metric":"custom_fields_all","op":">","threshold":300,"unit":"","severity":"Warning","kind":"Issue","title":"High number of custom fields","why":"Fields were added without checking out-of-box options.","impact":"Custom fields add maintenance and upgrade effort.","recommendation":"Find unused fields","steps":["Find unused fields","Retire or replace them with out-of-box fields"],"where":"sys_dictionary element starts with u_","rc":"DEBT","patterns":["P07"],"pack":"Platform","stage":"","type":"Design","effort":[8,16,40],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"PL-10","collector":"PDA-PLAT-001","metric":"dormant_users_pct","op":">","threshold":30,"unit":"%","severity":"Warning","kind":"Issue","title":"Active users not logged in for 90 days","why":"Accounts aren't deactivated, or licensed users aren't adopting the platform.","impact":"Licences may be paid for but not used.","recommendation":"Separate integration and SSO-only users","steps":["Separate integration and SSO-only users","Deactivate leavers","Target adoption for the rest"],"where":"sys_user active, last_login_time more than 90 days ago","rc":"ADOPTION","patterns":["P12","P23"],"pack":"Platform","stage":"","type":"Behaviour","effort":[4,8,16],"phase":4,"role":"Platform owner","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PL-11","collector":"PDA-PLAT-001","metric":"sched_scripts","op":">","threshold":150,"unit":"","severity":"Info","kind":"Issue","title":"Large number of scheduled script jobs","why":"Jobs were added over time without review.","impact":"Scheduled jobs compete for resources.","recommendation":"Review owners and schedules","steps":["Review owners and schedules","Retire unused jobs"],"where":"sysauto_script active","rc":"PERF","patterns":["P08","P07"],"pack":"Platform","stage":"","type":"Design","effort":[4,8,16],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PL-12","collector":"PDA-PLAT-001","metric":"instance_scan_open","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Open Instance Scan findings","why":"Scan results haven't been worked through.","impact":"Known quality issues remain unaddressed.","recommendation":"Triage by check category","steps":["Triage by check category","Fix or accept each with a reason"],"where":"scan_finding active","rc":"DEBT","patterns":["P07"],"pack":"Platform","stage":"","type":"Design","effort":[8,24,56],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"AE-01","collector":"PDA-PLAT-001","metric":"custom_scoped_apps","op":">","threshold":0,"unit":"","severity":"Info","kind":"Opportunity","title":"Custom scoped apps to govern","why":"Apps may have been built without a review board or pipeline.","impact":"Apps may lack ownership, testing or entitlement.","recommendation":"List owners and usage","steps":["List owners and usage","Bring them under App Engine Management Center governance"],"where":"sys_app scope starts with x_","rc":"GOVERNANCE","patterns":["P26","P07","P22"],"pack":"Platform","stage":"","type":"Improvement","effort":[4,8,16],"phase":4,"role":"Architect","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-27","collector":"PDA-CMDB-001","metric":"multi_source_no_source_records","op":"==","threshold":1,"unit":"","severity":"Warning","kind":"Issue","title":"Multi-source CI data not recorded","why":"CIs are loaded from more than one source without going through IRE with a named data source, so no per-source history is kept.","impact":"Nobody can see which source supplied which value.","recommendation":"Route every load through IRE with a data source name","steps":["Route every load through IRE with a data source name","Check CMDB 360 / multi-source settings for the release","Compare source values before choosing the authoritative source"],"where":"sys_object_source count vs distinct discovery_source values","rc":"CMDB_GOV","patterns":["P05","P09"],"pack":"CMDB & CSDM","stage":"CMDB 360","type":"Design","effort":[6,12,20],"phase":2,"role":"Architect","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-28","collector":"PDA-CMDB-001","metric":"source_stale_pct","op":">","threshold":30,"unit":"%","severity":"Info","kind":"Issue","title":"Source records not refreshed in 90 days","why":"A source stopped sending data, but its CIs were never reviewed.","impact":"CIs from sources that stopped sending data may be stale.","recommendation":"Find which sources stopped","steps":["Find which sources stopped","Retire or re-source the affected CIs","Add staleness rules to CMDB Health"],"where":"sys_object_source.last_scan older than 90 days","rc":"HYGIENE","patterns":["P05"],"pack":"CMDB & CSDM","stage":"CMDB 360","type":"Data","effort":[4,8,12],"phase":4,"role":"CMDB owner","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"OM-04","collector":"PDA-OPS-001","metric":"discovery_not_running","op":"==","threshold":1,"unit":"","severity":"Error","kind":"Issue","title":"Discovery schedules not running","why":"Schedules exist but aren't triggering, or MID Servers aren't available to run them.","impact":"The CMDB is ageing.","recommendation":"Check schedule timing and MID Server selection","steps":["Check schedule timing and MID Server selection","Run one schedule manually and review the log","Alert when a schedule misses its run"],"where":"discovery_status in the last 30 days vs active discovery_schedule","rc":"OPS","patterns":["P05","P14"],"pack":"ITOM & Discovery","stage":"","type":"Behaviour","effort":[2,4,8],"phase":1,"role":"ITOM engineer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"OM-05","collector":"PDA-OPS-001","metric":"discovery_no_service_maps","op":"==","threshold":1,"unit":"","severity":"Info","kind":"Opportunity","title":"Discovery running but no mapped services","why":"Infrastructure is discovered, but services aren't mapped, so outages can't be tied to what the business uses.","impact":"Outages can't be tied to the services the business uses.","recommendation":"Confirm the Service Mapping entitlement","steps":["Confirm the Service Mapping entitlement","Start with the top five business-critical services (tag-based or top-down)"],"where":"cmdb_ci_service_discovered count","rc":"CAPABILITY","patterns":["P05","P14","P23"],"pack":"ITOM & Discovery","stage":"","type":"Improvement","effort":[16,40,80],"phase":4,"role":"ITOM engineer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Large"},{"id":"OM-06","collector":"PDA-OPS-001","metric":"cloud_resources","op":"==","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Cloud work planned, but no cloud resources in the CMDB","why":"Cloud resources are built outside ServiceNow and never recorded, so operations can't support them.","impact":"Operations can't support cloud resources it can't see.","recommendation":"Bring cloud resources in through a Service Graph Connector or cloud discovery (check the licence)","steps":["Bring cloud resources in through a Service Graph Connector or cloud discovery (check the licence)","Tag resources to business applications","Connect DevOps pipelines to change"],"where":"cmdb_ci_vm_instance count, checked against discovery answer P24-1","rc":"ADJACENT","patterns":["P24","P05"],"pack":"ITOM & Discovery","stage":"","type":"Integrity","effort":[16,32,64],"phase":4,"role":"Architect","confidence":"Measured","requiresAnswer":"P24-1","solutionType":"Configuration","complexity":"Large"},{"id":"IN-05","collector":"PDA-OPS-001","metric":"legacy_tool_integrations","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Integrations still linked to legacy service tools","why":"A legacy tool is still feeding or receiving data, so the exit isn't complete.","impact":"The legacy tool exit isn't complete.","recommendation":"Confirm each integration's purpose and owner","steps":["Confirm each integration's purpose and owner","Plan cut-over and decommission","Archive the legacy data you need to keep"],"where":"sys_data_source / sys_rest_message names matching the legacy tool keywords set in Scope","rc":"LEGACY","patterns":["P13","P09"],"pack":"Integrations","stage":"","type":"Design","effort":[8,16,40],"phase":2,"role":"Integration developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"PL-13","collector":"PDA-RISK-001","metric":"hardening_weakened","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"Security properties not at hardened values","why":"Hardening settings were changed, often to work around a customisation.","impact":"Weakened settings increase security risk, especially for regulated and public sector clients.","recommendation":"Confirm why each was changed","steps":["Confirm why each was changed","Restore the hardened value and fix what depended on it","Review the Instance Security Center dashboard"],"where":"sys_properties: glide.security.use_csrf_token, glide.ui.escape_text, glide.script.use.sandbox","rc":"SECURITY","patterns":["P10","P11","P22"],"pack":"Platform","stage":"","type":"Design","effort":[4,8,16],"phase":1,"role":"Platform owner","confidence":"Measured (confirm expected values)","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"AG-01","collector":"PDA-RISK-001","metric":"ai_skills_ungoverned","op":"==","threshold":1,"unit":"","severity":"Error","kind":"Issue","title":"AI skills configured without central AI governance","why":"Now Assist skills were set up before an AI register and ownership model existed.","impact":"AI use can't be evidenced or controlled.","recommendation":"Record each skill with an owner, purpose and data scope","steps":["Record each skill with an owner, purpose and data scope","Restrict activation by role","Consider AI Control Tower if licensed and link AI risks to IRM"],"where":"sn_nowassist_skill_config count vs installed AI Control Tower app","rc":"AIGOV","patterns":["P27","P19","P11"],"pack":"AI & Automation","stage":"","type":"Design","effort":[8,16,32],"phase":1,"role":"Platform owner","confidence":"Measured (app detection by name)","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"AG-02","collector":"PDA-RISK-001","metric":"now_assist_unused","op":"==","threshold":1,"unit":"","severity":"Info","kind":"Opportunity","title":"Now Assist installed but not used","why":"The application was installed, but no one has configured or adopted it.","impact":"Licensed AI capability delivers no value.","recommendation":"Confirm entitlement and the business owner","steps":["Confirm entitlement and the business owner","Decide whether to activate, roadmap or uninstall","If activating, start with the smallest valuable use case"],"where":"sys_scope name contains \"Now Assist\" → tables in those scopes → total rows","rc":"CAPABILITY","patterns":["P19","P23"],"pack":"AI & Automation","stage":"","type":"Improvement","effort":[4,8,16],"phase":0,"role":"Platform owner","confidence":"Measured (app detection by name)","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"WL-01","collector":"PDA-PLAT-001","metric":"wsd_unused","op":"==","threshold":1,"unit":"","severity":"Info","kind":"Opportunity","title":"Workplace Service Delivery installed but not used","why":"The application was installed, but no one has configured or adopted it.","impact":"Licensed workplace capability delivers no value.","recommendation":"Confirm entitlement and the business owner","steps":["Confirm entitlement and the business owner","Decide whether to activate, roadmap or uninstall","If activating, start with the smallest valuable use case"],"where":"sys_scope name contains \"Workplace\" → tables in those scopes → total rows","rc":"CAPABILITY","patterns":["P28","P23"],"pack":"Workplace & Legal","stage":"","type":"Improvement","effort":[4,8,16],"phase":0,"role":"Platform owner","confidence":"Measured (app detection by name)","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"WL-02","collector":"PDA-PLAT-001","metric":"legal_unused","op":"==","threshold":1,"unit":"","severity":"Info","kind":"Opportunity","title":"Legal Service Delivery installed but not used","why":"The application was installed, but no one has configured or adopted it.","impact":"Licensed legal capability delivers no value.","recommendation":"Confirm entitlement and the business owner","steps":["Confirm entitlement and the business owner","Decide whether to activate, roadmap or uninstall","If activating, start with the smallest valuable use case"],"where":"sys_scope name contains \"Legal\" → tables in those scopes → total rows","rc":"CAPABILITY","patterns":["P28","P23"],"pack":"Workplace & Legal","stage":"","type":"Improvement","effort":[4,8,16],"phase":0,"role":"Platform owner","confidence":"Measured (app detection by name)","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"ID-01","collector":"PDA-PLAT-001","metric":"industry_unused","op":"==","threshold":1,"unit":"","severity":"Info","kind":"Opportunity","title":"Industry solution installed but not used","why":"The application was installed, but no one has configured or adopted it.","impact":"Licensed industry capability delivers no value.","recommendation":"Confirm entitlement and the business owner","steps":["Confirm entitlement and the business owner","Decide whether to activate, roadmap or uninstall","If activating, start with the smallest valuable use case"],"where":"sys_scope name contains \"Telecommunications / Financial Services Operations / Healthcare / Public Sector Digital\" → tables in those scopes → total rows","rc":"CAPABILITY","patterns":["P23","P22"],"pack":"Platform","stage":"","type":"Improvement","effort":[4,8,16],"phase":0,"role":"Platform owner","confidence":"Measured (app detection by name)","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"OT-01","collector":"PDA-PLAT-001","metric":"otm_no_devices","op":"==","threshold":1,"unit":"","severity":"Info","kind":"Opportunity","title":"OT Management installed but no OT devices","why":"OT Management was installed but the device data was never loaded.","impact":"Plant risk and change stay invisible.","recommendation":"Confirm the OT discovery source (partner connector or import)","steps":["Confirm the OT discovery source (partner connector or import)","Load devices with Purdue level and owners"],"where":"cmdb_ci_ot count vs installed Operational Technology apps","rc":"OTVIS","patterns":["P29","P23"],"pack":"Operational Technology","stage":"","type":"Improvement","effort":[16,32,64],"phase":2,"role":"ITOM engineer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Large"},{"id":"OT-02","collector":"PDA-PLAT-001","metric":"ot_details_pct","op":"<","threshold":50,"unit":"%","severity":"Warning","kind":"Issue","title":"OT devices without OT device details","why":"Devices were loaded as CIs without the OT-specific details (Purdue level, device function).","impact":"Risk and segmentation can't be assessed.","recommendation":"Map the connector fields to OT device details","steps":["Map the connector fields to OT device details","Backfill Purdue level and function type"],"where":"cmdb_ot_entity count vs cmdb_ci_ot count","rc":"OTVIS","patterns":["P29","P05"],"pack":"Operational Technology","stage":"","type":"Integrity","effort":[8,16,32],"phase":3,"role":"ITOM engineer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"OT-03","collector":"PDA-PLAT-001","metric":"ot_no_group_pct","op":">","threshold":20,"unit":"%","severity":"Error","kind":"Issue","title":"OT devices with no support group","why":"Plant ownership was never mapped to support groups.","impact":"Incidents and vulnerabilities on these devices have nowhere to go.","recommendation":"Agree plant support groups","steps":["Agree plant support groups","Set the group by site or equipment model entity"],"where":"cmdb_ci_ot.support_group empty","rc":"OTVIS","patterns":["P29","P10"],"pack":"Operational Technology","stage":"","type":"Data","effort":[4,8,16],"phase":2,"role":"OT lead","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"AM-01","collector":"PDA-ASSET-001","metric":"asset_expected_ci_missing_pct","op":">","threshold":5,"unit":"%","severity":"Critical","kind":"Issue","title":"Assets with no linked CI","why":"The asset load has no step that creates or links the CI.","impact":"Equipment that should have a CI can't be selected on Incident, Change or Case, so impact analysis isn't possible.","recommendation":"Design a CI transform using IRE (SNC.IdentificationEngineScriptableApi.createOrUpdateCI) into the agreed class","steps":["Design a CI transform using IRE (SNC.IdentificationEngineScriptableApi.createOrUpdateCI) into the agreed class","Link alm_hardware.ci ↔ cmdb_ci.asset","Dry-run against a copy of the register, then execute in batches"],"where":"alm_hardware.ci is empty","rc":"IMPORT","patterns":["P05","P06"],"pack":"Asset Management","stage":"","type":"Integrity","effort":[24,40,64],"phase":2,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Large"},{"id":"AM-02","collector":"PDA-ASSET-001","metric":"transform_asset_only","op":"==","threshold":1,"unit":"","severity":"Critical","kind":"Issue","title":"Asset transform map with no CI transform","why":"The import was designed asset-first and the CI side was never built.","impact":"Every future load repeats the asset-without-CI gap.","recommendation":"Add a CI transform map (or an onAfter script calling IRE) next to the asset map","steps":["Add a CI transform map (or an onAfter script calling IRE) next to the asset map","Set coalesce on a stable key (asset tag or serial), never on location","Record the design in the As Built"],"where":"sys_transform_map: target alm_hardware active, no target cmdb_ci*","rc":"IMPORT","patterns":["P05","P09"],"pack":"Asset Management","stage":"","type":"Design","effort":[16,24,40],"phase":2,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-11","collector":"PDA-CMDB-001","metric":"ci_name_pattern","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"CIs named after levels or locations","why":"The CI name was mapped from a location or level column instead of the asset identifier.","impact":"These CIs represent places, not equipment, and mislead anyone selecting a CI.","recommendation":"Map these CIs to real equipment or retire them (set to Retired, don't delete)","steps":["Map these CIs to real equipment or retire them (set to Retired, don't delete)","Move location data onto cmn_location references"],"where":"cmdb_ci.name starts with \"Level\" or \"L0\"","rc":"IMPORT","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Identification","type":"Data","effort":[8,16,32],"phase":3,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"AM-03","collector":"PDA-ASSET-001","metric":"asset_no_model_pct","op":">","threshold":10,"unit":"%","severity":"Error","kind":"Issue","title":"Assets missing a model (and so a manufacturer)","why":"The field was left out of the transform. The reason isn't documented, so confirm it with the data owner.","impact":"Assets can't be reported by manufacturer or model, and lifecycle and warranty tracking is blocked.","recommendation":"Confirm why the field was excluded","steps":["Confirm why the field was excluded","Map model via a product model lookup, creating models where required","Backfill from the source register"],"where":"alm_hardware.model is empty","rc":"IMPORT","patterns":["P06","P04"],"pack":"Asset Management","stage":"","type":"Data","effort":[12,20,32],"phase":3,"role":"Developer / BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"AM-04","collector":"PDA-ASSET-001","metric":"asset_no_location_pct","op":">","threshold":5,"unit":"%","severity":"Error","kind":"Issue","title":"Assets missing a location","why":"Location was not mapped, or the source values didn't match any cmn_location record.","impact":"Site views, dispatch and CAB filtering don't work.","recommendation":"Build a location lookup with an exceptions list","steps":["Build a location lookup with an exceptions list","Backfill location, then make it mandatory for new loads"],"where":"alm_hardware.location is empty","rc":"IMPORT","patterns":["P06"],"pack":"Asset Management","stage":"","type":"Data","effort":[8,16,24],"phase":3,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"AM-05","collector":"PDA-ASSET-001","metric":"asset_no_assignee_pct","op":">","threshold":30,"unit":"%","severity":"Warning","kind":"Issue","title":"Assets with no assigned owner","why":"Ownership for facility equipment was never defined. It may belong at group level.","impact":"These assets have no accountable person.","recommendation":"Agree the ownership model (person or support group)","steps":["Agree the ownership model (person or support group)","Fill managed_by / support group instead if that fits better"],"where":"alm_hardware.assigned_to is empty","rc":"PROCESS","patterns":["P06"],"pack":"Asset Management","stage":"","type":"Data","effort":[4,8,16],"phase":4,"role":"BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"AM-06","collector":"PDA-ASSET-001","metric":"models_no_category","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Product models without a model category","why":"The model catalogue was built for a different use and never tied to a category.","impact":"These models can't drive asset or CI class creation.","recommendation":"Rationalise the model categories","steps":["Rationalise the model categories","Link each model to one category with an asset class and a CI class"],"where":"cmdb_hardware_product_model.cmdb_model_category is empty","rc":"TAXONOMY","patterns":["P06"],"pack":"Asset Management","stage":"","type":"Design","effort":[8,12,20],"phase":2,"role":"Developer / BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"AM-07","collector":"PDA-ASSET-001","metric":"test_data_records","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"Test data in the instance","why":"Test records were promoted or loaded in production and not removed afterwards.","impact":"Test records erode trust in reports.","recommendation":"Confirm each record with the data owner","steps":["Confirm each record with the data owner","Retire or delete with a logged fix script (dry-run first)"],"where":"asset_tag / serial_number / cmdb_ci.name match test markers","rc":"GOVERNANCE","patterns":["P11","P04"],"pack":"Asset Management","stage":"","type":"Data","effort":[2,4,8],"phase":1,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-15","collector":"PDA-CMDB-001","metric":"rel_per_100_ci","op":"<","threshold":20,"unit":" per 100","severity":"Error","kind":"Issue","title":"Few or no CI relationships","why":"The load doesn't create relationships, and the instance has no discovery tool to add them.","impact":"Nothing can show what an outage affects.","recommendation":"Define a minimal relationship model (e.g. Located in / Powers / Feeds)","steps":["Define a minimal relationship model (e.g. Located in / Powers / Feeds)","Create the relationships in the IRE payload"],"where":"cmdb_rel_ci count vs cmdb_ci count","rc":"IMPORT","patterns":["P05","P14"],"pack":"CMDB & CSDM","stage":"Relationships","type":"Integrity","effort":[16,24,40],"phase":2,"role":"Architect / Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-18","collector":"PDA-CMDB-001","metric":"ci_class_no_asset_pct","op":">","threshold":10,"unit":"%","severity":"Warning","kind":"Issue","title":"CIs with no linked asset","why":"The CIs were created separately from the asset load.","impact":"These CIs carry no financial or lifecycle data.","recommendation":"Match CIs to assets on serial number or asset tag","steps":["Match CIs to assets on serial number or asset tag","Link them, or retire CIs that don't match"],"where":"the configured CI class.asset is empty","rc":"IMPORT","patterns":["P05","P06"],"pack":"CMDB & CSDM","stage":"Lifecycle","type":"Integrity","effort":[8,12,20],"phase":3,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-12","collector":"PDA-CMDB-001","metric":"ci_class_name_dup_clusters","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Duplicate CI names","why":"The load has no identification rule, so reloads create duplicates.","impact":"Users may select the wrong CI.","recommendation":"Define identification rules for the class","steps":["Define identification rules for the class","Merge or retire duplicates after the IRE load"],"where":"the configured CI class: names used more than once","rc":"HYGIENE","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Identification","type":"Data","effort":[8,12,24],"phase":3,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CM-19","collector":"PDA-CMDB-001","metric":"stale_ci_pct","op":">","threshold":10,"unit":"%","severity":"Info","kind":"Issue","title":"CIs not updated in 12 months","why":"Nothing keeps these CIs current, so no source is refreshing them.","impact":"Operational CIs may be out of date.","recommendation":"Set up a regular certification or refresh from the source register","steps":["Set up a regular certification or refresh from the source register"],"where":"cmdb_ci.sys_updated_on older than 365 days","rc":"HYGIENE","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Health","type":"Data","effort":[4,8,12],"phase":4,"role":"BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"CM-16","collector":"PDA-CMDB-001","metric":"orphan_rel","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Orphaned CI relationships","why":"CIs were deleted without their relationships being cleaned up.","impact":"Broken relationships distort dependency views.","recommendation":"Delete the orphaned relationships with a logged fix script","steps":["Delete the orphaned relationships with a logged fix script"],"where":"cmdb_rel_ci parent or child is empty","rc":"HYGIENE","patterns":["P05"],"pack":"CMDB & CSDM","stage":"Relationships","type":"Integrity","effort":[2,3,6],"phase":1,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"IT-01","collector":"PDA-SVC-001","metric":"site_in_text_pct","op":">","threshold":10,"unit":"%","severity":"Error","kind":"Issue","title":"Site names typed into the short description","why":"Location isn't available on the form, so users work around it with free text.","impact":"The site is held in free text that can't be filtered or reported.","recommendation":"Add location to the Incident and Change form views","steps":["Add location to the Incident and Change form views","Fill it from the CI","Make it mandatory with a UI Policy"],"where":"task.short_description contains site names (last 90 days)","rc":"FORM","patterns":["P02","P04"],"pack":"ITSM","stage":"","type":"Behaviour","effort":[6,10,16],"phase":2,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"IT-02","collector":"PDA-SVC-001","metric":"form_location_missing","op":"==","threshold":1,"unit":"","severity":"Error","kind":"Issue","title":"Location missing from the Incident or Change form","why":"The default layouts were never adjusted.","impact":"Users can't record the location where it is needed.","recommendation":"Update the form layouts in an update set","steps":["Update the form layouts in an update set","Check the workspace form views too"],"where":"sys_ui_element: element location on incident / change_request sections","rc":"FORM","patterns":["P02"],"pack":"ITSM","stage":"","type":"Design","effort":[2,4,6],"phase":2,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"IT-03","collector":"PDA-SVC-001","metric":"change_no_ci_pct","op":">","threshold":20,"unit":"%","severity":"Error","kind":"Issue","title":"Changes raised with no CI","why":"The right CIs don't exist, so users can't select them.","impact":"There is no conflict detection or impact assessment for these changes.","recommendation":"Once CIs exist, make the CI mandatory on normal and standard changes","steps":["Once CIs exist, make the CI mandatory on normal and standard changes","Add CI to change templates"],"where":"change_request.cmdb_ci is empty (last 90 days)","rc":"IMPORT","patterns":["P05","P14"],"pack":"ITSM","stage":"","type":"Integrity","effort":[4,6,10],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"IT-04","collector":"PDA-SVC-001","metric":"reassign_gt3_pct","op":">","threshold":5,"unit":"%","severity":"Warning","kind":"Issue","title":"Incidents reassigned more than three times","why":"Assignment rules or categories don't send work to the right team first time.","impact":"Incidents bounce between teams, delaying resolution.","recommendation":"Analyse the reassignment paths","steps":["Analyse the reassignment paths","Tune assignment rules and categories"],"where":"incident.reassignment_count > 3 (last 90 days)","rc":"PROCESS","patterns":["P25","P01"],"pack":"ITSM","stage":"","type":"Behaviour","effort":[8,12,20],"phase":4,"role":"BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CS-01","collector":"PDA-SVC-001","metric":"case_no_asset_pct","op":">","threshold":30,"unit":"%","severity":"Warning","kind":"Issue","title":"Cases with no asset","why":"Assets aren't linked to accounts or install base, so agents can't pick them.","impact":"Cases can't be tied to customer equipment.","recommendation":"Link assets to customer accounts","steps":["Link assets to customer accounts","Show asset and install base on the case form"],"where":"sn_customerservice_case.asset is empty (last 90 days)","rc":"IMPORT","patterns":["P15","P06"],"pack":"Customer Service","stage":"","type":"Integrity","effort":[8,12,20],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"CS-02","collector":"PDA-SVC-001","metric":"case_no_account","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Cases with no account","why":"Cases are created through a channel that doesn't set the account.","impact":"Cases can't be reported by customer.","recommendation":"Find the channel creating these cases","steps":["Find the channel creating these cases","Default the account from the contact"],"where":"sn_customerservice_case.account is empty (last 90 days)","rc":"PROCESS","patterns":["P15","P04"],"pack":"Customer Service","stage":"","type":"Data","effort":[2,4,8],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PL-01","collector":"PDA-PLAT-001","metric":"br_current_update","op":">","threshold":0,"unit":"","severity":"Error","kind":"Issue","title":"Business rules calling current.update()","why":"The logic was written as an after rule instead of a before rule.","impact":"Recursive and double updates slow the platform.","recommendation":"Convert to before rules or use setWorkflow(false) with a documented reason","steps":["Convert to before rules or use setWorkflow(false) with a documented reason","Retest the affected processes"],"where":"sys_script active, script contains current.update()","rc":"SCRIPT","patterns":["P07","P08"],"pack":"Platform","stage":"","type":"Design","effort":[4,8,16],"phase":1,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PL-02","collector":"PDA-PLAT-001","metric":"client_gliderecord","op":">","threshold":0,"unit":"","severity":"Warning","kind":"Issue","title":"Client scripts querying with GlideRecord","why":"Server lookups were written in the browser.","impact":"Forms load slowly.","recommendation":"Replace with GlideAjax and a client-callable Script Include","steps":["Replace with GlideAjax and a client-callable Script Include"],"where":"sys_script_client active, script contains new GlideRecord","rc":"SCRIPT","patterns":["P07","P08"],"pack":"Platform","stage":"","type":"Design","effort":[4,6,12],"phase":4,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PL-03","collector":"PDA-PLAT-001","metric":"stale_update_sets","op":">","threshold":0,"unit":"","severity":"Info","kind":"Issue","title":"Update sets in progress for more than 90 days","why":"Work was started and never completed or promoted.","impact":"Partial promotion and lost changes are likely.","recommendation":"Review each one with its owner","steps":["Review each one with its owner","Complete, merge or mark it ignored"],"where":"sys_update_set state = in progress, created > 90 days ago","rc":"GOVERNANCE","patterns":["P07","P11"],"pack":"Platform","stage":"","type":"Design","effort":[2,4,6],"phase":1,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PL-04","collector":"PDA-PLAT-001","metric":"syslog_errors_7d","op":">","threshold":200,"unit":"","severity":"Warning","kind":"Issue","title":"High volume of script errors","why":"Scripts are failing at runtime and nobody is monitoring them.","impact":"Scripts are failing at runtime.","recommendation":"Group the errors by source","steps":["Group the errors by source","Fix the top 10 sources"],"where":"syslog level = error, last 7 days","rc":"SCRIPT","patterns":["P08","P14"],"pack":"Platform","stage":"","type":"Behaviour","effort":[6,10,20],"phase":1,"role":"Developer","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Medium"},{"id":"PL-05","collector":"PDA-PLAT-001","metric":"groups_no_members","op":">","threshold":0,"unit":"","severity":"Info","kind":"Issue","title":"Active groups with no members","why":"Groups were created and never staffed, or their members left.","impact":"Work can be assigned to groups nobody watches.","recommendation":"Deactivate the groups or add members","steps":["Deactivate the groups or add members","Check assignment rules that point to them"],"where":"sys_user_group active with no sys_user_grmember","rc":"PROCESS","patterns":["P25"],"pack":"Platform","stage":"","type":"Data","effort":[2,3,6],"phase":1,"role":"BA","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"},{"id":"PL-06","collector":"PDA-RISK-001","metric":"custom_tables","op":">","threshold":0,"unit":"","severity":"Info","kind":"Opportunity","title":"Custom tables to review against entitlement","why":"Custom tables may count toward the subscription's custom table allowance.","impact":"Custom tables may count against the custom table entitlement.","recommendation":"Compare against the subscription entitlement","steps":["Compare against the subscription entitlement","Consider moving to out-of-box tables"],"where":"sys_db_object name starts with u_ or x_","rc":"GOVERNANCE","patterns":["P07","P23"],"pack":"Platform","stage":"","type":"Improvement","effort":[2,4,8],"phase":0,"role":"Architect","confidence":"Measured","requiresAnswer":"","solutionType":"Configuration","complexity":"Small"}];
const PDA_PATTERNS = [{"id":"P01","name":"Fragmented tools and siloed service teams","rc":"FRAGMENT","sev":"high","effort":[40,80,160],"phase":2,"symptoms":"Several service desks, portals or ticketing tools; each team runs its own process; users don't know where to ask.","questions":[{"q":"Do different teams or regions run separate service tools or ticketing systems?","f":"Separate service tools are in use across teams or regions"},{"q":"Do users have more than one place to raise requests or get help?","f":"Users have more than one place to get help"}],"solution":["Consolidate onto one ServiceNow instance with Enterprise Service Management (IT, HR, facilities, customer) on shared task, catalogue and portal foundations","One Employee Center or Service Portal as the front door, with routing by service and topic","Standard assignment groups, SLAs and categories using a shared taxonomy"],"architecture":["One instance, domain separation only where legally required","Shared data model (CSDM) and shared catalogue taxonomy before migrating teams","Wave-based onboarding: prove value in IT first, then expand"],"licensing":"Each workflow (ITSM, HRSD, CSM, FSM) is licensed separately. Confirm the entitlement for every team being onboarded.","pack":"ITSM","checks":["PK-05","IT-04"]},{"id":"P02","name":"Manual, email and spreadsheet processes","rc":"MANUAL","sev":"medium","effort":[24,40,80],"phase":2,"symptoms":"Work arrives by email or phone, is tracked in spreadsheets, and is re-keyed between systems.","questions":[{"q":"Is a significant share of work still requested or tracked by email or spreadsheet?","f":"Work is still requested or tracked by email or spreadsheet"},{"q":"Are there paper forms or whiteboards in any service process?","f":"Paper forms or whiteboards are still part of service processes"}],"solution":["Replace email intake with catalogue items and record producers","Flow Designer for approvals and fulfilment steps","Inbound email actions only as a fallback, with parsing into structured fields"],"architecture":["Model each request as a catalogue item with variables that map to reportable fields","Use Flow Designer, not legacy Workflow, for new automation","Measure the channel mix (contact type) before and after"],"licensing":"Core platform and ITSM. Flow Designer is included; IntegrationHub spokes may need an additional subscription.","pack":"ITSM","checks":["IT-06","IT-09","CS-03","IT-01","IT-02"]},{"id":"P03","name":"Weak self-service, catalogue and knowledge","rc":"SELFSERVICE","sev":"medium","effort":[24,48,96],"phase":4,"symptoms":"Low portal use, out-of-date knowledge, a cluttered catalogue, and repeat calls for simple requests.","questions":[{"q":"Do most users call or email rather than use the portal?","f":"Users bypass the portal and call or email instead"},{"q":"Is knowledge content out of date or hard to find?","f":"Knowledge content is out of date or hard to find"}],"solution":["Employee Center (or Service Portal) with a curated catalogue and taxonomy","Knowledge Management with ownership, review dates and feedback","Virtual Agent for top request types; search tuned with AI Search where licensed"],"architecture":["Keep catalogue categories shallow and user-worded","Set knowledge review cycles (valid-to dates) and owners per knowledge base","Track self-service share as the primary KPI"],"licensing":"Employee Center Pro, AI Search and advanced Virtual Agent features depend on the Pro or Enterprise tier. Confirm before designing around them.","pack":"Portal & Knowledge","checks":["IT-05","PK-01","PK-02","PK-03","PK-05","AI-02"]},{"id":"P04","name":"No single view, poor reporting and insight","rc":"INSIGHT","sev":"medium","effort":[16,32,64],"phase":4,"symptoms":"Leaders can't trust reports, figures are compiled by hand, and there is no single source of truth.","questions":[{"q":"Are management reports assembled manually outside ServiceNow?","f":"Management reports are compiled manually outside the platform"},{"q":"Do leaders dispute the accuracy of ServiceNow reports?","f":"Leaders do not trust ServiceNow reporting"}],"solution":["Platform Analytics / Performance Analytics dashboards on agreed KPIs","Fix the data at source first (mandatory fields, reference data)","Data quality checks scheduled with owners"],"architecture":["Define each KPI with a formula and owner before building dashboards","Report from reference fields, never free text","Keep dashboard filters visible so conditions are transparent"],"licensing":"Performance Analytics indicator counts and advanced features depend on the tier. Confirm before committing.","pack":"Platform","checks":["CM-17","CM-20","CM-21","CM-26","HR-01","IN-02","AM-03","AM-07","IT-01","CS-02"]},{"id":"P05","name":"CMDB inaccurate or no service visibility","rc":"CMDB_GOV","sev":"high","effort":[40,80,160],"phase":2,"symptoms":"CIs are missing, duplicated or out of date; impact analysis is not trusted; there is no link from services to infrastructure.","questions":[{"q":"Do teams distrust or avoid using the CMDB?","f":"Teams distrust or avoid the CMDB"},{"q":"Is it hard to see which services an outage affects?","f":"Service impact of outages cannot be determined"}],"solution":["CSDM-aligned model with identification and reconciliation rules (IRE)","Automated population via Discovery or Service Graph Connectors where licensed, or governed imports through IRE where not","CMDB Health, data certification and class owners"],"architecture":["Design the class model and CSDM domains before loading","Every load through IRE with a named data source","Minimal classes, with granularity carried by model and category"],"licensing":"Discovery, Service Mapping and most Service Graph Connectors need ITOM. Without ITOM, use governed IRE imports.","pack":"CMDB & CSDM","checks":["CM-01","CM-02","CM-03","CM-04","CM-05","CM-06","CM-07","CM-08","CM-09","CM-13","CM-14","CM-17","CM-20","CM-21","CM-22","CM-23","CM-24","CM-25","CM-27","CM-28","OM-04","OM-05","OM-06","OT-02","AM-01","AM-02","CM-11","CM-15","CM-18","CM-12","CM-19","CM-16","IT-03"]},{"id":"P06","name":"Asset and licence visibility and cost","rc":"ASSET","sev":"medium","effort":[24,48,96],"phase":3,"symptoms":"No reliable register of hardware or software, warranty and contract dates are missed, and licence spend is not optimised.","questions":[{"q":"Is there a single trusted register of hardware and software assets?","f":"There is no single trusted asset register"},{"q":"Have audits or renewals been missed because of poor asset data?","f":"Audits or renewals have been missed because of poor asset data"}],"solution":["Hardware Asset Management lifecycle (request → receive → deploy → retire) linked to CIs","Software Asset Management normalisation, reconciliation and reclamation","Contract and warranty tracking with expiry notifications"],"architecture":["Model categories drive asset class and CI class creation","Asset-to-CI synchronisation both ways","Start with top-spend publishers for SAM"],"licensing":"HAM and SAM are separate subscriptions. Core asset tables exist without them, but lifecycle automation and normalisation do not.","pack":"Asset Management","checks":["CM-05","AM-08","AM-09","AM-01","AM-03","AM-04","AM-05","AM-06","CM-18","CS-01"]},{"id":"P07","name":"Heavy customisation, technical debt and upgrade pain","rc":"DEBT","sev":"high","effort":[40,80,200],"phase":1,"symptoms":"Upgrades are slow and risky, many skipped records, legacy workflows, custom tables and fields everywhere.","questions":[{"q":"Do upgrades take more than a few weeks or get deferred?","f":"Upgrades are slow or regularly deferred"},{"q":"Has the platform been heavily customised away from out-of-box?","f":"The platform is heavily customised"}],"solution":["Instance Scan and upgrade skipped-record review to size the debt","Revert to out-of-box where the business need allows; refactor the rest to supported patterns","Migrate legacy Workflow to Flow Designer"],"architecture":["Customisation decision log (keep, refactor, revert)","Automated Test Framework coverage before large upgrades","Scoped apps for genuine custom needs"],"licensing":"Instance Scan and ATF are platform features. Confirm any HealthScan entitlement with ServiceNow.","pack":"Platform","checks":["CM-06","CM-07","CM-08","CM-09","PK-04","IN-04","AI-01","PL-09","PL-11","PL-12","AE-01","PL-01","PL-02","PL-03","PL-06"]},{"id":"P08","name":"Slow platform performance","rc":"PERF","sev":"medium","effort":[16,32,64],"phase":1,"symptoms":"Slow forms and lists, timeouts, heavy scheduled jobs.","questions":[{"q":"Do users complain that forms or lists are slow?","f":"Users report slow forms or lists"}],"solution":["Transaction and slow-query log analysis","Refactor synchronous scripts (GlideAjax, before rules), add indexes via ServiceNow support","Rationalise scheduled jobs and data retention (archive and table cleaner rules)"],"architecture":["Performance budgets per form","Archive rules for high-volume tables","Monitor after each release"],"licensing":"Platform capability, no additional licence.","pack":"Platform","checks":["PL-08","PL-11","PL-01","PL-02","PL-04"]},{"id":"P09","name":"Integration complexity","rc":"INTEGRATION","sev":"high","effort":[24,56,120],"phase":2,"symptoms":"Brittle point-to-point integrations, failed imports, data out of sync with ERP, HR or CRM systems.","questions":[{"q":"Do integrations fail or need manual reruns?","f":"Integrations fail or need manual reruns"},{"q":"Is data regularly out of sync with ERP, HR or CRM systems?","f":"Data is out of sync with connected systems"}],"solution":["IntegrationHub spokes and Service Graph Connectors instead of custom code","Standard error handling, retry and alerting for every integration","Integration catalogue with owners"],"architecture":["One pattern per integration type (event, bulk, lookup)","Authentication through connection and credential aliases","All CI data through IRE"],"licensing":"IntegrationHub spoke packs and transaction volumes are licensed. Confirm before choosing spokes.","pack":"Integrations","checks":["CM-03","OM-01","IN-01","IN-02","IN-03","IN-04","CM-27","IN-05","AM-02"]},{"id":"P10","name":"Security exposure and slow threat response","rc":"SECURITY","sev":"critical","effort":[24,56,120],"phase":1,"symptoms":"Vulnerability backlog grows, security incidents are handled outside the platform, too many admins.","questions":[{"q":"Are vulnerabilities tracked outside ServiceNow or left open past their SLA?","f":"Vulnerabilities are tracked outside the platform or breach their SLA"},{"q":"Is admin access broadly granted?","f":"Admin access is broadly granted"}],"solution":["Vulnerability Response linked to the CMDB for owner-based remediation","Security Incident Response playbooks","Least-privilege roles, instance security hardening and MFA"],"architecture":["Remediation groups assigned from CI support group","SLAs by risk score","Quarterly access recertification"],"licensing":"Security Operations (VR, SIR) is a separate subscription. Instance hardening is platform capability.","pack":"Security Operations","checks":["SO-01","SO-02","PL-07","PL-13","OT-03"]},{"id":"P11","name":"Compliance, risk and audit pressure","rc":"GOV_RISK","sev":"high","effort":[40,80,160],"phase":2,"symptoms":"Controls and evidence live in spreadsheets, audit findings recur, regulatory changes are hard to track.","questions":[{"q":"Are controls, risks or audit evidence managed in spreadsheets?","f":"Controls and audit evidence are managed in spreadsheets"},{"q":"Have audits raised findings about IT or service processes?","f":"Audits have raised findings about service processes"}],"solution":["Integrated Risk Management: Policy and Compliance, Risk, and Audit","Continuous control monitoring from platform data","Third-party risk where suppliers are in scope"],"architecture":["Start with one authority document and its controls","Link controls to CIs and business services","Automated evidence collection from ServiceNow data"],"licensing":"IRM applications are separate subscriptions. Confirm which ones are held.","pack":"IRM & Risk","checks":["PL-07","RM-01","RM-02","PL-13","AG-01","AM-07","PL-03"]},{"id":"P12","name":"Low adoption and change resistance","rc":"ADOPTION","sev":"medium","effort":[16,32,64],"phase":4,"symptoms":"Licences are unused, users work around the platform, training is not landing.","questions":[{"q":"Are licensed users not using the platform regularly?","f":"Licensed users are not using the platform regularly"},{"q":"Has previous rollout or training struggled to change behaviour?","f":"Previous rollouts struggled with adoption"}],"solution":["Role-based training and in-product guidance (Guided Tours)","Simplified forms and workspaces for each persona","Adoption metrics reviewed monthly"],"architecture":["Design with the user, test with the user","Remove fields and steps that add no value","Communications plan per release"],"licensing":"Platform capability.","pack":"Platform","checks":["IT-05","PK-02","PL-10"]},{"id":"P13","name":"Legacy tool replacement and lock-in exit","rc":"LEGACY","sev":"high","effort":[80,160,320],"phase":2,"symptoms":"An end-of-life tool, rising licence costs, or a forced exit from a data centre or vendor.","questions":[{"q":"Is a legacy tool being replaced or reaching end of support?","f":"A legacy tool is being replaced or reaching end of support"},{"q":"Is there a hard deadline for exiting a contract or data centre?","f":"There is a hard exit deadline"}],"solution":["Out-of-box-first migration with a data migration plan (what to bring, what to archive)","Parallel run and cut-over plan","Decommission checklist for the old tool"],"architecture":["Do not replicate the old tool's customisations","Migrate open records only; archive history","Map old categories to the new taxonomy"],"licensing":"Depends on the replaced scope. Align with the target ServiceNow subscriptions.","pack":"Integrations","checks":["IN-05"]},{"id":"P14","name":"Outages, resilience and operational monitoring","rc":"OPS","sev":"high","effort":[40,80,160],"phase":2,"symptoms":"Outages found by users first, major incidents managed by phone, noisy or missing monitoring.","questions":[{"q":"Do users usually report outages before IT knows about them?","f":"Users detect outages before IT"},{"q":"Is major incident handling run outside the platform?","f":"Major incidents are managed outside the platform"}],"solution":["Major Incident Management with communication plans","Event Management and AIOps alert correlation where licensed","Service-based dashboards linked to the CMDB"],"architecture":["Monitoring tools send events, not tickets","Alert → incident rules based on CI and service","Post-incident review as a problem record"],"licensing":"Event Management and AIOps need ITOM Health. Major Incident Management is part of ITSM.","pack":"ITOM & Discovery","checks":["CM-25","IT-08","AM-08","OM-01","OM-02","OM-03","IN-03","OM-04","OM-05","CM-15","IT-03","PL-04"]},{"id":"P15","name":"Customer service and case handling","rc":"EXPERIENCE","sev":"medium","effort":[40,80,160],"phase":2,"symptoms":"Agents lack a single customer view, cases are handled by email, customers repeat themselves.","questions":[{"q":"Do agents switch between several systems to handle one customer case?","f":"Agents switch between systems to handle a case"},{"q":"Are most customer cases handled by email?","f":"Most customer cases are handled by email"}],"solution":["Customer Service Management with accounts, contacts, install base and assets","Omnichannel intake (portal, chat, email) into one case","Agent Workspace with playbooks"],"architecture":["Account and asset model first","Case types and playbooks per service","Link cases to products and CIs for proactive service"],"licensing":"CSM is a separate subscription. Some channels and AI features depend on the tier.","pack":"Customer Service","checks":["CS-03","CS-01","CS-02"]},{"id":"P16","name":"Employee and HR experience","rc":"EXPERIENCE","sev":"medium","effort":[40,80,160],"phase":2,"symptoms":"HR queries by email, inconsistent onboarding, employees don't know where to go.","questions":[{"q":"Are HR queries mostly handled by email or phone?","f":"HR queries are handled by email or phone"},{"q":"Does onboarding involve many manual hand-offs between teams?","f":"Onboarding relies on manual hand-offs"}],"solution":["HR Service Delivery with HR services, case management and knowledge","Lifecycle events (onboarding, offboarding) orchestrated across HR, IT and facilities","Employee Center as the single front door"],"architecture":["HR services defined before building","Sensitive data protected with HR-specific roles and encryption where required","Integration with the HR system of record"],"licensing":"HRSD is a separate subscription. Lifecycle events and Employee Center Pro depend on the tier.","pack":"HR Service Delivery","checks":["HR-01","HR-02"]},{"id":"P17","name":"Field service and dispatch","rc":"EXPERIENCE","sev":"medium","effort":[40,80,160],"phase":2,"symptoms":"Low first-visit fix rate, manual dispatch, technicians without mobile access.","questions":[{"q":"Are field technicians dispatched manually or without mobile access?","f":"Field work is dispatched manually or without mobile access"}],"solution":["Field Service Management with work orders, scheduling and the mobile app","Parts and skills matching","Link work orders to assets and CIs"],"architecture":["Territories and skills modelled first","Mobile offline requirements agreed early","Asset data quality as a prerequisite"],"licensing":"FSM is a separate subscription.","pack":"Customer Service","checks":["CS-04"]},{"id":"P18","name":"Portfolio, demand and project visibility","rc":"PORTFOLIO","sev":"medium","effort":[24,48,96],"phase":4,"symptoms":"Demand arrives through many routes, projects run late without visibility, investment decisions lack data.","questions":[{"q":"Is there a single intake and prioritisation process for new demand?","f":"There is no single demand intake and prioritisation process"},{"q":"Do leaders lack a live view of project status and resourcing?","f":"Leaders lack a live view of projects and resources"}],"solution":["Strategic Portfolio Management: demand, project, resource and portfolio planning","Prioritisation scoring and stage gates","Portfolio dashboards"],"architecture":["Start with demand intake and project tracking before resource management","Standard stage gates","Link projects to business applications and services"],"licensing":"SPM is a separate subscription.","pack":"Strategic Portfolio","checks":["SP-01","SP-02","SP-03"]},{"id":"P19","name":"Automation and AI opportunity","rc":"CAPABILITY","sev":"opportunity","effort":[16,40,80],"phase":4,"symptoms":"Repetitive manual triage, no virtual agent, no predictive categorisation or routing.","questions":[{"q":"Do agents spend significant time categorising and routing work by hand?","f":"Agents categorise and route work manually"},{"q":"Is there appetite to use AI but no governance for it yet?","f":"AI is wanted but governance is not in place"}],"solution":["Predictive Intelligence for categorisation and assignment","Virtual Agent for top intents","Now Assist capabilities (summarisation, search) where licensed, with an AI governance model"],"architecture":["Clean historical data before training models","Start with high-volume, low-risk use cases","AI governance: data, quality and human review"],"licensing":"Now Assist and some AI features need Pro Plus or equivalent SKUs. Confirm entitlement before scoping.","pack":"AI & Automation","checks":["AI-01","AI-02","AI-03","AG-01","AG-02"]},{"id":"P20","name":"Operating model, capacity and platform support","rc":"OPMODEL","sev":"medium","effort":[16,32,64],"phase":0,"symptoms":"No platform owner, a small or stretched team, no roadmap, backlog grows.","questions":[{"q":"Is there a named platform owner and governance board?","f":"There is no named platform owner or governance board"},{"q":"Does the team lack capacity to keep up with upgrades and demand?","f":"The platform team lacks capacity"}],"solution":["Platform governance: owner, design authority, demand intake","Roadmap and release cadence aligned to upgrades","Managed service or centre of excellence where capacity is short"],"architecture":["Two upgrades a year as the baseline","Definition of done includes ATF and documentation","Quarterly health scans with this workbench"],"licensing":"No licence impact.","pack":"Platform","checks":["CM-14"]},{"id":"P21","name":"Procurement, finance and spend control","rc":"SPEND","sev":"medium","effort":[40,80,160],"phase":4,"symptoms":"Purchasing via email and spreadsheets, poor spend visibility, slow approvals.","questions":[{"q":"Are purchase requests and approvals handled outside the platform?","f":"Purchasing and approvals are handled outside the platform"}],"solution":["Source-to-Pay / procurement workflows integrated with ERP","Catalogue-driven purchasing with approvals","Spend and cost-allocation reporting"],"architecture":["ERP remains the financial system of record","Integrate, don't duplicate","Approval rules held in decision tables"],"licensing":"Source-to-Pay Operations and related finance workflows are separate subscriptions.","pack":"Platform","checks":["IT-09"]},{"id":"P22","name":"Public sector and citizen services","rc":"EXPERIENCE","sev":"medium","effort":[40,80,160],"phase":2,"symptoms":"Citizen requests handled on paper or legacy case systems, strict security and residency needs.","questions":[{"q":"Are citizen or constituent services delivered through legacy or paper-based systems?","f":"Citizen services run on legacy or paper-based systems"}],"solution":["Public Sector Digital Services or CSM for citizen case management","Low-code apps with App Engine for agency-specific processes","Security classification and data residency controls"],"architecture":["Confirm hosting and classification (e.g. IRAP PROTECTED) requirements up front","Reuse common case patterns across agencies","Accessible portal design"],"licensing":"Public sector products and hosting options vary by region. Confirm with ServiceNow.","pack":"Platform","checks":["AE-01","PL-13","ID-01"]},{"id":"P23","name":"Under-used licensed capability","rc":"CAPABILITY","sev":"opportunity","effort":[8,16,32],"phase":0,"symptoms":"Licensed modules are unused while separate tools are paid for.","questions":[{"q":"Are there licensed ServiceNow modules that are not in use?","f":"Licensed modules are not in use"},{"q":"Are separate tools paid for that duplicate ServiceNow capability?","f":"Separate tools duplicate licensed ServiceNow capability"}],"solution":["Entitlement vs usage review (subscription management)","Retire duplicate tools where ServiceNow already covers the need","Roadmap to activate high-value licensed capability"],"architecture":["Usage evidence from the scan plus the entitlement list","Business case per retirement"],"licensing":"Uses the client's existing entitlement list. Confirm it with the account team.","pack":"Platform","checks":["AM-09","AI-02","AI-03","PL-10","OM-05","AG-02","WL-01","WL-02","ID-01","OT-01","PL-06"]},{"id":"P24","name":"Adjacent cloud, data and application work","rc":"ADJACENT","sev":"opportunity","effort":[8,16,32],"phase":0,"symptoms":"Cloud migrations, data platforms or custom apps that touch ServiceNow through integrations, CI data or operations.","questions":[{"q":"Are cloud, data platform or application changes planned that ServiceNow should track?","f":"Cloud, data or application changes are planned outside ServiceNow"}],"solution":["Record cloud resources and applications in the CMDB (Service Graph Connectors or IRE imports)","Change and release integration with DevOps pipelines","Operational hand-over into ITSM and ITOM"],"architecture":["ServiceNow as the system of action, not the build platform","Tag cloud resources to business applications"],"licensing":"Cloud discovery and DevOps Change Velocity may need ITOM or ITSM Pro. Confirm.","pack":"ITOM & Discovery","checks":["OM-06"]},{"id":"P25","name":"Service management maturity uplift","rc":"PROCESS","sev":"medium","effort":[24,56,120],"phase":2,"symptoms":"Processes are inconsistent, problem management is weak, frequent reassignments.","questions":[{"q":"Are incident, problem and change processes inconsistent between teams?","f":"Service processes are inconsistent between teams"},{"q":"Is problem management rarely used to remove repeat incidents?","f":"Problem management is rarely used"}],"solution":["ITIL 4-aligned ITSM on out-of-box process flows","Problem management with known errors","Assignment rules, SLAs and continual improvement"],"architecture":["Adopt out-of-box state models","One process owner per practice","Measure repeat incidents and reassignment"],"licensing":"ITSM. Pro features (e.g. Predictive Intelligence, Performance Analytics content) depend on the tier.","pack":"ITSM","checks":["IT-07","IT-04","PL-05"]},{"id":"P26","name":"Rapid custom workflow and app needs","rc":"GOVERNANCE","sev":"opportunity","effort":[16,40,80],"phase":4,"symptoms":"An urgent business process with no product fit, and citizen developers building apps without guardrails.","questions":[{"q":"Are there business processes with no suitable product that need a custom app?","f":"Business processes need a custom app"},{"q":"Do people build apps on the platform without governance?","f":"Apps are built without governance"}],"solution":["App Engine Studio with templates","App Engine Management Center for pipeline and governance","Scoped applications with reusable components"],"architecture":["Check existing products first","Guardrails: scoped apps, review board, ATF","Reuse table and flow patterns"],"licensing":"App Engine custom table limits and creator entitlements apply. Confirm them.","pack":"Platform","checks":["AE-01"]},{"id":"P27","name":"AI governance and responsible use","rc":"AIGOV","sev":"high","effort":[16,32,64],"phase":1,"symptoms":"AI skills and agents are switched on without an owner, policy, data controls or quality review.","questions":[{"q":"Are Now Assist skills or AI agents active without an agreed AI policy?","f":"AI capabilities are active without an agreed policy"},{"q":"Is anyone accountable for reviewing AI output quality and data use?","f":"Nobody is accountable for AI quality and data use"}],"solution":["AI Control Tower (where licensed) as the register of AI assets, owners and risks","Now Assist Admin console governance: skill activation by role and data filtering","Link AI risks to IRM controls"],"architecture":["Register every skill and agent with an owner and purpose","Human review for customer-facing output","Measure quality and usage before widening access"],"licensing":"Now Assist and AI Control Tower are separate SKUs. Confirm entitlement.","pack":"AI & Automation","checks":["AG-01"]},{"id":"P28","name":"Workplace, legal and specialist service delivery","rc":"EXPERIENCE","sev":"medium","effort":[24,56,120],"phase":2,"symptoms":"Facilities, space bookings, legal requests or contracts run on email and spreadsheets outside the service platform.","questions":[{"q":"Are facilities, space or workplace requests handled outside ServiceNow?","f":"Workplace requests are handled outside the platform"},{"q":"Do legal or contract requests arrive by email with no tracking?","f":"Legal and contract requests are untracked"}],"solution":["Workplace Service Delivery: case, reservation and space management with maps","Legal Service Delivery: legal request intake, matter management and contract workflows","Shared Employee Center front door"],"architecture":["Location hierarchy (cmn_location) cleaned first","Reuse the enterprise catalogue and knowledge taxonomy","Restrict legal data with scoped roles"],"licensing":"WSD and LSD are separate subscriptions. Confirm which modules are held.","pack":"Workplace & Legal","checks":["WL-01","WL-02"]},{"id":"P29","name":"Operational technology visibility","rc":"OTVIS","sev":"high","effort":[40,80,160],"phase":2,"symptoms":"Plant and industrial devices are invisible to IT, with no owners, vulnerabilities or change control on OT assets.","questions":[{"q":"Are industrial or OT devices tracked outside the CMDB?","f":"OT devices are tracked outside the CMDB"},{"q":"Are OT vulnerabilities and changes managed separately from IT?","f":"OT vulnerabilities and changes are managed separately"}],"solution":["Operational Technology Management with OT CI classes and ISA-95 equipment model","OT discovery partner integrations (Service Graph Connectors)","OT Vulnerability and Change management where licensed"],"architecture":["Purdue level recorded for every OT device","Equipment model entities linked to OT devices","Segregated roles for plant operators"],"licensing":"OTM, OT Vulnerability Response and connectors are separate subscriptions. Confirm them.","pack":"Operational Technology","checks":["OT-01","OT-02","OT-03"]}];
const PDA_ROOT_CAUSES = {"IMPORT":{"title":"Data load built asset-first, with no CI rule","why":"The import set and transform map write to the asset table only. Without a CI transform or an Identification and Reconciliation Engine (IRE) call, assets never create or link to equipment CIs, and any CIs that do exist were created from a different key, such as a location or level.","fix":"Add a CI-first load: staging table → IRE (createOrUpdateCI) into the agreed CI class → link asset and CI both ways. Re-run it against the current register, then retire CIs named after locations.","benefit":"Equipment can be selected on Incident, Change and Case. Impact analysis and site-level reporting start working."},"FORM":{"title":"Forms not designed for a site-based operating model","why":"The default Incident and Change layouts were kept, so location is not visible. Users type the site into the short description, which cannot be filtered or reported on.","fix":"Add location and CI to the working form views, fill location from the CI where one is set, and make it mandatory with a UI Policy at the right state.","benefit":"CAB and operations can filter by site, and the free-text workaround stops."},"TAXONOMY":{"title":"Model and category structure built for a different purpose","why":"Product models and model categories were set up for another use and never reviewed for the equipment actually being managed.","fix":"Rationalise the product models and model categories, and map each category to one CI class and one asset class.","benefit":"Assets create CIs consistently and reporting is cleaner."},"GOVERNANCE":{"title":"Gaps in build governance and documentation","why":"Test data and long-open update sets remain in the instance, and design decisions (such as why fields were excluded) were not recorded.","fix":"Remove test data, close or merge stale update sets, and record design decisions in the As Built.","benefit":"Lower upgrade and audit risk, and every decision can be traced."},"SCRIPT":{"title":"Scripting patterns that cost performance","why":"Scripts use patterns ServiceNow advises against, such as current.update() in business rules and GlideRecord calls in client scripts.","fix":"Refactor to before business rules, GlideAjax and Script Includes. Add Instance Scan checks so the patterns do not come back.","benefit":"Faster forms, no recursive updates, safer upgrades."},"HYGIENE":{"title":"No ongoing CMDB housekeeping","why":"No controls are running for duplicate, stale or orphaned records, so quality degrades after each load.","fix":"Turn on CMDB Health checks and set an owner for each CI class. Confirm CMDB Data Manager entitlement before using it.","benefit":"A CMDB people can trust for impact analysis and reporting."},"PROCESS":{"title":"Gaps in process configuration","why":"Assignment, ownership and account data is not kept up to date, which causes repeated reassignment and records with no owner.","fix":"Review assignment rules, group membership and ownership fields with the process owners.","benefit":"Faster resolution and clear accountability."},"CMDB_GOV":{"title":"CMDB governance controls not in place","why":"Identification, reconciliation and ownership rules were never defined, so any load or user can create or overwrite CIs without control.","fix":"Define identification rules for every class in use and reconciliation rules for every data source, and set an owner and support group per class. Route all loads through IRE.","benefit":"Duplicates stop, the trusted source wins, and every CI has someone accountable."},"CLASS":{"title":"CI class model used incorrectly","why":"CIs sit in the base class, or in custom classes and fields that duplicate out-of-box ones. This usually happens when data is loaded before the class model is designed.","fix":"Map data to the out-of-box class hierarchy, reclassify base-class CIs, and retire custom classes and fields that aren't needed.","benefit":"Class-specific forms, rules and health checks work, and upgrades are simpler."},"CSDM":{"title":"CSDM foundations not implemented","why":"Business applications, services and service offerings haven't been modelled, so CIs can't be tied to what the business consumes.","fix":"Implement the CSDM Foundation and Crawl stages: business applications, service offerings and lifecycle fields. Link tasks to service offerings.","benefit":"Service-level reporting and impact analysis, and a clear path to the Walk and Run stages."},"CONSUME":{"title":"CMDB not used in day-to-day processes","why":"Forms and processes don't ask for a CI or service, so the CMDB isn't used where it adds value.","fix":"Make CI and service part of the Incident, Change and Problem forms and templates, and fill them in automatically where possible.","benefit":"Impact, trend and root cause reporting becomes possible."},"FRAGMENT":{"title":"Service delivery split across tools and teams","why":"Teams adopted their own tools and processes over time with no shared service model.","fix":"Consolidate onto shared ServiceNow foundations (catalogue, portal, taxonomy, CSDM) and onboard teams in waves.","benefit":"One front door and one set of data for every service team."},"MANUAL":{"title":"Work still runs through email and spreadsheets","why":"Intake and fulfilment were never modelled as structured requests.","fix":"Replace email and spreadsheet steps with catalogue items and Flow Designer automation.","benefit":"Less re-keying, faster fulfilment and reportable data."},"SELFSERVICE":{"title":"Self-service not designed or maintained","why":"The portal, catalogue and knowledge have no owners or review cycle.","fix":"Curate the catalogue, set knowledge ownership and review dates, and track self-service share.","benefit":"Fewer calls and emails, and faster answers for users."},"INSIGHT":{"title":"Reporting built on unreliable data","why":"Key data is captured as free text or not at all, so reports need manual work.","fix":"Fix data at source, define KPIs with owners, then build dashboards.","benefit":"Trusted, live reporting without manual compilation."},"ASSET":{"title":"Asset lifecycle not managed end to end","why":"Assets are loaded once and not maintained through their lifecycle.","fix":"Implement the asset lifecycle linked to CIs, contracts and warranties.","benefit":"Accurate registers, fewer missed renewals and lower spend."},"DEBT":{"title":"Accumulated customisation and legacy automation","why":"Custom builds and legacy workflows were added without a design authority.","fix":"Size the debt with Instance Scan, then revert, refactor or retain each item on a decision log.","benefit":"Faster, safer upgrades and lower run cost."},"PERF":{"title":"Platform load not managed","why":"Scripts, jobs and data growth have not been tuned or archived.","fix":"Analyse slow transactions and jobs, refactor scripts and apply archive rules.","benefit":"Faster forms and fewer timeouts."},"INTEGRATION":{"title":"Integrations without standard patterns","why":"Integrations were built point to point with no common error handling.","fix":"Move to IntegrationHub or connector patterns with monitoring and owners.","benefit":"Fewer failures and data that stays in sync."},"SECURITY":{"title":"Security operations not governed on the platform","why":"Vulnerabilities and access are not managed with owners and SLAs.","fix":"Link vulnerability remediation to CI ownership, harden the instance and recertify access.","benefit":"Lower exposure and faster remediation."},"GOV_RISK":{"title":"Risk and compliance managed outside the platform","why":"Controls and evidence live in documents and spreadsheets.","fix":"Implement IRM with controls linked to services and automated evidence.","benefit":"Audit-ready evidence and fewer repeat findings."},"ADOPTION":{"title":"Platform designed without the user","why":"Forms and journeys reflect system structure rather than user tasks.","fix":"Simplify persona journeys, train by role and measure adoption.","benefit":"Higher use of licences already paid for."},"LEGACY":{"title":"Dependence on a legacy tool","why":"An ageing or costly tool still carries core processes.","fix":"Migrate out-of-box first, bring open records only, and decommission the old tool.","benefit":"Lower cost and a supported, modern platform."},"OPS":{"title":"Operations not connected to service impact","why":"Monitoring, major incidents and the CMDB are not linked.","fix":"Connect events and major incidents to services and CIs.","benefit":"Faster detection and resolution of outages."},"EXPERIENCE":{"title":"Case handling not designed around the customer or employee","why":"Cases arrive through unstructured channels without a single view.","fix":"Implement the relevant workflow (CSM, HRSD, FSM, PSDS) with structured intake and workspaces.","benefit":"Faster resolution and a consistent experience."},"PORTFOLIO":{"title":"No governed demand and portfolio process","why":"Demand and projects are tracked in separate tools with no stage gates.","fix":"Implement SPM demand and project management with prioritisation.","benefit":"Visible pipeline and better investment decisions."},"CAPABILITY":{"title":"Licensed capability not used","why":"Features were licensed but never activated or adopted.","fix":"Compare entitlements with usage and activate high-value capability.","benefit":"More value from the existing subscription."},"OPMODEL":{"title":"No platform operating model","why":"Nobody owns the platform roadmap, design decisions or capacity.","fix":"Set up platform governance, a roadmap and the right support model.","benefit":"Sustainable delivery and fewer design faults."},"SPEND":{"title":"Purchasing and spend handled outside governed workflows","why":"Procurement relies on email and spreadsheets.","fix":"Implement catalogue-driven procurement integrated with ERP.","benefit":"Faster approvals and visible spend."},"AIGOV":{"title":"AI adopted without governance","why":"AI features were enabled before ownership, policy and review were agreed.","fix":"Register AI assets with owners, restrict activation by role, and link AI risks to controls.","benefit":"Safe, measurable AI value and audit-ready evidence."},"OTVIS":{"title":"Operational technology outside the service model","why":"OT assets were never brought into the CMDB with owners and relationships.","fix":"Model OT devices and equipment entities, populate them through connectors, and assign owners.","benefit":"Plant risk and change become visible and governed."},"ADJACENT":{"title":"Adjacent change not reflected in ServiceNow","why":"Cloud, data and app changes happen outside ServiceNow.","fix":"Bring resources and applications into the CMDB and connect DevOps change.","benefit":"Operations can support what is built."}};
const PDA_PHASES = [{"n":0,"name":"Discover & confirm","goal":"Confirm the likely causes with data owners and agree the target design."},{"n":1,"name":"Stabilise","goal":"Remove risk: test data, broken governance, harmful scripts."},{"n":2,"name":"Remediate design","goal":"Fix the design faults that create bad data."},{"n":3,"name":"Clean & backfill data","goal":"Correct existing records once the design stops the problem recurring."},{"n":4,"name":"Optimise & improve","goal":"Hygiene controls, process tuning and improvements."}];
const PDA_EXTRA_PACKS = [{"id":"Portal & Knowledge","label":"Portal & Knowledge","collectors":[]},{"id":"AI & Automation","label":"AI & Automation","collectors":[]},{"id":"Strategic Portfolio","label":"Strategic Portfolio","collectors":[]},{"id":"Workplace & Legal","label":"Workplace & Legal","collectors":[]},{"id":"Operational Technology","label":"Operational Technology","collectors":[]}];
const PDA_RUNBOOKS = [{"id":"RB-PDA-ALL","title":"Platform design assurance (full scan)","pack":"Platform","symptoms":["platform health check","design assurance","baseline","full assessment","everything","where do I start","new client"],"steps":["PDA-CMDB-001","PDA-ASSET-001","PDA-SVC-001","PDA-RISK-001","PDA-OPS-001","PDA-PLAT-001"],"guidance":"Run all six read-only collectors, CMDB first. Review each collector's CONFIG block before running. Paste every output here; the rule engine turns them into findings, root causes and a delivery plan."},{"id":"RB-PDA-A2CI","title":"Assets without CIs (asset-first load)","pack":"Asset Management","symptoms":["assets without cis","asset first","cannot select ci","import asset","transform map","equipment not in cmdb","location blank"],"steps":["PDA-ASSET-001","PDA-CMDB-001","PDA-SVC-001"],"guidance":"Confirm how assets are loaded, whether CIs are expected for their model categories, and whether users work around missing CIs and locations."},{"id":"RB-PDA-CSDM","title":"CSDM and service visibility","pack":"CMDB & CSDM","symptoms":["csdm","service offering","business application","impact analysis","which services","outage impact"],"steps":["PDA-CMDB-001","PDA-OPS-001","PDA-SVC-001"],"guidance":"Check CSDM foundations, relationships and discovery, then how incidents and changes reference CIs and services."},{"id":"RB-PDA-DEBT","title":"Technical debt and upgrade readiness","pack":"Platform","symptoms":["upgrade","technical debt","customisation","customization","skipped records","legacy workflow","slow instance"],"steps":["PDA-PLAT-001","PDA-RISK-001"],"guidance":"Size scripting and customisation debt, legacy automation, open update sets and performance pressure before planning the upgrade."},{"id":"RB-PDA-EXP","title":"Self-service and employee experience","pack":"Portal & Knowledge","symptoms":["self service","portal","knowledge","catalogue","catalog","email requests","hr cases","virtual agent"],"steps":["PDA-SVC-001"],"guidance":"Measure channel mix, knowledge freshness, catalogue structure and HR/customer case design."},{"id":"RB-PDA-GOV","title":"Security, risk and AI governance","pack":"Security Operations","symptoms":["security","hardening","admin access","audit","ai governance","now assist","controls"],"steps":["PDA-RISK-001","PDA-PLAT-001"],"guidance":"Check vulnerability ageing, admin access, hardening settings, GRC ownership and whether AI capabilities are governed."}];

// ================= Platform design assurance (PDA) extension =================
// Generated content (collectors, rules, patterns, root causes, packs, runbooks)
// comes from tools/pda/pda_catalog.json via tools/merge_pda_features.py.
// Adds: 6 read-only collectors, 99 declarative rules, a discovery workshop
// (53 questions across 29 problem patterns), a solution playbook, a
// root-cause-based delivery plan, a proposal generator and a guided journey.

SCRIPT_CATALOG.push(...PDA_COLLECTORS.map((collector) => ({
  id: collector.id,
  title: collector.title,
  file: `collectors/${collector.id}.js`,
  stage: collector.stage,
  description: collector.description,
  kind: "collector",
  pack: "pda",
  safety: "Read-only aggregate collection - field-validated, no personal data, emits one DIAG envelope",
  sourceUrl: `pda:${collector.id}`,
  module: collector.module,
})));
DIAG_RUNBOOKS.unshift(...PDA_RUNBOOKS);

const PDA_SEVERITY_WEIGHT = { Critical: 30, High: 20, Medium: 10, Low: 0 };
const PDA_PATTERN_SEVERITY = { critical: ["Critical", "P1"], high: ["High", "P2"], medium: ["Medium", "P3"], low: ["Low", "P4"], opportunity: ["Low", "P4"] };
const PDA_ANSWERS = [["yes", "Yes"], ["no", "No"], ["unknown", "Not sure"], ["na", "Not relevant"]];
const PDA_PATTERN_BY_ID = Object.fromEntries(PDA_PATTERNS.map((pattern) => [pattern.id, pattern]));
const PDA_USER_FIELDS = ["owner", "status", "targetDate", "priority", "priorityLabel", "severity", "notes"];

function pdaDefaults() {
  return { answers: {}, answeredAt: {}, pack: "", plan: { people: 2, hours: 60, sprintWeeks: 2, start: "" } };
}

function pdaState(target) {
  target.pda = target.pda && typeof target.pda === "object" ? { ...pdaDefaults(), ...target.pda } : pdaDefaults();
  target.pda.plan = { ...pdaDefaults().plan, ...(target.pda.plan || {}) };
  return target.pda;
}

function pdaListUrl(entry, metricName) {
  const query = (entry.env.results || []).find((item) => item.kind === "query" && item.metric === metricName);
  if (!query || !query.table) return "";
  return `/${query.table}_list.do?sysparm_query=${encodeURIComponent(query.query || "")}`;
}

function pdaRuleFinding(rule, entry, value) {
  const mapped = DIAG_SEVERITY_MAP[rule.severity] || ["Medium", "P3"];
  const cause = PDA_ROOT_CAUSES[rule.rc] || {};
  const envelope = entry.env;
  return {
    id: "PDA-" + rule.id,
    ruleId: rule.id,
    title: rule.title,
    domain: rule.pack,
    pack: rule.pack,
    severity: mapped[0],
    priority: mapped[1],
    priorityLabel: mapped[1],
    likelihood: "Confirmed by measurement",
    rootCause: (cause.title ? cause.title + ". " : "") + rule.why,
    evidence: `${rule.collector} · ${rule.metric} = ${value}${rule.unit || ""} (threshold ${rule.op} ${rule.threshold}${rule.unit || ""}) · ${rule.where} · captured ${envelope.captured_at || ""} on ${envelope.instance || ""}`,
    impact: rule.impact,
    remediation: rule.recommendation,
    effort: `${rule.effort[1]} h likely (${rule.effort[0]}–${rule.effort[2]} h)`,
    status: "Draft",
    environment: entry.environment || "",
    confidence: rule.confidence || "Measured",
    owner: "Unassigned",
    sourceRef: rule.collector,
    sourceDocument: entry.datasetName || "DIAG envelope",
    patterns: rule.patterns,
    rcKey: rule.rc,
    phase: rule.phase,
    effortHours: rule.effort,
    role: rule.role,
    kind: rule.kind,
    listUrl: pdaListUrl(entry, rule.metric),
    measured: value,
    measuredText: `${value}${rule.unit || ""}`,
  };
}

function pdaEvaluate(target) {
  const envelopes = target.envelopes || {};
  const answers = pdaState(target).answers;
  const triggered = [];
  const cleared = new Set();
  const byPack = {};
  const stats = { evaluated: 0, triggered: 0, notApplicable: 0 };
  PDA_RULES.forEach((rule) => {
    const entry = envelopes[diagCollectorKey(rule.collector)];
    if (!entry) return;
    const value = entry.env.metrics[rule.metric];
    if (value === undefined || value === null || value === -1) { stats.notApplicable += 1; return; }
    if (rule.requiresAnswer && answers[rule.requiresAnswer] !== "yes") { stats.notApplicable += 1; return; }
    stats.evaluated += 1;
    byPack[rule.pack] = (byPack[rule.pack] || 0) + 1;
    if (diagEvalOp(value, rule.op, rule.threshold)) {
      stats.triggered += 1;
      triggered.push(pdaRuleFinding(rule, entry, value));
    } else cleared.add("PDA-" + rule.id);
  });
  return { triggered, cleared, byPack, stats };
}

// Keeps consultant edits (owner, status, dates) when a rule fires again, and
// marks - never deletes - findings that no longer trigger on a rescan.
function pdaMergeFindings(target, incoming, cleared) {
  const existing = new Map(target.findings.map((finding) => [finding.id, finding]));
  incoming.forEach((finding) => {
    const previous = existing.get(finding.id);
    if (previous) {
      const kept = {};
      PDA_USER_FIELDS.forEach((field) => { if (previous[field] !== undefined && previous.userEdited) kept[field] = previous[field]; });
      if (previous.status === "Resolved on rescan") kept.status = "Draft";
      Object.assign(previous, finding, kept);
    } else target.findings.push(finding);
  });
  target.findings.forEach((finding) => {
    if (cleared.has(finding.id) && finding.status !== "Resolved on rescan") {
      finding.status = "Resolved on rescan";
      finding.resolvedAt = nowIso();
    }
  });
}

function pdaDraftFix(target, finding, steps, verify) {
  if (target.fixes[finding.id]) return;
  target.fixes[finding.id] = {
    approach: "DRAFT (generated) - " + (finding.remediation || "Agree the remediation approach."),
    steps: steps || [],
    verify: verify,
    rollback: "Configuration-level change - back out through the named update set or change record used for the fix. Data changes run as dry-run first, in batches, with before values logged.",
    status: "Drafted",
    owner: "",
  };
}

function pdaRefreshDiscovery(target) {
  const pda = pdaState(target);
  const wanted = new Map();
  PDA_PATTERNS.forEach((pattern) => pattern.questions.forEach((question, index) => {
    const qid = `${pattern.id}-${index + 1}`;
    if (pda.answers[qid] !== "yes") return;
    const mapped = PDA_PATTERN_SEVERITY[pattern.sev] || ["Medium", "P3"];
    const cause = PDA_ROOT_CAUSES[pattern.rc] || {};
    wanted.set("DISC-" + qid, {
      id: "DISC-" + qid,
      title: question.f,
      domain: pattern.pack,
      pack: pattern.pack,
      severity: mapped[0],
      priority: mapped[1],
      priorityLabel: mapped[1],
      likelihood: "Stated in the discovery workshop",
      rootCause: (cause.title ? cause.title + ". " : "") + (cause.why || pattern.symptoms),
      evidence: `Discovery workshop · "${question.q}" answered Yes on ${shortDate(pda.answeredAt[qid] || nowIso())}. Confirm with data owners before quoting.`,
      impact: `Pattern ${pattern.id}: ${pattern.name}. ${pattern.symptoms}`,
      remediation: pattern.solution[0],
      effort: `${pattern.effort[1]} h likely (${pattern.effort[0]}–${pattern.effort[2]} h)`,
      status: "Draft",
      environment: "",
      confidence: "Stated by client",
      owner: "Unassigned",
      sourceRef: "Discovery workshop",
      sourceDocument: "Discovery workshop",
      patterns: [pattern.id],
      rcKey: pattern.rc,
      phase: pattern.phase,
      effortHours: pattern.effort,
      role: "Consultant",
      kind: "Stated",
    });
  }));
  target.findings = target.findings.filter((finding) => !String(finding.id).startsWith("DISC-") || wanted.has(finding.id) || finding.userEdited);
  Object.keys(target.fixes).forEach((id) => {
    if (id.startsWith("DISC-") && !wanted.has(id) && target.fixes[id].status === "Drafted") delete target.fixes[id];
  });
  const existing = new Set(target.findings.map((finding) => finding.id));
  wanted.forEach((finding, id) => {
    const current = target.findings.find((item) => item.id === id);
    if (current && current.userEdited) current.evidence = finding.evidence;
    else if (current) Object.assign(current, finding);
    else target.findings.push(finding);
    const pattern = PDA_PATTERN_BY_ID[finding.patterns[0]];
    pdaDraftFix(target, finding, pattern.solution, "Confirm the stated condition with evidence (run the related collectors in the playbook) before remediation starts.");
  });
}

function pdaApplyEnvelopes(target, timestamp) {
  const evaluation = pdaEvaluate(target);
  pdaMergeFindings(target, evaluation.triggered, evaluation.cleared);
  evaluation.triggered.forEach((finding) => {
    const rule = PDA_RULES.find((item) => item.id === finding.ruleId);
    pdaDraftFix(target, finding, rule.steps, `Re-run ${rule.collector} after the change and confirm ${rule.metric} is back within ${rule.op} ${rule.threshold}${rule.unit || ""}; attach the new envelope as evidence.`);
  });
  pdaState(target).evaluatedByPack = evaluation.byPack;
  target.audit.unshift({ id: uuid(), at: timestamp || nowIso(), action: "Design assurance rules evaluated", detail: `${evaluation.stats.evaluated} rule(s) evaluated, ${evaluation.stats.triggered} triggered, ${evaluation.stats.notApplicable} not applicable.` });
}

// Replaces the original pack scoring: a pack is "collected" only when at
// least one of its checks could actually be evaluated, and stated
// (discovery) findings are listed but never change a measured score.
diagPackHealth = function (target) {
  const envelopes = target.envelopes || {};
  const evaluated = pdaState(target).evaluatedByPack || {};
  const hasSignal = (key) => {
    const entry = envelopes[key];
    return Boolean(entry && Object.values(entry.env.metrics || {}).some((value) => typeof value === "number" && value !== -1));
  };
  return DIAG_PACKS.concat(PDA_EXTRA_PACKS).map((pack) => {
    const packCollectors = pack.collectors || [];
    const hasPdaRules = PDA_RULES.some((rule) => rule.pack === pack.id);
    const collected = packCollectors.filter((collector) => hasSignal(diagCollectorKey(collector))).length + (evaluated[pack.id] ? 1 : 0);
    const total = packCollectors.length + (hasPdaRules ? 1 : 0);
    const packFindings = target.findings.filter((finding) => finding.status !== "Resolved on rescan" && (finding.pack
      ? finding.pack === pack.id
      : packCollectors.some((collector) => String(finding.sourceRef || "").includes(diagCollectorKey(collector)))));
    const measured = packFindings.filter((finding) => finding.kind !== "Stated");
    let score = null;
    let status = "Not assessed";
    if (collected) {
      score = 100;
      measured.forEach((finding) => { score -= PDA_SEVERITY_WEIGHT[finding.severity] || 0; });
      score = Math.max(score, 5);
      status = score >= 80 ? "Healthy" : score >= 55 ? "Warning" : "At risk";
    }
    return { id: pack.id, label: pack.label, collectors: packCollectors.concat(hasPdaRules ? ["PDA collectors"] : []), collected, total, findings: packFindings.length, stated: packFindings.length - measured.length, score, status };
  });
};

// ---------- Delivery planning (root-cause based, no double counting) ----------
function pdaPlan(target) {
  const plan = pdaState(target).plan;
  const open = target.findings.filter((finding) => finding.status !== "Resolved on rescan" && finding.status !== "Closed" && Array.isArray(finding.effortHours));
  const groups = new Map();
  open.forEach((finding) => {
    const key = `${finding.phase}|${finding.rcKey || finding.id}`;
    if (!groups.has(key)) groups.set(key, { phase: finding.phase, rcKey: finding.rcKey, findings: [] });
    groups.get(key).findings.push(finding);
  });
  const items = [];
  const stated = open.filter((finding) => finding.kind === "Stated").length;
  items.push({ title: "Mobilise, walk through the evidence and agree the target design", phase: 0, effort: [8, 12, 16], ids: [] });
  if (stated) items.push({ title: `Confirm ${stated} stated finding(s) with data owners`, phase: 0, effort: [stated, stated * 2, stated * 3], ids: [] });
  groups.forEach((group) => {
    // Largest fix sets the base; each extra finding under the same root cause adds 25%.
    const sorted = group.findings.map((finding) => finding.effortHours).sort((a, b) => b[1] - a[1]);
    const effort = [0, 1, 2].map((k) => Math.round(sorted[0][k] + sorted.slice(1).reduce((sum, item) => sum + item[k] * 0.25, 0)));
    const cause = PDA_ROOT_CAUSES[group.rcKey] || {};
    items.push({ title: cause.title || group.findings[0].title, phase: group.phase, effort, ids: group.findings.map((finding) => finding.id), rcKey: group.rcKey });
  });
  PDA_PHASES.slice(1).forEach((phase) => {
    const work = items.filter((item) => item.phase === phase.n && item.ids.length);
    if (!work.length) return;
    items.push({ title: "Testing, UAT and deployment (20%)", phase: phase.n, effort: [0, 1, 2].map((k) => Math.ceil(work.reduce((sum, item) => sum + item.effort[k], 0) * 0.2)), ids: [] });
  });
  items.sort((a, b) => a.phase - b.phase);
  const capacity = Math.max(1, Number(plan.people || 1) * Number(plan.hours || 1));
  const weeks = Math.max(1, Number(plan.sprintWeeks || 2));
  const start = plan.start || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const sprints = [];
  let current = { no: 1, used: 0, items: [] };
  sprints.push(current);
  items.forEach((item) => {
    let remaining = item.effort[1];
    item.sprints = [];
    while (remaining > 0) {
      if (current.used >= capacity) { current = { no: sprints.length + 1, used: 0, items: [] }; sprints.push(current); }
      const take = Math.min(remaining, capacity - current.used);
      current.items.push({ title: item.title, hours: take, phase: item.phase, continued: remaining !== item.effort[1] });
      current.used += take;
      remaining -= take;
      if (!item.sprints.includes(current.no)) item.sprints.push(current.no);
    }
  });
  sprints.forEach((sprint) => {
    const begin = new Date(start + "T00:00:00");
    begin.setDate(begin.getDate() + (sprint.no - 1) * weeks * 7);
    const end = new Date(begin);
    end.setDate(end.getDate() + weeks * 7 - 3);
    sprint.start = begin;
    sprint.end = end;
  });
  const totals = [0, 1, 2].map((k) => items.reduce((sum, item) => sum + item.effort[k], 0));
  return { items, sprints, capacity, totals, weeks, open: open.length };
}

function pdaDate(value) {
  return value instanceof Date ? value.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
}

function pdaPatternsHit(target) {
  const hits = {};
  target.findings.filter((finding) => finding.status !== "Resolved on rescan").forEach((finding) => {
    (finding.patterns || []).forEach((pid) => { (hits[pid] ||= []).push(finding); });
  });
  return hits;
}

// ---------- Views ----------
function pdaJourney() {
  const pda = pdaState(state);
  const answered = Object.values(pda.answers).filter(Boolean).length;
  const totalQuestions = PDA_PATTERNS.reduce((sum, pattern) => sum + pattern.questions.length, 0);
  const collected = PDA_COLLECTORS.filter((collector) => state.envelopes?.[diagCollectorKey(collector.id)]).length;
  const open = state.findings.filter((finding) => finding.status !== "Resolved on rescan").length;
  const steps = [
    ["Scope the client", Boolean(state.assessment.client), state.assessment.client ? escapeHtml(state.assessment.client) : "Client, lead and environment", "scope"],
    ["Run the discovery workshop", answered > 0, `${answered} of ${totalQuestions} questions answered`, "discovery"],
    ["Collect platform evidence", collected > 0, `${collected} of ${PDA_COLLECTORS.length} design collectors loaded`, "guided"],
    ["Review findings", open > 0, `${open} open finding${open === 1 ? "" : "s"}`, "findings"],
    ["Match solutions", open > 0, `${Object.keys(pdaPatternsHit(state)).length} problem pattern(s) found`, "playbook"],
    ["Plan the delivery", open > 0, open ? `${pdaPlan(state).sprints.length} sprint(s) planned` : "Needs findings", "deliveryplan"],
    ["Issue the proposal", false, "Summary, proposal and playbook documents", "reports"],
  ];
  const next = steps.find((step) => !step[1]) || steps[steps.length - 1];
  return `<section class="panel pda-journey"><div class="panel-heading"><div><span class="eyebrow">Guided path · platform design assurance</span><h2>${escapeHtml(state.assessment.client ? `${state.assessment.client}: your assessment journey` : "Your assessment journey")}</h2></div>
    <button class="button primary" data-action="navigate" data-view="${next[3]}">Next: ${escapeHtml(next[0])}</button></div>
    <ol class="pda-steps">${steps.map(([title, done, detail, view], index) => `<li class="${done ? "is-done" : ""} ${next[0] === title ? "is-next" : ""}">
      <button data-action="navigate" data-view="${view}"><span class="pda-step-no">${done ? "✓" : index + 1}</span><span><strong>${escapeHtml(title)}</strong><small>${detail}</small></span></button></li>`).join("")}</ol></section>`;
}

function renderDiscovery() {
  const pda = pdaState(state);
  const packs = [...new Set(PDA_PATTERNS.map((pattern) => pattern.pack))];
  const shown = PDA_PATTERNS.filter((pattern) => !pda.pack || pattern.pack === pda.pack);
  const totalQuestions = PDA_PATTERNS.reduce((sum, pattern) => sum + pattern.questions.length, 0);
  const answered = Object.values(pda.answers).filter(Boolean).length;
  const yes = Object.values(pda.answers).filter((value) => value === "yes").length;
  const client = state.assessment.client || "the client";
  const groups = packs.filter((pack) => shown.some((pattern) => pattern.pack === pack)).map((pack) => `
    <section class="panel pda-qgroup"><span class="eyebrow">${escapeHtml(pack)}</span>
    ${shown.filter((pattern) => pattern.pack === pack).map((pattern) => `
      <article class="pda-pattern-q"><div class="section-row"><h3><span class="mono-id">${pattern.id}</span> ${escapeHtml(pattern.name)}</h3>
        <button class="text-button" data-action="pda-open-pattern" data-id="${pattern.id}">Solution playbook →</button></div>
        ${pattern.questions.map((question, index) => {
          const qid = `${pattern.id}-${index + 1}`;
          const current = pda.answers[qid] || "";
          return `<div class="pda-qrow"><p>${escapeHtml(question.q.replace(/^(Do|Does|Is|Are|Has|Have) /, (match) => match))}</p>
            <div class="pda-answers" role="group" aria-label="${escapeHtml(question.q)}">${PDA_ANSWERS.map(([value, label]) => `<button class="${current === value ? "is-selected" : ""}" aria-pressed="${current === value}" data-action="pda-answer" data-qid="${qid}" data-value="${value}">${label}</button>`).join("")}</div></div>`;
        }).join("")}
      </article>`).join("")}
    </section>`).join("");
  return `${viewHeading("Discovery workshop", `What ${client} tells us`, "Some problems never show in platform data: adoption, operating model, legacy tools, licence use, governance. Ask these questions with the client's platform owner and process owners. Every Yes becomes a finding marked Stated by client, with its own root cause and draft solution.", `<button class="button secondary" data-action="navigate" data-view="playbook">Open solution playbook</button><button class="button primary" data-action="navigate" data-view="guided">Next: collect evidence</button>`)}
    <section class="panel pda-discovery-bar"><div class="pda-progress"><strong>${answered}/${totalQuestions}</strong><span>answered</span></div><div class="pda-progress"><strong>${yes}</strong><span>stated problems</span></div>
      <div class="pda-filter">${["", ...packs].map((pack) => `<button class="chip-button ${pda.pack === pack ? "is-selected" : ""}" data-action="pda-filter-pack" data-pack="${escapeHtml(pack)}">${escapeHtml(pack || "All areas")}</button>`).join("")}</div></section>
    ${groups}`;
}

function pdaPatternBody(pattern, forDocument = false) {
  const hits = pdaPatternsHit(state)[pattern.id] || [];
  const checks = pattern.checks.map((id) => PDA_RULES.find((rule) => rule.id === id)).filter(Boolean);
  const answers = pdaState(state).answers;
  return `<p class="pda-symptoms">${escapeHtml(pattern.symptoms)}</p>
    <div class="pda-cols"><div><h3>ServiceNow solution</h3><ol>${pattern.solution.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></div>
    <div><h3>Architecture approach</h3><ul>${pattern.architecture.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></div>
    <p class="pda-note"><strong>Licensing:</strong> ${escapeHtml(pattern.licensing)}</p>
    <div class="pda-cols"><div><h3>How it is detected</h3><ul class="pda-checks">${checks.map((rule) => `<li><span class="mono-id">${rule.id}</span> ${escapeHtml(rule.title)}${hits.some((finding) => finding.ruleId === rule.id) ? ' <b class="pda-hit">found</b>' : ""}</li>`).join("")}</ul>
      <p class="small"><strong>Discovery questions</strong></p><ul class="pda-checks">${pattern.questions.map((question, index) => `<li>${escapeHtml(question.q)}${answers[`${pattern.id}-${index + 1}`] === "yes" ? ' <b class="pda-hit">Yes</b>' : ""}</li>`).join("")}</ul></div>
    <div><h3>Delivery</h3><p class="small">Root cause: <strong>${escapeHtml(PDA_ROOT_CAUSES[pattern.rc]?.title || pattern.rc)}</strong><br>Default phase: ${escapeHtml(PDA_PHASES[pattern.phase]?.name || "")}<br>Typical effort: ${pattern.effort[0]}–${pattern.effort[2]} h (likely ${pattern.effort[1]} h)</p>
      ${hits.length && !forDocument ? `<p class="small"><strong>In this assessment</strong></p><ul class="pda-checks">${hits.map((finding) => `<li><button class="text-button" data-action="select-finding" data-id="${escapeHtml(finding.id)}">${escapeHtml(finding.id)}</button> ${escapeHtml(finding.title)}</li>`).join("")}</ul>` : ""}</div></div>`;
}

function renderPlaybook() {
  const hits = pdaPatternsHit(state);
  const active = PDA_PATTERN_BY_ID[ui.pdaPattern] || PDA_PATTERNS.find((pattern) => hits[pattern.id]) || PDA_PATTERNS[0];
  const list = PDA_PATTERNS.map((pattern) => `<button class="record-row ${pattern.id === active.id ? "is-selected" : ""}" data-action="pda-open-pattern" data-id="${pattern.id}">
    <span class="mono-id">${pattern.id}${hits[pattern.id] ? ' <b class="pda-hit">●</b>' : ""}</span><strong>${escapeHtml(pattern.name)}</strong><small>${escapeHtml(pattern.pack)}${hits[pattern.id] ? ` · ${hits[pattern.id].length} finding(s)` : ""}</small></button>`).join("");
  return `${viewHeading("Solution playbook", "From problem pattern to ServiceNow solution", `${PDA_PATTERNS.length} common platform problem patterns. Each has an out-of-box-first solution, the architecture approach, licensing notes, how the Workbench detects it and typical delivery effort. Patterns marked ● were found in this assessment.`, '<button class="button secondary" data-action="export-playbook">Download playbook</button>')}
    <div class="split-layout library-layout"><section class="list-pane"><div class="record-list">${list}</div></section>
    <section class="detail-pane"><div class="detail-header"><div><span class="mono-id">${active.id} · ${escapeHtml(active.pack)}</span><h2>${escapeHtml(active.name)}</h2></div>${chip(hits[active.id] ? "Found" : "Not found")}</div>${pdaPatternBody(active)}</section></div>`;
}

function renderDeliveryPlan() {
  const pda = pdaState(state);
  if (!state.findings.some((finding) => Array.isArray(finding.effortHours))) {
    return `${viewHeading("Delivery plan", "Phases and sprints", "The plan is built from design-assurance and discovery findings, grouped by root cause so shared fixes are estimated once.")}${renderEmpty("No plannable findings yet", "Answer the discovery workshop or load the design assurance collectors. Findings with effort estimates appear here automatically.")}`;
  }
  const plan = pdaPlan(state);
  const cols = plan.sprints.length;
  const phases = PDA_PHASES.map((phase) => ({ phase, items: plan.items.filter((item) => item.phase === phase.n) })).filter((group) => group.items.length);
  return `${viewHeading("Delivery plan", "Phases and sprints", "Design is fixed before data. Findings that share a root cause are estimated once (largest fix plus 25% per extra finding), with 20% added for testing and deployment. Effort figures are starting estimates; set your practice's own baselines.", '<button class="button secondary" data-action="export-proposal">Generate proposal</button>')}
    <form id="pda-plan-form" class="panel pda-plan-form"><label><span>People</span><input name="people" type="number" min="1" value="${escapeHtml(pda.plan.people)}"></label>
      <label><span>Hours per person per sprint</span><input name="hours" type="number" min="1" value="${escapeHtml(pda.plan.hours)}"></label>
      <label><span>Sprint length (weeks)</span><input name="sprintWeeks" type="number" min="1" value="${escapeHtml(pda.plan.sprintWeeks)}"></label>
      <label><span>Planned start</span><input name="start" type="date" value="${escapeHtml(pda.plan.start)}"></label>
      <button class="button primary" type="submit">Update plan</button></form>
    <section class="metric-grid">${metric("Sprints", plan.sprints.length, `${plan.sprints.length * plan.weeks} weeks`, "teal")}${metric("Likely effort", `${plan.totals[1]} h`, `range ${plan.totals[0]}–${plan.totals[2]} h`, "blue")}${metric("Capacity", `${plan.capacity} h`, "per sprint", "green")}${metric("Findings planned", plan.open, `${plan.items.length} work items`, "amber")}</section>
    <section class="panel"><div class="table-wrap"><table class="pda-timeline"><thead><tr><th>Phase</th>${plan.sprints.map((sprint) => `<th>S${sprint.no}</th>`).join("")}</tr></thead><tbody>
      ${phases.map(({ phase, items }) => { const used = new Set(items.flatMap((item) => item.sprints)); return `<tr><td><strong>${phase.n}. ${escapeHtml(phase.name)}</strong></td>${plan.sprints.map((sprint) => `<td class="${used.has(sprint.no) ? "on" : ""}"></td>`).join("")}</tr>`; }).join("")}
    </tbody></table></div><p class="small">Sprint 1 starts ${escapeHtml(pdaDate(plan.sprints[0].start))}; the last sprint ends ${escapeHtml(pdaDate(plan.sprints[cols - 1].end))}.</p></section>
    <div class="pda-phase-list">${phases.map(({ phase, items }) => `<section class="panel"><span class="eyebrow">Phase ${phase.n} · ${items.reduce((sum, item) => sum + item.effort[1], 0)} h</span><h2>${escapeHtml(phase.name)}</h2><p class="small">${escapeHtml(phase.goal)}</p>
      <ul class="pda-work">${items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong> <span class="small">· ${item.effort[1]} h · S${item.sprints.join(", S")}</span>${item.ids.length ? `<div>${item.ids.map((id) => `<button class="text-button mono-id" data-action="select-finding" data-id="${escapeHtml(id)}">${escapeHtml(id)}</button>`).join(" ")}</div>` : ""}</li>`).join("")}</ul></section>`).join("")}</div>`;
}

// ---------- Documents ----------
function pdaDocumentShell(title, subtitle, body) {
  const client = state.assessment.client || "[CLIENT NAME]";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(client)} - ${escapeHtml(title)}</title>
<style>:root{--deep:#12363f;--teal:#0e7c86;--green:#5bd747;--ink:#17333b;--muted:#64777d;--rule:#d8e1e3}
*{box-sizing:border-box}body{margin:0;font-family:Inter,Aptos,"Segoe UI",Arial,sans-serif;color:var(--ink);font-size:12.5px;line-height:1.55;background:#fff}
.cover{background:var(--deep);color:#fff;padding:42px;border-bottom:6px solid var(--green)}.cover h1{margin:8px 0 4px;font-size:27px}.cover p{margin:2px 0;color:#cfe0e2}
.eyebrow{letter-spacing:.14em;text-transform:uppercase;font-size:11px;color:#9fd9c8}.page{max-width:830px;margin:0 auto;padding:30px 42px}
h2{color:var(--deep);font-size:17px;border-bottom:2px solid var(--rule);padding-bottom:6px;margin:26px 0 10px}h3{font-size:14px;margin:16px 0 6px}
table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11.5px}th{background:var(--deep);color:#fff;text-align:left;padding:6px 8px}td{border-bottom:1px solid var(--rule);padding:6px 8px;vertical-align:top}
.callout{border:1px solid var(--teal);background:#eef7f7;border-radius:8px;padding:10px 14px;margin:12px 0}.small{font-size:11px;color:var(--muted)}ul,ol{padding-left:20px}
footer{margin-top:30px;padding-top:10px;border-top:1px solid var(--rule);color:var(--muted);font-size:10.5px}
@media print{.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4;margin:14mm}h2{break-after:avoid}}</style></head><body>
<div class="cover"><span class="eyebrow">${escapeHtml(state.assessment.confidentiality || "Client confidential")} · draft for review</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(client)} · ${escapeHtml(subtitle)}</p><p>Generated ${escapeHtml(new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }))}${state.assessment.lead ? ` · prepared by ${escapeHtml(state.assessment.lead)}` : ""}</p></div>
<div class="page">${body}<footer>Generated by the Diagnostic Workbench from the local assessment store. Measured findings trace to named collector envelopes; stated findings come from the discovery workshop and must be confirmed. Effort figures are estimates, not a quote.</footer></div></body></html>`;
}

function buildProposalHtml() {
  const open = sortedFindings(state.findings.filter((finding) => finding.status !== "Resolved on rescan"));
  const byCause = new Map();
  open.forEach((finding) => {
    const key = finding.rcKey || finding.domain;
    if (!byCause.has(key)) byCause.set(key, []);
    byCause.get(key).push(finding);
  });
  const hits = pdaPatternsHit(state);
  const patterns = PDA_PATTERNS.filter((pattern) => hits[pattern.id]);
  const plan = pdaPlan(state);
  const phases = PDA_PHASES.map((phase) => ({ phase, items: plan.items.filter((item) => item.phase === phase.n) })).filter((group) => group.items.length);
  const body = `
<h2>1. The current situation</h2>
<p>This proposal is based on ${open.filter((finding) => finding.kind !== "Stated").length} measured finding(s) from read-only platform collectors and ${open.filter((finding) => finding.kind === "Stated").length} stated finding(s) from the discovery workshop. Stated findings are confirmed in Phase 0.</p>
${[...byCause.entries()].map(([key, findings]) => `<h3>${escapeHtml(PDA_ROOT_CAUSES[key]?.title || key)}</h3><p>${escapeHtml(PDA_ROOT_CAUSES[key]?.why || "")}</p><ul>${findings.slice(0, 6).map((finding) => `<li>${escapeHtml(finding.title)} <span class="small">(${escapeHtml(finding.kind === "Stated" ? "stated" : "measured")}: ${escapeHtml(finding.kind === "Stated" ? "discovery workshop" : (finding.measuredText || String(finding.measured ?? "")) + " · " + finding.ruleId)})</span></li>`).join("")}</ul>`).join("")}
<h2>2. The ServiceNow solution</h2>
<table><thead><tr><th>Problem pattern</th><th>What we will change</th><th>Business outcome</th></tr></thead><tbody>
${patterns.map((pattern) => `<tr><td>${escapeHtml(pattern.name)}</td><td>${escapeHtml(pattern.solution.join("; "))}</td><td>${escapeHtml(PDA_ROOT_CAUSES[pattern.rc]?.benefit || "")}</td></tr>`).join("")}</tbody></table>
<h2>3. Architectural approach</h2>
<ul><li><strong>Out of the box first:</strong> platform capability before custom build; custom work only where the business need requires it, recorded in a decision log.</li>
<li><strong>Design before data:</strong> correct loads, forms and rules first, then clean records so problems do not return.</li>
<li><strong>Safe data changes:</strong> dry-run first, batched execution, before values logged, rollback defined.</li>
<li><strong>Upgrade-safe delivery:</strong> named update sets, promotion through each environment, Automated Test Framework coverage for changed processes, As Built updated.</li>
<li><strong>Measured outcome:</strong> the collectors are re-run after each phase; findings that no longer trigger are marked resolved.</li></ul>
${patterns.map((pattern) => `<h3>${escapeHtml(pattern.name)}</h3><ul>${pattern.architecture.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><p class="small">Licensing: ${escapeHtml(pattern.licensing)}</p>`).join("")}
<h2>4. Phases and sprints</h2>
<table><thead><tr><th>Phase</th><th>Goal</th><th>Sprints</th><th>Likely hours</th></tr></thead><tbody>
${phases.map(({ phase, items }) => { const sprints = [...new Set(items.flatMap((item) => item.sprints))].sort((a, b) => a - b); return `<tr><td>${phase.n}. ${escapeHtml(phase.name)}</td><td>${escapeHtml(phase.goal)}</td><td>S${sprints[0]}${sprints.length > 1 ? "–S" + sprints[sprints.length - 1] : ""}</td><td>${items.reduce((sum, item) => sum + item.effort[1], 0)}</td></tr>`; }).join("")}</tbody></table>
<p>Estimated effort: <strong>${plan.totals[1]} hours</strong> likely (range ${plan.totals[0]}–${plan.totals[2]}), across ${plan.sprints.length} × ${plan.weeks}-week sprints from ${escapeHtml(pdaDate(plan.sprints[0].start))} to ${escapeHtml(pdaDate(plan.sprints[plan.sprints.length - 1].end))}, at ${plan.capacity} hours per sprint. Commercials are provided separately.</p>
<table><thead><tr><th>Sprint</th><th>Dates</th><th>Work</th></tr></thead><tbody>
${plan.sprints.map((sprint) => `<tr><td>S${sprint.no}</td><td>${escapeHtml(pdaDate(sprint.start))} – ${escapeHtml(pdaDate(sprint.end))}</td><td>${sprint.items.map((item) => escapeHtml(item.title + (item.continued ? " (cont.)" : ""))).join("; ")}</td></tr>`).join("")}</tbody></table>
<h2>5. Assumptions</h2><ul><li>Client data owners and process owners are available in Phase 0.</li><li>A sub-production instance cloned from production is available for build and testing.</li><li>No additional ServiceNow subscriptions are assumed; any exception is flagged before work starts.</li></ul>
<h2>6. Dependencies</h2><ul><li>Agreed target design (class model, identification rules, service model) before Phase 2.</li><li>A current, owned source for any data backfill in Phase 3.</li></ul>
<h2>7. Exclusions</h2><ul><li>Capabilities that need subscriptions the client does not hold.</li><li>New modules or processes not listed above.</li><li>Commercial terms (Statement of Work).</li></ul>
<h2>8. Decisions needed</h2><ul><li>Which findings are in scope for the first release.</li><li>Ownership model for CIs, assets and services.</li><li>Acceptance of stated findings after Phase 0 confirmation.</li></ul>
<div class="callout"><strong>Interpretation control.</strong> Measured findings record values against configured thresholds; they are evidence, not blame. Root causes are the most likely explanation and are confirmed with the client before remediation.</div>`;
  return pdaDocumentShell("Remediation proposal", state.assessment.name, body);
}

function buildPlaybookHtml() {
  const hits = pdaPatternsHit(state);
  const list = PDA_PATTERNS.filter((pattern) => hits[pattern.id]);
  const patterns = list.length ? list : PDA_PATTERNS;
  return pdaDocumentShell("Solution playbook", list.length ? "Problem patterns found in this assessment" : "All problem patterns",
    patterns.map((pattern) => `<h2>${pattern.id}. ${escapeHtml(pattern.name)}</h2>${pdaPatternBody(pattern, true)}`).join(""));
}

// ---------- Wrappers around existing views ----------
const pdaBaseDashboard = renderDashboard;
renderDashboard = function () {
  const html = pdaBaseDashboard();
  const at = html.indexOf("<section");
  return at < 0 ? html + pdaJourney() : html.slice(0, at) + pdaJourney() + html.slice(at);
};

const pdaBaseFindingDetail = renderFindingDetail;
renderFindingDetail = function (finding) {
  const html = pdaBaseFindingDetail(finding);
  if (!finding.patterns && !finding.listUrl) return html;
  const patterns = (finding.patterns || []).map((pid) => PDA_PATTERN_BY_ID[pid]).filter(Boolean);
  const cause = PDA_ROOT_CAUSES[finding.rcKey] || null;
  return html + `<section class="detail-section pda-finding-extra"><span class="eyebrow">Design assurance</span>
    <div class="fact-grid"><div><span>Source</span><strong>${escapeHtml(finding.kind === "Stated" ? "Stated by client" : "Measured")}</strong></div><div><span>Plan phase</span><strong>${escapeHtml(PDA_PHASES[finding.phase]?.name || "")}</strong></div><div><span>Typical effort</span><strong>${escapeHtml(finding.effort || "")}</strong></div><div><span>Status</span><strong>${escapeHtml(finding.status || "")}</strong></div></div>
    ${cause ? `<p><strong>Why it usually happens:</strong> ${escapeHtml(cause.why)}</p><p><strong>What fixing it achieves:</strong> ${escapeHtml(cause.benefit)}</p>` : ""}
    <div class="detail-actions">${finding.listUrl ? `<a class="button secondary compact" href="${escapeHtml(finding.listUrl)}" target="_blank" rel="noopener noreferrer">Open matching records</a>` : ""}${patterns.map((pattern) => `<button class="button secondary compact" data-action="pda-open-pattern" data-id="${pattern.id}">Playbook: ${escapeHtml(pattern.name)}</button>`).join("")}</div></section>`;
};

const pdaBaseScriptDetail = renderScriptDetail;
renderScriptDetail = function (script) {
  const html = pdaBaseScriptDetail(script);
  if (script.pack !== "pda") return html;
  const meta = PDA_COLLECTORS.find((collector) => collector.id === script.id);
  return html.replace('<div class="template-warning">', `<div class="callout strong pda-collector-note"><strong>Design assurance collector</strong><span>No customer profile is needed. Review the CONFIGURATION block at the top (CI class, name prefixes, site names, test markers, legacy tool names), run it, then use <b>Paste script output</b>. It checks ${meta.metrics.length} measures for ${meta.rules.length} rules. Missing tables or fields report Not applicable - never a pass.</span></div><div class="template-warning pda-hidden">`);
};

boot();

// Kept intentionally small: automated integration tests use this hook to
// render every view against the issued reference payload without a browser.
function renderWorkbenchForTest(nextState, view = "dashboard") {
  state = structuredClone(nextState);
  state.activeView = view;
  ui = { ...ui, query: "", selectedComponent: "", selectedFinding: "", selectedScript: "" };
  renderShell();
  return app.innerHTML;
}
