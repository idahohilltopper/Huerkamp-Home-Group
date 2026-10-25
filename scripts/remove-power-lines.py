"""Remove the power lines from the hero skyline photo.

Input:  photos/minneapolis-skyline-3840-original.jpg (Wikimedia Commons, CC BY 4.0, unaltered)
Output: public/hero/minneapolis-skyline-3840.jpg (then run scripts/make-hero.py for the site sizes)
Usage:  python3 scripts/remove-power-lines.py photos/minneapolis-skyline-3840-original.jpg public/hero/minneapolis-skyline-3840.jpg
Needs:  pip install opencv-python-headless numpy

How it works:
1. Find the wires where they cross open sky (thin dark lines), and follow each one across the photo, column by
   column, carrying it straight through the buildings it passes in front of.
2. Three wires that show as light lines across the brick buildings on the left are added from fitted curves.
3. Erase a narrow band along each wire: in open sky, blend the pixels just above and below; over buildings,
   copy the same columns from a floor above or below (the facade repeats), picking the best-matching shift.
"""
import sys
import cv2
import numpy as np

im = cv2.imread(sys.argv[1]); H, W = im.shape[:2]
MANUAL = [[-1.323002221782864e-05, 0.07216224551559414, 982.010207343137], [-1.2014762554079796e-05, 0.07118454751684752, 993.5881042360306], [-1.2901250854967106e-05, 0.07170630752776909, 1008.8309151513411]]

# ---- 1. Trace the wires ----
g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
hsv=cv2.cvtColor(cv2.GaussianBlur(im,(0,0),3),cv2.COLOR_BGR2HSV)
sky=((hsv[...,0]>=95)&(hsv[...,0]<=115)&(hsv[...,1]>70)&(hsv[...,2]>150)).astype(np.uint8)
sky=cv2.morphologyEx(sky,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_RECT,(3,25)))
sky=cv2.erode(sky,np.ones((7,7),np.uint8)); sky[1500:]=0
bh=cv2.morphologyEx(g,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_RECT,(11,11))).astype(np.float32)
bhs=cv2.GaussianBlur(bh,(9,1),0)   # smooth along the wire
wire=((bh>25)&(sky>0)).astype(np.uint8)
wire=cv2.morphologyEx(wire,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_RECT,(25,1)))
n,lab,st,_=cv2.connectedComponentsWithStats(wire,8)
seeds=[]
for i in range(1,n):
    x,y,w,h,a=st[i]
    if w>=120 and h<=w*0.2:
        ys,xs=np.where(lab==i); seeds.append((w,xs,ys))
seeds.sort(key=lambda s:-s[0])
used=np.zeros((H,W),np.uint8)

def trace(path, x, slope, step):
    """Follow the wire from path's last point, column by column, in direction step (+1/-1)."""
    y=path[x]; lost_sky=0; lost=0
    while 0<=x+step<W:
        x+=step; yp=y+slope*step
        yi=int(round(yp))
        if yi<3 or yi>=H-3: break
        col=bhs[yi-2:yi+3,x]
        k=int(np.argmax(col)); val=col[k]
        insky=sky[yi,x]>0
        if val>18 and (insky or abs(k-2)<=1):
            ynew=yi-2+k+0.0
            # sub-pixel peak
            if 0<k<4:
                a,b,c=col[k-1],col[k],col[k+1]; d=(a-2*b+c)
                if d!=0: ynew+=0.5*(a-c)/d
            if insky:
                lost_sky=0
            y=0.7*yp+0.3*ynew if not insky else ynew
            lost=0
        else:
            y=yp; lost+=1
            if insky: lost_sky+=1
        path[x]=y
        if insky and len(path)>40:
            xs=sorted(path)[-60:] if step>0 else sorted(path)[:60]
            if len(xs)>20:
                slope=np.polyfit(xs,[path[i] for i in xs],1)[0]
        if lost_sky>60 or lost>900: break
    # drop the unconfirmed tail
    return path

wires=[]
for w,xs,ys in seeds:
    if used[ys,xs].mean()>0.5: continue
    a,b=np.polyfit(xs,ys,1)
    path={int(x):float(a*x+b) for x in range(xs.min(),xs.max()+1)}
    path=trace(path,int(xs.max()),a,1)
    path=trace(path,int(xs.min()),a,-1)
    X=np.array(sorted(path)); Y=np.array([path[i] for i in X])
    # trim ends that were not confirmed in the sky (keep up to last confirmed sky ridge)
    conf=np.array([sky[int(round(y)),x]>0 and bhs[int(round(y)),x]>18 for x,y in zip(X,Y)])
    idx=np.where(conf)[0]
    if len(idx)<100: continue
    lo,hi=idx[0],idx[-1]
    X,Y=X[lo:hi+1],Y[lo:hi+1]
    if X[0]<15: X=np.r_[np.arange(0,X[0]),X]; Y=np.r_[np.full(len(X)-len(Y),Y[0]),Y]
    Ys=cv2.GaussianBlur(Y.reshape(1,-1).astype(np.float32),(31,1),0).ravel() if len(Y)>31 else Y
    for x,y in zip(X,Ys): cv2.circle(used,(int(x),int(round(y))),4,1,-1)
    wires.append(np.c_[X,Ys])

# ---- 2/3. Erase them ----
# Open sky: a 7-pixel band along each wire. Over buildings: 5 pixels, so the facade around it stays sharp.
hsv=cv2.cvtColor(cv2.GaussianBlur(im,(0,0),3),cv2.COLOR_BGR2HSV)
sky=((hsv[...,0]>=95)&(hsv[...,0]<=115)&(hsv[...,1]>70)&(hsv[...,2]>150)).astype(np.uint8)
sky=cv2.morphologyEx(sky,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_RECT,(3,25)))
sky=cv2.erode(sky,np.ones((7,7),np.uint8))
# Plain sky only: smooth once the thin wires are filtered out (glass and building edges are not)
med=cv2.medianBlur(cv2.cvtColor(im,cv2.COLOR_BGR2GRAY),7).astype(np.float32)
std=np.sqrt(np.maximum(cv2.blur(med*med,(15,15))-cv2.blur(med,(15,15))**2,0))
sky=((sky>0)&(std<3.5)).astype(np.uint8)
# Snap each traced path to the darkest line within 2 pixels (sub-pixel), then drop paths that duplicate another.
g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
bhv=cv2.GaussianBlur(cv2.morphologyEx(g,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_RECT,(1,11))).astype(np.float32),(7,1),0)
snapped=[]
for P in wires:
    X=P[:,0].astype(int); Y=P[:,1].astype(float).copy()
    for i,(x,y) in enumerate(zip(X,Y)):
        yi=int(round(y))
        if yi<3 or yi>=H-3: continue
        col=bhv[yi-2:yi+3,x]; k=int(np.argmax(col))
        if col[k]>(8 if sky[yi,x] else 14) and 0<k<4:
            a,b,c=col[k-1],col[k],col[k+1]; d=a-2*b+c
            Y[i]=yi-2+k+(0.5*(a-c)/d if d else 0)
    Y=cv2.GaussianBlur(Y.reshape(1,-1).astype(np.float32),(15,1),0).ravel() if len(Y)>15 else Y
    snapped.append(np.c_[X,Y])
keep=[]
for P in sorted(snapped,key=lambda p:-len(p)):
    dup=False
    for Q in keep:
        xs=np.intersect1d(P[:,0],Q[:,0])
        if len(xs)>0.5*len(P):
            dp=dict(zip(P[:,0],P[:,1])); dq=dict(zip(Q[:,0],Q[:,1]))
            if np.mean([abs(dp[x]-dq[x])<2.5 for x in xs])>0.6: dup=True; break
    if not dup: keep.append(P)
print(len(wires),'traced,',len(keep),'after merging duplicates')
wires=keep
# Faint ends: a wire found well inside the frame keeps going to the edge (it fades against bright sky)
ext=[]
for P in wires:
    X,Y=P[:,0],P[:,1]
    if 0<X[0]<700:
        sl=np.polyfit(X[:300],Y[:300],1)[0]; xe=np.arange(0,X[0]); ext.append(np.c_[xe,Y[0]+sl*(xe-X[0])])
    if 3200<X[-1]<W-1:
        sl=np.polyfit(X[-300:],Y[-300:],1)[0]; xe=np.arange(X[-1]+1,W); ext.append(np.c_[xe,Y[-1]+sl*(xe-X[-1])])
wires=wires+ext
# Three light wires across the brick buildings on the left, fitted by hand-guided snapping (from guide points on the photo, snapped to the wires)
for c in MANUAL:
    xe=np.arange(0,1260); wires.append(np.c_[xe,np.polyval(c,xe)])
wide=np.zeros((H,W),np.uint8); thin=np.zeros((H,W),np.uint8)
for P in wires:
    pts=np.round(P*4).astype(np.int32)
    cv2.polylines(wide,[pts],False,255,7,lineType=cv2.LINE_8,shift=2)
    cv2.polylines(thin,[pts],False,255,5,lineType=cv2.LINE_8,shift=2)
mask=np.where(sky>0,wide,thin)
out=im.astype(np.float32)
# Buildings: fill each wire's band by copying the same columns from a little above or below (the facade
# repeats floor by floor), choosing the shift whose rows just outside the band match best.
bmask=(mask>0)&(sky==0)
ys_,xs_=np.where(bmask)
done=np.zeros((H,W),bool)
BW=24
for x0 in range(0,W,BW):
    blk=bmask[:,x0:x0+BW]
    if not blk.any(): continue
    rows=np.where(blk.any(1))[0]
    runs=np.split(rows,np.where(np.diff(rows)>1)[0]+1)
    for r in runs:
        y0,y1=r[0],r[-1]
        ctx=np.r_[max(y0-4,0):y0,y1+1:min(y1+5,H)]
        best=None
        for sh in list(range(-60,-7))+list(range(8,61)):
            src=np.arange(y0,y1+1)+sh; csrc=ctx+sh
            if src.min()<0 or src.max()>=H or csrc.min()<0 or csrc.max()>=H: continue
            if mask[src.min():src.max()+1,x0:x0+BW].any(): continue
            d=np.mean((out[csrc,x0:x0+BW]-out[ctx,x0:x0+BW])**2)
            if best is None or d<best[0]: best=(d,sh)
        if best is None: continue
        sh=best[1]
        for y in range(y0,y1+1):
            m=bmask[y,x0:x0+BW]
            out[y,x0:x0+BW][m]=im[y+sh,x0:x0+BW][m]
            done[y,x0:x0+BW]|=m
# Sky (and anything left): blend the pixels just above and below
for x in range(W):
    col=(mask[:,x]>0)&~done[:,x]
    if not col.any(): continue
    ys=np.where(col)[0]
    runs=np.split(ys,np.where(np.diff(ys)>1)[0]+1)
    for r in runs:
        a,b=r[0]-1,r[-1]+1
        if a<0 or b>=H: continue
        top=out[max(a-1,0):a+1,x].mean(0); bot=out[b:b+2,x].mean(0)
        t=((r-a)/(b-a))[:,None]
        out[r,x]=top*(1-t)+bot*t
# Sky fills: soften sideways so the column-by-column blend leaves no faint stripes
sm=cv2.GaussianBlur(out,(31,1),0)
gf=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(np.float32)
# texture just above and below the band (the band itself holds the wire): smooth sky only, not glass or edges
tex=np.sqrt(np.maximum(cv2.blur(gf*gf,(31,1))-cv2.blur(gf,(31,1))**2,0))
tex=np.maximum(np.roll(tex,-8,0),np.roll(tex,8,0))
skyfill=cv2.dilate(((mask>0)&(sky>0)).astype(np.uint8),np.ones((3,1),np.uint8))>0
out[skyfill]=sm[skyfill]
out=np.clip(out,0,255).astype(np.uint8)
cv2.imwrite(sys.argv[2], out, [cv2.IMWRITE_JPEG_QUALITY, 94])
print('wrote', sys.argv[2])
