"""Render deterministic Formation V2 unit atlases with Blender."""

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

STATES = {"idle": 2, "walk": 4, "attack": 4, "route": 4, "fall": 5}
FAMILIES = ["roman-infantry", "gallic-infantry", "hellenistic-infantry", "missile-infantry", "auxiliary-cavalry", "horse-archer", "cataphract", "scythed-chariot"]


def material(name, color, metallic=0.0, roughness=0.6):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return mat


def part(name, shape, location, scale, mat, root, rotation=(0, 0, 0)):
    if shape == "sphere":
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, location=location)
    elif shape == "cylinder":
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, location=location)
    elif shape == "cone":
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=1, radius2=.72, location=location)
    elif shape == "torus":
        bpy.ops.mesh.primitive_torus_add(major_segments=16, minor_segments=6, location=location)
    else:
        bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = rotation
    obj.data.materials.append(mat)
    obj.parent = root
    bevel = obj.modifiers.new("soft-edges", "BEVEL")
    bevel.width = .05
    bevel.segments = 2
    return obj


def bow(root, mats, x=.45, y=-.05, z=1.7, size=1):
    return [
        part("bow-upper", "cylinder", (x, y, z), (.025, .025, .43 * size), mats["wood"], root, (.35, 0, 0)),
        part("bow-lower", "cylinder", (x, y, z - .65 * size), (.025, .025, .43 * size), mats["wood"], root, (-.35, 0, 0)),
    ]


def infantry(family, mats):
    root = bpy.data.objects.new(f"{family}-rig", None)
    bpy.context.collection.objects.link(root)
    style = {
        "roman-infantry": ("roman", "mail"),
        "gallic-infantry": ("gallic", "gallic"),
        "hellenistic-infantry": ("eastern", "linen"),
        "missile-infantry": ("missile", "leather"),
    }[family]
    tunic, armor = mats[style[0]], mats[style[1]]
    part("torso", "cone", (0, 0, 1.42), (.36, .25, .48), armor, root)
    part("skirt", "cone", (0, 0, 1.02), (.38, .28, .28), tunic, root)
    part("head", "sphere", (0, 0, 2.02), (.23, .21, .27), mats["skin"], root)
    part("helmet", "sphere", (0, 0, 2.15), (.27, .24, .19), mats["bronze"], root)
    if family != "missile-infantry":
        part("crest", "cone", (0, 0, 2.34), (.08, .16, .18), mats["bronze"], root)
    limbs = [
        part("left-leg", "cylinder", (-.16, 0, .55), (.1, .1, .48), mats["skin"], root),
        part("right-leg", "cylinder", (.16, 0, .55), (.1, .1, .48), mats["skin"], root),
        part("left-arm", "cylinder", (-.42, 0, 1.42), (.085, .085, .47), mats["skin"], root),
        part("right-arm", "cylinder", (.42, 0, 1.42), (.085, .085, .47), mats["skin"], root),
    ]
    if family == "roman-infantry":
        part("shield", "cube", (-.52, -.12, 1.28), (.34, .09, .62), mats["roman-shield"], root)
    else:
        size = (.28, .4, .08) if family == "missile-infantry" else (.48, .66, .1)
        shield = mats["gallic-shield"] if family == "gallic-infantry" else mats["eastern-shield"]
        part("shield", "cylinder", (-.5, -.12, 1.3), size, shield, root, (math.pi / 2, 0, 0))
    if family == "missile-infantry":
        limbs += bow(root, mats)
        weapon = part("weapon", "cylinder", (.38, 0, 1.56), (.018, .018, .7), mats["wood"], root, (math.pi / 2, 0, 0))
        head = part("weapon-head", "cone", (.38, -.72, 1.56), (.045, .045, .13), mats["iron"], root, (math.pi / 2, 0, 0))
    else:
        weapon = part("weapon", "cylinder", (.46, 0, 1.65), (.025, .025, 1.15), mats["wood"], root, (.12, 0, 0))
        head = part("weapon-head", "cone", (.46, 0, 2.84), (.07, .07, .19), mats["iron"], root)
    rig(root, "infantry", limbs, weapon, head)
    return root


def horse(root, mats, prefix, x=0, y=0, armored=False):
    coat = mats["iron"] if armored else mats["horse"]
    part(f"{prefix}-body", "sphere", (x, y, .98), (.48, .82, .42), coat, root)
    part(f"{prefix}-neck", "cylinder", (x, y - .62, 1.35), (.18, .18, .55), coat, root, (.58, 0, 0))
    part(f"{prefix}-head", "sphere", (x, y - .94, 1.67), (.22, .35, .22), coat, root)
    return [part(f"{prefix}-leg-{i}", "cylinder", (x + lx, y + ly, .42), (.07, .07, .48), coat, root) for i, (lx, ly) in enumerate(((-.28, -.38), (.28, -.38), (-.28, .42), (.28, .42)))]


def mounted(family, mats):
    root = bpy.data.objects.new(f"{family}-rig", None)
    bpy.context.collection.objects.link(root)
    heavy = family == "cataphract"
    limbs = horse(root, mats, "horse", armored=heavy)
    armor = mats["iron"] if heavy else mats["mail"] if family == "auxiliary-cavalry" else mats["leather"]
    tunic = mats["roman"] if family == "auxiliary-cavalry" else mats["eastern"]
    part("rider-torso", "cone", (0, .02, 1.92), (.3, .22, .42), armor, root)
    part("rider-skirt", "cone", (0, .03, 1.62), (.31, .25, .2), tunic, root)
    part("rider-head", "sphere", (0, -.02, 2.42), (.2, .19, .24), mats["skin"], root)
    part("rider-helmet", "sphere", (0, -.02, 2.56), (.24, .22, .17), mats["iron"] if heavy else mats["bronze"], root)
    limbs += [part("rider-left-arm", "cylinder", (-.34, -.03, 1.98), (.075, .075, .38), mats["skin"], root), part("rider-right-arm", "cylinder", (.34, -.03, 1.98), (.075, .075, .38), mats["skin"], root)]
    if family == "horse-archer":
        limbs += bow(root, mats, .4, -.05, 2.03, .85)
        weapon = part("weapon", "cylinder", (.34, -.02, 2), (.015, .015, .58), mats["wood"], root, (math.pi / 2, 0, 0))
        head = part("weapon-head", "cone", (.34, -.61, 2), (.04, .04, .11), mats["iron"], root, (math.pi / 2, 0, 0))
    else:
        weapon = part("weapon", "cylinder", (.42, -.2, 2.03), (.022, .022, 1.32), mats["wood"], root, (.55, 0, 0))
        head = part("weapon-head", "cone", (.42, -1.31, 2.75), (.07, .07, .2), mats["iron"], root, (.55, 0, 0))
    rig(root, "mounted", limbs, weapon, head)
    root.scale = (.78, .78, .78)
    return root


def chariot(mats):
    root = bpy.data.objects.new("scythed-chariot-rig", None)
    bpy.context.collection.objects.link(root)
    limbs = horse(root, mats, "left-horse", -.42, -.32) + horse(root, mats, "right-horse", .42, -.32)
    part("cart", "cube", (0, .78, .72), (.62, .5, .34), mats["wood"], root)
    part("left-wheel", "torus", (-.72, .8, .55), (.38, .38, .11), mats["bronze"], root, (math.pi / 2, 0, 0))
    part("right-wheel", "torus", (.72, .8, .55), (.38, .38, .11), mats["bronze"], root, (math.pi / 2, 0, 0))
    part("left-scythe", "cylinder", (-1.05, .8, .55), (.035, .035, .52), mats["iron"], root, (0, math.pi / 2, 0))
    part("right-scythe", "cylinder", (1.05, .8, .55), (.035, .035, .52), mats["iron"], root, (0, math.pi / 2, 0))
    part("driver", "cone", (0, .78, 1.42), (.28, .22, .44), mats["eastern"], root)
    part("driver-head", "sphere", (0, .72, 1.98), (.2, .19, .24), mats["skin"], root)
    rig(root, "chariot", limbs)
    root.scale = (.63, .63, .63)
    return root


def rig(root, kind, limbs, weapon=None, head=None):
    root["kind"] = kind
    root["limbs"] = [obj.name for obj in limbs]
    root["weapon"] = weapon.name if weapon else ""
    root["weapon-head"] = head.name if head else ""
    if weapon:
        root["weapon-origin"] = list(weapon.location)
        root["head-origin"] = list(head.location)


def pose(root, state, frame, count):
    z_rotation = root.rotation_euler.z
    root.rotation_euler = (0, 0, z_rotation)
    root.location = (0, 0, 0)
    for name in root["limbs"]:
        bpy.data.objects[name].rotation_euler = (0, 0, 0)
    if root["weapon"]:
        bpy.data.objects[root["weapon"]].location = root["weapon-origin"]
        bpy.data.objects[root["weapon-head"]].location = root["head-origin"]
    phase = frame / max(1, count - 1)
    limbs = [bpy.data.objects[name] for name in root["limbs"]]
    mobile = root["kind"] != "infantry"
    if state == "idle":
        root.location.z = math.sin(phase * math.tau) * (.018 if mobile else .012)
    elif state in {"walk", "route"}:
        swing = math.sin(phase * math.tau) * (.82 if state == "route" else .58)
        for i, limb in enumerate(limbs):
            limb.rotation_euler.y = swing if i % 2 == 0 else -swing
        root.location.z = abs(math.sin(phase * math.tau)) * (.1 if mobile else .06)
        if state == "route":
            root.rotation_euler.x = .16
    elif state == "attack":
        strike = math.sin(phase * math.pi)
        root.rotation_euler.x = strike * (.08 if mobile else .13)
        if root["weapon"]:
            bpy.data.objects[root["weapon"]].rotation_euler.x -= strike * .55
            bpy.data.objects[root["weapon-head"]].rotation_euler.x -= strike * .55
    elif state == "fall":
        root.rotation_euler.y = phase * (1.1 if root["kind"] == "chariot" else 1.45)
        root.location.z = -phase * (.25 if mobile else .45)
        root.location.x = phase * .22


def scene_setup(output):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = 192, 256, 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.look = "AgX - Medium High Contrast"
    for location, energy, size in [((4.5, -5, 7), 1050, 5), ((-4, 1.5, 4), 450, 4)]:
        bpy.ops.object.light_add(type="AREA", location=location)
        bpy.context.object.data.energy, bpy.context.object.data.size = energy, size
    bpy.ops.object.camera_add(location=(5.4, -8.4, 4.5))
    camera = bpy.context.object
    camera.data.type, camera.data.ortho_scale = "ORTHO", 3.95
    camera.rotation_euler = (Vector((0, 0, 1.42)) - camera.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = camera
    output.mkdir(parents=True, exist_ok=True)
    return scene


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--family", default="all")
    parser.add_argument("--output", required=True)
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    output = Path(args.output).resolve()
    scene = scene_setup(output)
    mats = {
        "skin": material("skin", (.55, .32, .2, 1)), "mail": material("mail", (.16, .18, .18, 1), .65, .3),
        "linen": material("linen", (.64, .58, .42, 1), .05, .65), "leather": material("leather", (.25, .13, .06, 1), 0, .72),
        "bronze": material("bronze", (.42, .26, .08, 1), .7, .28), "iron": material("iron", (.23, .25, .26, 1), .8, .24),
        "wood": material("wood", (.24, .1, .035, 1), 0, .75), "horse": material("horse", (.24, .12, .06, 1), 0, .74),
        "roman": material("roman-tunic", (.42, .055, .035, 1)), "roman-shield": material("roman-shield", (.5, .035, .025, 1), .15, .45),
        "gallic": material("gallic-tunic", (.23, .31, .16, 1)), "gallic-shield": material("gallic-shield", (.38, .18, .055, 1), .1, .55),
        "eastern": material("eastern-tunic", (.08, .29, .32, 1)), "eastern-shield": material("eastern-shield", (.13, .32, .38, 1), .15, .5),
        "missile": material("missile-tunic", (.39, .28, .12, 1)),
    }
    families = FAMILIES if args.family == "all" else (["roman-infantry", "gallic-infantry"] if args.family == "bibracte" else [args.family])
    if set(families) - set(FAMILIES):
        raise ValueError(f"Unknown family: {args.family}")
    roots = [mounted(f, mats) if f in {"auxiliary-cavalry", "horse-archer", "cataphract"} else chariot(mats) if f == "scythed-chariot" else infantry(f, mats) for f in families]
    for root in roots:
        root.hide_render = True
    bpy.ops.wm.save_as_mainfile(filepath=str(output / "formation-source-kit.blend"))
    for root in roots:
        for candidate in roots:
            candidate.hide_render = candidate != root
        for state, count in STATES.items():
            for direction in range(8):
                for frame in range(count):
                    pose(root, state, frame, count)
                    root.rotation_euler.z = direction * math.tau / 8
                    family = root.name.replace("-rig", "")
                    scene.render.filepath = str(output / f"{family}__{state}__d{direction}__f{frame}.png")
                    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
