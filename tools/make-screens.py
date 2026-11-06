# Step screenshots for "Start. Open. Watch." from the video repo stills (IP already blurred there).
# The QR codes still encode the local IP address, so their modules are softened here and the
# result is checked to no longer decode. Needs: pip install opencv-contrib-python pillow (AVIF support).
import cv2, numpy as np
from PIL import Image
import os
U=os.path.expanduser('~/Movies/HushCast-video/')
OUT=os.path.join(os.path.dirname(__file__), '..', 'public', 'screens') + '/'
import os; os.makedirs(OUT, exist_ok=True)
det=cv2.wechat_qrcode_WeChatQRCode()
def obscure(im, box):
    x0,y0,x1,y1=[int(round(v)) for v in box]
    pad=2; x0-=pad;y0-=pad;x1+=pad;y1+=pad
    roi=im[y0:y1,x0:x1].copy(); s=x1-x0
    k=int(s*0.06)|1
    blur=cv2.GaussianBlur(roi,(k*3|1,k*3|1),k)
    f=int(s*0.24); c0=int(s*0.38); c1=int(s*0.62)
    for (a,b) in ((0,0),(s-f,0),(0,s-f)):
        blur[b:b+f,a:a+f]=roi[b:b+f,a:a+f]
    blur[c0:c1,c0:c1]=roi[c0:c1,c0:c1]
    im[y0:y1,x0:x1]=blur
    return im
def save(im_bgr, name, crop=None, width=720):
    im=Image.fromarray(cv2.cvtColor(im_bgr,cv2.COLOR_BGR2RGB))
    if crop: im=im.crop(crop)
    h=round(im.height*width/im.width); im=im.resize((width,h),Image.LANCZOS)
    im.save(OUT+name+'.avif',quality=58); im.save(OUT+name+'.webp',quality=78,method=6)
    print(name, im.size, os.path.getsize(OUT+name+'.avif'), os.path.getsize(OUT+name+'.webp'))
    return im.size
# 1 Start: Android's share prompt over the app (status bar cropped)
a=cv2.imread(U+'clean/v4/stills/s03_tab_share2.png'); save(a,'step-start',(0,34,1098,688))
# 2 Open: casting screen; IP text already blurred, QR modules softened (the code carries the IP)
b=cv2.imread(U+'stills/app-screens/tablet-casting-clean.png')
b=obscure(b,(541.95,192.03,772.43,421.80)); save(b,'step-open')
# 3 Watch: the browser on the Mac showing the cast; mirrored QR softened too
c=cv2.imread(U+'clean/v4/stills/s03_mac_mirrored.png')
c=obscure(c,(559.88,188.31,738.91,368.05)); save(c,'step-watch')
for n in ('step-open','step-watch'):
    im=cv2.imread(OUT+n+'.webp'); big=cv2.resize(im,None,fx=3,fy=3,interpolation=cv2.INTER_CUBIC)
    print(n,'decodes to', det.detectAndDecode(big)[0], cv2.QRCodeDetector().detectAndDecode(big)[0])
