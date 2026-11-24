import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, doc, collection, getDoc, setDoc, deleteDoc, onSnapshot, runTransaction, writeBatch } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig, HOST_CODE } from './config.js';
import { PAST_ROUNDS } from './past-rounds.js';

const ROUNDS = 4;
const app = document.getElementById('app');
const topicEl = document.getElementById('topic');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let fs = null, ref = null, histCol = null, state = null, owner = false, liveLoaded = false;
let history = [], histLoaded = false;
let view = 'home', detailId = null;
let me = '', draftText = '', msg = '', msgErr = false, busy = false, confirm = '', lastCount = -1;
try { me = localStorage.getItem('mrd-me') || ''; owner = localStorage.getItem('mrd-host') === HOST_CODE; } catch (e) {}

const total = s => s.order.length * ROUNDS;
const who = (s, i) => { const n = s.order.length, r = Math.floor(i / n), p = i % n; return r % 2 === 0 ? s.order[p] : s.order[n - 1 - p]; };
const slotsFor = (s, name) => { const out = []; for (let i = 0; i < total(s); i++) if (who(s, i) === name) out.push(i); return out; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const say = (t, err) => { msg = t; msgErr = !!err; };
const isLive = () => state && state.status === 'live' && Array.isArray(state.order);
const ord = n => n + (['th','st','nd','rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)] || 'th');
const go = (v, id) => { view = v; detailId = id || null; say(''); confirm = ''; render(); window.scrollTo(0, 0); };
const back = () => `<button class="ghost back" data-act="home">← Home</button>`;
const msgLine = () => `<p class="msg ${msgErr ? 'err' : ''}">${esc(msg)}</p>`;

function homeView() {
  const live = isLive();
  const n = histLoaded ? history.length : null;
  return `<div class="home">
    ${live ? `<button class="big sun" data-act="live">Rejoin the live draft: ${esc(state.topic)}</button>` : ''}
    ${owner ? `<button class="big" data-act="new">${live ? (confirm === 'new' ? 'Tap again to end the live draft' : 'Start a new draft') : 'Start a draft'}</button>` : ''}
    <button class="big ${owner || live ? 'ghost' : ''}" data-act="past">See past drafts${n ? ` (${n})` : ''}</button>
    ${!owner && !live ? '<p class="hint">No draft is running right now. When the host starts one, it shows up here.</p>' : ''}
    ${msgLine()}
    ${owner ? `<details class="tools"><summary>Host tools</summary><div class="row" style="padding-top:10px">
        ${histLoaded && !history.length ? '<button class="ghost" data-act="seed">Load the 11 past rounds</button>' : ''}
        <button class="ghost" data-act="logout">Leave host mode</button></div></details>`
      : `<details class="tools"><summary>I'm the host</summary><form class="row" id="host" style="padding-top:10px">
        <input id="code" type="password" class="grow" placeholder="Host passcode" autocomplete="off"><button type="submit">Unlock</button></form></details>`}
  </div>`;
}

function setupView() {
  return `${back()}<form class="panel" id="setup">
    <h2 class="bungee" style="font-size:30px">Set up the mountain</h2>
    <label>What's the Mount Rushmore of…
      <input id="tp" maxlength="80" placeholder="Fast food chains" required></label>
    <label>Drafters, one per line
      <textarea id="pl" placeholder="Jake&#10;Maddie&#10;Tyler&#10;Sam"></textarea></label>
    <p class="hint">Order gets shuffled when you start. Snake style: 1 → last, then last → 1. Four rounds.</p>
    ${msgLine()}
    <div class="row"><button type="submit" ${busy ? 'disabled' : ''}>Shuffle &amp; start</button></div>
  </form>`;
}

function liveView(s) {
  if (!s || !Array.isArray(s.order) || s.status === 'setup') return `${back()}<div class="panel"><h2 class="bungee" style="font-size:26px">No live draft</h2><p>Nothing is running right now.</p></div>`;
  const T = total(s), n = s.picks.length, done = n >= T;
  const cur = done ? null : who(s, n);
  const round = Math.floor(n / s.order.length) + 1;
  const last = s.picks[n - 1];
  const meOpts = ['<option value="">Pick your name</option>'].concat(s.order.map(p => `<option ${p === me ? 'selected' : ''}>${esc(p)}</option>`)).join('');
  let clock;
  if (done) {
    clock = `<div class="lbl">Draft complete</div><h2>The mountain is carved</h2><p class="latest">All ${T} picks are locked and saved to past drafts.</p>`;
  } else {
    const mine = cur === me;
    clock = `<div class="lbl">Round ${round} of ${ROUNDS} · Pick ${n + 1} of ${T}</div>
      <h2>${esc(cur)} is on the clock</h2>
      ${last ? `<p class="latest">Last pick: <b>${esc(last.p)}</b> took <b>${esc(last.t)}</b></p>` : ''}
      ${mine ? `<form class="row" id="pick"><input id="ans" class="grow" maxlength="60" placeholder="Your pick" value="${esc(draftText)}" autocomplete="off"><button type="submit" ${busy ? 'disabled' : ''}>Lock it in</button></form>`
             : `<p class="latest">${me ? `Locked. Waiting on ${esc(cur)} to pick.` : 'Choose your name below to draft.'}</p>`}
      ${msgLine()}`;
  }
  const strip = Array.from({length: T}, (_, i) => `<span class="chip ${i < n ? 'done' : i === n ? 'now' : ''}">${i + 1}. ${esc(who(s, i))}</span>`).join('');
  const board = s.order.map((p, k) => {
    const lis = slotsFor(s, p).map(i => {
      const pk = s.picks[i];
      return `<li class="${pk ? '' : 'empty'} ${i === n && !done ? 'cur' : ''}"><span class="pk">Pick ${i + 1}</span><span class="t">${pk ? esc(pk.t) : (i === n ? 'On the clock' : 'Uncarved')}</span></li>`;
    }).join('');
    return `<article class="mon ${p === cur ? 'on' : ''}"><header><span class="seed">${k + 1}</span><b>${esc(p)}</b></header><ol>${lis}</ol></article>`;
  }).join('');
  return `${back()}<section class="clock ${n !== lastCount && lastCount >= 0 ? 'flash' : ''}">${clock}</section>
    ${done ? '' : `<div class="row" style="margin-top:14px"><label for="me" style="font-weight:700">I'm drafting as</label><select id="me">${meOpts}</select></div>`}
    <div class="strip" aria-label="Draft order">${strip}</div>
    <h3 class="sec">The monuments</h3>
    <div class="board">${board}</div>
    ${owner ? `<details class="tools"><summary>Host tools</summary><div class="row" style="padding-top:10px">
      <button class="ghost" data-act="undo" ${n ? '' : 'disabled'}>Undo last pick</button></div></details>` : ''}`;
}

function pastList() {
  if (!histLoaded) return `${back()}<p class="msg">Digging up the archives…</p>`;
  if (!history.length) return `${back()}<div class="panel"><h2 class="bungee" style="font-size:26px">No past drafts yet</h2><p>Finished drafts land here automatically.</p></div>`;
  const items = history.map(h => `<button class="past" data-act="open" data-id="${esc(h.id)}">
      <b>${esc(h.topic)}</b>
      <span>${esc((h.teams || []).map(t => t.name).join(', '))}${h.date ? ' · ' + esc(h.date) : ''}</span>
    </button>`).join('');
  return `${back()}<h2 class="bungee" style="font-size:32px;margin-bottom:14px">Past drafts</h2><div class="list">${items}</div>`;
}

function pastDetail(h) {
  if (!h) return pastList();
  const teams = (h.teams || []).slice();
  const ranked = teams.some(t => Number(t.place) > 0);
  if (ranked) teams.sort((a, b) => (Number(a.place) || 99) - (Number(b.place) || 99));
  const cards = teams.map((t, k) => `<article class="mon ${ranked && Number(t.place) === 1 ? 'on' : ''}">
      <header><span class="seed">${k + 1}</span><b>${esc(t.name)}</b>${Number(t.place) > 0 ? `<span class="place">${esc(ord(Number(t.place)))}</span>` : ''}</header>
      <ol>${(t.picks || []).map((p, i) => `<li><span class="pk">#${i + 1}</span><span class="t">${esc(p)}</span></li>`).join('')}</ol>
    </article>`).join('');
  return `<button class="ghost back" data-act="past">← Past drafts</button>
    <h2 class="bungee" style="font-size:clamp(28px,5vw,44px)">The Mount Rushmore of ${esc(h.topic)}</h2>
    <p class="who"><b>Drafters:</b> ${esc(teams.map(t => t.name).join(', '))}${h.date ? ' · ' + esc(h.date) : ''}</p>
    <h3 class="sec">${ranked ? 'Final rankings' : 'The teams'}</h3>
    <div class="board">${cards}</div>
    ${owner ? `<details class="tools"><summary>Host tools</summary><div class="row" style="padding-top:10px">
      <button class="ghost" data-act="del" data-id="${esc(h.id)}">${confirm === 'del' ? 'Tap again to delete' : 'Delete this draft'}</button></div></details>` : ''}`;
}

function render() {
  if (!fs) return;
  const focused = document.activeElement && document.activeElement.id;
  const keep = view === 'setup' ? [document.getElementById('tp')?.value, document.getElementById('pl')?.value] : null;
  topicEl.textContent = view === 'live' && isLive() ? 'The Mount Rushmore of ' + state.topic : 'Snake draft · 4 picks each';
  if (view === 'home') app.innerHTML = homeView();
  else if (view === 'setup') app.innerHTML = owner ? setupView() : homeView();
  else if (view === 'live') { app.innerHTML = liveView(state); if (state && state.picks) lastCount = state.picks.length; }
  else if (view === 'past') app.innerHTML = pastList();
  else if (view === 'detail') app.innerHTML = pastDetail(history.find(h => h.id === detailId));
  if (keep && keep[0] != null && document.getElementById('tp')) { document.getElementById('tp').value = keep[0]; document.getElementById('pl').value = keep[1]; }
  if (focused && document.getElementById(focused)) { const el = document.getElementById(focused); el.focus(); if (el.setSelectionRange && el.value) el.setSelectionRange(el.value.length, el.value.length); }
}

async function safe(fn) {
  try { await fn(); return true; }
  catch (e) { console.error(e); say(e && e.code === 'permission-denied' ? 'The database refused that. Check the Firestore rules.' : 'That didn\'t save. Try again in a moment.', true); return false; }
}
function archive(s) {
  const teams = s.order.map(name => ({ name, picks: slotsFor(s, name).map(i => s.picks[i] && s.picks[i].t).filter(Boolean) }));
  const d = new Date(s.started || Date.now());
  return setDoc(doc(fs, 'history', 'd' + (s.started || Date.now())), {
    topic: s.topic, teams, createdAt: s.started || Date.now(),
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });
}

app.addEventListener('submit', async ev => {
  ev.preventDefault();
  if (busy) return;
  const id = ev.target.id;
  if (id === 'host') {
    const c = document.getElementById('code').value;
    if (c && c === HOST_CODE) { owner = true; try { localStorage.setItem('mrd-host', c); } catch (e) {} say('Host mode on.'); }
    else say('That passcode doesn\'t match.', true);
    return render();
  }
  if (id === 'setup') {
    const topic = document.getElementById('tp').value.trim();
    const names = [...new Set(document.getElementById('pl').value.split('\n').map(x => x.trim()).filter(Boolean))];
    if (!topic) { say('Give the mountain a topic.', true); return render(); }
    if (names.length < 2) { say('Add at least two drafters.', true); return render(); }
    if (names.length > 16) { say('Keep it to 16 drafters or fewer.', true); return render(); }
    busy = true; say(''); render();
    const ok = await safe(() => setDoc(ref, { status: 'live', topic: topic.slice(0, 80), order: shuffle(names.map(x => x.slice(0, 30))), picks: [], started: Date.now() }));
    busy = false; if (ok) go('live'); else render();
  }
  if (id === 'pick') {
    const t = document.getElementById('ans').value.trim();
    if (!t) { say('Type a pick first.', true); return render(); }
    busy = true; say('Locking in…'); render();
    let finished = null, problem = '';
    const ok = await safe(() => runTransaction(fs, async tx => {
      const snap = await tx.get(ref);
      const s = snap.exists() ? snap.data() : null;
      const n = s && s.picks ? s.picks.length : -1;
      if (!s || s.status !== 'live' || who(s, n) !== me) { problem = 'The board moved. Take another look.'; return; }
      const dup = s.picks.find(p => p.t.toLowerCase() === t.toLowerCase());
      if (dup) { problem = `${dup.p} already took ${dup.t}. Pick something else.`; return; }
      const picks = s.picks.concat([{ p: me, t: t.slice(0, 60) }]);
      const next = { ...s, picks, status: picks.length >= total(s) ? 'done' : 'live' };
      tx.set(ref, next);
      if (next.status === 'done') finished = next;
    }));
    if (ok && problem) say(problem, true);
    else if (ok) { draftText = ''; say(''); if (finished) await safe(() => archive(finished)); }
    busy = false; render();
  }
});

app.addEventListener('input', ev => { if (ev.target.id === 'ans') draftText = ev.target.value; });
app.addEventListener('change', ev => {
  if (ev.target.id === 'me') { me = ev.target.value; try { localStorage.setItem('mrd-me', me); } catch (e) {} say(''); render(); }
});
app.addEventListener('click', async ev => {
  const b = ev.target.closest('button[data-act]'); if (!b || busy) return;
  const act = b.dataset.act;
  if (act === 'home') return go('home');
  if (act === 'live') return go('live');
  if (act === 'past') return go('past');
  if (act === 'open') return go('detail', b.dataset.id);
  if (act === 'logout') { owner = false; try { localStorage.removeItem('mrd-host'); } catch (e) {} return go('home'); }
  if (act === 'new') {
    if (isLive() && confirm !== 'new') { confirm = 'new'; render(); setTimeout(() => { confirm = ''; render(); }, 4000); return; }
    return go('setup');
  }
  if (act === 'del' && confirm !== 'del') { confirm = 'del'; render(); setTimeout(() => { confirm = ''; render(); }, 4000); return; }
  busy = true;
  if (act === 'undo') await safe(async () => { const snap = await getDoc(ref); const s = snap.exists() ? snap.data() : null; if (s && s.picks && s.picks.length) await setDoc(ref, { ...s, picks: s.picks.slice(0, -1), status: 'live' }); });
  if (act === 'del') { await safe(() => deleteDoc(doc(fs, 'history', b.dataset.id))); busy = false; return go('past'); }
  if (act === 'seed') {
    const ok = await safe(() => { const batch = writeBatch(fs); PAST_ROUNDS.forEach(r => batch.set(doc(fs, 'history', r.id), { topic: r.topic, date: r.date, createdAt: r.createdAt, teams: r.teams })); return batch.commit(); });
    if (ok) say(`Loaded ${PAST_ROUNDS.length} past rounds.`);
  }
  busy = false; render();
});

if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('PASTE')) {
  app.innerHTML = '<div class="panel"><h2 class="bungee" style="font-size:26px">Almost there</h2><p>Paste your Firebase settings into <b>config.js</b>, then reload. The README walks through it.</p></div>';
} else {
  fs = getFirestore(initializeApp(firebaseConfig));
  ref = doc(fs, 'draft', 'state');
  histCol = collection(fs, 'history');
  render();
  const timer = setTimeout(() => { if (!liveLoaded) { say('Can\'t reach the drafts yet. They will show up once it connects.', true); render(); } }, 10000);
  let firstLive = true;
  onSnapshot(ref, snap => {
    clearTimeout(timer); liveLoaded = true;
    if (msgErr && msg.startsWith('Can\'t reach')) say('');
    state = snap.exists() ? snap.data() : null;
    if (state && !Array.isArray(state.picks)) state = null;
    if (firstLive && isLive() && view === 'home' && !owner) view = 'live';
    firstLive = false;
    render();
  }, e => { console.error(e); clearTimeout(timer); say('Can\'t read the draft. Check the Firestore rules in the README.', true); render(); });
  onSnapshot(histCol, snap => {
    history = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
    histLoaded = true;
    if (view === 'home' || view === 'past' || view === 'detail') render();
  }, e => { console.error(e); histLoaded = true; render(); });
}
