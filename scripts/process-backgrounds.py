#!/usr/bin/env python3
"""Re-export all backgrounds at 1440x810 (native 1:1 at display resolution)."""
from PIL import Image
import numpy as np, os

RAW = '/Users/alexherbert/openclaw-workspace-backup/'
OUT = '/Users/alexherbert/.openclaw/workspace/Apps/punch-the-monkey/assets/backgrounds/'
W, H = 1440, 810
os.makedirs(OUT, exist_ok=True)

jobs = [
    ('bg_zoo2_raw.png',   'bg-zoo.png'),
    ('bg_escape_raw.png', 'bg-escape.png'),
    ('bg_street_raw.png', 'bg-street.png'),
    ('bg_forest_raw.png', 'bg-forest.png'),
]

def make_tileable(img, blend_pct=0.12):
    arr = np.array(img, dtype=np.float32)
    w = arr.shape[1]
    blend = int(w * blend_pct)
    for i in range(blend):
        t = i / blend
        arr[:, i, :] = arr[:, w - blend + i, :] * (1 - t) + arr[:, i, :] * t
    return Image.fromarray(arr.astype(np.uint8))

for src_name, dst_name in jobs:
    src_path = RAW + src_name
    if not os.path.exists(src_path):
        print(f'SKIP (not found): {src_name}')
        continue
    img = Image.open(src_path).convert('RGB')
    scaled = img.resize((W, H), Image.LANCZOS)
    tileable = make_tileable(scaled)
    tileable.save(OUT + dst_name, quality=96)
    print(f'{src_name} -> {dst_name}: {tileable.size}')

print('Backgrounds done.')
