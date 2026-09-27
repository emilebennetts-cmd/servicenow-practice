/* Generated from DSB Workbench library 1.5 (gen_library.py). */
export const LIB_VERSION = "1.5";
export const BUILD_PHASES = [
    {
        "phase": "0. Prepare",
        "tasks": [
            "Confirm scope name/prefix and create the scoped application (Fluent SDK project or Studio)",
            "Create the working update set / branch and record naming",
            "Confirm sub-production access and clone currency"
        ],
        "types": [
            "Store app / plugin activation"
        ]
    },
    {
        "phase": "1. Data model",
        "types": [
            "Table",
            "Field",
            "Choice list",
            "System property",
            "CMDB / IRE rule"
        ]
    },
    {
        "phase": "2. Security",
        "types": [
            "Role",
            "Group",
            "ACL"
        ]
    },
    {
        "phase": "3. Server logic",
        "types": [
            "Script include",
            "Business rule"
        ]
    },
    {
        "phase": "4. Automation",
        "types": [
            "Flow / subflow",
            "Notification",
            "Scheduled job",
            "Assignment / matching rule",
            "SLA definition",
            "Assessment / survey",
            "OOB application configuration"
        ]
    },
    {
        "phase": "5. Data & integration",
        "types": [
            "Import set / transform map",
            "Integration (REST/SOAP)",
            "Data load / reference data",
            "Integration spoke / connection",
            "Discovery / connector schedule"
        ]
    },
    {
        "phase": "6. Experience",
        "types": [
            "Application menu / module",
            "Form / list layout",
            "Client script / UI policy",
            "Workspace / portal page",
            "Catalog item / record producer",
            "Report / dashboard",
            "Other",
            "Knowledge base / content"
        ]
    },
    {
        "phase": "7. Test & deploy",
        "tasks": [
            "Run PVT in development after build complete",
            "Deploy to test (app repo / update set); run PVT in test",
            "Run UAT with named testers; log defects against requirement IDs",
            "Obtain UAT sign-off; prepare production deployment record (change)",
            "Deploy to production; run PVT; hypercare period; handover documentation"
        ],
        "types": [
            "Governance / documentation"
        ]
    }
];
export const OOB_PROMPTS = {
    "Process": [
        "Can the primary record extend Task so approvals, SLAs, assignment and the activity stream are inherited?",
        "Can Flow Designer (approvals, SLA, notifications) deliver the process without custom scripting?",
        "Is an existing ITSM/CSM/HR process close enough to configure rather than build?"
    ],
    "Data": [
        "Can Import Sets + Transform Maps load the data without scripted loads?",
        "Does an existing table or CSDM class already hold this data?",
        "Are reference lists better as choice lists, reference tables, or existing sys tables?"
    ],
    "Integration": [
        "Is there an IntegrationHub spoke for the target system?",
        "Can a REST step / REST Message with a connection & credential alias replace a scripted integration?",
        "Can the integration be inbound via Import Set API or Scripted REST rather than custom endpoints?"
    ],
    "UI / Experience": [
        "Can form design, UI policies and view rules deliver the behaviour before client scripts?",
        "Is a configurable Workspace or Service Portal/Employee Center page adequate rather than custom UI?",
        "Can Record Producers / Catalog Items front the request experience?"
    ],
    "Reporting": [
        "Can standard reports and dashboards answer the KPI questions?",
        "Do the required fields exist, or must they be added to the data model?",
        "Is Performance Analytics needed for trends, and is it entitled?"
    ],
    "Security / Access": [
        "Can role-based ACLs deliver the access model without scripted conditions?",
        "Do existing roles cover the personas?",
        "Is field-level security required, or is record-level enough?"
    ],
    "Non-functional": [
        "Are indexes needed on the fields used for filtering?",
        "Can scheduled work run in off-peak windows?",
        "Is table auditing required and at what level?"
    ]
};
export const BRIEF_CONTRACT = {
    "version": "dsb-1.0",
    "engagementId": "<from brief>",
    "designNotes": "Markdown text: solution overview, options considered, architecture decisions",
    "components": [
        {
            "id": "CMP-xxx (optional; new if omitted)",
            "name": "",
            "type": "one of LIB.componentTypes",
            "cls": "Out of the box|Configuration|Customisation",
            "scope": "Application|Global",
            "desc": "",
            "reqs": [
                "REQ-001"
            ],
            "upgrade": "Low|Medium|High",
            "justification": "required when cls=Customisation"
        }
    ],
    "buildTasks": [
        {
            "id": "BT-xxx (optional)",
            "title": "",
            "phase": "",
            "component": "CMP-xxx",
            "notes": ""
        }
    ],
    "testCases": [
        {
            "id": "UAT-xxx|PVT-xxx (optional)",
            "kind": "UAT|PVT",
            "title": "",
            "req": "REQ-001",
            "component": "CMP-xxx",
            "persona": "",
            "pre": "",
            "steps": [
                "..."
            ],
            "expected": ""
        }
    ],
    "risks": [
        {
            "title": "",
            "desc": "",
            "cat": "",
            "l": 1,
            "i": 1,
            "treat": ""
        }
    ],
    "assumptions": [
        {
            "title": "",
            "basis": "",
            "validate": ""
        }
    ],
    "dependencies": [
        {
            "title": "",
            "type": "Client|Third party|Internal|Platform"
        }
    ],
    "decisions": [
        {
            "title": "",
            "decision": "",
            "rationale": ""
        }
    ],
    "atfTests": [
        {
            "title": "",
            "req": "REQ-001",
            "steps": [
                "Impersonate",
                "..."
            ],
            "suite": "",
            "note": ""
        }
    ],
    "updateSets": [
        {
            "name": "",
            "scope": "global|sn_xxx|x_xxx",
            "desc": ""
        }
    ]
};
