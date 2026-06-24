// ============================================================
//  APP PRINCIPAL — Lógica, UI y Navegación
// ============================================================

// Estado global
const STATE = {
  user: null,
  settings: null,
  currentSection: 'hoy',
  completions: {}, // { 'YYYY-MM-DD': Set(taskIds) }
  calMonth: null,  // { year, month }
  goals: {},       // current month goals
};

// ---- HELPERS ----

function getArgentinaDate() {
  const now = new Date();
  // Argentina UTC-3
  const arg = new Date(now.getTime() + (now.getTimezoneOffset() + CONFIG.UTC_OFFSET * -60) * 60000);
  return arg;
}

function dateToStr(date) {
  return date.toISOString().split('T')[0];
}

function getTodayStr() {
  return dateToStr(getArgentinaDate());
}

function getPlanDay(startDateStr) {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr + 'T00:00:00');
  const today = getArgentinaDate();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, Math.min(diff, 90));
}

function isActiveDay(dateStr, activeDays) {
  const d = new Date(dateStr + 'T00:00:00');
  // getDay(): 0=dom, 1=lun, ..., 6=sab
  // activeDays uses: 1=lun, 2=mar, ..., 7=dom
  const dow = d.getDay(); // 0-6
  const mapped = dow === 0 ? 7 : dow;
  return activeDays.includes(mapped);
}

function toast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function showSection(name) {
  STATE.currentSection = name;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${name}`)?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.section === name);
  });
  // Render section
  switch (name) {
    case 'hoy': renderHoy(); break;
    case 'calendario': renderCalendario(); break;
    case 'progreso': renderProgreso(); break;
    case 'manuales': renderManuales(); break;
    case 'config': renderConfig(); break;
  }
}

// ---- MARKDOWN SIMPLE ----

function renderMarkdown(text) {
  const lines = text.split('\n');
  const out = [];
  let inList = false;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/`(.+?)`/g, '<code>$1</code>');

    if (/^# (.+)/.test(line))        { if(inList){out.push('</ul>');inList=false;} out.push(`<h1>${line.slice(2)}</h1>`); }
    else if (/^## (.+)/.test(line))  { if(inList){out.push('</ul>');inList=false;} out.push(`<h2>${line.slice(3)}</h2>`); }
    else if (/^### (.+)/.test(line)) { if(inList){out.push('</ul>');inList=false;} out.push(`<h3>${line.slice(4)}</h3>`); }
    else if (/^---$/.test(line))     { if(inList){out.push('</ul>');inList=false;} out.push('<hr>'); }
    else if (/^> (.+)/.test(line))   { out.push(`<blockquote>${line.slice(2)}</blockquote>`); }
    else if (/^\| .+ \|/.test(line) && !/^[\| \-]+$/.test(line)) {
      if(inList){out.push('</ul>');inList=false;}
      if(!inTable){ out.push('<table>'); inTable=true; }
      const cells = line.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      out.push(`<tr>${cells}</tr>`);
    }
    else if (/^[\| \-:]+$/.test(line) && inTable) { /* skip separator rows */ }
    else if (/^[-*] (.+)/.test(line)) {
      if(inTable){out.push('</table>');inTable=false;}
      if(!inList){ out.push('<ul>'); inList=true; }
      out.push(`<li>${line.slice(2)}</li>`);
    }
    else if (/^\d+\. (.+)/.test(line)) {
      if(inTable){out.push('</table>');inTable=false;}
      if(!inList){ out.push('<ul>'); inList=true; }
      out.push(`<li>${line.replace(/^\d+\. /, '')}</li>`);
    }
    else {
      if(inList){out.push('</ul>');inList=false;}
      if(inTable){out.push('</table>');inTable=false;}
      if(line.trim()) out.push(`<p>${line}</p>`);
    }
  }
  if(inList) out.push('</ul>');
  if(inTable) out.push('</table>');
  return out.join('');
}

// ---- AUTH SCREEN ----

function renderLogin() {
  document.getElementById('screen-app').style.display = 'none';
  const login = document.getElementById('screen-login');
  login.style.display = 'flex';
}

function renderApp() {
  document.getElementById('screen-login').style.display = 'none';
  document.getElementById('screen-app').style.display = 'flex';
  showSection('hoy');
}

window.switchLoginTab = function(tab) {
  const isPw = tab === 'password';
  document.getElementById('form-password').style.display = isPw ? 'flex' : 'none';
  document.getElementById('form-magic').style.display = isPw ? 'none' : 'flex';
  document.getElementById('tab-password').style.background = isPw ? 'var(--gold)' : 'transparent';
  document.getElementById('tab-password').style.color = isPw ? '#000' : 'var(--text2)';
  document.getElementById('tab-magic').style.background = isPw ? 'transparent' : 'var(--gold)';
  document.getElementById('tab-magic').style.color = isPw ? 'var(--text2)' : '#000';
};

window.handlePasswordLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById('pw-email').value.trim();
  const password = document.getElementById('pw-password').value;
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Ingresando...'; btn.disabled = true;
  const { error } = await signInWithPassword(email, password);
  if (error) {
    toast('Error: ' + (error.message.includes('Invalid') ? 'Email o contraseña incorrectos' : error.message), 'error');
    btn.textContent = 'Ingresar'; btn.disabled = false;
  }
};

window.handleSignUp = async function() {
  const email = document.getElementById('pw-email').value.trim();
  const password = document.getElementById('pw-password').value;
  if (!email || password.length < 6) {
    toast('Completá el email y una contraseña de al menos 6 caracteres', 'error'); return;
  }
  const { error } = await signUpWithPassword(email, password);
  if (error) {
    toast('Error: ' + error.message, 'error');
  } else {
    toast('✅ Cuenta creada. Revisá tu email para confirmarla, luego ingresá.', 'success', 6000);
  }
};

window.handleMagicLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById('magic-email').value.trim();
  if (!email) return;
  const btn = e.target.querySelector('button');
  btn.textContent = 'Enviando...'; btn.disabled = true;
  const { error } = await signInWithEmail(email);
  if (error) {
    toast('Error: ' + error.message, 'error');
    btn.textContent = 'Enviar Magic Link ✨'; btn.disabled = false;
  } else {
    document.getElementById('form-magic').innerHTML = `
      <div style="text-align:center;padding:20px;">
        <div style="font-size:48px;margin-bottom:16px;">📬</div>
        <p style="font-weight:700;font-size:18px;margin-bottom:8px;">¡Revisá tu email!</p>
        <p style="color:var(--text2);font-size:14px;">Te mandamos un link a <strong>${email}</strong>. Tocalo para entrar.</p>
      </div>`;
  }
};

// ---- SECTION: HOY ----

async function renderHoy() {
  const container = document.getElementById('section-hoy');
  if (!STATE.user || !STATE.settings) { container.innerHTML = '<div class="loading"><span class="spinner">⏳</span>Cargando...</div>'; return; }

  const todayStr = getTodayStr();
  const argDate = getArgentinaDate();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayName = dayNames[argDate.getDay()];
  const dateLabel = `${dayName} ${argDate.getDate()} de ${monthNames[argDate.getMonth()]}`;

  const planDay = getPlanDay(STATE.settings.start_date);
  const activeDays = STATE.settings.active_days || [1, 2, 3, 4, 5];
  const isActive = isActiveDay(todayStr, activeDays);

  // Load completions for today
  if (!STATE.completions[todayStr]) {
    const { data } = await getCompletionsForDate(STATE.user.id, todayStr);
    STATE.completions[todayStr] = new Set(data.map(r => r.task_id));
  }
  const done = STATE.completions[todayStr];
  const totalTasks = TASKS.length;
  const completedCount = TASKS.filter(t => done.has(t.id)).length;

  // Update top bar
  document.getElementById('top-day-badge').textContent = planDay > 0 && planDay <= 90 ? `Día ${planDay} de 90` : '🏁 Plan terminado';

  container.innerHTML = `
    <div class="hoy-header">
      <div>
        <div class="hoy-fecha">${dateLabel}</div>
        <div class="hoy-titulo">${isActive ? 'Tus tareas de hoy' : '😴 Día de descanso'}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:22px;font-weight:800;color:var(--gold)">${completedCount}/${totalTasks}</div>
        <div style="font-size:11px;color:var(--text2)">completadas</div>
      </div>
    </div>

    ${!STATE.settings.start_date ? `
      <div class="card" style="border-color:var(--gold);background:var(--gold-bg);">
        <div style="font-weight:700;margin-bottom:8px;">⚡ Primero configurá tu plan</div>
        <div style="font-size:14px;color:var(--text2);margin-bottom:12px;">Elegí la fecha de inicio de tus 90 días.</div>
        <button class="btn btn-primary btn-sm" onclick="showSection('config')">Ir a Configuración →</button>
      </div>
    ` : ''}

    ${isActive ? '' : `
      <div class="card">
        <div style="font-size:32px;margin-bottom:8px;">🏖️</div>
        <div style="font-size:16px;font-weight:700;margin-bottom:6px;">Hoy no trabajás</div>
        <div style="font-size:14px;color:var(--text2);">Este día no está en tu cronograma activo. ¡Descansá y recargá energías para mañana!</div>
      </div>
    `}

    <div id="tasks-list">
      ${TASKS.map(task => renderTaskCard(task, done.has(task.id))).join('')}
    </div>

    ${completedCount === totalTasks && isActive ? `
      <div class="card-gold" style="text-align:center;margin-top:8px;">
        <div style="font-size:36px;margin-bottom:8px;">🎉</div>
        <div style="font-weight:800;font-size:18px;color:var(--gold)">¡DÍA COMPLETADO!</div>
        <div style="font-size:14px;color:var(--text2);margin-top:6px;">Todas las tareas del día listas. ¡Sos un crack!</div>
      </div>
    ` : ''}
  `;

  // Attach event listeners after render
  attachTaskListeners();
}

function renderTaskCard(task, isCompleted) {
  const isOro = task.esOroBrillo;
  return `
    <div class="task-card ${isOro ? 'oro' : ''} ${isCompleted ? 'completed' : ''}" id="task-card-${task.id}">
      <div class="task-header" onclick="toggleTaskExpand(${task.id})">
        <div class="task-hora">${task.hora}</div>
        <div class="task-emoji">${task.emoji}</div>
        <div class="task-info">
          <div class="task-titulo">${task.titulo}</div>
          <div class="task-dur">${task.duracion}</div>
        </div>
        <button class="task-check ${isCompleted ? 'done' : ''}" onclick="event.stopPropagation(); handleTaskCheck(${task.id})" aria-label="Marcar completada">
          ${isCompleted ? '✓' : ''}
        </button>
      </div>
      <div class="task-body" id="task-body-${task.id}">
        <div class="task-desc">${task.descripcion}</div>
        <div class="task-actions">
          ${task.manual ? `<button class="btn btn-outline btn-sm" onclick="openManual('${task.manual}')">📖 Ver guía</button>` : ''}
          ${isOro ? `<span class="tag tag-gold">🏆 BLOQUE SAGRADO</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function attachTaskListeners() {
  // Already using inline onclick
}

window.toggleTaskExpand = function(taskId) {
  const body = document.getElementById(`task-body-${taskId}`);
  if (body) body.classList.toggle('open');
};

window.handleTaskCheck = async function(taskId) {
  const todayStr = getTodayStr();
  const done = STATE.completions[todayStr];
  const isNowCompleted = !done.has(taskId);

  // Optimistic update
  if (isNowCompleted) done.add(taskId);
  else done.delete(taskId);

  const card = document.getElementById(`task-card-${taskId}`);
  const checkBtn = card?.querySelector('.task-check');
  if (card) { card.classList.toggle('completed', isNowCompleted); card.querySelector('.task-titulo').style.textDecoration = isNowCompleted ? 'line-through' : ''; }
  if (checkBtn) { checkBtn.classList.toggle('done', isNowCompleted); checkBtn.textContent = isNowCompleted ? '✓' : ''; }

  const { error } = await toggleTaskCompletion(STATE.user.id, taskId, todayStr, isNowCompleted);
  if (error) {
    // Revert
    if (isNowCompleted) done.delete(taskId); else done.add(taskId);
    toast('Error al guardar', 'error');
    renderHoy();
  } else {
    // Update counter
    const completedCount = TASKS.filter(t => done.has(t.id)).length;
    const counterEl = document.querySelector('#section-hoy .hoy-titulo + div .completedCount') ||
                      document.querySelector('#section-hoy [style*="font-size:22px"]');
    if (counterEl) counterEl.textContent = `${completedCount}/${TASKS.length}`;

    // Show completion banner if all done
    if (completedCount === TASKS.length) {
      toast('🎉 ¡Día completado! ¡Sos un crack!', 'success', 4000);
      setTimeout(() => renderHoy(), 500);
    }
  }
};

window.openManual = function(manualKey) {
  showSection('manuales');
  setTimeout(() => {
    const card = document.getElementById(`manual-${manualKey}`);
    if (card) {
      card.classList.add('open');
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

// ---- SECTION: CALENDARIO ----

async function renderCalendario() {
  const container = document.getElementById('section-calendario');
  if (!STATE.user) return;

  const now = getArgentinaDate();
  if (!STATE.calMonth) STATE.calMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const { year, month } = STATE.calMonth;

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayLabels = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  // Load completions for this month
  const { data: comps } = await getCompletionsForMonth(STATE.user.id, year, month);
  const compsByDate = {};
  comps.forEach(c => {
    if (!compsByDate[c.completed_date]) compsByDate[c.completed_date] = new Set();
    compsByDate[c.completed_date].add(c.task_id);
  });

  const activeDays = STATE.settings?.active_days || [1, 2, 3, 4, 5];
  const todayStr = getTodayStr();

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  // Start from Monday
  let startDow = firstDay.getDay(); // 0=sun
  if (startDow === 0) startDow = 7; // convert to 1=mon...7=sun
  const blanks = startDow - 1;

  let gridHtml = dayLabels.map(d => `<div class="cal-day-label">${d}</div>`).join('');
  // Blank days
  for (let i = 0; i < blanks; i++) gridHtml += '<div></div>';

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const isActive = isActiveDay(dateStr, activeDays);

    let cls = '';
    let dot = '';
    if (isFuture) { cls = 'future'; }
    else if (!isActive) { cls = 'rest'; }
    else {
      const done = compsByDate[dateStr]?.size || 0;
      if (done === 0) cls = 'empty';
      else if (done >= TASKS.length) { cls = 'full'; dot = '<div class="cal-dot"></div>'; }
      else { cls = 'partial'; dot = '<div class="cal-dot"></div>'; }
    }
    if (isToday) cls += ' today';
    gridHtml += `<div class="cal-day ${cls}">${d}${dot}</div>`;
  }

  container.innerHTML = `
    <div class="section-title">📅 Calendario</div>
    <div class="cal-nav">
      <button class="cal-nav-btn" onclick="calChangeMonth(-1)">‹</button>
      <div class="cal-mes">${monthNames[month - 1]} ${year}</div>
      <button class="cal-nav-btn" onclick="calChangeMonth(1)">›</button>
    </div>
    <div class="cal-grid">${gridHtml}</div>
    <div class="cal-leyenda">
      <div class="cal-ley-item"><div class="cal-ley-dot" style="background:var(--green)"></div> Completo</div>
      <div class="cal-ley-item"><div class="cal-ley-dot" style="background:var(--gold)"></div> Parcial</div>
      <div class="cal-ley-item"><div class="cal-ley-dot" style="background:var(--red)"></div> Sin tareas</div>
      <div class="cal-ley-item"><div class="cal-ley-dot" style="background:var(--border)"></div> Descanso</div>
    </div>
    <div class="card">
      <div style="font-weight:700;margin-bottom:8px;">Este mes</div>
      <div style="font-size:13px;color:var(--text2);">
        Días completos: <strong style="color:var(--green)">${Object.values(compsByDate).filter(s => s.size >= TASKS.length).length}</strong> •
        Días parciales: <strong style="color:var(--gold)">${Object.values(compsByDate).filter(s => s.size > 0 && s.size < TASKS.length).length}</strong>
      </div>
    </div>
  `;
}

window.calChangeMonth = function(delta) {
  let { year, month } = STATE.calMonth;
  month += delta;
  if (month < 1) { month = 12; year--; }
  if (month > 12) { month = 1; year++; }
  STATE.calMonth = { year, month };
  renderCalendario();
};

// ---- SECTION: PROGRESO ----

async function renderProgreso() {
  const container = document.getElementById('section-progreso');
  if (!STATE.user || !STATE.settings) return;

  const planDay = getPlanDay(STATE.settings.start_date);
  const pct = Math.round((planDay / 90) * 100);

  const now = getArgentinaDate();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  if (!STATE.goals[`${year}-${month}`]) {
    const { data } = await getGoalForMonth(STATE.user.id, year, month);
    STATE.goals[`${year}-${month}`] = data || { captaciones: 0, visitas: 0, videos: 0, cierres: 0 };
  }
  const goals = STATE.goals[`${year}-${month}`];

  container.innerHTML = `
    <div class="section-title">📊 Progreso</div>

    <div class="card-gold" style="margin-bottom:16px;">
      <div class="prog-header">
        <div class="prog-dias">${planDay > 0 ? `Día ${planDay}` : 'No iniciado'}</div>
        <div class="prog-sub">de 90 días · ${pct}% completado</div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width:${pct}%"></div>
      </div>
      ${STATE.settings.start_date ? `<div style="font-size:12px;color:var(--text2);">Inicio: ${STATE.settings.start_date}</div>` : ''}
    </div>

    <div class="section-title" style="font-size:16px;">Metas — ${monthNames[month - 1]} ${year}</div>

    ${Object.entries(METAS).map(([key, meta]) => {
      const val = goals[key] || 0;
      const pctMeta = Math.min(100, Math.round((val / meta.target) * 100));
      const color = val >= meta.target ? 'var(--green)' : val >= meta.min ? 'var(--gold)' : 'var(--text)';
      return `
        <div class="meta-card">
          <div class="meta-header">
            <div>
              <div class="meta-label">${meta.emoji} ${meta.label}</div>
              <div class="meta-target" style="color:var(--text2)">Meta: ${meta.min}-${meta.target}${meta.unit}</div>
            </div>
            <span class="meta-badge">${pctMeta}%</span>
          </div>
          <div class="meta-counter">
            <button class="counter-btn" onclick="updateGoal('${key}', -1, ${year}, ${month})">−</button>
            <div class="counter-val" style="color:${color}">${val}</div>
            <button class="counter-btn" onclick="updateGoal('${key}', 1, ${year}, ${month})">+</button>
          </div>
          <div class="progress-bar-wrap" style="margin-top:10px;">
            <div class="progress-bar-fill" style="width:${pctMeta}%;background:${color}"></div>
          </div>
        </div>
      `;
    }).join('')}

    <div class="card" style="margin-top:8px;">
      <div style="font-weight:700;margin-bottom:8px;">💡 Referencia de metas</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.6;">
        🏠 5-10 captaciones/mes<br>
        👣 3-5 visitas diarias<br>
        🎬 50+ videos/mes (10 semanales)<br>
        ✅ 2-3 cierres/mes
      </div>
    </div>
  `;
}

window.updateGoal = async function(key, delta, year, month) {
  const goalKey = `${year}-${month}`;
  const current = STATE.goals[goalKey] || {};
  const newVal = Math.max(0, (current[key] || 0) + delta);
  current[key] = newVal;
  STATE.goals[goalKey] = current;

  // Update just the counter display
  const counterEls = document.querySelectorAll('.counter-val');
  // Re-render is simpler
  await saveGoalEntry(STATE.user.id, year, month, current);
  renderProgreso();
};

// ---- SECTION: MANUALES ----

function renderManuales() {
  const container = document.getElementById('section-manuales');
  container.innerHTML = `
    <div class="section-title">📚 Manuales</div>
    <div class="section-sub">Tocá cada manual para expandirlo. También podés abrirlos directamente desde la tarea.</div>
    ${Object.entries(MANUALES).map(([key, m]) => `
      <div class="manual-card" id="manual-${key}">
        <div class="manual-header" onclick="toggleManual('${key}')">
          <div class="manual-header-left">
            <span class="manual-emoji">${m.emoji}</span>
            <span class="manual-nombre">${m.nombre}</span>
          </div>
          <span class="manual-arrow">▼</span>
        </div>
        <div class="manual-content" id="manual-content-${key}">
          ${renderMarkdown(m.contenido)}
        </div>
      </div>
    `).join('')}
  `;
}

window.toggleManual = function(key) {
  const card = document.getElementById(`manual-${key}`);
  card?.classList.toggle('open');
};

// ---- SECTION: CONFIG ----

async function renderConfig() {
  const container = document.getElementById('section-config');
  const activeDays = STATE.settings?.active_days || [1, 2, 3, 4, 5];
  const startDate = STATE.settings?.start_date || '';
  const dayLabels = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
  const dayValues = [1, 2, 3, 4, 5, 6, 7];

  const subStatus = await isSubscribed();

  container.innerHTML = `
    <div class="section-title">⚙️ Configuración</div>

    <div class="config-section">
      <div class="config-label">Plan de 90 días</div>
      <div class="config-card">
        <div class="config-row">
          <div>
            <div class="config-row-label">Fecha de inicio</div>
            <div class="config-row-sub">¿Cuándo empezaste el plan?</div>
          </div>
          <input type="date" id="cfg-start-date" value="${startDate}"
            style="background:var(--card2);border:1px solid var(--border);color:var(--text);padding:8px;border-radius:8px;font-size:14px;"
            onchange="saveStartDate(this.value)">
        </div>
        <div class="config-row" style="flex-direction:column;align-items:flex-start;gap:10px;">
          <div>
            <div class="config-row-label">Días activos</div>
            <div class="config-row-sub">¿Qué días aplicás la rutina?</div>
          </div>
          <div class="days-picker" id="days-picker">
            ${dayValues.map((v, i) => `
              <div class="day-chip ${activeDays.includes(v) ? 'active' : ''}" data-day="${v}" onclick="toggleActiveDay(${v})">
                ${dayLabels[i]}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="config-label">Notificaciones Push</div>
      <div class="config-card">
        <div class="config-row">
          <div>
            <div class="config-row-label">${subStatus ? '🔔 Activadas' : '🔕 Desactivadas'}</div>
            <div class="config-row-sub">${subStatus ? 'Recibirás recordatorios en el horario de cada tarea' : 'Activá para recibir recordatorios automáticos'}</div>
          </div>
          <button class="btn ${subStatus ? 'btn-danger' : 'btn-primary'} btn-sm" id="push-btn" onclick="handlePushToggle()">
            ${subStatus ? 'Desactivar' : 'Activar'}
          </button>
        </div>
        <div class="config-row" style="flex-direction:column;align-items:flex-start;gap:4px;">
          <div class="config-row-label" style="font-size:13px;color:var(--text2);">⚠️ Para notificaciones en iPhone:</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.5;">1. Abrí esta app en Safari<br>2. Tocá el botón Compartir (□↑)<br>3. "Agregar a pantalla de inicio"<br>4. Abrí la app instalada y activá las notificaciones</div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="config-label">Cuenta</div>
      <div class="config-card">
        <div class="config-row">
          <div>
            <div class="config-row-label">Email</div>
            <div class="config-row-sub">${STATE.user?.email || '—'}</div>
          </div>
        </div>
        <div class="config-row" style="justify-content:center;">
          <button class="btn btn-danger btn-sm" onclick="handleSignOut()">Cerrar sesión</button>
        </div>
      </div>
    </div>
  `;
}

window.saveStartDate = async function(date) {
  if (!date) return;
  const newSettings = { ...(STATE.settings || {}), start_date: date };
  const { data, error } = await saveUserSettings(STATE.user.id, newSettings);
  if (!error) {
    STATE.settings = { ...STATE.settings, start_date: date };
    toast('✅ Fecha guardada', 'success');
    document.getElementById('top-day-badge').textContent = `Día ${getPlanDay(date)} de 90`;
  } else {
    toast('Error al guardar', 'error');
  }
};

window.toggleActiveDay = async function(day) {
  let days = [...(STATE.settings?.active_days || [1, 2, 3, 4, 5])];
  if (days.includes(day)) {
    if (days.length <= 1) return; // At least 1 active day
    days = days.filter(d => d !== day);
  } else {
    days.push(day);
    days.sort((a, b) => a - b);
  }
  STATE.settings = { ...(STATE.settings || {}), active_days: days };
  await saveUserSettings(STATE.user.id, STATE.settings);

  // Update chips
  document.querySelectorAll('.day-chip').forEach(chip => {
    chip.classList.toggle('active', days.includes(parseInt(chip.dataset.day)));
  });
};

window.handlePushToggle = async function() {
  const btn = document.getElementById('push-btn');
  btn.textContent = '...';
  btn.disabled = true;

  const subscribed = await isSubscribed();
  if (subscribed) {
    await disablePushNotifications(STATE.user.id);
    toast('🔕 Notificaciones desactivadas', 'info');
  } else {
    const activeDays = STATE.settings?.active_days || [1, 2, 3, 4, 5];
    const result = await setupPushNotifications(STATE.user.id, activeDays);
    if (result.ok) toast('🔔 ' + result.message, 'success');
    else toast('Error: ' + result.message, 'error');
  }

  await renderConfig();
};

window.handleSignOut = async function() {
  if (!confirm('¿Cerrar sesión?')) return;
  await signOut();
  STATE.user = null;
  STATE.settings = null;
  renderLogin();
};

// ---- INIT ----

async function init() {
  // Check config
  if (CONFIG.SUPABASE_URL === 'PEGAR_URL_DE_SUPABASE_AQUI') {
    document.getElementById('screen-login').innerHTML = `
      <div style="padding:40px;text-align:center;max-width:400px;margin:auto;">
        <div style="font-size:48px;margin-bottom:16px;">⚙️</div>
        <h2 style="margin-bottom:12px;">Falta configurar</h2>
        <p style="color:var(--text2);font-size:14px;line-height:1.6;">Abrí el archivo <code style="color:var(--gold)">config.js</code> y pegá tus credenciales de Supabase. Luego volvé a cargar la página.</p>
      </div>`;
    return;
  }

  // Listen for auth changes
  onAuthChange(async (event, session) => {
    if (session?.user) {
      STATE.user = session.user;
      // Load settings
      const { data } = await getUserSettings(STATE.user.id);
      STATE.settings = data || { active_days: [1, 2, 3, 4, 5], start_date: null };
      if (!data) {
        // Create default settings for new user
        await saveUserSettings(STATE.user.id, { active_days: [1, 2, 3, 4, 5], start_date: null });
      }
      renderApp();
    } else {
      STATE.user = null;
      renderLogin();
    }
  });
}

// Start
document.addEventListener('DOMContentLoaded', init);
