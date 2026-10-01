# Licensing checkpoint: Titans of War: Caesar

Checkpoint: **FG-LIC-20260930-06-GH1**. Prepared September 30, 2026.
Prepared for owner-authorized source publication. Successful upload is recorded
separately against the final public commit.

## Upgraded edition and migration boundary

The owner confirms the game has been substantially updated since its first
licensed release. Those existing gameplay upgrades are distinct from this
source migration: the migration itself changes packaging and documentation,
not gameplay or media. The current release policy is the Forge license for
Titans Forge-controlled material within its stated scope, subject to existing
grants and separately licensed components. Retaining a legacy MIT notice does
not automatically license future additions under MIT. The owner confirmed the
generated terrain and portrait provider/account on September 30, 2026; see
[the confirmation record](docs/MEDIA_PROVIDER_CONFIRMATION.json).

## Current policy and earlier MIT grants

The current project policy is [Forge Game Hosting License 1.0](LICENSE), a
source-available licence rather than an OSI-approved open-source licence. For
newly covered material only, companies with gross annual revenue over
US$1,000,000 need a separate agreement to publicly host their own playable copy.
See the full terms for scope, exemptions and preserved platform permissions.

The selected original source includes an MIT notice, retained byte-for-byte in
[LICENSE-LEGACY-MIT.txt](LICENSE-LEGACY-MIT.txt). Its SHA-256 is
`f5ba04d99816b6e73a183fcba80bfdcdab78c82a075a21f183fe4ca4dfaa1cd9`. Previously MIT-licensed material remains usable and hostable
under MIT. This export cannot make identical earlier MIT material exclusively
Forge-licensed. This migration creates no additional gameplay upgrade and does
not overwrite an old release.
The prior working-file snapshot is identified by SHA-256 `375acea3993e1c06d3957b5b5d7679ee15643d783b5c35e8393670577d5c1b6e`;
there is no invented prior Git commit. The preserved runtime-file hashes are
listed in [SOURCE_SNAPSHOT.json](SOURCE_SNAPSHOT.json).

Newly authored checkpoint documents and release-notice staging support are
offered under the Forge terms. Owner-controlled upgraded game material not
already granted under MIT or other terms is also covered by the Forge release
policy. This checkpoint does not claim an exclusive Forge grant over identical
previously MIT-supplied material. Future covered game changes need an identifiable
release boundary. Dependencies, media and prior grants retain their own terms;
the root licence is not a blanket claim over third-party or generated assets.
See [MEDIA_RIGHTS.md](MEDIA_RIGHTS.md) and [the public media inventory](docs/MEDIA_PROVENANCE_PUBLIC.json).

`npm run build` stages rights notices after the build. Direct Vite invocation
does not perform that lifecycle step: run `node scripts/stage-release-licenses.mjs`
and then its `--check` mode before redistributing a direct build.
The source-publication preflight verified 37 of 37 original application/media
members against the recorded itch archive. Licensing notices were checked
separately. This is a payload-identity check, not a complete legal rights audit.
No private Git history is exported.
