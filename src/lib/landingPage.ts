import { env } from "../config/env";


export function getLandingPageHtml(): string {
  const base = `http://localhost:${env.PORT}`;
  const api = `${base}/api/${env.API_VERSION}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>API Dashboard</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0f1117;--bg2:#161b27;--bg3:#1e2536;--border:#2a3347;
  --text:#e2e8f0;--muted:#64748b;--accent:#6366f1;--accent2:#818cf8;
  --green:#22c55e;--yellow:#eab308;--red:#ef4444;--blue:#38bdf8;
  --teal:#2dd4bf;--orange:#f97316;
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;padding:2rem 1rem}
a{color:inherit;text-decoration:none}
.wrap{max-width:960px;margin:0 auto}

.header{display:flex;align-items:center;gap:1rem;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border)}
.logo{width:42px;height:42px;background:var(--accent);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.header h1{font-size:1.4rem;font-weight:600;letter-spacing:-.02em}
.header p{font-size:.8rem;color:var(--muted);margin-top:2px}
.badge{display:inline-flex;align-items:center;gap:4px;font-size:.7rem;padding:2px 8px;border-radius:99px;font-weight:500;margin-left:8px}
.badge.live{background:#14532d;color:#86efac}
.badge.env{background:#1e3a5f;color:#93c5fd}

.status-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-bottom:2rem}
.stat{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:.9rem 1rem}
.stat-label{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.3rem}
.stat-value{font-size:1.1rem;font-weight:600}
.stat-value.green{color:var(--green)}
.stat-value.blue{color:var(--blue)}
.stat-value.yellow{color:var(--yellow)}
.stat-value.teal{color:var(--teal)}
.stat-value.orange{color:var(--orange)}

.section-title{font-size:.7rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.75rem}

.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.75rem;margin-bottom:2rem}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.1rem;cursor:pointer;transition:border-color .2s,transform .15s;display:block;position:relative;overflow:hidden}
.card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--card-accent,var(--accent))08,transparent 60%);pointer-events:none}
.card:hover{border-color:var(--card-accent,var(--accent));transform:translateY(-2px)}
.card-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:.75rem;background:var(--card-accent-bg,#312e81)}
.card h3{font-size:.9rem;font-weight:600;margin-bottom:.25rem}
.card p{font-size:.75rem;color:var(--muted);line-height:1.5}
.card-arrow{position:absolute;top:1rem;right:1rem;color:var(--muted);font-size:14px;transition:color .2s,transform .2s}
.card:hover .card-arrow{color:var(--card-accent,var(--accent));transform:translate(2px,-2px)}

.info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.75rem;margin-bottom:2rem}
.info-box{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.1rem}
.info-box h4{font-size:.8rem;font-weight:600;color:var(--accent2);margin-bottom:.75rem;display:flex;align-items:center;gap:.4rem}
.info-row{display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.8rem}
.info-row:last-child{border-bottom:none}
.info-row span:first-child{color:var(--muted)}
.info-row span:last-child{color:var(--text);font-weight:500;font-family:monospace;font-size:.75rem}
.info-val.green{color:var(--green)}
.info-val.yellow{color:var(--yellow)}
.info-val.blue{color:var(--blue)}
.info-val.orange{color:var(--orange)}

.migration-list{list-style:none}
.migration-item{display:flex;align-items:center;gap:.6rem;padding:.45rem 0;border-bottom:1px solid var(--border);font-size:.78rem}
.migration-item:last-child{border-bottom:none}
.m-dot{width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0}
.m-name{flex:1;font-family:monospace;color:var(--text)}
.m-time{color:var(--muted);font-size:.72rem}

.stack{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem}
.pill{font-size:.72rem;padding:4px 10px;border-radius:99px;border:1px solid var(--border);color:var(--muted);background:var(--bg2)}

.author-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.25rem;margin-bottom:2rem;display:flex;align-items:center;gap:1.25rem}
.author-avatar{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;flex-shrink:0;color:white}
.author-info h3{font-size:1rem;font-weight:600;margin-bottom:.2rem}
.author-info p{font-size:.78rem;color:var(--muted);line-height:1.6;margin-bottom:.6rem}
.author-links{display:flex;gap:.5rem;flex-wrap:wrap}
.author-link{font-size:.72rem;padding:3px 10px;border-radius:99px;border:1px solid var(--border);color:var(--muted);background:var(--bg3);transition:border-color .2s,color .2s}
.author-link:hover{border-color:var(--accent);color:var(--accent2)}

.footer{text-align:center;font-size:.75rem;color:var(--muted);padding-top:1.5rem;border-top:1px solid var(--border)}
.footer a{color:var(--accent2)}

#uptime,#memused,#memtotal,#avgrt{transition:all .3s}
</style>
</head>
<body>
<div class="wrap">

  <div class="header">
    <div class="logo">⚡</div>
    <div>
      <h1>My Express API
        <span class="badge live">● Live</span>
        <span class="badge env">${env.NODE_ENV}</span>
      </h1>
      <p>Express 5 · TypeScript · Prisma 7 · NeonDB · v1.0.0</p>
    </div>
  </div>

  <!-- Runtime Stats -->
  <div class="status-bar">
    <div class="stat">
      <div class="stat-label">Status</div>
      <div class="stat-value green">● Running</div>
    </div>
    <div class="stat">
      <div class="stat-label">Uptime</div>
      <div class="stat-value teal" id="uptime">—</div>
    </div>
    <div class="stat">
      <div class="stat-label">Memory Used</div>
      <div class="stat-value yellow" id="memused">—</div>
    </div>
    <div class="stat">
      <div class="stat-label">Memory Total</div>
      <div class="stat-value" id="memtotal">—</div>
    </div>
    <div class="stat">
      <div class="stat-label">Node.js</div>
      <div class="stat-value blue" id="nodever">—</div>
    </div>
    <div class="stat">
      <div class="stat-label">Avg Response</div>
      <div class="stat-value orange" id="avgrt">—</div>
    </div>
  </div>

  <!-- Quick Access -->
  <div class="section-title">Quick Access</div>
  <div class="grid">
    <a href="${api}/docs" target="_blank" class="card" style="--card-accent:#6366f1;--card-accent-bg:#312e81">
      <div class="card-icon">📖</div>
      <h3>Swagger Docs</h3>
      <p>Interactive API docs — test endpoints directly</p>
      <span class="card-arrow">↗</span>
    </a>
    <a href="${api}/health" target="_blank" class="card" style="--card-accent:#22c55e;--card-accent-bg:#14532d">
      <div class="card-icon">💚</div>
      <h3>Health Check</h3>
      <p>Server status, uptime, environment info</p>
      <span class="card-arrow">↗</span>
    </a>
    <a href="${api}/health/db" target="_blank" class="card" style="--card-accent:#38bdf8;--card-accent-bg:#0c4a6e">
      <div class="card-icon">🗄️</div>
      <h3>DB Health</h3>
      <p>NeonDB connection status check</p>
      <span class="card-arrow">↗</span>
    </a>
    <a href="${api}" target="_blank" class="card" style="--card-accent:#f97316;--card-accent-bg:#7c2d12">
      <div class="card-icon">🔗</div>
      <h3>API Base URL</h3>
      <p>Base endpoint for all API routes</p>
      <span class="card-arrow">↗</span>
    </a>
    <a href="http://localhost:51212" target="_blank" class="card" style="--card-accent:#2dd4bf;--card-accent-bg:#134e4a">
      <div class="card-icon">🔬</div>
      <h3>Prisma Studio</h3>
      <p>Visual database browser — run make db-studio</p>
      <span class="card-arrow">↗</span>
    </a>
    <a href="${api}/docs-json" target="_blank" class="card" style="--card-accent:#a78bfa;--card-accent-bg:#2e1065">
      <div class="card-icon">📄</div>
      <h3>OpenAPI JSON</h3>
      <p>Raw spec for client SDK generation</p>
      <span class="card-arrow">↗</span>
    </a>
  </div>

  <!-- Environment & Project Info -->
  <div class="info-grid">
    <div class="info-box">
      <h4>⚙️ Environment</h4>
      <div class="info-row"><span>NODE_ENV</span><span class="info-val green">${env.NODE_ENV}</span></div>
      <div class="info-row"><span>Port</span><span class="info-val blue">${env.PORT}</span></div>
      <div class="info-row"><span>API Version</span><span class="info-val">/api/${env.API_VERSION}</span></div>
      <div class="info-row"><span>Rate Limit</span><span class="info-val yellow">${env.RATE_LIMIT_MAX} req / 15 min</span></div>
      <div class="info-row"><span>CORS Origin</span><span class="info-val">${env.CORS_ORIGIN}</span></div>
    </div>

    <div class="info-box">
      <h4>🏗️ Project</h4>
      <div class="info-row"><span>Project</span><span class="info-val">My Express API</span></div>
      <div class="info-row"><span>Version</span><span class="info-val green">v1.0.0</span></div>
      <div class="info-row"><span>GitHub</span>
        <a href="https://github.com/yourusername/your-repo" target="_blank" style="color:var(--blue);font-size:.75rem">yourusername/your-repo ↗</a>
      </div>
      <div class="info-row"><span>Contact</span><span class="info-val">your@email.com</span></div>
      <div class="info-row"><span>Slack</span>
        <a href="https://your-workspace.slack.com/channels/your-channel" target="_blank" style="color:var(--accent2);font-size:.75rem">#your-channel ↗</a>
      </div>
    </div>

    <div class="info-box">
      <h4>🗄️ DB Migrations</h4>
      <ul class="migration-list" id="migration-list">
        <li class="migration-item">
          <span class="m-dot"></span>
          <span class="m-name">20260101_000000_init</span>
          <span class="m-time">latest</span>
        </li>
      </ul>
    </div>
  </div>

  <!-- Tech Stack -->
  <div class="section-title">Tech Stack</div>
  <div class="stack">
    <span class="pill">Express 5</span>
    <span class="pill">TypeScript 5</span>
    <span class="pill">Prisma 7</span>
    <span class="pill">NeonDB</span>
    <span class="pill">Zod 4</span>
    <span class="pill">Pino Logger</span>
    <span class="pill">Helmet</span>
    <span class="pill">Rate Limiting</span>
    <span class="pill">Swagger / OpenAPI 3.0</span>
    <span class="pill">Jest</span>
    <span class="pill">ESLint + Prettier</span>
    <span class="pill">Husky + commitlint</span>
    <span class="pill">GitHub Actions</span>
    <span class="pill">Vercel</span>
  </div>

  <!-- Author -->
  <div class="section-title">Developer</div>
  <div class="author-card">
    <div class="author-avatar">YN</div>
    <div class="author-info">
      <h3>Your Name</h3>
      <p>Full-stack developer passionate about building scalable backend systems.<br>Open to collaborations and interesting projects.</p>
      <div class="author-links">
        <a href="https://github.com/yourusername" target="_blank" class="author-link">⌥ GitHub</a>
        <a href="https://linkedin.com/in/yourusername" target="_blank" class="author-link">in LinkedIn</a>
        <a href="mailto:your@email.com" class="author-link">✉ Email</a>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>My Express API · <a href="${api}/docs">Swagger UI</a> · <a href="${api}/docs-json">OpenAPI JSON</a> · Built with ❤️</p>
  </div>

</div>

<script>
(function(){
  // Uptime formatter
  function fmtUptime(s){
    const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.floor(s%60);
    if(h>0) return h+'h '+m+'m';
    if(m>0) return m+'m '+sec+'s';
    return sec+'s';
  }

  // Fetch health data for runtime stats
  fetch('${api}/health')
    .then(r=>r.json())
    .then(d=>{
      if(d.data){
        document.getElementById('uptime').textContent = fmtUptime(d.data.uptime||0);
        document.getElementById('nodever').textContent = d.data.nodeVersion||'—';
      }
    }).catch(()=>{});

  // Fetch runtime stats (memory, response time)
  fetch('${api}/health/runtime')
    .then(r=>r.json())
    .then(d=>{
      if(d.data){
        document.getElementById('memused').textContent = d.data.memUsed||'—';
        document.getElementById('memtotal').textContent = d.data.memTotal||'—';
        document.getElementById('avgrt').textContent = d.data.avgResponseTime||'—';
      }
    }).catch(()=>{
      document.getElementById('memused').textContent='N/A';
      document.getElementById('memtotal').textContent='N/A';
      document.getElementById('avgrt').textContent='N/A';
    });

  // Refresh uptime every second
  let uptimeVal = 0;
  fetch('${api}/health').then(r=>r.json()).then(d=>{
    uptimeVal = d.data?.uptime||0;
    setInterval(()=>{
      uptimeVal++;
      const el=document.getElementById('uptime');
      if(el) el.textContent=fmtUptime(uptimeVal);
    },1000);
  }).catch(()=>{});
})();
</script>
</body>
</html>`;
}
