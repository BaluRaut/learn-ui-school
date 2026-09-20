"""Does the board still stand? A zero-dependency check of the HTML, the CSS tokens and the API. (Lesson 10)
    python3 ui/mock_api.py &  python3 ui/smoke_test.py
"""
import json, re, sys, urllib.request
B = "http://127.0.0.1:8000"
fails = 0
def check(name, ok):
    global fails; print(("✅" if ok else "❌"), name); fails += 0 if ok else 1

html = urllib.request.urlopen(B + "/").read().decode()
check("lang attribute on <html>", 'lang="en"' in html)
check("one <h1>", html.count("<h1") == 1)
check("every input has a label", all(f'for="{i}"' in html for i in re.findall(r'<(?:input|select) id="([^"]+)"', html)))
check("images have alt", all("alt=" in tag for tag in re.findall(r"<img[^>]*>", html)))
check("skip link + live region", 'class="skip"' in html and 'aria-live="polite"' in html)
css = urllib.request.urlopen(B + "/styles.css").read().decode()
check("design tokens defined", "--accent" in css and "--bg" in css)
check("dark theme via tokens", "prefers-color-scheme: dark" in css)
check("focus is visible", ":focus-visible" in css)
api = json.loads(urllib.request.urlopen(B + "/api/students").read())
check("API returns students", len(api["items"]) >= 5)
req = urllib.request.Request(B + "/api/students", data=b'{"name":"Z","class":"9Z"}', headers={"Content-Type": "application/json"}, method="POST")
try: urllib.request.urlopen(req); check("API rejects a bad form", False)
except urllib.error.HTTPError as e: check("API rejects a bad form (400)", e.code == 400)
print("\n" + ("🎉 the board stands" if not fails else f"💥 {fails} check(s) failed")); sys.exit(1 if fails else 0)
