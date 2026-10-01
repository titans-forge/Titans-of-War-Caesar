# Media Rights

The upgraded edition's current release policy is Forge Game Hosting License
1.0 for covered material; earlier MIT grants remain preserved. See LICENSING.md.
Visual media is tracked separately and is not automatically covered by a code
license.

## Generated project assets

The terrain panoramas and formation art under `src/assets/` were generated for
Titans Forge during development. They are stylized teaching assets rather than
documentary images, archaeological reconstructions, or representations of an
exact order of battle.

| Asset family | Files | Release record |
|---|---|---|
| Battlefield terrain | `src/assets/*-terrain.webp` | Owner confirmed OpenAI/Codex and Titans Forge-controlled account on September 30, 2026 |
| Roman and Gallic infantry | `src/assets/roman-*.webp`, `src/assets/helvetian-*.webp` | Same owner-confirmed provider/account record |
| Mounted and specialist units | `src/assets/parthian-*.webp`, `src/assets/roman-auxiliary-cavalry.webp`, `src/assets/pontic-scythed-chariot.webp` | Same owner-confirmed provider/account record |
| Formation V2 unit atlases | `public/unit-atlases/*` | Eight procedural Blender families authored in this repository; reproducible scripts and source record under `art-source/` |
| Interface concept | the privately retained Bibracte interface concept (not exported) | Development reference; not loaded by the application |

On September 30, 2026, the project owner directly confirmed that the generated
image families were produced through the owner's Titans Forge-controlled
OpenAI/Codex account. The public record is
`docs/MEDIA_PROVIDER_CONFIRMATION.json`; private generation transcripts are not
included. Generation dates were not supplied and remain unknown. Applicable
provider terms remain operative. This attestation is not an independent
copyright certification or a public-domain designation.

The Formation V2 atlases are a separate asset family from the earlier
generated portraits. Their geometry, materials, fixed camera, animation poses,
render command, packer, and media record are stored in this repository. The
temporary PNG frames under `art-output/` are ignored; the compact WebP atlases
and Phaser metadata are release assets.

## Third-party interface assets

Interface icons are rendered from Lucide React under the ISC License. Runtime
framework dependencies retain their own package licenses.

## Historical fidelity

Visual assets are atmospheric representations. Scenario claims and documented
historical boundaries are maintained separately in `docs/SOURCES.md` and
`docs/FIDELITY_LEDGER.md`.
