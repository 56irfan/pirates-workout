// ══ FIREBASE ══
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

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}

// ── STARTUP: Check if language already selected ──
(function(){
  const savedLang = localStorage.getItem('pirateLang');
  if(savedLang){
    // Already selected before — hide lang screen immediately
    const ls = document.getElementById('lang-screen');
    if(ls) ls.style.display = 'none';
  } else {
    // First time — hide loading, show lang screen
    // (lang-screen is shown by default via z-index:600)
    // Hide loading screen until lang is picked
    const ld = document.getElementById('loading');
    if(ld) ld.style.display = 'none';
  }
})();

// Install button
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});
function showInstallButton() {
  if (document.getElementById('installBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'installBtn';
  btn.innerHTML = '⚓ Install App';
  btn.style.cssText = `position:fixed;bottom:94px;left:50%;transform:translateX(-50%);background:rgba(214,40,40,0.8);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,100,100,0.3);padding:11px 26px;border-radius:999px;color:white;font-family:'Cinzel',serif;font-size:13px;font-weight:bold;letter-spacing:2px;z-index:999;cursor:pointer;box-shadow:0 4px 24px rgba(214,40,40,0.4),inset 0 1px 0 rgba(255,255,255,0.2);transition:all 0.2s`;
  btn.onclick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') btn.remove();
      deferredPrompt = null;
    }
  };
  document.body.appendChild(btn);
}
window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('installBtn');
  if (btn) btn.remove();
});

let currentUser = null;
let PK = "irfan_player";

async function googleLogin() {
  const btn = document.getElementById('google-login-btn');
  btn.textContent = '⏳ সংযোগ হচ্ছে...';
  btn.disabled = true;
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await auth.signInWithPopup(provider);
  } catch(e) {
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Google দিয়ে লগইন`;
    btn.disabled = false;
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'block';
    errEl.textContent = '⚠ ' + (e.message || 'লগইন হয়নি');
    setTimeout(() => fallbackInit(), 2000);
  }
}

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    PK = user.uid;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('lang-screen').style.display = 'none';
    await init();
  }
});
async function fallbackInit() {
  document.getElementById('login-screen').style.display = 'none';
  await init();
}

async function fbGet(p) {
  try { const snap = await db.ref(p).get(); return snap.exists() ? snap.val() : null; }
  catch(e) { try { const r = await fetch(`https://arise-app-c49a3-default-rtdb.firebaseio.com/${p}.json`); return await r.json(); } catch(e2) { return null; } }
}
async function fbSet(p, d) {
  try { await db.ref(p).set(d); }
  catch(e) { try { await fetch(`https://arise-app-c49a3-default-rtdb.firebaseio.com/${p}.json`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}); } catch(e2) {} }
}

// ══ DATA ══
const QT=[
  {id:1,title:"Morning Push-ups",desc:"3 sets × 20 reps",xp:50,stat:"strength",cat:"fitness",done:false,icon:"💪"},
  {id:2,title:"Squats",desc:"3 sets × 30 reps",xp:50,stat:"strength",cat:"fitness",done:false,icon:"🦵"},
  {id:3,title:"Plank Hold",desc:"3 sets × 60 seconds",xp:40,stat:"endurance",cat:"fitness",done:false,icon:"🧘"},
  {id:4,title:"Pull-ups",desc:"3 sets × 10 reps",xp:60,stat:"strength",cat:"fitness",done:false,icon:"🏋️"},
  {id:5,title:"Jumping Jacks",desc:"3 sets × 50 reps",xp:30,stat:"agility",cat:"fitness",done:false,icon:"🤸"},
  {id:6,title:"Running / Walk",desc:"30 minutes cardio",xp:70,stat:"endurance",cat:"fitness",done:false,icon:"🏃"},
  {id:7,title:"Lunges",desc:"3 sets × 20 reps each leg",xp:45,stat:"strength",cat:"fitness",done:false,icon:"🦶"},
  {id:8,title:"Burpees",desc:"3 sets × 15 reps",xp:65,stat:"agility",cat:"fitness",done:false,icon:"💥"},
  {id:9,title:"Read a Book",desc:"30 minutes reading",xp:60,stat:"intelligence",cat:"mind",done:false,icon:"📖"},
  {id:10,title:"Study / Learn",desc:"1 hour focused study",xp:80,stat:"intelligence",cat:"mind",done:false,icon:"🎓"},
  {id:11,title:"Meditation",desc:"15 minutes mindfulness",xp:50,stat:"vitality",cat:"mind",done:false,icon:"🌿"},
  {id:12,title:"Journal Writing",desc:"Write today's thoughts",xp:35,stat:"intelligence",cat:"mind",done:false,icon:"✍️"},
  {id:13,title:"Drink Water",desc:"8 glasses throughout day",xp:30,stat:"vitality",cat:"health",done:false,icon:"💧"},
  {id:14,title:"Sleep 8 Hours",desc:"Full night rest",xp:60,stat:"vitality",cat:"health",done:false,icon:"😴"},
  {id:15,title:"Healthy Meal",desc:"Eat nutritious food",xp:40,stat:"vitality",cat:"health",done:false,icon:"🥗"},
  {id:16,title:"No Junk Food",desc:"Avoid processed food",xp:50,stat:"vitality",cat:"health",done:false,icon:"🚫"},
  {id:17,title:"Social Interaction",desc:"Meaningful conversation",xp:40,stat:"charisma",cat:"social",done:false,icon:"🤝"},
  {id:18,title:"Help Someone",desc:"Do something kind",xp:45,stat:"charisma",cat:"social",done:false,icon:"💙"},
];

// One Piece themed bosses
const BOSSES=[
  {id:1,name:"Kaido the Dragon",hp:1000,reward:500,desc:"Complete ALL quests for 7 days straight — The Strongest Creature",icon:"🐉",diff:"YONKO",color:"#D62828"},
  {id:2,name:"Doflamingo",hp:500,reward:200,desc:"Do 100 push-ups in a single day — Conqueror's Strings",icon:"🦩",diff:"WARLORD",color:"#FB8500"},
  {id:3,name:"Big Mom",hp:700,reward:300,desc:"Study for 5 hours in a single day — Soul Pocus",icon:"👑",diff:"YONKO",color:"#FFB703"},
  {id:4,name:"Smoker",hp:300,reward:100,desc:"Run 5km without stopping — Pursue the Pirates",icon:"💨",diff:"MARINE",color:"#023E8A"},
  {id:5,name:"Blackbeard",hp:400,reward:150,desc:"Eat clean for 14 consecutive days — Darkness Power",icon:"☠️",diff:"YONKO",color:"#3D2B1F"},
  {id:6,name:"Rob Lucci",hp:600,reward:250,desc:"Sleep before 10PM for 7 days — CP9 Agent",icon:"🐆",diff:"CP0",color:"#8B9BB4"},
];

// Straw Hat crew stats — One Piece character inspired
const SC={
  strength:{icon:`<svg width="14" height="14" viewBox="0 0 24 24" fill="#D62828"><path d="M14.5 2.5l7 7-12 12-2-2 9-9-2-2-9 9-2-2 12-12Z"/></svg>`,color:"#D62828",label:"Strength"},
  intelligence:{icon:`<svg width="14" height="14" viewBox="0 0 24 24" fill="#023E8A"><ellipse cx="8" cy="12" rx="5" ry="7"/><ellipse cx="16" cy="12" rx="5" ry="7"/><rect x="9" y="5" width="6" height="14" fill="#023E8A"/></svg>`,color:"#023E8A",label:"Intelligence"},
  agility:{icon:`<svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB703"><path d="M13 2L4 14h7l-1 8 9-12h-7Z"/></svg>`,color:"#FFB703",label:"Agility"},
  vitality:{icon:`<svg width="14" height="14" viewBox="0 0 24 24" fill="#FB8500"><path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13Z"/></svg>`,color:"#FB8500",label:"Vitality"},
  endurance:{icon:`<svg width="14" height="14" viewBox="0 0 24 24" fill="#0353A4"><path d="M12 2L4 6v6c0 5 3.6 9.7 8 11 4.4-1.3 8-6 8-11V6l-8-4Z"/></svg>`,color:"#0353A4",label:"Endurance"},
  charisma:{icon:`<svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><path d="M12 2l2.4 7.5H22l-6.5 4.5 2.5 7.5L12 17l-6 4.5 2.5-7.5L2 9.5h7.5Z"/></svg>`,color:"#22c55e",label:"Charisma"}
};

// One Piece themed achievements
const AT=[
  {id:1,title:"First Bounty",desc:"Complete your first quest",icon:"💰",unlocked:false},
  {id:2,title:"Pirate Crew",desc:"Reach Level 5",icon:"⚓",unlocked:false},
  {id:3,title:"Will of D",desc:"7-day streak",icon:"🔥",unlocked:false},
  {id:4,title:"Conqueror's Haki",desc:"Complete 50 quests",icon:"👑",unlocked:false},
  {id:5,title:"Pirate King",desc:"Reach Level 20",icon:"🏴‍☠️",unlocked:false},
  {id:6,title:"Balanced Crew",desc:"All stats above 50",icon:"⚖️",unlocked:false}
];

// One Piece rank system
function rank(l){
  if(l>=20)return{r:"KING",c:"#FFB703",lb:"Pirate King",icon:`<svg width="30" height="30" viewBox="0 0 24 24" fill="#FFB703"><path d="M3 17l3-8 3 5 3-9 3 9 3-5 3 8H3Z"/><rect x="3" y="18" width="18" height="3" rx="1.5"/></svg>`};
  if(l>=15)return{r:"YONKO",c:"#D62828",lb:"Emperor",icon:`<svg width="30" height="30" viewBox="0 0 24 24" fill="#D62828"><path d="M12 2l2.5 7.5H22l-6.5 4.5 2.5 7.5L12 17l-6 4.5 2.5-7.5L2 9.5h7.5Z"/></svg>`};
  if(l>=10)return{r:"NAKAMA",c:"#FB8500",lb:"Straw Hat Pirate",icon:`<svg width="30" height="30" viewBox="0 0 24 24" fill="#FB8500"><circle cx="12" cy="6" r="3.5"/><path d="M5 21c0-4 3.1-7 7-7s7 3 7 7H5Z"/></svg>`};
  if(l>=5)return{r:"ROOKIE",c:"#023E8A",lb:"Supernova",icon:`<svg width="30" height="30" viewBox="0 0 24 24" fill="#023E8A"><path d="M12 3l1.5 5h5l-4 3 1.5 5-4-3-4 3 1.5-5-4-3h5Z"/></svg>`};
  return{r:"E",c:"#8B9BB4",lb:"East Blue Pirate",icon:`<svg width="30" height="30" viewBox="0 0 24 24" fill="#8B9BB4"><path d="M20 11H13V4h-2v7H4v2h7v7h2v-7h7v-2Z" opacity=".5"/><rect x="10" y="10" width="4" height="4" rx="2"/></svg>`};
}

// ══ ONBOARDING VARIABLES ══
let obYear = 2000;
let obWeight = 70;
let obFeet = 5;
let obInch = 7;

function showStep(n) {
  for(let i=1;i<=4;i++){
    const el=document.getElementById('ob-step'+i);
    if(el) el.style.display='none';
  }
  const s=document.getElementById('ob-step'+n);
  if(s) s.style.display='flex';
}

function adjYear(d){
  const now=new Date().getFullYear();
  obYear=Math.max(1950,Math.min(now-5,obYear+d));
  document.getElementById('ob-year-val').textContent=obYear;
  const age=now-obYear;
  document.getElementById('ob-age-show').textContent='বয়স: '+age+' বছর';
}

function obSaveName(){
  const v=document.getElementById('ob-name').value.trim();
  if(!v){alert('নাম দাও!');return;}
  S.playerName=v;
  showStep(3);
  adjYear(0); // refresh display
}

function obSaveYear(){
  const now=new Date().getFullYear();
  S.birthYear=obYear;
  S.age=now-obYear;
  showStep(4);
  updateObBMI();
}

function adjObW(d){
  obWeight=Math.round((Math.max(30,Math.min(200,obWeight+d)))*10)/10;
  document.getElementById('ob-weight-val').textContent=obWeight;
  updateObBMI();
}

function adjObFt(d){
  obFeet=Math.max(3,Math.min(8,obFeet+d));
  document.getElementById('ob-feet-val').textContent=obFeet;
  updateObBMI();
}

function adjObIn(d){
  obInch=Math.max(0,Math.min(11,obInch+d));
  document.getElementById('ob-inch-val').textContent=obInch;
  updateObBMI();
}

function updateObBMI(){
  const totalInch=(obFeet*12)+obInch;
  const cm=totalInch*2.54;
  const h=cm/100;
  const bmiVal=(obWeight/(h*h)).toFixed(1);
  let label='Normal';
  if(bmiVal<18.5)label='Underweight';
  else if(bmiVal<25)label='Normal ✓';
  else if(bmiVal<30)label='Overweight';
  else label='Obese';
  document.getElementById('ob-bmi-show').textContent='BMI: '+bmiVal+' — '+label;
}

async function obFinish(){
  const totalInch=(obFeet*12)+obInch;
  S.weight=obWeight;
  S.height=Math.round(totalInch*2.54); // feet → cm
  S.heightFeet=obFeet;
  S.heightInch=obInch;
  await fbSet('players/'+PK, S);
  document.getElementById('onboarding').style.display='none';
  document.getElementById('app').style.display = 'flex';
  render();
}
  
let S={},tab="dashboard",qF="all",tW=70,cB=null,sT=null;

function xpL(l){return l*l*100;}
function bmi(){const h=S.height/100;return(S.weight/(h*h)).toFixed(1);}
function bmiI(b){if(b<18.5)return{l:"Underweight",c:"#023E8A"};if(b<25)return{l:"Normal ✓",c:"#22c55e"};if(b<30)return{l:"Overweight",c:"#FFB703"};return{l:"Obese",c:"#D62828"};}

function save(){
  document.getElementById('saving').style.display='block';
  clearTimeout(sT);
  sT=setTimeout(async()=>{await fbSet(`players/${PK}`,S);document.getElementById('saving').style.display='none';},1000);
}

let nT=null;
function notif(msg,c="#FFB703"){
  const e=document.getElementById('notif');
  e.textContent=msg;e.style.color=c;e.style.borderColor=c;e.style.boxShadow=`0 0 20px ${c}50`;e.style.display='block';
  clearTimeout(nT);nT=setTimeout(()=>e.style.display='none',2500);
}

function completeQuest(id){
  const q=S.quests.find(q=>q.id===id);if(!q||q.done)return;
  if(navigator.vibrate)navigator.vibrate(80);
  q.done=true;
  let nx=S.xp+q.xp,nl=S.level,lv=false;
  while(nx>=xpL(nl)){nx-=xpL(nl);nl++;lv=true;}
  S.xp=nx;S.level=nl;S.stats[q.stat]=Math.min(100,S.stats[q.stat]+3);S.totalQuestsDone=(S.totalQuestsDone||0)+1;
  if(S.totalQuestsDone>=1)S.achievements[0].unlocked=true;
  if(S.level>=5)S.achievements[1].unlocked=true;
  if(S.streak>=7)S.achievements[2].unlocked=true;
  if(S.totalQuestsDone>=50)S.achievements[3].unlocked=true;
  if(S.level>=20)S.achievements[4].unlocked=true;
  if(Object.values(S.stats).every(v=>v>=50))S.achievements[5].unlocked=true;
  save();
  if(lv){document.getElementById('lvlup-txt').textContent=`You are now Level ${nl} — ${rank(nl).lb}!`;const e=document.getElementById('lvlup');e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2500);}
  else notif(`+${q.xp} XP — ${q.title} ✓`,"#22c55e");
  render();
}

function saveName(){const v=document.getElementById('name-input').value.trim();if(!v)return;S.playerName=v;document.getElementById('name-modal').style.display='none';save();render();notif("✅ Name updated!","#023E8A");}

function openBoss(id){
  cB=BOSSES.find(b=>b.id===id);if(!cB)return;
  document.getElementById('bm-icon').textContent=cB.icon;
  document.getElementById('bm-name').style.color=cB.color;
  document.getElementById('bm-name').textContent=cB.name;
  document.getElementById('bm-diff').style.color=cB.color;
  document.getElementById('bm-diff').textContent=cB.diff;
  document.getElementById('bm-desc').textContent=cB.desc;
  document.getElementById('bm-hp').textContent=cB.hp;
  document.getElementById('bm-xp').textContent='+'+cB.reward;
  document.getElementById('boss-inner').style.borderColor=cB.color+'60';
  document.getElementById('boss-accept-btn').style.background=`linear-gradient(135deg,${cB.color},${cB.color}cc)`;
  document.getElementById('boss-accept-btn').onclick=()=>{document.getElementById('boss-modal').style.display='none';notif(`⚔️ ${cB.name} accepted!`,cB.color);};
  document.getElementById('boss-modal').style.display='flex';
}

function adjTW(d){tW=Math.round((Math.max(30,Math.min(200,tW+d)))*10)/10;document.getElementById('tw-val').textContent=tW;}
function openWeightModal(){tW=S.weight;document.getElementById('tw-val').textContent=tW;document.getElementById('weight-modal').style.display='flex';}
function logWeight(){
  S.weight=tW;
  const today=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const last=S.weightHistory[S.weightHistory.length-1];
  if(last&&last.date===today)S.weightHistory[S.weightHistory.length-1].w=tW;
  else{if(S.weightHistory.length>=10)S.weightHistory.shift();S.weightHistory.push({date:today,w:tW});}
  document.getElementById('weight-modal').style.display='none';save();render();notif("⚖️ Weight logged!","#FB8500");
}
function adjW(d){S.weight=Math.round((Math.max(30,Math.min(200,S.weight+d)))*10)/10;save();render();}
function adjH(d){S.height=Math.max(100,Math.min(250,S.height+d));save();render();}
function setFilter(f){qF=f;render();}

function setTab(t){
  // map old tabs to new
  if(t==='stats'||t==='boss'||t==='achieve')t='crew';
  tab=t;
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const nb=document.getElementById('nb-'+t);if(nb)nb.classList.add('active');
  render();document.getElementById('content').scrollTop=0;
}

function openSettings(){
  document.getElementById('settings-modal').style.display='flex';
}

function setLang(v){
  S.lang=v; save();
  // update settings dropdown if open
  const sel=document.getElementById('lang-select');
  if(sel)sel.value=v;
  showNotif(v==='bn'?'ভাষা পরিবর্তন হয়েছে':'Language changed');
}

function selectLang(v){
  // Save to localStorage so we never show this screen again
  localStorage.setItem('pirateLang', v);
  S.lang = v;
  // Hide lang screen, show loading
  document.getElementById('lang-screen').style.display='none';
  document.getElementById('loading').style.display='flex';
  // Now proceed to login or onboarding depending on auth state
  // auth.onAuthStateChanged will handle the rest
  // If user is already logged in (shouldn't be on first open, but just in case)
  if(currentUser){
    init();
  } else {
    // Show login screen
    document.getElementById('loading').style.display='none';
    document.getElementById('login-screen').style.display='flex';
  }
}

function confirmDeleteAccount(){
  document.getElementById('settings-modal').style.display='none';
  if(confirm('সব data মুছে যাবে। নিশ্চিত?')){
    if(confirm('শেষ সুযোগ — সব progress চিরতরে DELETE হবে?')){
      db.ref('players/'+PK).remove()
        .then(()=>{ return auth.currentUser.delete(); })
        .then(()=>{ location.reload(); })
        .catch(e=>{
          // If delete user fails (needs re-auth), at least clear data
          db.ref('players/'+PK).remove().then(()=>{
            auth.signOut().then(()=>location.reload());
          });
        });
    }
  }
}

function render(){
  const rk=rank(S.level),bv=bmi(),bi=bmiI(parseFloat(bv)),done=S.quests.filter(q=>q.done).length;
  const xp=Math.min((S.xp/xpL(S.level))*100,100);
  const el=document.getElementById('content');

  // ── DASHBOARD ──
  if(tab==="dashboard"){
    const inc=S.quests.filter(q=>!q.done).slice(0,3);
    const userPhoto=currentUser&&currentUser.photoURL?`<img src="${currentUser.photoURL}" style="width:30px;height:30px;border-radius:50%;border:2px solid var(--gold);object-fit:cover" onerror="this.style.display='none'">`:''
    const settingsBtn=currentUser?`<button onclick="openSettings()" class="settings-glass-btn" style="width:40px;height:40px;background:linear-gradient(135deg,rgba(255,255,255,0.13) 0%,rgba(255,255,255,0.05) 100%);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border:1px solid rgba(255,255,255,0.22);border-radius:13px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.25),inset 0 -1px 0 rgba(0,0,0,0.15);transition:transform 0.2s cubic-bezier(.34,1.56,.64,1)" ontouchstart="this.style.transform='scale(0.88)'" ontouchend="this.style.transform='scale(1)'"><span style="position:absolute;inset:0;border-radius:13px;background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 55%);pointer-events:none"></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="position:relative;z-index:1;filter:drop-shadow(0 0 3px rgba(255,255,255,0.2))"><line x1="4" y1="6" x2="20" y2="6" stroke="rgba(210,225,245,0.92)" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="6" r="2.5" fill="rgba(210,225,245,0.92)" stroke="rgba(6,14,26,0.6)" stroke-width="1.2"/><line x1="4" y1="12" x2="20" y2="12" stroke="rgba(210,225,245,0.92)" stroke-width="2" stroke-linecap="round"/><circle cx="15" cy="12" r="2.5" fill="rgba(210,225,245,0.92)" stroke="rgba(6,14,26,0.6)" stroke-width="1.2"/><line x1="4" y1="18" x2="20" y2="18" stroke="rgba(210,225,245,0.92)" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="18" r="2.5" fill="rgba(210,225,245,0.92)" stroke="rgba(6,14,26,0.6)" stroke-width="1.2"/></svg></button>`:''
    el.innerHTML=`<div style="padding:20px 16px">

<!-- Top bar -->
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
  <div style="display:flex;align-items:center;gap:8px">${userPhoto}<div class="cinzel" style="font-size:9px;color:var(--dim);letter-spacing:3px">STRAW HAT SYSTEM</div></div>
  ${settingsBtn}
</div>

<!-- Title -->
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
  <div class="pirate" style="font-size:32px;letter-spacing:3px;background:linear-gradient(90deg,var(--gold),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent">NAKAMA</div>
  <div style="display:flex;align-items:center;gap:10px">
    <div class="pirate" style="font-size:11px;letter-spacing:4px;font-weight:900;color:rgba(255,183,3,0.35)">IRFAN</div>
    <div class="cinzel" style="background:var(--ocean-light);border:1px solid rgba(251,133,0,0.3);border-radius:10px;padding:6px 12px;font-size:12px;color:var(--orange);font-weight:700;display:flex;align-items:center;gap:5px"><svg width="16" height="16" viewBox="0 0 24 24" fill="var(--orange)"><path d="M12 2C12 2 7 7 7 13a5 5 0 0 0 10 0c0-2.5-1.5-4.5-2.5-5.5 0 0 0 3-2 4 0-3-.5-6.5-2.5-8.5Z"/></svg> ${S.streak} Day${S.streak!==1?'s':''}</div>
  </div>
</div>

<!-- Hero Card — Wanted Poster style -->
<div class="glass-gold" style="padding:22px;margin-bottom:14px">
  <!-- Corner ornaments -->
  <div style="position:absolute;top:8px;left:8px;color:rgba(255,183,3,0.3);font-size:14px">✦</div>
  <div style="position:absolute;top:8px;right:8px;color:rgba(255,183,3,0.3);font-size:14px">✦</div>
  <div style="position:absolute;bottom:8px;left:8px;color:rgba(255,183,3,0.3);font-size:14px">✦</div>
  <div style="position:absolute;bottom:8px;right:8px;color:rgba(255,183,3,0.3);font-size:14px">✦</div>
  <!-- Glow -->
  <div style=style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:radial-gradient(circle,${rk.c}20,transparent 70%);border-radius:50%;pointer-events:none"></div>

  <!-- Profile row -->
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
    <div class="float" style="width:68px;height:68px;border-radius:50%;background:${rk.c}18;border:2px solid ${rk.c};display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0">${rk.icon}</div>
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:3px" onclick="document.getElementById('name-input').value='';document.getElementById('name-modal').style.display='flex'">
        <div class="cinzel" style="font-size:18px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${S.playerName}</div>
        <span style="color:var(--muted);display:flex;align-items:center"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg></span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="cinzel" style="font-size:10px;color:${rk.c};font-weight:700;letter-spacing:2px">${rk.r}</span>
        <span style="color:var(--dim)">·</span>
        <span style="font-size:11px;color:var(--muted)">${rk.lb}</span>
      </div>
      <div class="cinzel" style="font-size:28px;font-weight:900;color:${rk.c};margin-top:2px">Lv.${S.level}</div>
    </div>
  </div>

  <!-- XP bar -->
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:5px">
      <span class="cinzel" style="font-size:9px;color:var(--dim);letter-spacing:2px">BOUNTY POINTS (XP)</span>
      <span style="font-size:10px;color:var(--muted)">${S.xp} / ${xpL(S.level)}</span>
    </div>
    <div class="xp-track"><div class="xp-fill" style="width:${xp}%"></div></div>
  </div>
</div>

<!-- Stats grid -->
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
  ${[
    {l:"Today",v:`${done}/${S.quests.length}`,i:`<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--navy-mid)"><path d="M6 2C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6ZM13 9V3.5L18.5 9H13Z"/><rect x="7" y="12" width="7" height="1.5" rx=".75" fill="white" opacity=".7"/><rect x="7" y="15" width="10" height="1.5" rx=".75" fill="white" opacity=".7"/></svg>`,c:"var(--navy-mid)"},
    {l:"Total",v:S.totalQuestsDone,i:`<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12 10.5 15.5 17 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,c:"#22c55e"},
    {l:"Awards",v:`${S.achievements.filter(a=>a.unlocked).length}/${S.achievements.length}`,i:`<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--gold)"><path d="M6 2v6a6 6 0 0 0 12 0V2H6Z"/><path d="M4 2h2v4c0 .55-.45 1-1 1S4 6.55 4 6V2ZM18 2h2v4c0 .55-.45 1-1 1s-1-.45-1-1V2Z" opacity=".7"/><rect x="10" y="14" width="4" height="4" rx="1"/><rect x="7" y="18" width="10" height="2" rx="1"/></svg>`,c:"var(--gold)"}
  ].map(s=>`<div class="stat-mini" style="padding:14px 10px"><div style="font-size:20px">${s.i}</div><div class="cinzel" style="font-size:18px;font-weight:700;color:${s.c};margin-top:4px">${s.v}</div><div class="cinzel" style="font-size:9px;color:rgba(139,155,180,0.85);margin-top:2px;letter-spacing:1px">${s.l}</div></div>`).join('')}
</div>

<!-- Today's Progress -->
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <span class="cinzel" style="font-size:10px;color:var(--muted);letter-spacing:2px">TODAY'S VOYAGE</span>
    <span class="cinzel" style="font-size:11px;color:#22c55e">${Math.round((done/S.quests.length)*100)}%</span>
  </div>
  <div class="prog-track" style="margin-bottom:14px"><div class="prog-fill" style="width:${(done/S.quests.length)*100}%"></div></div>
  ${inc.map(q=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
    <span style="font-size:22px;flex-shrink:0;width:32px;text-align:center">${q.icon}</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;color:rgba(253,248,236,0.95);font-weight:600;font-family:'Cinzel',serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${q.title}</div>
      <div style="font-size:11px;color:rgba(139,155,180,0.85);font-family:'Crimson Pro',serif">${q.desc}</div>
    </div>
    <span class="cinzel" style="font-size:11px;color:var(--gold);flex-shrink:0;padding-left:8px">+${q.xp}</span>
  </div>`).join('')}
  <button class="btn btn-ghost" onclick="setTab('quests')" style="width:100%;margin-top:12px;padding:9px;border-radius:8px;font-size:11px;letter-spacing:1px">VIEW ALL QUESTS →</button>
</div>

<!-- Body Status -->
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div>
      <div class="cinzel" style="font-size:9px;color:var(--muted);letter-spacing:2px">BODY STATUS</div>
      <div class="cinzel" style="font-size:30px;font-weight:900;color:${bi.c};margin-top:4px">${bv}</div>
      <div style="font-size:12px;color:${bi.c};margin-top:2px;font-family:'Crimson Pro',serif">${bi.l}</div>
    </div>
    <div style="text-align:right">
      <div class="cinzel" style="font-size:9px;color:var(--muted)">WEIGHT</div>
      <div class="cinzel" style="font-size:26px;font-weight:700">${S.weight}<span style="font-size:13px;color:var(--muted)"> kg</span></div>
      <div style="font-size:11px;color:var(--muted);margin-top:3px">${S.height} cm</div>
    </div>
  </div>
</div>
</div>`;
  }

  // ── QUESTS ──
  else if(tab==="quests"){
    const fq=qF==="all"?S.quests:S.quests.filter(q=>q.cat===qF);
    el.innerHTML=`<div style="padding:20px 16px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
  <div>
    <div class="cinzel" style="font-size:9px;color:var(--muted);letter-spacing:3px">GRAND LINE VOYAGE</div>
    <div class="pirate" style="font-size:26px;letter-spacing:2px;color:var(--gold)">DAILY QUESTS</div>
  </div>
  <span class="cinzel" style="font-size:13px;color:#22c55e;font-weight:700">${done}/${S.quests.length}</span>
</div>

<!-- Filter tabs -->
<div style="display:flex;gap:7px;overflow-x:auto;padding-bottom:8px;margin-bottom:14px">
  ${["all","fitness","mind","health","social"].map(f=>`<button class="pill cinzel" onclick="setFilter('${f}')" style="padding:7px 14px;border-radius:20px;font-size:9px;letter-spacing:1px;cursor:pointer;transition:all 0.2s;white-space:nowrap;background:${qF===f?"var(--red)":"var(--ocean-light)"};color:${qF===f?"white":"var(--muted)"};border:1px solid ${qF===f?"var(--red)":"var(--dim)"}">${f.toUpperCase()}</button>`).join('')}
</div>

<!-- Quest list -->
${fq.map(q=>{const c=SC[q.stat];return`<div class="quest-row ${q.done?'done':''}">
  <div style="width:46px;height:46px;border-radius:14px;flex-shrink:0;background:${q.done?"rgba(255,255,255,0.04)":c.color+"15"};backdrop-filter:blur(8px);border:1px solid ${q.done?"rgba(255,255,255,0.07)":c.color+"40"};display:flex;align-items:center;justify-content:center;font-size:22px">${q.done?"✅":q.icon}</div>
  <div style="flex:1;min-width:0">
    <div class="cinzel" style="font-size:13px;font-weight:700;color:${q.done?"rgba(139,155,180,0.5)":"rgba(253,248,236,0.95)"}">${q.title}</div>
    <div style="font-size:11px;color:rgba(139,155,180,0.85);margin-top:2px;font-family:'Crimson Pro',serif">${q.desc}</div>
    <div style="display:flex;gap:6px;margin-top:6px">
      <span class="tag" style="color:var(--gold);background:rgba(255,183,3,0.12)">+${q.xp} XP</span>
      <span class="tag" style="color:${c.color};background:${c.color}18;display:inline-flex;align-items:center;gap:3px">${c.icon} +3</span>
    </div>
  </div>
  ${!q.done?`<button class="btn" onclick="completeQuest(${q.id})" style="width:42px;height:42px;border-radius:14px;background:${c.color}15;backdrop-filter:blur(12px);border:1px solid ${c.color}60;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;box-shadow:0 4px 12px ${c.color}25,inset 0 1px 0 rgba(255,255,255,0.1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>`:''}
</div>`}).join('')}

<!-- ⚔️ BOSS BATTLES SECTION -->
<div style="margin-top:28px;margin-bottom:8px">
  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(214,40,40,0.4),transparent);margin-bottom:20px"></div>
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
    <div class="cinzel" style="font-size:9px;color:var(--red);letter-spacing:3px;display:flex;align-items:center;gap:6px"><svg width="13" height="13" viewBox="0 0 24 24" fill="var(--red)"><path d="M12 2L1 21h22L12 2Zm0 4l7.5 13H4.5L12 6Z"/><rect x="11" y="10" width="2" height="5" rx="1" fill="white"/><circle cx="12" cy="17" r="1" fill="white"/></svg> DANGER ZONE</div>
  </div>
  <div class="pirate" style="font-size:24px;letter-spacing:2px;color:var(--red);margin-bottom:14px;display:flex;align-items:center;gap:10px"><svg width="22" height="22" viewBox="0 0 24 24" fill="var(--red)"><path d="M14.5 2.5l7 7-12 12-2-2 9-9-2-2-9 9-2-2 12-12Z"/></svg> BOSS BATTLES</div>
  <div style="background:rgba(214,40,40,0.08);backdrop-filter:blur(16px);border:1px solid rgba(214,40,40,0.25);border-radius:18px;padding:14px;margin-bottom:16px">
    <div class="cinzel" style="font-size:10px;color:var(--red);letter-spacing:2px;margin-bottom:4px;display:flex;align-items:center;gap:5px"><svg width="12" height="12" viewBox="0 0 24 24" fill="var(--red)"><path d="M12 2C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V16h8v-1.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7Zm-1.5 7a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"/><rect x="9" y="17.5" width="6" height="1.5" rx=".75" fill="var(--red)"/><rect x="9" y="19.5" width="6" height="1.5" rx=".75" fill="var(--red)" opacity=".7"/></svg> WARNING</div>
    <div style="font-size:13px;color:rgba(200,210,225,0.85);line-height:1.6;font-family:'Crimson Pro',serif">Extreme real-life challenges. Defeat them to earn massive Bounty XP!</div>
  </div>
  ${BOSSES.map(b=>`<div class="boss-card" style="background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:18px;margin-bottom:12px;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.1)" onclick="openBoss(${b.id})">
    <div style="position:absolute;top:0;left:0;bottom:0;width:3px;background:linear-gradient(180deg,${b.color},${b.color}60)"></div>
    <div style="display:flex;align-items:center;gap:14px">
      <div style="width:52px;height:52px;border-radius:14px;background:${b.color}15;border:1px solid ${b.color}35;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">${b.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div class="cinzel" style="font-size:13px;font-weight:700;color:rgba(253,248,236,0.95)">${b.name}</div>
          <span style="font-size:9px;font-family:'Cinzel',serif;font-weight:700;color:${b.color};background:${b.color}15;border:1px solid ${b.color}30;border-radius:999px;padding:3px 8px;flex-shrink:0">${b.diff}</span>
        </div>
        <div style="display:flex;gap:12px;margin-top:5px">
          <span style="font-size:11px;color:rgba(230,80,80,0.9);font-family:'Crimson Pro',serif">❤️ ${b.hp} HP</span>
          <span style="font-size:11px;color:rgba(255,183,3,0.9);font-family:'Crimson Pro',serif">🎁 +${b.reward} XP</span>
        </div>
        <div style="margin-top:10px;font-size:12px;color:rgba(200,210,225,0.8);background:rgba(0,0,0,0.2);border-radius:10px;padding:8px 12px;font-family:'Crimson Pro',serif;line-height:1.5">📜 ${b.desc}</div>
      </div>
    </div>
  </div>`).join('')}
</div>

</div>`;
  }

  // ── BODY ──
  else if(tab==="body"){
    const ideal={mn:(18.5*(S.height/100)**2).toFixed(1),mx:(24.9*(S.height/100)**2).toFixed(1)};
    const diff=(S.weight-21.7*(S.height/100)**2).toFixed(1);
    const bp=Math.min(Math.max(((parseFloat(bv)-15)/25)*100,0),100);
    const minW=S.weightHistory.length?Math.min(...S.weightHistory.map(w=>w.w)):S.weight;
    const maxW=S.weightHistory.length?Math.max(...S.weightHistory.map(w=>w.w)):S.weight;
    const wr=maxW-minW||1;
    el.innerHTML=`<div style="padding:20px 16px">
<div style="margin-bottom:18px">
  <div class="cinzel" style="font-size:9px;color:var(--muted);letter-spacing:3px">PHYSICAL RECORDS</div>
  <div class="pirate" style="font-size:26px;letter-spacing:2px;color:var(--orange)">BODY TRACKER</div>
</div>

<!-- BMI card -->
<div class="glass" style="padding:22px;margin-bottom:12px;border-color:${bi.c}40">
  <div style="text-align:center;margin-bottom:18px">
    <div class="cinzel" style="font-size:9px;color:var(--muted);letter-spacing:3px">BODY MASS INDEX</div>
    <div class="cinzel" style="font-size:52px;font-weight:900;color:${bi.c};margin-top:6px">${bv}</div>
    <div style="font-size:15px;color:${bi.c};margin-top:3px;font-family:'Crimson Pro',serif">${bi.l}</div>
  </div>
  <div style="margin-bottom:18px">
    <div style="height:10px;border-radius:5px;overflow:hidden;background:linear-gradient(90deg,#023E8A,#22c55e 40%,#FFB703 70%,#D62828);position:relative;box-shadow:0 2px 8px rgba(0,0,0,0.4)">
      <div style="position:absolute;top:50%;transform:translateY(-50%);left:${bp}%;margin-left:-5px"><div style="width:10px;height:10px;background:white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.5)"></div></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:4px">${["15","18.5","25","30","40"].map(v=>`<span style="font-size:9px;color:var(--dim)">${v}</span>`).join('')}</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div>
      <div class="cinzel" style="font-size:9px;color:var(--muted);letter-spacing:1px;margin-bottom:7px">WEIGHT (kg)</div>
      <div style="display:flex;align-items:center;gap:7px">
        <button onclick="adjW(-0.5)" class="adj-btn" style="width:36px;height:36px">-</button>
        <div class="cinzel" style="flex:1;text-align:center;font-size:19px;font-weight:700">${S.weight}</div>
        <button onclick="adjW(0.5)" class="adj-btn" style="width:36px;height:36px">+</button>
      </div>
    </div>
    <div>
      <div class="cinzel" style="font-size:9px;color:var(--muted);letter-spacing:1px;margin-bottom:7px">HEIGHT (cm)</div>
      <div style="display:flex;align-items:center;gap:7px">
        <button onclick="adjH(-1)" class="adj-btn" style="width:36px;height:36px">-</button>
        <div class="cinzel" style="flex:1;text-align:center;font-size:19px;font-weight:700">${S.height}</div>
        <button onclick="adjH(1)" class="adj-btn" style="width:36px;height:36px">+</button>
      </div>
    </div>
  </div>
</div>

<!-- Weight history graph -->
<div class="card" style="margin-bottom:12px">
  <div class="cinzel" style="font-size:10px;color:var(--muted);letter-spacing:2px;margin-bottom:14px;display:flex;align-items:center;gap:6px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8v13M5 11c0 3.9 14 3.9 14 0"/></svg> WEIGHT HISTORY</div>
  ${S.weightHistory.length===0?`
  <div style="height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(139,155,180,0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="19" x2="20" y2="19"/><polyline points="4 15 8 9 12 11 16 5 20 8"/></svg>
    <div class="cinzel" style="font-size:9px;color:rgba(139,155,180,0.5);letter-spacing:2px">NO DATA YET</div>
    <div style="font-size:11px;color:rgba(139,155,180,0.35);font-family:'Crimson Pro',serif">Log your first weight below</div>
  </div>
  `:`
  <div style="display:flex;align-items:flex-end;gap:5px;height:90px">
    ${S.weightHistory.map((it,i)=>{const h=Math.max(16,16+((it.w-minW)/wr)*68);const il=i===S.weightHistory.length-1;return`<div style='flex:1;display:flex;flex-direction:column;align-items:center;gap:3px'><div style='font-size:8px;color:var(--dim)'>${it.w}</div><div style='width:100%;height:${h}px;background:${il?'var(--gold)':'rgba(3,83,164,0.6)'};border-radius:3px 3px 0 0;transition:height 0.4s ease;box-shadow:${il?'0 0 12px rgba(255,183,3,0.5)':'none'}'></div><div style='font-size:8px;color:var(--dim);white-space:nowrap'>${it.date.slice(4)}</div></div>`;}).join('')}
  </div>
  `}
  <button class="btn btn-ghost" onclick="openWeightModal()" style="width:100%;margin-top:14px;padding:10px;border-radius:10px;font-size:11px;letter-spacing:1px">+ LOG TODAY'S WEIGHT</button>
</div>

<!-- Target analysis -->
<div class="card">
  <div class="cinzel" style="font-size:10px;color:var(--muted);letter-spacing:2px;margin-bottom:12px;display:flex;align-items:center;gap:6px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="var(--muted)"/></svg> TARGET ANALYSIS</div>
  ${[
    {l:"Ideal Weight Range",v:`${ideal.mn} – ${ideal.mx} kg`,c:"#22c55e"},
    {l:"Current Status",v:`BMI ${bv} · ${bi.l}`,c:bi.c},
    {l:"Diff from Ideal",v:`${parseFloat(diff)>0?"+":""}${diff} kg`,c:"var(--muted)"}
  ].map((it,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:${i<2?"1px solid rgba(255,255,255,0.06)":"none"}">
    <div style="font-size:13px;color:rgba(200,210,225,0.85);font-family:'Crimson Pro',serif">${it.l}</div>
    <div class="cinzel" style="font-size:13px;font-weight:700;color:${it.c}">${it.v}</div>
  </div>`).join('')}
</div>
</div>`;
  }

  // ── CREW (Status + Achievements + Leaderboard) ──
  else if(tab==="crew"){
    let tx=S.xp;for(let i=1;i<S.level;i++)tx+=xpL(i);
    const lb=[
      {n:S.playerName,l:S.level,x:S.xp,r:rk.r,c:rk.c,me:true},
      {n:"Monkey D. Luffy",l:99,x:99999,r:"KING",c:"#D62828",me:false},
      {n:"Roronoa Zoro",l:55,x:25000,r:"YONKO",c:"#FFB703",me:false},
      {n:"Nami",l:40,x:12000,r:"NAKAMA",c:"#FB8500",me:false},
      {n:"Sanji",l:35,x:8000,r:"NAKAMA",c:"#023E8A",me:false},
    ].sort((a,b)=>b.l-a.l||b.x-a.x);
    const md=[`<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="14" r="7" fill="#FFB703"/><circle cx="12" cy="14" r="5" fill="#FFC93C"/><text x="12" y="18" text-anchor="middle" font-size="7" font-weight="900" fill="#7A5900">1</text><path d="M8 4l2 5h4l2-5" fill="#FFB703" opacity=".8"/></svg>`,`<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="14" r="7" fill="#9ca3af"/><circle cx="12" cy="14" r="5" fill="#d1d5db"/><text x="12" y="18" text-anchor="middle" font-size="7" font-weight="900" fill="#4b5563">2</text><path d="M8 4l2 5h4l2-5" fill="#9ca3af" opacity=".8"/></svg>`,`<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="14" r="7" fill="#d4894a"/><circle cx="12" cy="14" r="5" fill="#e8a870"/><text x="12" y="18" text-anchor="middle" font-size="7" font-weight="900" fill="#7c3d0e">3</text><path d="M8 4l2 5h4l2-5" fill="#d4894a" opacity=".8"/></svg>`];
    el.innerHTML=`<div style="padding:20px 16px">

<!-- Header -->
<div style="margin-bottom:18px">
  <div class="cinzel" style="font-size:9px;color:var(--muted);letter-spacing:3px">STRAW HAT LOG</div>
  <div class="pirate" style="font-size:26px;letter-spacing:2px;color:var(--gold)">CREW STATUS</div>
</div>

<!-- ── STATUS SECTION ── -->
<div class="glass-gold" style="padding:18px;margin-bottom:12px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    ${[
      {l:"Name",v:S.playerName},
      {l:"Rank",v:rk.r,c:rk.c},
      {l:"Level",v:`Lv. ${S.level}`},
      {l:"Class",v:rk.lb},
      {l:"Total XP",v:tx.toLocaleString()},
      {l:"Streak",v:`${S.streak} Days`,c:"var(--orange)"}
    ].map(it=>`<div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(8px);border-radius:12px;padding:12px;border:1px solid rgba(255,255,255,0.08)">
      <div class="cinzel" style="font-size:9px;color:rgba(139,155,180,0.85);letter-spacing:1px">${it.l}</div>
      <div class="cinzel" style="font-size:14px;font-weight:700;color:${it.c||"rgba(253,248,236,0.95)"};margin-top:4px">${it.v}</div>
    </div>`).join('')}
  </div>
</div>

<!-- Attribute bars -->
<div class="card" style="margin-bottom:20px">
  <div class="cinzel" style="font-size:10px;color:var(--muted);letter-spacing:2px;margin-bottom:16px;display:flex;align-items:center;gap:6px"><svg width="12" height="12" viewBox="0 0 24 24" fill="var(--muted)"><path d="M14.5 2.5l7 7-12 12-2-2 9-9-2-2-9 9-2-2 12-12Z"/></svg> HAKI ATTRIBUTES</div>
  ${Object.entries(S.stats).map(([k,v])=>{const c=SC[k];return`<div style="margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="display:flex;align-items:center;width:18px;height:18px">${c.icon}</span>
        <span class="cinzel" style="font-size:12px;color:rgba(253,248,236,0.92);font-weight:600">${c.label}</span>
      </div>
      <span class="cinzel" style="font-size:13px;color:${c.color};font-weight:700">${v}</span>
    </div>
    <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${v}%;background:linear-gradient(90deg,${c.color},${c.color}aa);box-shadow:0 0 5px ${c.color}"></div></div>
  </div>`;}).join('')}
</div>

<!-- ── ACHIEVEMENTS ── -->
<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,183,3,0.3),transparent);margin-bottom:20px"></div>
<div style="margin-bottom:6px">
  <div class="cinzel" style="font-size:9px;color:var(--muted);letter-spacing:3px">PIRATE RECORDS</div>
  <div class="pirate" style="font-size:22px;letter-spacing:2px;color:var(--gold);margin-bottom:14px">ACHIEVEMENTS</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px">
  ${S.achievements.map(a=>`<div style="background:${a.unlocked?"rgba(255,183,3,0.07)":"rgba(255,255,255,0.04)"};backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid ${a.unlocked?"rgba(255,183,3,0.3)":"rgba(255,255,255,0.09)"};border-radius:20px;padding:16px;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.08)">
    ${a.unlocked?`<div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,183,3,0.6),transparent)"></div>`:''}
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="width:36px;height:36px;border-radius:10px;background:${a.unlocked?"rgba(255,183,3,0.12)":"rgba(255,255,255,0.06)"};border:1px solid ${a.unlocked?"rgba(255,183,3,0.3)":"rgba(255,255,255,0.1)"};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${a.unlocked?`<span style="font-size:18px">${a.icon}</span>`:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(139,155,180,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`}
      </div>
      <div style="flex:1;min-width:0">
        <div class="cinzel" style="font-size:11px;font-weight:700;color:${a.unlocked?"var(--gold)":"rgba(220,230,245,0.85)"};margin-bottom:2px">${a.title}</div>
        <div style="font-size:10px;color:rgba(139,155,180,0.8);font-family:'Crimson Pro',serif;line-height:1.4">${a.desc}</div>
      </div>
    </div>
    ${a.unlocked?`<div style="display:flex;align-items:center;gap:4px"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span class="cinzel" style="font-size:8px;color:#22c55e;letter-spacing:1px">UNLOCKED</span></div>`:`<div class="cinzel" style="font-size:8px;color:rgba(139,155,180,0.35);letter-spacing:1px">LOCKED</div>`}
  </div>`).join('')}
</div>

<!-- ── LEADERBOARD ── -->
<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,183,3,0.3),transparent);margin-bottom:20px"></div>
<div class="cinzel" style="font-size:9px;color:var(--muted);letter-spacing:3px;margin-bottom:6px">GRAND LINE</div>
<div class="pirate" style="font-size:22px;letter-spacing:2px;color:var(--gold);margin-bottom:14px">LEADERBOARD</div>
${lb.map((p,i)=>`<div style="background:${p.me?"rgba(255,183,3,0.08)":"rgba(255,255,255,0.05)"};backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid ${p.me?"rgba(255,183,3,0.4)":"rgba(255,255,255,0.1)"};border-radius:16px;padding:13px 15px;display:flex;align-items:center;gap:12px;margin-bottom:8px;box-shadow:${p.me?"0 0 20px rgba(255,183,3,0.12),inset 0 1px 0 rgba(255,255,255,0.15)":"0 2px 12px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.06)"}">
  <div style="width:28px;text-align:center;font-size:${i<3?20:13}px;color:${i===0?"#FFB703":i===1?"#c0c8d8":i===2?"#d4894a":"rgba(139,155,180,0.7)"}">
    ${i<3?md[i]:`#${i+1}`}
  </div>
  <div style="flex:1;min-width:0">
    <div class="cinzel" style="font-size:13px;font-weight:700;color:${p.me?"var(--gold)":"rgba(253,248,236,0.95)"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.n}</div>
    <div style="font-size:11px;color:rgba(139,155,180,0.85);font-family:'Crimson Pro',serif">Lv.${p.l} · ${p.x.toLocaleString()} XP</div>
  </div>
  <span class="cinzel" style="font-size:9px;font-weight:700;color:${p.c};background:${p.c}22;border:1px solid ${p.c}55;border-radius:999px;padding:3px 10px;flex-shrink:0;letter-spacing:1px;backdrop-filter:blur(8px)">${p.r}</span>
</div>`).join('')}

</div>`;
  }
}

async function init(){
  const saved=await fbGet(`players/${PK}`);
  if(saved&&saved.playerName){
    S=saved;
    // Safety defaults for fields that may not exist in old Firebase data
    if(!S.weightHistory) S.weightHistory=[];
    if(!S.lang) S.lang=localStorage.getItem('pirateLang')||'bn';
    if(!S.totalQuestsDone) S.totalQuestsDone=0;
    const today=new Date().toDateString();
    if(S.lastQuestReset!==today){
      S.quests=JSON.parse(JSON.stringify(QT));
      if(S.lastQuestReset)S.streak=(S.streak||0)+1;
      S.lastQuestReset=today;
      await fbSet(`players/${PK}`,S);
    }
    if(!S.achievements||S.achievements.length<AT.length)S.achievements=AT.map(a=>{const e=(S.achievements||[]).find(x=>x.id===a.id);return e||{...a,unlocked:false};});
  } else {
    // নতুন user — onboarding দেখাও
    const now = new Date().getFullYear();
    S = {
      playerName: '',
      birthYear: 2000,
      age: now - 2000,
      level: 1, xp: 0, streak: 0, totalQuestsDone: 0,
      lang: localStorage.getItem('pirateLang') || 'bn',
      stats: {strength:10,intelligence:10,agility:10,vitality:10,endurance:10,charisma:10},
      weight: 70, height: 170, heightFeet: 5, heightInch: 7,
      weightHistory: [],
      achievements: JSON.parse(JSON.stringify(AT)),
      lastQuestReset: new Date().toDateString(),
      quests: JSON.parse(JSON.stringify(QT))
    };
    document.getElementById('loading').style.display = 'none';
    document.getElementById('onboarding').style.display = 'block';
    showStep(1);
    return; // init এখানেই শেষ
  }
  document.getElementById('loading').style.display='none';
  document.getElementById('app').style.display='flex';
  document.getElementById('name-input').addEventListener('keydown',e=>{if(e.key==='Enter')saveName();});
  // Sync lang to localStorage
  if(S.lang) localStorage.setItem('piratelang', S.lang);
  // Sync settings dropdown
  const sel = document.getElementById('lang-select');
  if(sel && S.lang) sel.value = S.lang;
  render();
}
// init() called by onAuthStateChanged