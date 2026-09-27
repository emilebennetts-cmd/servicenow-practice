export const DW_PHASES = [{ "id": "setup", "label": "Set up", "stages": [1, 2, 3] }, { "id": "collect", "label": "Collect", "stages": [4, 5, 12] }, { "id": "map", "label": "Map", "stages": [6, 7] }, { "id": "review", "label": "Review", "stages": [8, 9, 10, 11, 13] }, { "id": "diagnose", "label": "Diagnose", "stages": [14, 15] }, { "id": "deliver", "label": "Deliver", "stages": [16, 17, 18] }];
export const DW_STAGES = [{ "id": 1, "title": "Engagement setup", "purpose": "Create the assessment, handling rules, team, and environment map.", "phase": "setup" }, { "id": 2, "title": "Application identification", "purpose": "Confirm scope, prefixes, tokens, and always-include records.", "phase": "setup" }, { "id": 3, "title": "Scope & business context", "purpose": "Record purpose, users, impact language, risks, and known events.", "phase": "setup" }, { "id": 4, "title": "Application inventory", "purpose": "Count the structural surface before extracting source.", "phase": "collect" }, { "id": 5, "title": "Component extraction", "purpose": "Collect configuration artefacts and resolve every cited component.", "phase": "collect" }, { "id": 6, "title": "Dependencies & relationships", "purpose": "Review cited, inferred, and manually curated links.", "phase": "map" }, { "id": 7, "title": "Data-flow analysis", "purpose": "Trace imports, transforms, automation, staging, and outputs.", "phase": "map" }, { "id": 8, "title": "Security & access", "purpose": "Review ACL joins, client-callable surfaces, and public access.", "phase": "review" }, { "id": 9, "title": "Automation & execution", "purpose": "Assess rule order, jobs, workflows, notifications, and SLAs.", "phase": "review" }, { "id": 10, "title": "Integrations", "purpose": "Inventory endpoints, authentication, inbound mail, and REST operations.", "phase": "review" }, { "id": 11, "title": "Configuration & code quality", "purpose": "Find hardcoding, debug noise, client-only enforcement, and drift.", "phase": "review" }, { "id": 12, "title": "Logs & errors", "purpose": "Validate scan, upgrade-skipped, and log evidence per environment.", "phase": "collect" }, { "id": 13, "title": "Performance", "purpose": "Assess slow transactions, query hotspots, and job overruns.", "phase": "review" }, { "id": 14, "title": "Incident correlation", "purpose": "Disposition every incident against findings or explicit gaps.", "phase": "diagnose" }, { "id": 15, "title": "Root-cause analysis", "purpose": "Classify causation with timelines and human confirmation.", "phase": "diagnose" }, { "id": 16, "title": "Solution development", "purpose": "Complete the eight-part fix block and script approvals.", "phase": "deliver" }, { "id": 17, "title": "Prioritised plan", "purpose": "Sequence by dependency, assign ownership, and set target dates.", "phase": "deliver" }, { "id": 18, "title": "Report generation", "purpose": "Verify and issue explorer, register, and decision report outputs.", "phase": "deliver" }];
export const DW_GUIDES = [
    {
        "id": "scope",
        "order": 1,
        "title": "Define the client and application boundary",
        "stages": [
            1,
            2,
            3
        ],
        "summary": "Set the client, application, environments, scope names, table prefixes, and search tokens before collecting anything.",
        "why": "The extractor uses this boundary to avoid pulling unrelated configuration and to make zero results meaningful.",
        "dataPoints": [
            "Client and assessment name",
            "Application name and scope",
            "Table prefixes and search tokens",
            "Environment and upgrade type",
            "Business purpose, users, and known events"
        ],
        "scripts": [],
        "formats": [
            "Saved directly in the Scope & context page"
        ],
        "steps": [
            "Open Scope & context and complete the three sections.",
            "Use application-specific tokens of four or more characters where possible.",
            "Add known sys_ids to Always include when a name filter cannot find them.",
            "Save the scope before editing or running an extractor."
        ],
        "unlocks": [
            "Safe extractor configuration",
            "Client-specific validation",
            "Business impact language",
            "Assessment report cover and context"
        ]
    },
    {
        "id": "modules",
        "order": 2,
        "title": "Discover installed products and custom applications",
        "stages": [
            2,
            4
        ],
        "summary": "Create the instance manifest that determines which product modules and custom scopes this assessment must cover.",
        "why": "The ServiceNow product catalogue and each customer instance evolve. Installed metadata is the reliable boundary for module-aware collection and publication.",
        "dataPoints": [
            "Installed applications and Store applications",
            "Active plugins and scopes",
            "Application navigator modules",
            "Custom and scoped tables",
            "Instance and release metadata",
            "Unavailable-table warnings"
        ],
        "scripts": [
            "EXT-000"
        ],
        "formats": [
            "EXT-000_instance_module_manifest_*.json"
        ],
        "steps": [
            "Generate the customer profile in Scope & context.",
            "Open EXT-000 and apply the customer profile.",
            "Run it in Scripts - Background, scope Global. It reads configuration metadata only.",
            "Download the JSON attachment from your sys_user record and import it here.",
            "Open Module coverage and mark each detected module Analysed, Deferred, Excluded or Unsupported with a reason."
        ],
        "unlocks": [
            "Installed module dashboard",
            "Custom application discovery",
            "Module-aware script selection",
            "Module-aware publication gate"
        ]
    },
    {
        "id": "components",
        "order": 3,
        "title": "Collect the configuration inventory and source",
        "stages": [
            4,
            5
        ],
        "summary": "Collect the actual ServiceNow configuration records, their source fields, metadata, URLs, and cited sys_ids.",
        "why": "Findings need real components and verbatim source. A table count or record name alone is not enough to support a remediation decision.",
        "dataPoints": [
            "sys_id, table, type, and display name",
            "Source or condition fields",
            "Updated date and updated by",
            "Instance URL",
            "Cited issue IDs",
            "Truncation and skipped-table warnings"
        ],
        "scripts": [
            "EXT-000",
            "EXT-100",
            "EXT-101",
            "EXT-102",
            "EXT-103",
            "EXT-103b",
            "EXT-104"
        ],
        "formats": [
            "ARTEFACTS_*.json",
            "CUSTOMER_APP_EVIDENCE_RESOLVED.json",
            "Targeted top-up JSON",
            "Evidence Explorer HTML"
        ],
        "steps": [
            "Generate the customer profile once, apply it to EXT-100, and review the generated targets and queries.",
            "Run EXT-100 in System Definition > Scripts - Background, scope Global, in its read-only mode.",
            "Review counts, invalid fields, skipped tables, and row-cap warnings; then run the full read-only extract.",
            "Download the JSON attachment created on your own sys_user record. Use EXT-104 only when attachment download is blocked.",
            "Run EXT-101 and the targeted top-ups for cited or missed records.",
            "Import the JSON files here, or import the final Evidence Explorer HTML to populate every supported layer together."
        ],
        "unlocks": [
            "Component inventory",
            "Source browser",
            "Component-to-finding links",
            "Code-quality review",
            "Evidence-backed remediation"
        ]
    },
    {
        "id": "scan",
        "order": 3,
        "title": "Collect Instance Scan and targeted audit evidence",
        "stages": [
            8,
            9,
            10,
            11,
            12,
            13
        ],
        "summary": "Bring in independent platform checks and read-only audit results instead of relying only on consultant-authored findings.",
        "why": "Independent evidence confirms scale, affected records, and repeatable platform conditions. It also distinguishes an observed problem from an assumption.",
        "dataPoints": [
            "Finding/check identifier",
            "Check or category",
            "Affected table and component sys_id",
            "Severity",
            "Description and details",
            "Instance/environment",
            "Issue mapping when known"
        ],
        "scripts": [
            "FIX-01",
            "FIX-03",
            "FIX-05",
            "FIX-10",
            "FIX-11",
            "FIX-12",
            "FIX-17",
            "FIX-18",
            "FIX-19",
            "FIX-21",
            "FIX-22"
        ],
        "formats": [
            "instance_scan.csv",
            "scan_findings.json",
            "Evidence Explorer HTML"
        ],
        "steps": [
            "Run the applicable read-only audit scripts from the Script library before considering a write action.",
            "Export the relevant Instance Scan results as CSV with component identifiers and full finding text.",
            "Name the file with scan in its filename, for example client_instance_scan.csv.",
            "Import the CSV or JSON. The Workbench validates it and places it in the Instance Scan evidence layer automatically.",
            "Review the Findings page and create or import a client-approved issue register; evidence alone is not treated as causation."
        ],
        "unlocks": [
            "Independent evidence browser",
            "Security and code-quality review",
            "Finding corroboration",
            "Evidence counts in reports"
        ]
    },
    {
        "id": "skips",
        "order": 4,
        "title": "Collect upgrade skipped-record evidence",
        "stages": [
            12,
            15,
            17
        ],
        "summary": "Export skipped and skipped-error upgrade records from the relevant family upgrade, then disposition the records that carry executable logic.",
        "why": "A patch result is not evidence for a family upgrade. Case-wrong filters and custom-table assumptions can otherwise produce a misleading zero.",
        "dataPoints": [
            "Upgrade history and environment",
            "Disposition exactly Skipped or Skipped Error",
            "File/table and target sys_id",
            "Customer and base versions",
            "Resolution status",
            "Cluster or issue mapping"
        ],
        "scripts": [
            "FIX-09"
        ],
        "formats": [
            "upgrade_skips.csv",
            "skipped_records.json",
            "Evidence Explorer HTML"
        ],
        "steps": [
            "Confirm the export belongs to the same family upgrade being assessed.",
            "Export sys_upgrade_history_log records with disposition Skipped or Skipped Error using the platform's exact case.",
            "Name the file with skip or upgrade in its filename.",
            "Import the CSV or JSON and resolve any validation failure before analysis.",
            "Use FIX-09 as the disposition workflow and retain manual decisions in the issued register."
        ],
        "unlocks": [
            "Upgrade evidence layer",
            "Skipped-record clusters",
            "Upgrade risk findings",
            "Prioritised remediation sequence"
        ]
    },
    {
        "id": "incidents",
        "order": 5,
        "title": "Collect the approved incident correlation dataset",
        "stages": [
            14,
            15
        ],
        "summary": "Import the minimum approved incident fields needed to test whether operational events align with configuration findings.",
        "why": "Incidents indicate operational impact but do not prove root cause. Keeping them in a separate personal-data layer makes that boundary visible.",
        "dataPoints": [
            "Incident number",
            "Short description",
            "Opened/resolved dates",
            "State and priority",
            "Affected service or application",
            "Known finding mapping",
            "No work notes, comments, or unnecessary personal data"
        ],
        "scripts": [],
        "formats": [
            "client_incidents.csv",
            "incidents.json",
            "Evidence Explorer HTML"
        ],
        "steps": [
            "Agree the minimum incident fields and date window with the client data owner.",
            "Remove work notes, comments, credentials, and unnecessary personal information.",
            "Name the file with incident in its filename.",
            "Import it here; the Workbench routes it to the approved incident evidence layer.",
            "Disposition each incident as supports, contradicts, unrelated, or insufficient evidence during root-cause review."
        ],
        "unlocks": [
            "Incident evidence browser",
            "Impact counts",
            "Root-cause review",
            "Operational context in the final report"
        ]
    },
    {
        "id": "findings",
        "order": 6,
        "title": "Import or build the evidence-linked findings register",
        "stages": [
            14,
            15,
            16
        ],
        "summary": "Create the controlled issue layer that turns evidence into a reviewed finding with severity, confidence, impact, priority, and ownership.",
        "why": "Raw scan and extract rows are evidence, not conclusions. The findings register is where the assessment makes and qualifies its claims.",
        "dataPoints": [
            "Stable finding ID and title",
            "Domain, severity, likelihood, and priority",
            "Root cause and confidence",
            "Confirmed evidence",
            "Impact if not addressed",
            "Recommended remediation",
            "Owner and status"
        ],
        "scripts": [],
        "formats": [
            "findings_register.csv",
            "issues.json",
            "Evidence Explorer HTML"
        ],
        "steps": [
            "Review validated components, scan evidence, skipped records, and incidents together.",
            "Create one stable row per finding using the required data points; do not convert every raw evidence row into a finding.",
            "Name a CSV with findings or register in its filename, or use JSON with an issues/findings array.",
            "Import it. The Workbench normalises the register and generates the Findings, Roadmap, and report views automatically.",
            "Open Relationships and run capped name inference, then accept or reject every proposed link."
        ],
        "unlocks": [
            "Findings register",
            "Priority roadmap",
            "Relationship proposals",
            "Solution workspace",
            "Findings CSV and HTML report"
        ]
    },
    {
        "id": "fixes",
        "order": 7,
        "title": "Complete remediation blocks and safe script references",
        "stages": [
            16,
            17
        ],
        "summary": "Attach an approach, numbered actions, manual work, scripts, verification, rollback, ownership, and approval status to each finding.",
        "why": "A finding without a safe and testable remediation path is not ready for client delivery.",
        "dataPoints": [
            "Approach",
            "Numbered implementation steps",
            "Manual actions",
            "Script IDs",
            "Verification",
            "Rollback",
            "Owner",
            "Destructive/write approval status"
        ],
        "scripts": [
            "FIX-01",
            "FIX-02",
            "FIX-03",
            "FIX-04",
            "FIX-05",
            "FIX-06",
            "FIX-07",
            "FIX-08",
            "FIX-09",
            "FIX-10",
            "FIX-11",
            "FIX-12",
            "FIX-13",
            "FIX-14",
            "FIX-15",
            "FIX-16",
            "FIX-17",
            "FIX-18",
            "FIX-19",
            "FIX-20",
            "FIX-21",
            "FIX-22"
        ],
        "formats": [
            "fixes.json",
            "Evidence Explorer HTML"
        ],
        "steps": [
            "Start with the read-only or PLAN-first pattern linked to the finding domain.",
            "Replace CUSTOMER_APP, CUSTOMER_NAME, and CUSTOMER_INSTANCE and review every customer-specific table, role, scope, sys_id, issue ID, filter, and target before use.",
            "Run write-capable scripts only in a named update set after client approval and a successful dry run.",
            "Import fixes as JSON keyed by finding ID, or import the layered Evidence Explorer HTML.",
            "Resolve every verification, rollback, owner, and approval gap before issuing outputs."
        ],
        "unlocks": [
            "Complete solution workspace",
            "Delivery-ready roadmap",
            "Publication gate",
            "Client remediation report"
        ]
    },
    {
        "id": "reference",
        "order": 8,
        "title": "Declare gaps, questions, decisions, and delivery context",
        "stages": [
            17,
            18
        ],
        "summary": "Record what the assessment did not cover, unresolved questions, sequencing decisions, and the evidence basis for delivery.",
        "why": "A report that does not state its gaps encourages the reader to assume complete coverage.",
        "dataPoints": [
            "Declared gaps",
            "Open questions and owner",
            "Decision and rationale",
            "Target dates and dependencies",
            "Evidence base",
            "Named human approver"
        ],
        "scripts": [],
        "formats": [
            "reference.json",
            "Evidence Explorer HTML"
        ],
        "steps": [
            "Review every deferred workflow stage and failed or missing dataset.",
            "Record each gap and question with an owner and next action.",
            "Import a reference JSON object or layer it into the Evidence Explorer.",
            "Open Report & export and clear each automated publication blocker.",
            "Generate the HTML report, findings CSV, collection checklist, and JSON backup for human sign-off."
        ],
        "unlocks": [
            "Defensible publication boundary",
            "Decision-ready roadmap",
            "Collection checklist",
            "Final report package"
        ]
    }
];
