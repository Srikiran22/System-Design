import csv, json, os, re, requests
exec(open(os.path.join(os.path.dirname(__file__),'content_parse.py')).read())
U=os.environ['SUPABASE_URL']+'/rest/v1/'; K=os.environ['SUPABASE_SERVICE_ROLE_KEY']
H={'apikey':K,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal'}
if not K.startswith('sb_'): H['Authorization']='Bearer '+K
def post(t,rows,conflict=None):
    for i in range(0,len(rows),20):
        r=requests.post(U+t+(f'?on_conflict={conflict}' if conflict else ''),headers=H,data=json.dumps(rows[i:i+20]))
        assert r.ok,(t,r.status_code,r.text[:300])
    print(t,len(rows))
post('articles',[dict(slug=a[0],filename=a[1],number=a[2],title=a[3],track_order=a[4],track=a[5],summary=a[6],body=a[7],word_count=a[8]) for a in arts],'slug')
def csvrows(f): return [dict(r,sort=i) for i,r in enumerate(csv.DictReader(open(os.path.join(D,f),encoding='utf-8')))]
post('sources',csvrows('sources.csv'),'source_id')
post('practice_prompts',csvrows('practice_prompts.csv'),'prompt_id')
for t,f in [('roles','role_competency_matrix.csv'),('coverage_deep','DEEP_COVERAGE_MATRIX.csv'),('coverage_research','RESEARCH_COVERAGE_MATRIX.csv'),('scrape_audit','DEEP_SCRAPE_AUDIT.csv')]:
    requests.delete(U+t+'?id=gt.0',headers=H).raise_for_status(); post(t,csvrows(f))
post('pack_meta',[{'key':'pack_metadata','value':json.load(open(D+'/PACK_METADATA.json'))},{'key':'portal_entity_schema','value':json.load(open(D+'/portal_entity_schema.json'))}],'key')
