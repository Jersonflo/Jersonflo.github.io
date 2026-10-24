"""Une el personaje de Mixamo y sus animaciones en un solo persona.glb.

Uso (desde la carpeta del portafolio):
  blender -b --factory-startup --python tools/build_persona.py -- assets/modelos assets/modelos/persona.glb

El personaje es el .fbx que trae malla; cada otro .fbx aporta una animación.
"""
import bpy, os, sys, re

src, out = sys.argv[sys.argv.index('--') + 1:][:2]
fbx = sorted(f for f in os.listdir(src) if f.lower().endswith('.fbx'))

def clip_name(f):
    n = os.path.splitext(f)[0].lower()
    if 'walk' in n and 'briefcase' in n: return 'walk_briefcase'
    if 'idle' in n and 'briefcase' in n: return 'idle_briefcase'
    if 'walk' in n: return 'walking'
    if 'idle' in n: return 'idle'
    return re.sub(r'\W+', '_', n)

bpy.ops.wm.read_factory_settings(use_empty=True)

# 1. the character: the first file that brings a mesh
character = None
for f in fbx:
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=os.path.join(src, f))
    new = set(bpy.data.objects) - before
    if any(o.type == 'MESH' for o in new):
        character = next(o for o in new if o.type == 'ARMATURE')
        char_file = f
        for a in list(bpy.data.actions): bpy.data.actions.remove(a)
        break
    for o in new: bpy.data.objects.remove(o, do_unlink=True)
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)
if character is None:
    sys.exit('No hay ningún .fbx con malla: descarga el personaje "With Skin".')
print('CHARACTER', char_file, character.name)

# 2. every other file: import, take its action, park it on the character as an NLA track
character.animation_data_create()
for f in fbx:
    if f == char_file or 't-pose' in f.lower(): continue
    before_o, before_a = set(bpy.data.objects), set(bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=os.path.join(src, f))
    acts = [a for a in bpy.data.actions if a not in before_a]
    for o in set(bpy.data.objects) - before_o: bpy.data.objects.remove(o, do_unlink=True)
    if not acts: continue
    act = acts[0]
    act.name = clip_name(f)
    act.use_fake_user = True
    track = character.animation_data.nla_tracks.new()
    track.name = act.name
    strip = track.strips.new(act.name, int(act.frame_range[0]), act)
    if hasattr(strip, 'action_slot') and act.slots:
        strip.action_slot = act.slots[0]
    print('ACTION', act.name, tuple(act.frame_range))

character.animation_data.action = None

# web weight: Mixamo ships 4K textures; 1024 px is plenty at this framing
for img in bpy.data.images:
    w, h = img.size[:]
    if max(w, h) > 1024:
        k = 1024 / max(w, h)
        img.scale(int(w * k), int(h * k))

bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_animations=True,
                          export_animation_mode='NLA_TRACKS', export_yup=True,
                          export_image_format='WEBP', export_image_quality=80)
print('WROTE', out, os.path.getsize(out))
