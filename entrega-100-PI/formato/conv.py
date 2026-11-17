import json,re,html
from extract import process
def esc(s): return html.escape(s,quote=False)
RIGHT=526
BUL=re.compile(r'^[•●•▪]\s*')
def blocks_for(n):
    raw=process(n)
    out=[]
    # drop cover
    started = n==1 and False
    items=[]
    for d in raw:
        if d['kind']=='line':
            if n==1 and d['page']==1 and d['top']<290 and d['x0']>150: continue
            if n in (2,3,4) and d['page']==1: continue
            items.append(d)
        else:
            if d['page']>1 or n==1: items.append(d)
    from collections import defaultdict
    cnt=defaultdict(lambda:[0,0])
    for d in items:
        if d['kind']=='line' and not d['bold']:
            cnt[d['page']][1]+=1
            if d['x1']>=535: cnt[d['page']][0]+=1
    ragged=set()
    L=[d for d in items if d['kind']=='line']
    for i,d in enumerate(L):
        pr=L[i-1] if i>0 and L[i-1]['page']==d['page'] else None
        nx=L[i+1] if i+1<len(L) and L[i+1]['page']==d['page'] else None
        pitch=(d['top']-pr['top']) if pr else ((nx['top']-d['top']) if nx else 0)
        d['rag']=pitch>=20 and pitch<40
    HEADS4=('Nivel del canal:','Sistema de canal:','Cobertura del mercado:','Operación, implementación y seguimiento','Comunicación al canal:','Herramientas de la mezcla de comunicación','Comunicación integrada de marca (CIM)')
    # group
    paras=[]; cur=None
    def flush():
        nonlocal cur
        if cur: paras.append(cur); cur=None
    prev=None
    for d in items:
        if d['kind']=='table':
            flush(); paras.append(dict(t='table',rows=d['rows'],page=d['page'])); prev=None; continue
        txt=d['text']
        m=BUL.match(txt)
        if d['bold'] and d['size']>=11 and not m:
            # heading line (merge with consecutive bold same size)
            if cur and cur['t']=='h' and cur['size']==d['size'] and prev is not None and prev['bold'] and (d['top']-prev['bottom'])<6:
                cur['text']+=' '+txt
            else:
                flush(); cur=dict(t='h',text=txt,size=d['size'],page=d['page'])
            prev=d; continue
        if m:
            flush(); cur=dict(t='li',text=BUL.sub('',txt),page=d['page']); prev=d
            continue
        # body line
        if n==4 and txt.startswith(HEADS4):
            flush(); paras.append(dict(t='h',text=txt,size=11.0,page=d['page'],sub=True)); prev=d; continue
        if cur and cur['t']=='li' and d['x0']<84:
            flush()
        if cur and cur['t'] in ('p','li'):
            cur['text']+=' '+txt
        else:
            flush(); cur=dict(t='p',text=txt,page=d['page'],lead=d.get('lead',''))
        prev=d
        if d.get('rag'):
            if re.search(r'[.”)]$',txt): flush()
        elif d['x1']<RIGHT and not (cur and cur['t']=='li' and d['x1']>RIGHT-1): flush()
    flush()
    return paras
if __name__=='__main__':
    import sys
    n=int(sys.argv[1])
    for p in blocks_for(n):
        if p['t']=='table': print('TABLE',len(p['rows']),'rows'); continue
        t=p['text']; print(p['t'].upper(),p.get('size',''),'|',t[:55],'...',t[-35:] if len(t)>90 else '')
