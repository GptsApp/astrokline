import json
with open('lh-opt3.json') as f:
    data = json.load(f)
cats = data.get('categories', {})
for key in ['performance', 'accessibility', 'best-practices', 'seo']:
    cat = cats.get(key, {})
    print(f"{key}: {int(cat.get('score', 0) * 100)}")
audits = data.get('audits', {})
for m in ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'interactive', 'speed-index', 'cumulative-layout-shift']:
    a = audits.get(m, {})
    print(f"  {m}: {a.get('displayValue', 'N/A')} (score={int(a.get('score', 0)*100)})")
network = audits.get('network-requests', {})
items = network.get('details', {}).get('items', [])
scripts = [i for i in items if '.js' in str(i.get('url',''))]
print(f"  Requests: {len(items)}, JS files: {len(scripts)}")
js_total = sum(i.get('transferSize', 0) for i in scripts)
print(f"  JS total: {js_total/1024:.0f}KB")
bootup = audits.get('bootup-time', {})
print(f"  Bootup: {bootup.get('displayValue', 'N/A')}")
for item in bootup.get('details', {}).get('items', [])[:5]:
    url = str(item.get('url', 'N/A'))[-55:]
    total = item.get('total', 0)
    scripting = item.get('scripting', 0)
    print(f"    {url} total={total:.0f}ms scripting={scripting:.0f}ms")
