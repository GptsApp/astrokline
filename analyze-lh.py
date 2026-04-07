import json, sys

with open('lh-baseline.json') as f:
    d = json.load(f)
audits = d.get('audits', {})

# Main thread work
mtw = audits.get('mainthread-work-breakdown', {})
if mtw.get('details', {}).get('items'):
    print('=== MAIN THREAD WORK ===')
    for item in mtw['details']['items'][:8]:
        print(f'  {item.get("groupLabel",""):<35} {item.get("duration",0):>8.0f}ms')

print()

# Third party
tp = audits.get('third-party-summary', {})
if tp.get('details', {}).get('items'):
    print('=== THIRD PARTIES ===')
    for item in tp['details']['items'][:5]:
        print(f'  {item.get("entity",{}).get("text",""):<35} {item.get("blockingTime",0):>8.0f}ms blocking | {item.get("transferSize",0)/1024:.0f}KB')

print()
print(f'DOM Size: {audits.get("dom-size",{}).get("displayValue","")}')
print(f'Server response time: {audits.get("server-response-time",{}).get("displayValue","")} score={audits.get("server-response-time",{}).get("score","N/A")}')
print(f'Font display: score={audits.get("font-display",{}).get("score","N/A")}')
print(f'Unminified CSS: score={audits.get("unminified-css",{}).get("score","N/A")}')
print(f'Unminified JS: score={audits.get("unminified-javascript",{}).get("score","N/A")}')
print(f'Optimized images: score={audits.get("uses-optimized-images",{}).get("score","N/A")}')
print(f'Modern image formats: score={audits.get("modern-image-formats",{}).get("score","N/A")}')
print(f'Responsive images: score={audits.get("uses-responsive-images",{}).get("score","N/A")}')

print()
print('=== DIAGNOSTICS ===')
diag = audits.get('diagnostics', {})
if diag.get('details', {}).get('items'):
    for item in diag['details']['items']:
        for k, v in item.items():
            print(f'  {k}: {v}')

print()
print('=== SEO Issues ===')
for key in ['document-title', 'meta-description', 'link-text', 'crawlable-anchors', 'robots-txt', 'canonical', 'hreflang']:
    a = audits.get(key, {})
    if a and a.get('score') is not None and a['score'] < 1:
        print(f'  FAIL: {a.get("title",key)} - score={a["score"]*100:.0f}')

print()
print('=== LCP ELEMENT ===')
lcp_el = audits.get('largest-contentful-paint-element', {})
if lcp_el.get('details', {}).get('items'):
    for item in lcp_el['details']['items']:
        if 'items' in item:
            for sub in item['items']:
                node = sub.get('node', {})
                if node:
                    print(f'  snippet: {node.get("snippet","")[:150]}')
                    print(f'  selector: {node.get("selector","")}')
        else:
            print(f'  {item}')

print()
print('=== LONG TASKS ===')
lt = audits.get('long-tasks', {})
if lt.get('details', {}).get('items'):
    for item in lt['details']['items'][:5]:
        print(f'  duration={item.get("duration",0):.0f}ms url={item.get("url","")[:80]}')
