import csv, json, os, re
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','content','pack')
def q(s):
    if s is None: return 'NULL'
    s=str(s); tag='$q$'
    assert tag not in s
    return tag+s+tag
def track(n):
    if n==0: return (0,'Start here')
    for lo,hi,i,name in [(1,26,1,'Core foundation'),(27,60,2,'Advanced expansion'),(61,81,3,'Deep research'),(82,95,4,'Expert extension'),(96,102,5,'Decision & execution'),(103,110,6,'Fifth-level engineering'),(111,118,7,'Sixth-level dependability')]:
        if lo<=n<=hi: return (i,name)
arts=[]
for f in sorted(os.listdir(D)):
    if not f.endswith('.md'): continue
    body=open(os.path.join(D,f),encoding='utf-8').read()
    m=re.match(r'(\d+)_',f)
    n=int(m.group(1)) if m else None
    ti,tn=track(n) if n is not None else (8,'Pack guides')
    tm=re.search(r'^#\s+(.+)$',body,re.M)
    title=tm.group(1).strip() if tm else f[:-3].replace('_',' ').title()
    summ=''
    for para in re.split(r'\n\s*\n',body):
        p=para.strip()
        if p and not p.startswith(('#','|','-','*','>','```')):
            summ=re.sub(r'[*_`\[\]]','',re.sub(r'\]\([^)]*\)',']',p))[:400]; break
    slug=re.sub(r'[^a-z0-9]+','-',f[:-3].lower()).strip('-')
    arts.append((slug,f,n,title,ti,tn,summ,body,len(body.split())))
