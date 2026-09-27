# Unified Delivery Workbench context

## Product

- Name: Unified Delivery Workbench
- Scope: `x_1577958_dsb`
- Scope sys_id: `17aff6423fa94ebabea0896ca9bb2ea3`
- Current release: `1.3.1`
- Live validation target: SWEP TEMP (`sweptemp.service-now.com`)
- Live validation date: 28/09/2026

## Release state

Release `1.3.1` is installed and live-validated in SWEP TEMP. The application update set is complete, both prerequisite retrieved update sets were previewed and committed, all 13 built-in read-only evidence collectors completed, and a real `EXT-000` output was uploaded and validated.

## Installation routes

The supported audited transport route is the three ordered XML files in `1.3.1/update-sets/`. Preview every file before commit and stop on collisions or missing references.

The supplied SDK package ZIP is retained for provenance and source comparison. SWEP TEMP rejected a direct third-party package install, so do not treat a successful upload of that ZIP as proof of installation on another instance.

## Safety boundary

- The one-button `Collect all` path runs fixed read-only collectors only.
- The diagnostic library contains 29 profiled scripts arranged across the guided phases.
- Five scripts are PLAN/APPLY capable. They are intentionally not executed by an unrestricted “run everything” button.
- APPLY remains blocked until the engagement has a change reference and the operator follows the update-set, approval, verification, and rollback controls.
- Raw SWEP TEMP evidence is not published in this repository.

## Known follow-up

SWEP TEMP denied read access to `sys_upgrade_history_log`, and `subscription_entitlement` requires a Restricted Caller Access privilege. The affected evidence was received with review flags; approve only the minimum read access if those datasets are required for a future assessment.

The packaged application declares `UNLICENSED`. Repository publication preserves provenance but does not establish redistribution rights; see the release licence notice.
