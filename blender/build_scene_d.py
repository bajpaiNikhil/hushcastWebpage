# Scene D (the dot) for the HushCast website: the launcher icon, extruded.
# Geometry comes straight from the app icon's vector paths (assets/icons/hushcast-icon-*.svg,
# converted from ic_launcher_foreground.xml): same points, same stroke widths, nothing redrawn.
# The dot is its own mesh (Dot) so the page can swap red (idle) and green (casting).
# No baked textures: the page shades it with tiny generated matcaps. 1 unit = 100 icon units.
# Run: blender --background --factory-startup --python build_scene_d.py
import bpy, bmesh, math, os
from mathutils import Vector

ROOT = os.environ.get('HC_WEB', '/Users/nikhilbajpai/Desktop/hushCastWebPage') + '/blender'
DEPTH = 0.10          # tile thickness
FRONT = -DEPTH / 2    # front face (faces -Y, towards the camera)

def T(x, y, lift=0.0):
    """Icon units (SVG, y down) -> Blender. Applies the icon's own group transform first:
    translate(-2,4) translate(56,50) scale(0.86) translate(-56,-50)."""
    xs, ys = 0.86 * x + 5.84, 0.86 * y + 11.0
    return Vector(((xs - 54) / 100, FRONT - lift, (54 - ys) / 100))

def mat(name):
    return bpy.data.materials.get(name) or bpy.data.materials.new(name)

def link(ob):
    bpy.context.scene.collection.objects.link(ob); return ob

def tube(name, splines, radius, m, lift):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = radius; cu.bevel_resolution = 3; cu.resolution_u = 10; cu.use_fill_caps = True
    for sp in splines:
        kind, pts = sp[0], sp[1:]
        if kind == 'line':
            s = cu.splines.new('POLY'); s.points.add(len(pts) - 1)
            for i, (x, y) in enumerate(pts): s.points[i].co = (*T(x, y, lift), 1)
        elif kind == 'bez':   # [(p, hl, hr), ...] in icon units
            s = cu.splines.new('BEZIER'); s.bezier_points.add(len(pts) - 1)
            for i, (p, hl, hr) in enumerate(pts):
                b = s.bezier_points[i]; b.co = T(*p, lift); b.handle_left = T(*hl, lift); b.handle_right = T(*hr, lift)
        elif kind == 'loop':
            s = cu.splines.new('POLY'); s.points.add(len(pts) - 1); s.use_cyclic_u = True
            for i, (x, y) in enumerate(pts): s.points[i].co = (*T(x, y, lift), 1)
    cu.materials.append(m)
    ob = link(bpy.data.objects.new(name, cu))
    return ob

def caps(name, ends, radius, m, lift):
    """Round line caps: small spheres at the open ends of the thick strokes."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    for (x, y) in ends:
        r = bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=radius)
        bmesh.ops.translate(bm, verts=r['verts'], vec=T(x, y, lift))
    bm.to_mesh(me); bm.free(); me.materials.append(m)
    return link(bpy.data.objects.new(name, me))

def rrect(x0, y0, x1, y1, r, seg=6):
    pts = []
    for cx, cy, a0 in ((x1 - r, y0 + r, -90), (x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180)):
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg); pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def slab_from_outline(name, pts, depth, m, lift):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    vs = [bm.verts.new(T(x, y, lift)) for x, y in pts]
    f = bm.faces.new(vs)
    ex = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, verts=[v for v in ex['geom'] if isinstance(v, bmesh.types.BMVert)], vec=(0, depth, 0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.triangulate(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free(); me.materials.append(m)
    return link(bpy.data.objects.new(name, me))

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    M = {n: mat(n) for n in ('M_Tile', 'M_Stroke', 'M_Faint', 'M_Box', 'M_Dot')}

    # Tile: 108 x 108, corner radius 26, as a rounded slab (front face towards -Y)
    me = bpy.data.meshes.new('Tile'); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co.x *= 1.08; v.co.y *= DEPTH; v.co.z *= 1.08
    bmesh.ops.bevel(bm, geom=[e for e in bm.edges if abs((e.verts[0].co - e.verts[1].co).y) > 1e-6],
                    offset=0.26, segments=10, profile=0.5, affect='EDGES', clamp_overlap=True)
    rest = [e for e in bm.edges if e.calc_face_angle(0) > math.radians(50)]
    bmesh.ops.bevel(bm, geom=rest, offset=0.018, segments=3, profile=0.5, affect='EDGES', clamp_overlap=True)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    bm.to_mesh(me); bm.free(); me.materials.append(M['M_Tile'])
    link(bpy.data.objects.new('Tile', me))

    k = 0.86 / 100   # icon units -> metres after the group scale
    # the H: two stems (width 8) and the wave (width 6)
    tube('Stems', [('line', (34, 36), (34, 80)), ('line', (60, 46), (60, 80))], 4 * k, M['M_Stroke'], 0.6 * 4 * k)
    tube('Wave', [('bez', ((34, 60), (27, 69), (41, 51)), ((54, 59), (47, 68), (57, 55)), ((60, 59), (58, 58), (62, 60)))],
         3 * k, M['M_Stroke'], 0.6 * 4 * k)
    caps('Caps', [(34, 36), (34, 80), (60, 46), (60, 80)], 4 * k, M['M_Stroke'], 0.6 * 4 * k)
    # the three faint links (width 1.8, 22% white)
    tube('Links', [('bez', ((60, 31), (54, 36), (66, 26)), ((72, 22), (69, 24), (75, 20))),
                   ('bez', ((61, 33), (54, 33), (68, 33)), ((79, 35), (74, 34), (84, 36))),
                   ('bez', ((60, 36), (53, 31), (67, 41)), ((76, 48), (72, 45), (80, 51)))], 0.9 * k, M['M_Faint'], 0.3 * 4 * k)
    # the three viewer screens: dark plates with a white outline (width 2.4)
    rects = [(68, 15, 80, 23.5), (79, 30, 91, 38.5), (76, 46, 88, 54.5)]
    for i, (x0, y0, x1, y1) in enumerate(rects):
        slab_from_outline(f'Screen{i}', rrect(x0, y0, x1, y1, 2.6), 0.02, M['M_Box'], 0.6 * 4 * k)
    tube('Outlines', [('loop', *rrect(x0, y0, x1, y1, 2.6)) for (x0, y0, x1, y1) in rects], 1.2 * k, M['M_Stroke'], 0.6 * 4 * k + 0.004)
    # the dot (r = 5), its own mesh: a slightly flattened bead
    me = bpy.data.meshes.new('Dot'); bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=14, radius=5 * k)
    for v in bm.verts: v.co.y *= 0.7
    bmesh.ops.translate(bm, verts=bm.verts, vec=T(60, 32, 0.8 * 4 * k))
    bm.to_mesh(me); bm.free(); me.materials.append(M['M_Dot'])
    link(bpy.data.objects.new('Dot', me))

    # convert curves to meshes and join by material: Strokes, Faint, Boxes
    for o in list(bpy.context.scene.objects):
        if o.type == 'CURVE':
            bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
            bpy.ops.object.convert(target='MESH')
    def join(names, new):
        obs = [bpy.data.objects[n] for n in names]
        bpy.ops.object.select_all(action='DESELECT')
        for o in obs: o.select_set(True)
        bpy.context.view_layer.objects.active = obs[0]
        if len(obs) > 1: bpy.ops.object.join()
        obs[0].name = new; obs[0].data.name = new
    join(['Stems', 'Wave', 'Caps', 'Outlines'], 'Strokes')
    join(['Links'], 'Faint')
    join(['Screen0', 'Screen1', 'Screen2'], 'Boxes')
    for o in bpy.context.scene.objects:
        if o.type == 'MESH':
            bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
            bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
            bpy.ops.mesh.remove_doubles(threshold=1e-5); bpy.ops.mesh.normals_make_consistent(inside=False)
            bpy.ops.object.mode_set(mode='OBJECT')
            bpy.ops.object.shade_smooth() if o.name in ('Strokes', 'Faint', 'Dot') else None
    rig = link(bpy.data.objects.new('Icon', None))
    for o in bpy.context.scene.objects:
        if o.type == 'MESH': o.parent = rig
    e = link(bpy.data.objects.new('ANCHOR_IconIn', None)); e.parent = rig; e.location = (-0.54, 0, 0)

def export():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=ROOT + '/exports/icon.glb', export_format='GLB', use_selection=True,
        export_apply=True, export_yup=True, export_normals=True, export_texcoords=False, export_materials='EXPORT',
        export_cameras=False, export_lights=False, export_animations=False, export_extras=False)
    tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    print('HC_TRIS', tris, [o.name for o in bpy.data.objects])

if __name__ == '__main__':
    build()
    bpy.ops.wm.save_as_mainfile(filepath=ROOT + '/web-scene-d.blend')
    export()
    print('HC_DONE')
