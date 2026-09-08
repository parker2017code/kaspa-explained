"""Author the V6 harbor prop library in Blender; export named GLB roots."""
import bpy, math, os
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def mat(n,c,metal=0):
 m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*c,1);m.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value=metal;m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.65;return m
wood=mat('Honey oak',(.48,.25,.10));dark=mat('Iron',(.10,.18,.22),.5);gold=mat('Brass',(.93,.62,.15),.65);leaf=mat('Sprout green',(.28,.62,.31));cream=mat('Canvas',(.91,.79,.52));teal=mat('Pip enamel',(.10,.52,.52));stone=mat('Iron ore',(.29,.34,.41))
def root(n):
 o=bpy.data.objects.new(n,None);bpy.context.collection.objects.link(o);return o
def cube(n,loc,scale,m,p,bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=n;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m);o.parent=p
 if bevel: mod=o.modifiers.new('Crafted edges','BEVEL');mod.width=bevel;mod.segments=3;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
def sphere(n,loc,scale,m,p):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=loc);o=bpy.context.object;o.name=n;o.scale=scale;o.data.materials.append(m);o.parent=p
 for face in o.data.polygons: face.use_smooth=True
 return o
def cyl(n,loc,r,d,m,p):
 bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=r,depth=d,location=loc);o=bpy.context.object;o.name=n;o.data.materials.append(m);o.parent=p
 for face in o.data.polygons: face.use_smooth=True
 return o
p=root('tool');cube('handle',(0,0,.42),(.10,.10,.8),wood,p);cube('axe blade',(.12,0,.66),(.40,.10,.25),dark,p);cube('grip',(0,0,.84),(.28,.10,.08),dark,p)
p=root('timber')
for i in range(3):
 o=cyl('stacked log',((i-1)*.19,0,.14),.12,.85,wood,p);o.rotation_euler[0]=math.pi/2
p=root('grain')
for i in range(7):
 x=(i-3)*.055;o=cyl('wheat stem',(x,0,.28),.012,.5,leaf,p)
 for j in range(3): sphere('wheat ear',(x,0,.47+j*.055),(.023,.035,.055),cream,p)
cube('bundle tie',(0,0,.28),(.4,.08,.055),wood,p)
p=root('ore')
for i in range(3): sphere('ore rock',((i-1)*.18,0,.14),(.19,.16,.17),stone,p)
p=root('parcel');cube('parcel',(0,0,.22),(.5,.4,.4),wood,p);cube('twine',(0,-.207,.22),(.04,.012,.41),wood,p);cube('label',(.12,-.216,.28),(.14,.01,.1),teal,p)
p=root('coin');o=cyl('stamped coin',(0,0,.06),.19,.09,gold,p)
p=root('cart');cube('cart bed',(0,0,.37),(.9,1.1,.12),wood,p)
for x in [-.48,.48]:
 cube('side rail',(x,0,.64),(.08,1.1,.34),wood,p)
 for y in [-.35,.35]:
  o=cyl('wheel',(x,y,.23),.23,.1,dark,p);o.rotation_euler[1]=math.pi/2
cube('draw bar',(0,-.85,.35),(.09,.8,.09),wood,p)
for name,m in [('pip',teal),('sprout',leaf),('courier',cream)]:
 p=root(name);sphere('body',(0,0,.64),(.24,.17,.30),m,p);sphere('head',(0,0,1.08),(.23,.20,.22),m,p)
 if name=='pip': cube('cream faceplate',(0,-.16,1.09),(.35,.08,.26),cream,p)
 for x in [-.08,.08]: sphere('eye',(x,-.185,1.12),(.035,.025,.045),dark,p)
 for x,side in [(-.27,'left'),(.27,'right')]:
  cube(side+' arm',(x,0,.65),(.12,.13,.40),m,p);sphere(side+' hand',(x,0,.43),(.08,.09,.08),gold if name=='courier' else cream,p);cube(side+' leg',(x*.5,0,.20),(.14,.17,.37),dark,p)
 if name=='sprout':
  for x in [-.12,.12]: sphere('leaf',(x,0,1.35),(.17,.06,.08),leaf,p)
 if name=='pip': cyl('antenna',(0,0,1.36),.025,.18,gold,p);sphere('antenna light',(0,0,1.48),(.06,.06,.06),gold,p)
p=root('machine');cube('machine base',(0,0,.25),(.8,.65,.5),dark,p);cyl('flywheel',(0,0,.72),.36,.13,gold,p);cube('housing',(.4,0,.7),(.3,.5,.7),teal,p)
# Author a reusable grasp motion on Pip's arm. Exported actions remain inspectable.
arm=bpy.data.objects.get('right arm');arm.rotation_euler[0]=0;arm.keyframe_insert(data_path='rotation_euler',frame=1);arm.rotation_euler[0]=-.85;arm.keyframe_insert(data_path='rotation_euler',frame=12);arm.keyframe_insert(data_path='rotation_euler',frame=25);arm.rotation_euler[0]=0;arm.keyframe_insert(data_path='rotation_euler',frame=36)
bpy.context.scene.frame_set(1)
out=os.path.abspath('src/assets/v6/models/harbor.glb');bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',export_animations=True,export_yup=True)
print(out)
