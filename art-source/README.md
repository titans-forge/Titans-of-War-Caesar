# Formation Art Source Kit

This directory documents the deterministic offline source pipeline for the
Formation V2 renderer. Blender is a development dependency only. Players do not
need Blender or Python.

## Formation families

The source kit produces eight late-Republic visual families:

- Roman infantry: mail shirt, Montefortino-style helmet, rectangular scutum,
  pilum or gladius, red-brown tunic, and a restrained cohort palette.
- Gallic infantry: mixed wool tunics and trousers, oval shields, spears or
  swords, limited helmet variation, and an earth/green/russet palette.
- Hellenistic infantry and missile troops with distinct shields, dress, and weapons.
- Auxiliary cavalry, Parthian horse archers, armored cataphracts, and scythed chariots.

Both families share one neutral proportion rig, camera, lighting setup, ground
contact, and orthographic projection. This consistency matters more at game
scale than portrait-level detail.

The source script renders eight directions for `idle`, `walk`, `attack`,
`route`, and `fall`. The packer writes transparent WebP atlases and Phaser atlas
JSON. Generated output is reproducible from the command line:

```bash
npm run art:render:bibracte
npm run art:pack:bibracte
npm run art:render:all
npm run art:pack:all
```

The full Blender run also saves `art-output/formations/formation-source-kit.blend`, so an
artist can refine armor, anatomy, poses, and materials without reconstructing
the camera or export contract.

## Acceptance views

Before promoting an atlas, capture:

1. opening line and deep formations;
2. diagonal movement in all eight directions;
3. front-rank contact;
4. 25, 50, and 75 percent representative losses;
5. route and fall states;
6. 390 x 844 mobile density and 1920 x 1080 desktop density.

Displayed figures are representative markers. They do not claim a literal
one-sprite-per-soldier order of battle.
