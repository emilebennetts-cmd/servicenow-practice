# Diagnostic scripts

This directory contains the 29 scripts shipped in Unified Delivery Workbench 1.3.1 as standalone JavaScript for review.

Use `index.csv` to see each script's title, kind, stage, write capability, safety label, and source metadata record.

- Start with read-only or PLAN mode.
- Replace and review every customer placeholder through the workbench profile.
- Confirm the generated instance guard before running.
- Run write-capable scripts only in a named update set after approval and a successful PLAN run.
- Import the generated `servicenow-diagnostic-result/1` JSON into Collection run so the result is validated and linked to the engagement.
