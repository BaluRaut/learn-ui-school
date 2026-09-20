// The notice board's one script — state, components, events, fetch. (Lessons 04–07, 11)
// No framework: the ideas are the same ones React/Vue/Svelte automate.
(function () {
  "use strict";
  const API = (location.origin.startsWith("file") ? "http://127.0.0.1:8000" : "") + "/api/students";

  // ---- 1) one source of truth (lesson 05) -------------------------------------
  const state = { students: [], filter: "", loading: true, error: null };

  // ---- 2) components: pure functions from state → DOM (lesson 05) ---------------
  const $ = (sel) => document.querySelector(sel);
  const tpl = $("#student-card");

  function StudentCard(s) {
    const li = tpl.content.firstElementChild.cloneNode(true);
    li.querySelector(".name").textContent = s.name;                       // textContent, never innerHTML (lesson 11: XSS)
    li.querySelector(".meta").textContent = `class ${s.class} · #${s.id}`;
    li.querySelector(".grade").textContent = s.grade;
    li.querySelector("img").src = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="hsl(${(s.id * 67) % 360} 70% 60%)"/><text x="20" y="26" text-anchor="middle" font-size="18" fill="#fff">${s.name[0]}</text></svg>`)}`;
    return li;
  }

  function render() {                                                     // the whole UI is a function of state
    const list = $("#student-list"), status = $("#status");
    const rows = state.students.filter((s) => !state.filter || s.class === state.filter);
    list.setAttribute("aria-busy", state.loading);
    list.replaceChildren(...rows.map(StudentCard));
    status.className = "status" + (state.error ? " error" : "");
    status.textContent = state.loading ? "Loading…" : state.error ? `Could not load: ${state.error}` : rows.length ? "" : "No students in this class yet.";
    $("#count").textContent = `${state.students.length} students on the board`;
  }

  // ---- 3) talking to the counter (lesson 04 + 11) --------------------------------
  async function load() {
    state.loading = true; state.error = null; render();
    try {
      const r = await fetch(API, { signal: AbortSignal.timeout(5000) });   // never wait forever
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      state.students = (await r.json()).items;
    } catch (e) {
      state.error = e.name === "TimeoutError" ? "timeout" : e.message;
    } finally {
      state.loading = false; render();
    }
  }

  async function enrol(data) {
    const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const body = await r.json();
    if (!r.ok) throw new Error(body.error ? body.error.message : r.statusText);
    return body;
  }

  // ---- 4) events → state changes → render (lesson 04) --------------------------
  $("#class-filter").addEventListener("change", (e) => { state.filter = e.target.value; render(); });

  $("#enrol-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target, msg = $("#form-msg"), btn = form.querySelector("button");
    const data = Object.fromEntries(new FormData(form).entries());
    let ok = true;                                                        // validate on the board first…
    for (const f of form.querySelectorAll(".field")) {
      const input = f.querySelector("input, select");
      const bad = !input.checkValidity();
      f.classList.toggle("invalid", bad); ok = ok && !bad;
    }
    if (!ok) { msg.className = "status error"; msg.textContent = "Please fill in the marked fields."; return; }
    btn.disabled = true; msg.className = "status"; msg.textContent = "Enrolling…";
    try {
      const s = await enrol(data);                                        // …the counter validates again (never trust the board)
      state.students.push(s); render(); form.reset();
      msg.className = "status ok"; msg.textContent = `${s.name} is on the board.`;
      $("#name").focus();
    } catch (err) {
      msg.className = "status error"; msg.textContent = err.message;
    } finally { btn.disabled = false; }
  });

  // ---- 5) the theme toggle: a token switch, nothing else changes (lesson 08) -----
  const themeBtn = $("#theme");
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    themeBtn.setAttribute("aria-pressed", t === "dark");
    themeBtn.textContent = t === "dark" ? "☀️ Light" : "🌙 Dark";
    try { localStorage.setItem("board-theme", t); } catch (e) {}
  }
  themeBtn.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  try { const saved = localStorage.getItem("board-theme"); if (saved) applyTheme(saved); } catch (e) {}

  load();
})();
