// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA1APVkDwnBQjmj6VBOfPFb036d8KEqDdc",
  authDomain: "arise-app-c49a3.firebaseapp.com",
  databaseURL: "https://arise-app-c49a3-default-rtdb.firebaseio.com",
  projectId: "arise-app-c49a3",
  storageBucket: "arise-app-c49a3.firebasestorage.app",
  messagingSenderId: "890346357822",
  appId: "1:890346357822:web:56b278c74348c63df3fd6f"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Global variables
let currentUser = null;
let PK = null;
let S = { lang: 'bn', playerName: '', level: 1, xp: 0, streak: 0, totalQuestsDone: 0, stats: { strength: 10, intelligence: 10, agility: 10, vitality: 10, endurance: 10, charisma: 10 }, weight: 70, height: 170, weightHistory: [], achievements: [], quests: [], lastQuestReset: '', birthYear: 2000, age: 25 };
let isNewUser = false;
let pendingUserData = null;
let obYear = 2000, obWeight = 70, obFeet = 5, obInch = 7;
let tab = 'dashboard';

// Quests Data
const QT = [
  { id: 1, title: "Morning Push-ups", desc: "3 sets × 20 reps", xp: 50, stat: "strength", cat: "fitness", done: false, icon: "💪" },
  { id: 2, title: "Squats", desc: "3 sets × 30 reps", xp: 50, stat: "strength", cat: "fitness", done: false, icon: "🦵" },
  { id: 3, title: "Plank Hold", desc: "3 sets × 60 seconds", xp: 40, stat: "endurance", cat: "fitness", done: false, icon: "🧘" },
  { id: 4, title: "Pull-ups", desc: "3 sets × 10 reps", xp: 60, stat: "strength", cat: "fitness", done: false, icon: "🏋️" },
  { id: 5, title: "Jumping Jacks", desc: "3 sets × 50 reps", xp: 30, stat: "agility", cat: "fitness", done: false, icon: "🤸" },
  { id: 6, title: "Running / Walk", desc: "30 minutes cardio", xp: 70, stat: "endurance", cat: "fitness", done: false, icon: "🏃" },
  { id: 7, title: "Lunges", desc: "3 sets × 20 reps each leg", xp: 45, stat: "strength", cat: "fitness", done: false, icon: "🦶" },
  { id: 8, title: "Burpees", desc: "3 sets × 15 reps", xp: 65, stat: "agility", cat: "fitness", done: false, icon: "💥" },
  { id: 9, title: "Read a Book", desc: "30 minutes reading", xp: 60, stat: "intelligence", cat: "mind", done: false, icon: "📖" },
  { id: 10, title: "Study / Learn", desc: "1 hour focused study", xp: 80, stat: "intelligence", cat: "mind", done: false, icon: "🎓" },
  { id: 11, title: "Meditation", desc: "15 minutes mindfulness", xp: 50, stat: "vitality", cat: "mind", done: false, icon: "🌿" },
  { id: 12, title: "Journal Writing", desc: "Write today's thoughts", xp: 35, stat: "intelligence", cat: "mind", done: false, icon: "✍️" },
  { id: 13, title: "Drink Water", desc: "8 glasses throughout day", xp: 30, stat: "vitality", cat: "health", done: false, icon: "💧" },
  { id: 14, title: "Sleep 8 Hours", desc: "Full night rest", xp: 60, stat: "vitality", cat: "health", done: false, icon: "😴" },
  { id: 15, title: "Healthy Meal", desc: "Eat nutritious food", xp: 40, stat: "vitality", cat: "health", done: false, icon: "🥗" },
  { id: 16, title: "No Junk Food", desc: "Avoid processed food", xp: 50, stat: "vitality", cat: "health", done: false, icon: "🚫" },
  { id: 17, title: "Social Interaction", desc: "Meaningful conversation", xp: 40, stat: "charisma", cat: "social", done: false, icon: "🤝" },
  { id: 18, title: "Help Someone", desc: "Do something kind", xp: 45, stat: "charisma", cat: "social", done: false, icon: "💙" }
];

const AT = [
  { id: 1, title: "First Bounty", desc: "Complete your first quest", icon: "💰", unlocked: false },
  { id: 2, title: "Pirate Crew", desc: "Reach Level 5", icon: "⚓", unlocked: false },
  { id: 3, title: "Will of D", desc: "7-day streak", icon: "🔥", unlocked: false },
  { id: 4, title: "Conqueror's Haki", desc: "Complete 50 quests", icon: "👑", unlocked: false },
  { id: 5, title: "Pirate King", desc: "Reach Level 20", icon: "🏴‍☠️", unlocked: false },
  { id: 6, title: "Balanced Crew", desc: "All stats above 50", icon: "⚖️", unlocked: false }
];

const BOSSES = [
  { id: 1, name: "Kaido", hp: 1000, reward: 500, desc: "Complete all quests 7 days", icon: "🐉", diff: "YONKO", color: "#D62828" },
  { id: 2, name: "Doflamingo", hp: 500, reward: 200, desc: "100 push-ups in a day", icon: "🦩", diff: "WARLORD", color: "#FB8500" }
];

function rank(l) {
  if (l >= 20) return { r: "KING", c: "#FFB703", lb: "Pirate King", icon: "🏴‍☠️" };
  if (l >= 15) return { r: "YONKO", c: "#D62828", lb: "Emperor", icon: "👑" };
  if (l >= 10) return { r: "NAKAMA", c: "#FB8500", lb: "Straw Hat Pirate", icon: "⚓" };
  if (l >= 5) return { r: "ROOKIE", c: "#023E8A", lb: "Supernova", icon: "🗡️" };
  return { r: "E", c: "#8B9BB4", lb: "East Blue Pirate", icon: "⛵" };
}

function xpL(l) { return l * l * 100; }
function bmi() { const h = S.height / 100; return (S.weight / (h * h)).toFixed(1); }
function save() { if (PK) db.ref(`players/${PK}`).set(S); }

// ========== LANGUAGE ==========
function selectLanguage(lang) {
  S.lang = lang;
  document.getElementById('lang-screen').style.display = 'none';
  document.getElementById('account-screen').style.display = 'flex';
}

function setLang(lang) {
  S.lang = lang;
  save();
  location.reload();
}

// ========== ACCOUNT ==========
function chooseLogin() {
  document.getElementById('account-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}

function chooseNewAccount() {
  isNewUser = true;
  document.getElementById('account-screen').style.display = 'none';
  document.getElementById('onboarding').style.display = 'block';
  document.getElementById('ob-step1').style.display = 'flex';
  document.getElementById('ob-step2').style.display = 'none';
}

// ========== ONBOARDING ==========
function adjYear(d) {
  const now = new Date().getFullYear();
  obYear = Math.max(1950, Math.min(now - 5, obYear + d));
  document.getElementById('ob-year-val').textContent = obYear;
  document.getElementById('ob-age-show').textContent = `Age: ${now - obYear} years`;
}

function saveBirthYear() {
  S.birthYear = obYear;
  S.age = new Date().getFullYear() - obYear;
  document.getElementById('ob-step1').style.display = 'none';
  document.getElementById('ob-step2').style.display = 'flex';
  updateObBMI();
}

function adjObW(d) { obWeight = Math.max(30, Math.min(200, obWeight + d)); document.getElementById('ob-weight-val').textContent = obWeight; updateObBMI(); }
function adjObFt(d) { obFeet = Math.max(3, Math.min(8, obFeet + d)); document.getElementById('ob-feet-val').textContent = obFeet; updateObBMI(); }
function adjObIn(d) { obInch = Math.max(0, Math.min(11, obInch + d)); document.getElementById('ob-inch-val').textContent = obInch; updateObBMI(); }

function updateObBMI() {
  const totalInch = (obFeet * 12) + obInch;
  const cm = totalInch * 2.54;
  const h = cm / 100;
  const bmiVal = (obWeight / (h * h)).toFixed(1);
  document.getElementById('ob-bmi-show').textContent = 'BMI: ' + bmiVal;
}

function showGoogleLoginAfterOnboarding() {
  const totalInch = (obFeet * 12) + obInch;
  pendingUserData = {
    weight: obWeight,
    height: Math.round(totalInch * 2.54),
    birthYear: obYear,
    age: new Date().getFullYear() - obYear
  };
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}

// ========== GOOGLE LOGIN ==========
async function googleLogin() {
  const btn = document.getElementById('google-login-btn');
  const btnText = document.getElementById('google-btn-text');
  btn.disabled = true;
  btnText.textContent = 'Loading...';
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  } catch (e) {
    btn.disabled = false;
    btnText.textContent = 'Login with Google';
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-error').textContent = '⚠ ' + e.message;
  }
}

// ========== AUTH STATE ==========
auth.onAuthStateChanged(async (user) => {
  document.getElementById('loading').style.display = 'none';
  
  if (user) {
    currentUser = user;
    PK = user.uid;
    
    // Check if user has data
    const saved = await db.ref(`players/${PK}`).once('value');
    const hasData = saved.exists() && saved.val().playerName;
    
    if (hasData) {
      // EXISTING USER - load data and go to app
      S = saved.val();
      if (!S.lang) S.lang = 'bn';
      
      // Reset daily quests
      const today = new Date().toDateString();
      if (S.lastQuestReset !== today) {
        S.quests = JSON.parse(JSON.stringify(QT));
        if (S.lastQuestReset) S.streak = (S.streak || 0) + 1;
        S.lastQuestReset = today;
        save();
      }
      if (!S.achievements || S.achievements.length < AT.length) {
        S.achievements = AT.map(a => ({ ...a, unlocked: false }));
      }
      
      // Show app
      document.getElementById('app').style.display = 'flex';
      render();
    } 
    else if (isNewUser && pendingUserData) {
      // NEW USER - create profile
      S = {
        playerName: '',
        birthYear: pendingUserData.birthYear,
        age: pendingUserData.age,
        level: 1, xp: 0, streak: 0, totalQuestsDone: 0,
        stats: { strength: 10, intelligence: 10, agility: 10, vitality: 10, endurance: 10, charisma: 10 },
        weight: pendingUserData.weight,
        height: pendingUserData.height,
        weightHistory: [],
        achievements: AT.map(a => ({ ...a, unlocked: false })),
        lastQuestReset: new Date().toDateString(),
        quests: JSON.parse(JSON.stringify(QT)),
        lang: S.lang || 'bn'
      };
      await db.ref(`players/${PK}`).set(S);
      isNewUser = false;
      pendingUserData = null;
      
      // Show name modal
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('name-modal').style.display = 'flex';
    }
    else {
      // No data - start fresh
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('lang-screen').style.display = 'flex';
    }
  } else {
    // No user - show language screen
    document.getElementById('lang-screen').style.display = 'flex';
  }
});

// ========== NAME MODAL ==========
function saveName() {
  const name = document.getElementById('name-input').value.trim();
  if (!name) return;
  S.playerName = name;
  save();
  document.getElementById('name-modal').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  render();
}

function closeNameModal() {
  document.getElementById('name-modal').style.display = 'none';
  document.getElementById('lang-screen').style.display = 'flex';
}

// ========== WEIGHT MODAL ==========
let tW = 70;
function openWeightModal() { tW = S.weight; document.getElementById('tw-val').textContent = tW; document.getElementById('weight-modal').style.display = 'flex'; }
function closeWeightModal() { document.getElementById('weight-modal').style.display = 'none'; }
function adjTW(d) { tW = Math.max(30, Math.min(200, tW + d)); document.getElementById('tw-val').textContent = tW; }
function logWeight() {
  S.weight = tW;
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!S.weightHistory) S.weightHistory = [];
  S.weightHistory.push({ date: today, w: tW });
  if (S.weightHistory.length > 10) S.weightHistory.shift();
  save();
  closeWeightModal();
  render();
}

function adjW(d) { S.weight = Math.max(30, Math.min(200, S.weight + d)); save(); render(); }
function adjH(d) { S.height = Math.max(100, Math.min(250, S.height + d)); save(); render(); }

// ========== SETTINGS ==========
function openSettings() {
  document.getElementById('settings-modal').style.display = 'flex';
  const select = document.getElementById('lang-select');
  if (select) select.value = S.lang;
}
function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; }
function logout() { auth.signOut().then(() => location.reload()); }
function confirmDeleteAccount() {
  if (confirm('Delete account? All data will be lost forever!')) {
    db.ref(`players/${PK}`).remove().then(() => {
      if (currentUser) currentUser.delete().then(() => location.reload());
      else location.reload();
    });
  }
}

// ========== QUESTS ==========
function completeQuest(id) {
  const q = S.quests.find(q => q.id === id);
  if (!q || q.done) return;
  q.done = true;
  let nx = S.xp + q.xp, nl = S.level, lv = false;
  while (nx >= xpL(nl)) { nx -= xpL(nl); nl++; lv = true; }
  S.xp = nx; S.level = nl;
  S.stats[q.stat] = Math.min(100, S.stats[q.stat] + 3);
  S.totalQuestsDone = (S.totalQuestsDone || 0) + 1;
  
  if (S.totalQuestsDone >= 1) S.achievements[0].unlocked = true;
  if (S.level >= 5) S.achievements[1].unlocked = true;
  if (S.streak >= 7) S.achievements[2].unlocked = true;
  if (S.totalQuestsDone >= 50) S.achievements[3].unlocked = true;
  if (S.level >= 20) S.achievements[4].unlocked = true;
  if (Object.values(S.stats).every(v => v >= 50)) S.achievements[5].unlocked = true;
  
  save();
  if (lv) alert(`Level UP! You are now Level ${nl} - ${rank(nl).lb}!`);
  render();
}

function setFilter(f) { qF = f; render(); }
let qF = 'all';

// ========== TAB NAVIGATION ==========
function setTab(t) {
  tab = t;
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`nb-${t}`).classList.add('active');
  render();
}

// ========== RENDER FUNCTIONS ==========
function render() {
  if (!S.quests) return;
  const rk = rank(S.level), bv = bmi(), done = S.quests.filter(q => q.done).length;
  const xpPercent = Math.min((S.xp / xpL(S.level)) * 100, 100);
  const el = document.getElementById('content');
  
  if (tab === 'dashboard') {
    const inc = S.quests.filter(q => !q.done).slice(0, 3);
    el.innerHTML = `
      <div style="padding:20px 16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px">
          <div class="pirate" style="font-size:32px;color:#FFB703">NAKAMA</div>
          <button onclick="openSettings()" style="background:#ffffff10;border:1px solid #ffffff20;border-radius:10px;padding:8px 12px;font-size:18px;cursor:pointer">⚙️</button>
        </div>
        <div class="card" style="text-align:center;background:linear-gradient(135deg,#FFB70320,#FFB70305)">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:60px;height:60px;border-radius:50%;background:${rk.c}20;border:2px solid ${rk.c};display:flex;align-items:center;justify-content:center;font-size:28px">${rk.icon}</div>
            <div style="flex:1;text-align:left">
              <div class="cinzel" style="font-size:18px;font-weight:900">${S.playerName || 'Pirate'}</div>
              <div class="cinzel" style="font-size:10px;color:${rk.c}">${rk.r} · ${rk.lb}</div>
              <div class="cinzel" style="font-size:22px;color:${rk.c}">Lv.${S.level}</div>
            </div>
          </div>
          <div style="margin-top:12px">
            <div class="xp-track"><div class="xp-fill" style="width:${xpPercent}%"></div></div>
            <div style="display:flex;justify-content:space-between;margin-top:5px"><span>XP</span><span>${S.xp}/${xpL(S.level)}</span></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px">
          <div class="stat-mini"><div>📜</div><div class="cinzel" style="font-size:18px;font-weight:700">${done}/${S.quests.length}</div><div class="cinzel" style="font-size:9px;color:#8B9BB4">TODAY</div></div>
          <div class="stat-mini"><div>✅</div><div class="cinzel" style="font-size:18px;font-weight:700">${S.totalQuestsDone}</div><div class="cinzel" style="font-size:9px;color:#8B9BB4">TOTAL</div></div>
          <div class="stat-mini"><div>🏆</div><div class="cinzel" style="font-size:18px;font-weight:700">${S.achievements.filter(a=>a.unlocked).length}/${AT.length}</div><div class="cinzel" style="font-size:9px;color:#8B9BB4">AWARDS</div></div>
        </div>
        <div class="card">
          <div class="cinzel" style="font-size:10px;color:#8B9BB4;margin-bottom:10px">TODAY'S QUESTS</div>
          ${inc.map(q => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #ffffff10">
            <span style="font-size:20px">${q.icon}</span>
            <div style="flex:1"><div class="cinzel" style="font-size:13px">${q.title}</div><div style="font-size:11px;color:#8B9BB4">${q.desc}</div></div>
            <span class="cinzel" style="color:#FFB703">+${q.xp}</span>
          </div>`).join('')}
          <button class="btn btn-ghost" onclick="setTab('quests')" style="width:100%;margin-top:12px">VIEW ALL →</button>
        </div>
        <div class="card">
          <div style="display:flex;justify-content:space-between">
            <div><div class="cinzel" style="font-size:9px;color:#8B9BB4">BMI</div><div class="cinzel" style="font-size:28px;font-weight:900">${bv}</div></div>
            <div style="text-align:right"><div class="cinzel" style="font-size:9px;color:#8B9BB4">WEIGHT</div><div class="cinzel" style="font-size:24px;font-weight:700">${S.weight}<span style="font-size:14px"> kg</span></div></div>
          </div>
        </div>
      </div>
    `;
  }
  else if (tab === 'quests') {
    const filtered = qF === 'all' ? S.quests : S.quests.filter(q => q.cat === qF);
    el.innerHTML = `
      <div style="padding:20px 16px">
        <div class="pirate" style="font-size:26px;color:#FFB703;margin-bottom:8px">DAILY QUESTS</div>
        <div style="display:flex;gap:8px;overflow-x:auto;margin-bottom:16px">
          ${['all','fitness','mind','health','social'].map(f => `<button class="btn ${qF===f?'btn-primary':''}" style="padding:6px 16px;border-radius:20px;font-size:10px" onclick="setFilter('${f}')">${f.toUpperCase()}</button>`).join('')}
        </div>
        ${filtered.map(q => `<div class="card" style="display:flex;align-items:center;gap:12px;padding:12px;opacity:${q.done?0.5:1}">
          <div style="width:44px;height:44px;border-radius:12px;background:${SC[q.stat]?.color}20;display:flex;align-items:center;justify-content:center;font-size:22px">${q.done?'✅':q.icon}</div>
          <div style="flex:1"><div class="cinzel" style="font-size:14px;font-weight:700">${q.title}</div><div style="font-size:11px;color:#8B9BB4">${q.desc}</div></div>
          ${!q.done ? `<button onclick="completeQuest(${q.id})" class="btn" style="background:${SC[q.stat]?.color}20;border:1px solid ${SC[q.stat]?.color};border-radius:10px;padding:8px 12px">+${q.xp}</button>` : ''}
        </div>`).join('')}
      </div>
    `;
  }
  else if (tab === 'body') {
    const ideal = (18.5 * (S.height/100)**2).toFixed(1);
    el.innerHTML = `
      <div style="padding:20px 16px">
        <div class="pirate" style="font-size:26px;color:#FB8500;margin-bottom:16px">BODY TRACKER</div>
        <div class="card" style="text-align:center">
          <div class="cinzel" style="font-size:9px;color:#8B9BB4">BMI</div>
          <div class="cinzel" style="font-size:52px;font-weight:900">${bmi()}</div>
          <div style="display:flex;justify-content:center;gap:20px;margin:16px 0">
            <div><button onclick="adjW(-0.5)" class="adj-btn" style="width:36px;height:36px">-</button></div>
            <div><div class="cinzel" style="font-size:20px">${S.weight} kg</div></div>
            <div><button onclick="adjW(0.5)" class="adj-btn" style="width:36px;height:36px">+</button></div>
          </div>
          <button onclick="openWeightModal()" class="btn btn-primary" style="margin-top:8px">LOG WEIGHT</button>
        </div>
        <div class="card"><div class="cinzel" style="font-size:10px;color:#8B9BB4">IDEAL WEIGHT</div><div class="cinzel" style="font-size:18px">${ideal} - ${(24.9*(S.height/100)**2).toFixed(1)} kg</div></div>
      </div>
    `;
  }
  else if (tab === 'crew') {
    let tx = S.xp; for (let i = 1; i < S.level; i++) tx += xpL(i);
    el.innerHTML = `
      <div style="padding:20px 16px">
        <div class="pirate" style="font-size:26px;color:#FFB703;margin-bottom:16px">CREW STATUS</div>
        <div class="card"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><div class="cinzel" style="font-size:9px;color:#8B9BB4">LEVEL</div><div class="cinzel" style="font-size:20px">${S.level}</div></div>
          <div><div class="cinzel" style="font-size:9px;color:#8B9BB4">RANK</div><div class="cinzel" style="font-size:20px;color:${rank(S.level).c}">${rank(S.level).r}</div></div>
          <div><div class="cinzel" style="font-size:9px;color:#8B9BB4">TOTAL XP</div><div class="cinzel" style="font-size:16px">${tx.toLocaleString()}</div></div>
          <div><div class="cinzel" style="font-size:9px;color:#8B9BB4">STREAK</div><div class="cinzel" style="font-size:16px;color:#FB8500">${S.streak} days</div></div>
        </div></div>
        <div class="card"><div class="cinzel" style="font-size:10px;color:#8B9BB4;margin-bottom:12px">⚔️ STATS</div>
          ${Object.entries(S.stats).map(([k,v]) => `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between"><span>${k}</span><span>${v}</span></div><div class="xp-track"><div style="width:${v}%;height:100%;background:#FFB703;border-radius:4px"></div></div></div>`).join('')}
        </div>
        <div class="card"><div class="cinzel" style="font-size:10px;color:#8B9BB4;margin-bottom:12px">🏆 ACHIEVEMENTS</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${S.achievements.map(a => `<div style="background:#ffffff08;border:1px solid #ffffff10;border-radius:12px;padding:10px;text-align:center;opacity:${a.unlocked?1:0.4}"><div style="font-size:24px">${a.unlocked?a.icon:'🔒'}</div><div class="cinzel" style="font-size:10px">${a.title}</div></div>`).join('')}</div>
        </div>
      </div>
    `;
  }
}

// SC for quest stats
const SC = {
  strength: { color: "#D62828" }, intelligence: { color: "#023E8A" }, agility: { color: "#FFB703" },
  vitality: { color: "#FB8500" }, endurance: { color: "#0353A4" }, charisma: { color: "#22c55e" }
};

// Start - hide loading after 1 sec
setTimeout(() => {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
  if (!currentUser) document.getElementById('lang-screen').style.display = 'flex';
}, 1000);