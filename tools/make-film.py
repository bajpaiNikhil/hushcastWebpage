# Web copy of the approved film (HushCast-intro-v4.mp4), its captions and its poster.
# The source film is never modified. Run from the repository root:
#   python3 tools/make-film.py ~/Movies/HushCast-video/renders/HushCast-intro-v4.mp4 ~/Movies/HushCast-video/renders/v4/HushCast-intro-v4.srt
# Needs ffmpeg. The MP4 is H.264 High, 1080p, CRF 28 (capped at 1.6 Mbit/s), AAC 128 kbit/s, +faststart.
import re, subprocess, sys, os
src, srt = sys.argv[1], sys.argv[2]
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'media')
os.makedirs(out, exist_ok=True)
POSTER_AT = '66.0'   # Live, side by side: the drawing on the tablet and in the Mac browser

# 1. captions: SRT -> WebVTT, cues sorted by start time (cue 19 is out of order in the source),
#    " / " line separators in the end card become real line breaks
def ms(t):
    h, m, s = t.replace(',', '.').split(':'); return int(h) * 3600000 + int(m) * 60000 + round(float(s) * 1000)
def vtt(n):
    return f'{n // 3600000:02d}:{n // 60000 % 60:02d}:{n // 1000 % 60:02d}.{n % 1000:03d}'
cues = []
for block in re.split(r'\n\s*\n', open(srt, encoding='utf-8').read().strip()):
    lines = block.strip().splitlines()
    a, b = [ms(x.strip()) for x in lines[1].split('-->')]
    cues.append((a, b, '\n'.join(lines[2:]).replace(' / ', '\n')))
cues.sort()
for (a1, b1, _), (a2, _, _) in zip(cues, cues[1:]):
    assert b1 <= a2, f'overlapping cues at {vtt(a1)}'
with open(os.path.join(out, 'hushcast-intro-v4.en.vtt'), 'w', encoding='utf-8') as f:
    f.write('WEBVTT\n\n' + '\n\n'.join(f'{vtt(a)} --> {vtt(b)}\n{t}' for a, b, t in cues) + '\n')

# 2. the video
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
  '-crf', '28', '-maxrate', '1600k', '-bufsize', '3200k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k',
  '-movflags', '+faststart', os.path.join(out, 'hushcast-intro-v4.mp4')], check=True)
# 3. the poster (1600 x 900 WebP)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', POSTER_AT, '-i', src, '-frames:v', '1', '-vf', 'scale=1600:-2',
  '-c:v', 'libwebp', '-quality', '80', os.path.join(out, 'hushcast-intro-v4.webp')], check=True)
print('ok:', len(cues), 'cues')
