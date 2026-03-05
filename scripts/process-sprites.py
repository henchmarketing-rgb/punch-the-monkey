#!/usr/bin/env python3
"""
Re-export all sprites with improved background removal.
Fixes:
- 8-connectivity flood fill (catches bg pixels in narrow arm gaps)
- Higher tolerance (35) for varied AI backgrounds
- Small isolated pixel island removal (kills phantom arms)
- Stronger fringe cleanup (threshold 50)
- Morphological alpha erosion to remove 1-pixel fringe halos
"""
from PIL import Image
import numpy as np
from collections import deque
from scipy import ndimage
import os, sys

RAW = '/Users/alexherbert/openclaw-workspace-backup/'
OUT = '/Users/alexherbert/.openclaw/workspace/Apps/punch-the-monkey/assets/sprites/'
os.makedirs(OUT, exist_ok=True)

# (raw_file, output_name, num_frames, target_frame_w, target_frame_h, is_portrait)
JOBS = [
    ('punch_raw.png',         'punch-idle.png',     1,  162, 240, True),
    ('walk_raw.png',          'punch-walk.png',      4,  174, 240, False),
    ('punch_attack_raw.png',  'punch-attack.png',    3,  225, 240, False),
    ('kick_raw.png',          'punch-kick.png',      3,  219, 240, False),
    ('punch_hurt_raw.png',    'punch-hurt.png',      2,  201, 240, False),
    ('punch_special_raw.png', 'punch-special.png',   4,  144, 384, False),
    ('macaque_walk_raw.png',  'macaque-walk.png',    4,  270, 270, False),
    ('macaque_attack_raw.png','macaque-attack.png',  2,  390, 270, False),
    ('macaque_hurt_raw.png',  'macaque-hurt.png',    2,  270, 240, False),
    ('gorilla_raw.png',       'gorilla-boss.png',    1,  300, 360, True),
    ('gorilla_walk2_raw.png', 'gorilla-walk.png',    4,  420, 360, False),
    ('gorilla_slam_raw.png',  'gorilla-slam.png',    3,  393, 390, False),
    ('gorilla_attack_raw.png','gorilla-attack.png',  2,  390, 360, False),
    ('hit_effects_raw.png',   'hit-effects.png',     4,  144, 144, False),
    ('boss_shockwave_raw.png','boss-shockwave.png',  4,  414, 240, False),
    ('boss_fx_dark_raw.png',  'boss-fx-ring.png',    4,  288, 288, False),
    ('boss_fx_light_raw.png', 'boss-fx-fire.png',    4,  288, 288, False),
]

FX_SPRITES = {'hit-effects.png', 'boss-shockwave.png', 'boss-fx-ring.png', 'boss-fx-fire.png'}


def remove_bg_flood_fill(img, tolerance=35):
    """
    8-connectivity BFS flood fill from all edges.
    Higher tolerance + diagonal connectivity reaches background pixels
    trapped in narrow arm gaps — eliminates phantom side arms.
    """
    arr = np.array(img.convert('RGBA'), dtype=np.int32)
    h, w = arr.shape[:2]
    alpha = arr[:, :, 3].copy()

    # Robust bg colour: median of many edge samples
    edge_samples = []
    for x in range(0, w, 4):
        edge_samples.append(arr[0, x, :3])
        edge_samples.append(arr[h-1, x, :3])
    for y in range(0, h, 4):
        edge_samples.append(arr[y, 0, :3])
        edge_samples.append(arr[y, w-1, :3])
    bg_color = np.median(edge_samples, axis=0)

    visited = np.zeros((h, w), dtype=bool)
    queue = deque()

    def is_bg(y, x):
        return np.abs(arr[y, x, :3] - bg_color).max() <= tolerance

    # Seed all 4 edges
    for x in range(w):
        for ye in [0, h-1]:
            if not visited[ye, x] and is_bg(ye, x):
                visited[ye, x] = True
                queue.append((ye, x))
    for y in range(h):
        for xe in [0, w-1]:
            if not visited[y, xe] and is_bg(y, xe):
                visited[y, xe] = True
                queue.append((y, xe))

    # 8-connectivity (diagonals too) — reaches pixels in narrow arm gaps
    DIRS = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
    while queue:
        cy, cx = queue.popleft()
        alpha[cy, cx] = 0
        for dy, dx in DIRS:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg(ny, nx):
                visited[ny, nx] = True
                queue.append((ny, nx))

    result = arr.copy().astype(np.uint8)
    result[:, :, 3] = alpha
    return Image.fromarray(result, 'RGBA')


def remove_small_islands(img, relative_threshold=0.08):
    """
    Remove detached phantom blobs (ghost arms, floating fists).
    Strategy: keep the largest connected component (main body) plus any
    component that is >= relative_threshold * largest_size.
    Everything smaller is a phantom artifact and gets erased.
    """
    arr = np.array(img, dtype=np.uint8)
    opaque = arr[:, :, 3] > 30

    struct = ndimage.generate_binary_structure(2, 2)  # 8-connectivity
    labeled, n = ndimage.label(opaque, structure=struct)
    if n == 0:
        return img

    sizes = ndimage.sum(opaque, labeled, range(1, n+1))
    max_size = max(sizes)
    keep_threshold = max_size * relative_threshold

    for comp_id, size in enumerate(sizes, start=1):
        if size < keep_threshold:
            arr[labeled == comp_id, 3] = 0

    return Image.fromarray(arr, 'RGBA')


def clean_fringe(img, threshold=50):
    """Hard threshold: remove semi-transparent fringe pixels."""
    arr = np.array(img, dtype=np.uint8)
    arr[:, :, 3] = np.where(arr[:, :, 3] < threshold, 0, arr[:, :, 3])
    return Image.fromarray(arr, 'RGBA')


def erode_alpha_edge(img, iterations=1):
    """
    1-pixel morphological erosion on the alpha channel to remove
    the 1-px halo that often survives flood fill + fringe cleanup.
    """
    arr = np.array(img, dtype=np.uint8)
    mask = arr[:, :, 3] > 0

    struct = ndimage.generate_binary_structure(2, 1)  # 4-connectivity
    eroded = ndimage.binary_erosion(mask, structure=struct, iterations=iterations)

    arr[~eroded, 3] = 0
    return Image.fromarray(arr, 'RGBA')


def center_on_canvas(img, tw, th):
    """Scale to fit tw×th, center on transparent canvas."""
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        return Image.new('RGBA', (tw, th), (0, 0, 0, 0))

    pad = 4
    x0 = max(0, bbox[0] - pad)
    y0 = max(0, bbox[1] - pad)
    x1 = min(img.width,  bbox[2] + pad)
    y1 = min(img.height, bbox[3] + pad)
    cropped = img.crop((x0, y0, x1, y1))

    cw, ch = cropped.size
    scale = min((tw - 6) / cw, (th - 6) / ch)
    nw, nh = int(cw * scale), int(ch * scale)
    scaled = cropped.resize((nw, nh), Image.LANCZOS)

    canvas = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    canvas.paste(scaled, ((tw - nw) // 2, (th - nh) // 2), scaled)
    return canvas


def extract_frames(raw_path, n_frames, is_portrait, crop_text_pct=0.10):
    img = Image.open(raw_path).convert('RGBA')
    w, h = img.size
    crop_h = int(h * (1 - crop_text_pct))
    img = img.crop((0, 0, w, crop_h))
    w, h = img.size
    if n_frames == 1 or is_portrait:
        return [img]
    frame_w = w // n_frames
    return [img.crop((i * frame_w, 0, (i + 1) * frame_w, h)) for i in range(n_frames)]


for raw_name, out_name, n_frames, tw, th, is_portrait in JOBS:
    raw_path = RAW + raw_name
    if not os.path.exists(raw_path):
        print(f'SKIP (not found): {raw_name}')
        continue

    is_fx = out_name in FX_SPRITES
    frames = extract_frames(raw_path, n_frames, is_portrait)

    processed = []
    for frame in frames:
        if is_fx:
            processed.append(frame.resize((tw, th), Image.LANCZOS))
        else:
            clean = remove_bg_flood_fill(frame, tolerance=35)
            clean = clean_fringe(clean, threshold=50)
            clean = erode_alpha_edge(clean, iterations=1)
            clean = remove_small_islands(clean, relative_threshold=0.08)
            centered = center_on_canvas(clean, tw, th)
            processed.append(centered)

    total_w = tw * len(processed)
    sheet = Image.new('RGBA', (total_w, th), (0, 0, 0, 0))
    for i, frame in enumerate(processed):
        sheet.paste(frame, (i * tw, 0))

    sheet.save(OUT + out_name)
    print(f'{raw_name} -> {out_name}: {sheet.size}  ({len(processed)} frames)')

print('\nAll sprites done.')
