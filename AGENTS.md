# Modern Todo (Demo) — Agent Instructions

## Scope

Static, dependency-free single-user Todo app for demo.

## Guardrails

- Keep it static: `index.html`, `style.css`, `app.js` (+ docs).
- No `package.json`, no bundlers, no dependencies.
- No GitHub Actions / workflows.
- Persist state in `localStorage` key: `modern-todo-demo:v1`.

## Run

```bash
python3 -m http.server 8000
```

Open: `http://127.0.0.1:8000`

## Live

If GitHub Pages is enabled: `https://OWNER.github.io/REPO/`
