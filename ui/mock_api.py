"""The tiny counter behind the notice board — serves the app AND /api/students. (Lessons 04, 11)

Zero dependencies. Run from the repo root:
    python3 ui/mock_api.py            # http://127.0.0.1:8000/  (add ?slow=1 or ?fail=1 to the API for loading/error states)
"""
import json, os, sys, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
STUDENTS = [
    {"id": 1, "name": "Aarav", "class": "3A", "grade": "A"}, {"id": 2, "name": "Sita", "class": "3A", "grade": "A+"},
    {"id": 3, "name": "Kabir", "class": "3A", "grade": "B+"}, {"id": 4, "name": "Meera", "class": "3B", "grade": "A"},
    {"id": 5, "name": "Rohan", "class": "3B", "grade": "B"},
]
NEXT = [6]

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(self, fmt, *a): print(f"{self.command} {self.path} → {a[1] if len(a) > 1 else ''}", file=sys.stderr, flush=True)

    def send_json(self, status, body):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Access-Control-Allow-Origin", "*")        # lesson 11: CORS — the counter says who may call it from a browser
        self.end_headers(); self.wfile.write(data)

    def do_OPTIONS(self):                                             # the browser's preflight question
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*"); self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); self.end_headers()

    def do_GET(self):
        u = urlparse(self.path)
        if u.path != "/api/students": return super().do_GET()
        q = parse_qs(u.query)
        if "slow" in q: time.sleep(2.5)                              # show the loading state
        if "fail" in q: return self.send_json(503, {"error": {"code": "unavailable", "message": "the counter is closed"}})
        self.send_json(200, {"items": STUDENTS})

    def do_POST(self):
        if urlparse(self.path).path != "/api/students": return self.send_json(404, {"error": {"code": "not_found", "message": "no such counter"}})
        try: body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0")) or b"{}"))
        except json.JSONDecodeError: return self.send_json(400, {"error": {"code": "invalid_json", "message": "bad JSON"}})
        name, cls = (body.get("name") or "").strip(), body.get("class")
        if len(name) < 2 or cls not in ("3A", "3B"):                # never trust the board: validate again
            return self.send_json(400, {"error": {"code": "validation_failed", "message": "name (2+ chars) and class (3A/3B) are required"}})
        s = {"id": NEXT[0], "name": name, "class": cls, "grade": body.get("grade", "C")}; NEXT[0] += 1
        STUDENTS.append(s); self.send_json(201, s)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"📌 notice board on http://127.0.0.1:{port}/  · API at /api/students", file=sys.stderr, flush=True)
    ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
