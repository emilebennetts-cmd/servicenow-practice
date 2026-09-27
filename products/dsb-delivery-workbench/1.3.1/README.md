# Unified Delivery Workbench 1.3.1

This directory is the complete, reviewable release used for the SWEP TEMP deployment validated on 28/09/2026.

- `package/` contains the original supplied ServiceNow SDK package.
- `metadata/` contains the unpacked package metadata for diff review.
- `source/` contains the 1.3.1 server modules extracted from the package metadata.
- `diagnostic-scripts/` contains all 29 diagnostic scripts as reviewable JavaScript plus an index.
- `update-sets/` contains the three ordered, reproducible transport files.
- `MANIFEST.md` records the release inventory and checksums.
- `DEPLOY.md` gives the controlled installation sequence.
- `DEPLOYMENT-VALIDATION.md` records what was proved in SWEP TEMP and what remains intentionally guarded.

The live application is available at:

`https://sweptemp.service-now.com/x_1577958_dsb_workbench.do`
