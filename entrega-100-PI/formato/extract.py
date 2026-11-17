import pdfplumber,glob,json,re,sys
U='/root/.claude/uploads/a03abc42-e0c3-5859-9a0c-f52610c1aba4/'
def grab(pat): return glob.glob(U+pat)[0]
FILES={1:'*Etapa_1_Final.pdf',2:'*Etapa_2_Final.pdf',3:'*Etapa_3_Pie_Final.pdf',4:'*Etapa_4_Final.pdf'}
def inside(b,t): return b[0]>=t[0]-2 and b[2]<=t[2]+2 and b[1]>=t[1]-2 and b[3]<=t[3]+2
def process(n):
    items=[]
    with pdfplumber.open(grab(FILES[n])) as pdf:
        for pi,page in enumerate(pdf.pages):
            tables=page.find_tables()
            tb=[t.bbox for t in tables]
            lines=page.extract_text_lines(return_chars=True,strip=True)
            # build ordered stream by top
            stream=[]
            for l in lines:
                b=(l['x0'],l['top'],l['x1'],l['bottom'])
                if any(inside(b,t) for t in tb): continue
                txt=l['text'].strip()
                if re.match(r'^Fracking Design · Comercialización I · Etapa \d',txt): continue
                chars=l['chars']
                bold=all(('Bold' in c['fontname']) for c in chars if c['text'].strip())
                size=max(c['size'] for c in chars)
                lead=''
                for c in chars:
                    if 'Bold' in c['fontname'] or not c['text'].strip() and lead: lead+=c['text']
                    else: break
                if bold: lead=''
                stream.append(('line',l['top'],dict(lead=lead.strip(),text=txt,x0=l['x0'],x1=l['x1'],top=l['top'],bottom=l['bottom'],bold=bold,size=size,font=chars[0]['fontname'])))
            for t in tables:
                stream.append(('table',t.bbox[1],dict(rows=t.extract(),bbox=t.bbox)))
            stream.sort(key=lambda s:s[1])
            for kind,_,d in stream:
                d['kind']=kind; d['page']=pi+1; items.append(d)
    return items
if __name__=='__main__':
    n=int(sys.argv[1]); it=process(n)
    json.dump(it,open(f'/tmp/claude-0/s/ex/raw{n}.json','w'),ensure_ascii=False)
    for d in it:
        if d['kind']=='table': print('P%d TABLE'%d['page'],d['rows']); continue
        print('P%d %s%s x0=%.0f x1=%.0f %s'%(d['page'],'B' if d['bold'] else ' ',int(d['size']),d['x0'],d['x1'],d['text'][:90]))
