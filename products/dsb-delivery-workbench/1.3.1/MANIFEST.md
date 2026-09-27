# Release manifest

- Prepared: 28/09/2026
- Application: Unified Delivery Workbench
- Scope: `x_1577958_dsb`
- Scope sys_id: `17aff6423fa94ebabea0896ca9bb2ea3`
- Version: `1.3.1`

## Primary artefacts

| Artefact | Purpose | Records / size | SHA-256 |
| --- | --- | ---: | --- |
| `package/Unified-Delivery-Workbench-x_1577958_dsb-v1.3.1-package.zip` | Original supplied SDK package | 2,635,020 bytes | `902AFAD3C1618413B7BD22A671A15C373C48BFD4523DC4829ADBDF4F9E0BEB2B` |
| `update-sets/01-DSB-1.3.1-scope-bootstrap.xml` | Creates the application scope before scoped metadata is transported | 1 insert | `9AF705CD39B8143EA61B91B74F2F55959FB518B0B566BC042E2C60F21B3AA206` |
| `update-sets/02-DSB-1.3.1-application.xml` | Complete exported application update set from SWEP TEMP | 2,210 updates / 9,307,781 bytes | `9E8232E9DBC798B59646130257DE8C2697CAA3FDCDEC9F978A331D3EA8329F43` |
| `update-sets/03-DSB-1.3.1-server-modules.xml` | Server modules omitted by the Fluent metadata upload path | 14 inserts / 234,418 bytes | `96D85DEFCD9B61EC7AAD78B1C693CFAEBAC5CE8F9A32467497A56981797BC40F` |

`SHA256SUMS.txt` contains a checksum for every published file in this release.

## Package inventory

- 23 application tables
- 29 diagnostic scripts
- 24 solution patterns
- 1,012 pattern items
- 23 evidence templates
- 32 component types
- 18 system properties
- 1 scripted REST API
- 1 workbench UI page
- 14 server module records
- 2,247 unpacked metadata files

## Transport identifiers

| Item | sys_id | State in SWEP TEMP |
| --- | --- | --- |
| Scope bootstrap retrieved update set | `536ed2c4547834031346d4ae19d5e1ce` | Committed |
| Application local update set | `b2308d163b678310f4237ea693e45a2d` | Complete |
| Server modules retrieved update set | `dca286790e51de663f214878899f22bc` | Committed |
| Installation tracking update set | `facb70d23b278310f4237ea693e45af7` | Complete; intentionally contains 0 customer updates |
