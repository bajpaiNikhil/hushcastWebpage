# Scene A (hero) for the HushCast website. Low-poly tablet + laptop, baked lighting.
# Run in a background Blender: it starts from an empty file, builds, saves web-scenes.blend.
# Units: metres. Camera looks along +Y. Device fronts face -Y.
import bpy, bmesh, math, os
from mathutils import Vector

ROOT = os.environ.get('HC_WEB', '/Users/nikhilbajpai/Desktop/hushCastWebPage') + '/blender'

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)

def mat(name, color, rough=0.5, metal=0.0, emit=None):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = srgb(color)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = srgb(emit)
        b.inputs['Emission Strength'].default_value = 1.0
    return m

def slab(name, w, d, h, r, seg, axis):
    """Rounded box. axis = the edge direction to round ('X','Y','Z')."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= w; v.co.y *= d; v.co.z *= h
    ai = 'XYZ'.index(axis)
    edges = [e for e in bm.edges if abs((e.verts[0].co - e.verts[1].co)[ai]) > 1e-6]
    bmesh.ops.bevel(bm, geom=edges, offset=r, segments=seg, profile=0.5, affect='EDGES', clamp_overlap=True)
    soft = min(w, d, h) * 0.22
    rest = [e for e in bm.edges if not e.is_boundary and e.calc_face_angle(0) > math.radians(50)]
    bmesh.ops.bevel(bm, geom=rest, offset=soft, segments=1, profile=0.5, affect='EDGES', clamp_overlap=True)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob

def assign_front(ob, front_mat, normal=Vector((0, -1, 0))):
    if front_mat.name not in ob.data.materials: ob.data.materials.append(front_mat)
    idx = list(ob.data.materials).index(front_mat)
    for p in ob.data.polygons:
        if p.normal.dot(normal) > 0.98: p.material_index = idx

def plane(name, w, h, m):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    uv = bm.loops.layers.uv.new('UVMap')
    for f in bm.faces:
        for l in f.loops:
            l[uv].uv = (l.vert.co.x + 0.5, l.vert.co.y + 0.5)
    for v in bm.verts:
        v.co = Vector((v.co.x * w, 0, v.co.y * h))   # stand up in XZ; the face normal is now -Y
    bm.to_mesh(me); bm.free()
    me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob

def empty(name, parent, loc):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 0.02
    bpy.context.scene.collection.objects.link(e)
    e.parent = parent; e.location = loc
    return e

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 64
    sc.view_settings.view_transform = 'Standard'
    world = bpy.data.worlds.new('World'); sc.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get('Background')
    bg.inputs['Color'].default_value = srgb('#0B0B0D'); bg.inputs['Strength'].default_value = 1.0

    body = mat('M_Body', '#7A7A80', rough=0.38)        # laptop + router: light aluminium, so it separates from the page
    tbody = mat('M_TabBody', '#3A3A40', rough=0.35)    # tablet: graphite
    glass = mat('M_Glass', '#060607', rough=0.32)
    deck = mat('M_Deck', '#18181B', rough=0.6)
    ground_m = mat('M_Ground', '#0E0E10', rough=0.9)
    scr_t = mat('M_ScreenTablet', '#000000', emit='#0E0E10')
    scr_l = mat('M_ScreenLaptop', '#000000', emit='#0E0E10')

    rig = bpy.data.objects.new('Rig', None); sc.collection.objects.link(rig)

    # Tablet 255 x 163 x 7 mm, floating, front-left
    tab = slab('Tablet', 0.255, 0.007, 0.163, 0.012, 4, 'Y')
    tab.data.materials.append(tbody); assign_front(tab, glass)
    tab.parent = rig
    tab.location = (-0.175, -0.02, 0.112)
    tab.rotation_euler = (math.radians(-9), 0, math.radians(13))
    st = plane('Screen_Tablet', 0.229, 0.139, scr_t); st.parent = tab; st.location = (0, -0.0037, 0)
    empty('ANCHOR_TabletOut', tab, (0.104, -0.004, -0.02))

    # Laptop 13 in, further back right
    lap = bpy.data.objects.new('Laptop', None); sc.collection.objects.link(lap)
    lap.parent = rig; lap.location = (0.215, 0.33, 0.0); lap.rotation_euler = (0, 0, math.radians(-26))
    base = slab('LaptopBase', 0.304, 0.212, 0.009, 0.011, 4, 'Z')
    base.data.materials.append(body); base.parent = lap; base.location = (0, 0, 0.0045)
    kb = plane('Keyboard', 0.268, 0.098, deck); kb.parent = base
    kb.rotation_euler = (math.radians(-90), 0, 0); kb.location = (0, 0.035, 0.0047)
    tp = plane('Trackpad', 0.112, 0.068, deck); tp.parent = base
    tp.rotation_euler = (math.radians(-90), 0, 0); tp.location = (0, -0.058, 0.0047)
    lid = slab('LaptopLid', 0.304, 0.005, 0.200, 0.011, 4, 'Y')
    for v in lid.data.vertices: v.co.z += 0.100
    lid.data.materials.append(body); assign_front(lid, glass)
    lid.parent = lap; lid.location = (0, 0.104, 0.0095); lid.rotation_euler = (math.radians(-17), 0, 0)
    sl = plane('Screen_Laptop', 0.282, 0.176, scr_l); sl.parent = lid; sl.location = (0, -0.0027, 0.104)
    empty('ANCHOR_LaptopIn', lid, (-0.112, -0.003, 0.07))

    # Your WiFi router, on the floor between the two devices (the arc of the cast passes over it)
    rt = slab('Router', 0.150, 0.100, 0.026, 0.014, 3, 'Z')
    rt.data.materials.append(body); rt.parent = rig
    rt.location = (-0.02, 0.36, 0.013); rt.rotation_euler = (0, 0, math.radians(-14))
    for i, sx in enumerate((-1, 1)):
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.0035, depth=0.085)
        an = bpy.context.active_object; an.name = f'RouterAntenna{i}'
        an.data.materials.append(body); an.parent = rt
        an.location = (sx * 0.062, 0.042, 0.052); an.rotation_euler = (math.radians(-8), math.radians(sx * 10), 0)
    led = mat('M_Led', '#F5F5F7', rough=0.3, emit='#F5F5F7')
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=5, radius=0.0035)
    ld = bpy.context.active_object; ld.name = 'RouterLed'; ld.data.materials.append(led); ld.parent = rt
    ld.location = (-0.045, -0.0505, 0.004)

    # (The cloud is drawn on the page as a thin outline, like the privacy diagram, in scenes/hero.ts.)

    # Ground disc (soft shadow catcher), triangle fan
    me = bpy.data.meshes.new('Ground'); bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, cap_tris=True, segments=48, radius=0.78)
    bm.to_mesh(me); bm.free(); me.materials.append(ground_m)
    gr = bpy.data.objects.new('Ground', me); sc.collection.objects.link(gr); gr.parent = rig
    gr.location = (0.02, 0.14, 0)

    # Lights for the bake only (not exported): soft key front-left, rim back-right, top fill
    def area(name, loc, size, energy, target=(0.02, 0.14, 0.08)):
        ld = bpy.data.lights.new(name, 'AREA'); ld.size = size; ld.energy = energy; ld.color = (1, 1, 1)
        lo = bpy.data.objects.new(name, ld); sc.collection.objects.link(lo); lo.location = loc
        d = Vector(target) - Vector(loc); lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    area('Key', (-0.75, -0.85, 0.95), 0.9, 30)
    area('Rim', (0.85, 0.95, 0.55), 0.6, 55)
    area('Rim2', (-0.9, 0.7, 0.45), 0.5, 30)   # second rim from the left: a bright edge on both devices
    area('Top', (0.05, 0.15, 1.3), 1.4, 9)

    cam = bpy.data.objects.new('Cam_Preview', bpy.data.cameras.new('Cam_Preview'))
    sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens_unit = 'FOV'; cam.data.angle = math.radians(26)
    cam.location = (-0.16, -1.30, 0.46)
    d = Vector((0.03, 0.12, 0.10)) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.resolution_x = 1600; sc.render.resolution_y = 1000
    sc.render.film_transparent = False
    bpy.context.view_layer.update()

def bake():
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 192
    try: sc.cycles.device = 'GPU'
    except Exception: pass
    devices = [bpy.data.objects[n] for n in ('Tablet', 'LaptopBase', 'LaptopLid', 'Keyboard', 'Trackpad', 'Router', 'RouterAntenna0', 'RouterAntenna1', 'RouterLed')]
    ground = bpy.data.objects['Ground']
    atlas = bpy.data.images.get('A_atlas') or bpy.data.images.new('A_atlas', 1024, 1024, alpha=False)
    gimg = bpy.data.images.get('A_ground') or bpy.data.images.new('A_ground', 512, 512, alpha=False)

    def uv_pack(objs, margin):
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs: o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=margin, scale_to_bounds=False)
        bpy.ops.uv.pack_islands(margin=margin)
        bpy.ops.object.mode_set(mode='OBJECT')

    def bake_into(objs, img):
        for o in objs:
            for m in o.data.materials:
                nt = m.node_tree
                n = nt.nodes.get('BakeTarget') or nt.nodes.new('ShaderNodeTexImage'); n.name = 'BakeTarget'
                n.image = img; nt.nodes.active = n
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs: o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        sc.render.bake.margin = 6
        bpy.ops.object.bake(type='COMBINED', margin=6, use_clear=True)

    uv_pack(devices, 0.012)
    bake_into(devices, atlas)
    # ground: planar UV from top
    me = ground.data
    uvl = me.uv_layers.get('UVMap') or me.uv_layers.new(name='UVMap')
    for poly in me.polygons:
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uvl.data[li].uv = (co.x / 1.56 + 0.5, co.y / 1.56 + 0.5)
    bake_into([ground], gimg)

    os.makedirs(ROOT + '/bake', exist_ok=True)
    for img, fn in ((atlas, 'A_atlas.png'), (gimg, 'A_ground.png')):
        img.filepath_raw = ROOT + '/bake/' + fn; img.file_format = 'PNG'; img.save()

    # Swap to 4 export materials: devices + ground use their baked image as an unlit-style base colour
    def baked_mat(name, img):
        m = bpy.data.materials.new(name); m.use_nodes = True
        nt = m.node_tree; b = nt.nodes.get('Principled BSDF')
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = img
        nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
        b.inputs['Roughness'].default_value = 1.0
        return m
    md = baked_mat('M_A_Devices', atlas); mg = baked_mat('M_A_Ground', gimg)
    for o in devices:
        o.data.materials.clear(); o.data.materials.append(md)
    ground.data.materials.clear(); ground.data.materials.append(mg)

def export():
    sc = bpy.context.scene
    keep = {'Rig', 'Tablet', 'Screen_Tablet', 'ANCHOR_TabletOut', 'Laptop', 'LaptopBase', 'Keyboard', 'Trackpad',
            'LaptopLid', 'Screen_Laptop', 'ANCHOR_LaptopIn', 'Ground', 'Router', 'RouterAntenna0', 'RouterAntenna1',
            'RouterLed'}
    bpy.ops.object.select_all(action='DESELECT')
    for o in sc.objects:
        if o.name in keep: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=ROOT + '/exports/hero.glb', export_format='GLB', use_selection=True,
        export_apply=True, export_yup=True, export_image_format='WEBP', export_image_quality=82,
        export_cameras=False, export_lights=False, export_animations=False, export_extras=False)

def preview(path):
    sc = bpy.context.scene
    sc.render.filepath = path; sc.render.image_settings.file_format = 'PNG'
    sc.cycles.samples = 48
    bpy.ops.render.render(write_still=True)

if __name__ == '__main__':
    # blender --background --factory-startup --python build_scene_a.py -- build preview bake export
    import sys
    steps = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['build']
    if 'build' in steps:
        build()
    else:
        bpy.ops.wm.open_mainfile(filepath=ROOT + '/web-scenes.blend')
    if 'preview' in steps:
        preview(ROOT + '/previews/a_preview.png')
    if 'bake' in steps:
        bake()
    if 'bake' in steps or 'build' in steps:
        bpy.ops.wm.save_as_mainfile(filepath=ROOT + '/web-scenes.blend')
    if 'export' in steps:
        export()
    print('HC_DONE', steps)
