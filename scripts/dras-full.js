// dras-full.js — drives the drascula-live MCP engine through the 22 chapter-2 milestones to room 19, checkpointing every 3, so a survey run can reach the unpacked rooms without replaying chapter 1.
// Chapter-2 playthrough with checkpoints. Resumes from the highest checkpoint slot (10,11,12,...)
// or slot 9 if none. Saves a checkpoint after every 3 milestones. Verifies via diff flag folds.
// Exact pack-phrase choice matching. choices-before-talk on retry. Skip only when last diff had speech.
const fs = require("fs");
const { existsSync } = require("fs");
const { spawn } = require("child_process");
const SAVES = require("path").join(__dirname, "..", ".saves");
const LOG = "/tmp/dras-full-log.txt";

// Build the room graph from the pack so navigation uses real exits, not guesses.
// The ghostlight repo is a sibling checkout; GHOSTLIGHT_PACK overrides the path.
const PACK = require(process.env.GHOSTLIGHT_PACK || require("path").join(__dirname, "..", "..", "ghostlight", "packs", "drascula-en.json"));
const GRAPH = {}; // room -> [{exit, to}]
for(const n of Object.keys(PACK.rooms)){
  const ex=PACK.rooms[n].exits||{}; GRAPH[n]=[];
  for(const e of Object.keys(ex)){ if(ex[e].to!=null) GRAPH[n].push({exit:Number(e), to:Number(ex[e].to)}); }
}
// BFS: list of exit numbers to walk from `from` to `to`.
function pathExits(from,to){
  if(from===to) return [];
  const q=[[from,[]]], seen=new Set([from]);
  while(q.length){ const [cur,acc]=q.shift();
    for(const {exit,to:nx} of (GRAPH[cur]||[])){ if(seen.has(nx)) continue;
      const acc2=acc.concat(exit); if(nx===to) return acc2; seen.add(nx); q.push([nx,acc2]); } }
  return null;
}
const lines = [];
function L(s){ lines.push(s); fs.writeFileSync(LOG, lines.join("\n")); console.log(s); }

// Decide the start slot: highest checkpoint present (10..40) else 9.
function slotFile(n){ return `${SAVES}/drascula.${String(n).padStart(3,"0")}`; }
let startSlot = 9;
// resume from highest ch2 checkpoint (10..19); slots 20+ are chapter-boundary saves, not ch2 progress.
for(let n=19;n>=10;n--){ if(existsSync(slotFile(n))){ startSlot=n; break; } }

const srv = spawn("mcp/node_modules/.bin/tsx", ["mcp/src/server.ts"], {
  env: { ...process.env, DRASCULA_MCP_TRANSPORT: "native", DRASCULA_MCP_SAVEPATH: SAVES },
  stdio: ["pipe","pipe","pipe"]
});
srv.stderr.on("data", d=>{ const s=d.toString().trim(); if(s){ lines.push("[eng] "+s); fs.writeFileSync(LOG, lines.join("\n")); } });
let buf="", id=0, pending=new Map();
srv.stdout.on("data", d=>{ buf+=d.toString(); let i;
  while((i=buf.indexOf("\n"))>=0){ const line=buf.slice(0,i); buf=buf.slice(i+1);
    if(!line.trim())continue; let m; try{m=JSON.parse(line)}catch(e){continue}
    if(m.id!=null && pending.has(m.id)){ pending.get(m.id)(m); pending.delete(m.id);} } });
function call(method,params){ return new Promise(res=>{ const myid=++id; pending.set(myid,res); srv.stdin.write(JSON.stringify({jsonrpc:"2.0",id:myid,method,params})+"\n"); }); }
function tool(name,args){ return call("tools/call",{name,arguments:args||{}}); }
function txt(r){ try{return r.result.content.map(c=>c.text).join("\n")}catch(e){return JSON.stringify(r.result||r.error)} }
function J(r){ try{return JSON.parse(txt(r))}catch(e){return {_raw:txt(r)}} }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// state can return room=undefined right after start/anim; wait and retry for a settled read.
async function st(){ for(let i=0;i<6;i++){ const s=J(await tool("state",{})); if(s&&s.room!=null) return s; await sleep(400); } return J(await tool("state",{})); }
function saidArr(j){ return (j.diff&&j.diff.said)||[]; }
function said(j){ return saidArr(j).map(x=>x.text).join(" ")||""; }

const flagsOn = new Set();
function foldFlags(j){ const f=j.diff&&j.diff.flags; if(!f) return; for(const k of Object.keys(f)){ const to=Array.isArray(f[k])?f[k][1]:f[k]; if(to===1) flagsOn.add(Number(k)); else if(to===0) flagsOn.delete(Number(k)); } }
function seedFlags(s){ (s.flags||[]).forEach((v,i)=>{ if(v===1) flagsOn.add(i); }); }

async function A(name,args){
  const j=J(await tool(name,args||{})); foldFlags(j);
  const d=j.diff||{};
  const tag=j.error?("ERROR:"+j.error):("room="+JSON.stringify(d.room)+" said="+JSON.stringify(said(j)).slice(0,46)+(d.invAdded?" +"+JSON.stringify(d.invAdded.map(x=>x.id)):"")+(d.flags?" f="+JSON.stringify(d.flags):""));
  L("  "+name+" "+JSON.stringify(args||{})+" -> "+tag);
  // Settle-timeout after a speech line: the engine committed the action but the
  // transport gave up waiting. Read the real committed state and re-seed flags.
  if(j.error && /did not settle/.test(j.error)){
    const s2=J(await tool("state",{}));
    if(s2 && Array.isArray(s2.flags)){ flagsOn.clear(); s2.flags.forEach((v,i)=>{ if(v===1) flagsOn.add(i); }); L("    recovered flags from state: "+[...flagsOn].sort((a,b)=>a-b).join(",")); }
  }
  return j;
}
async function advance(lastJ){ let had=said(lastJ).length>0,n=0; while(had&&n<6){ const j=J(await tool("skip",{})); foldFlags(j); n++; if(j.error){L("    skip err:"+j.error);break;} if(said(j).length===0) break; } }
// Safe conversation: read choices first; if not in a conversation, talk; then match EXACT phrase.
// Converse: open the menu (talk if needed), choose the exact phrase, THEN end the
// conversation (the ends:true option) so the flag commits. Flags only report on exit.
async function converse(target, phrase){
  let ch=J(await tool("choices",{}));
  let opts=ch.choices||ch.options||[];
  if(!opts.length){ const t=await A("talk",{target}); await advance(t); ch=J(await tool("choices",{})); opts=ch.choices||ch.options||[]; }
  L("    choices="+JSON.stringify(opts.map(o=>o.text||o)));
  const P=phrase.toUpperCase();
  let n=null;
  for(const o of opts){ const tx=(typeof o==="string"?o:(o.text||"")).toUpperCase(); if(tx.includes(P)){ n=(o.n!=null?o.n:opts.indexOf(o)+1); break; } }
  if(n==null){ L("    !! no choice ~ "+phrase); return false; }
  L("    choose "+n+" ("+phrase+")");
  let c=J(await tool("choose",{n})); foldFlags(c); await advance(c); await sleep(400);
  // Re-read flags from state after the choice settles (some flags commit on the choice itself).
  { const sa=await st(); if(Array.isArray(sa.flags)){ flagsOn.clear(); sa.flags.forEach((v,i)=>{ if(v===1) flagsOn.add(i); }); } }
  // End the conversation only if a menu is still open: pick the ends:true option (or last).
  let ch2=J(await tool("choices",{}));
  let opts2=(ch2.choices||ch2.options||[]);
  if(opts2.length){
    let end=opts2.find(o=>o.ends===true);
    let en = end ? (end.n!=null?end.n:opts2.indexOf(end)+1) : (opts2[opts2.length-1].n!=null?opts2[opts2.length-1].n:opts2.length);
    L("    end conversation -> choose "+en);
    const ce=J(await tool("choose",{n:en})); foldFlags(ce); await advance(ce); await sleep(400);
    const sb=await st(); if(Array.isArray(sb.flags)){ flagsOn.clear(); sb.flags.forEach((v,i)=>{ if(v===1) flagsOn.add(i); }); }
  }
  return true;
}

(async()=>{
  await call("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"play",version:"1"}});
  srv.stdin.write(JSON.stringify({jsonrpc:"2.0",method:"notifications/initialized"})+"\n");
  let s=J(await tool("start",{slot:startSlot}));
  await sleep(800); s=await st(); // let the engine settle before first read
  seedFlags(s);
  L("START slot"+startSlot+" ch"+s.chapter+" room"+s.room+" inv="+JSON.stringify(s.inventory)+" flagsOn="+[...flagsOn].sort((a,b)=>a-b).join(","));
  const have=(n)=> flagsOn.has(n);

  // Navigate to a target room using the pack graph. Re-plans from the live room each hop.
  // Some exits are closed DOORs: walk doesn't move the hero until the door is opened.
  // So if a walk doesn't change the room, open that hotspot once and retry the walk.
  async function goTo(room){
    for(let i=0;i<30;i++){
      const cur=(await st()).room; if(cur===room) return true;
      const path=pathExits(cur,room);
      if(!path||!path.length){ L("    !! no path "+cur+"->"+room); return false; }
      const ex=path[0];
      const r=await A("walk",{target:ex});
      if(r.error){ L("    !! walk "+ex+" failed: "+r.error); return false; }
      const after=(await st()).room;
      if(after===cur){ // didn't move: maybe a closed door — open it, then walk again
        await A("open",{target:ex});
        await A("walk",{target:ex});
      }
    }
    return (await st()).room===room;
  }

  // Each milestone: go to its room, then act. Navigation comes from the graph.
  const M = [
    { id:"ch2.handbag", flag:20, do: async()=>{ await goTo(16); await A("open",{target:183}); } },
    { id:"ch2.money", flag:23, do: async()=>{ await A("open",{target:22}); } },
    { id:"ch2.cigarettes", flag:26, do: async()=>{ await goTo(15); await A("use",{item:18,target:188}); await A("push",{target:188}); } },
    { id:"ch2.von-braun-named", flag:40, do: async()=>{ await goTo(14); await converse(53,"AND WHERE CAN I FIND VON BRAUN"); } },
    { id:"ch2.blind-man", flag:4, optional:true, do: async()=>{ await goTo(9); const t=await A("talk",{target:51}); await advance(t); } },
    { id:"ch2.sickle", flag:41, hasItem:14, do: async()=>{ await goTo(9); const u=await A("use",{item:7,target:51}); await advance(u); } },
    { id:"ch2.spike", flag:3, do: async()=>{ await goTo(3); await A("take",{target:165}); } },
    { id:"ch2.church", flag:8, do: async()=>{ await goTo(5); await A("use",{item:10,target:136}); } },
    { id:"ch2.crucifix", flag:10, do: async()=>{ await goTo(6); if((await st()).room===6){ L("  entered room 6; save slot 12"); await tool("save",{slot:12}); } await A("open",{target:139}); await A("take",{target:140}); } },
    { id:"ch2.candle", flag:35, do: async()=>{ await goTo(7); await A("take",{target:190}); } },
    { id:"ch2.leaves", flag:37, alsoNeed:8, do: async()=>{ await goTo(3); await A("use",{item:14,target:166}); } },
    { id:"ch2.bubble-gum", flag:34, do: async()=>{ await goTo(4); await A("push",{target:189}); } },
    { id:"ch2.tissues", flag:7, do: async()=>{ await goTo(8); await A("look",{target:147}); } },
    { id:"ch2.into-hut", flag:14, do: async()=>{ await goTo(17); await A("open",{target:177}); await converse(177,"AFRAID"); } },
    { id:"ch2.book", flag:28, do: async()=>{ await goTo(18); await A("take",{target:182}); } },
    { id:"ch2.earplugs", flag:39, do: async()=>{ await goTo(14); await A("use",{item:12,target:54}); } },
    { id:"ch2.test", flag:22, do: async()=>{ await goTo(18); await A("use",{item:11,target:50}); await converse(55,"I AM READY TO FACE YOUR TEST"); } },
    { id:"ch2.recipe", flag:33, do: async()=>{ await goTo(18); await converse(55,"WHY WOULDN'T DRASCULA KILL YOU"); } },
    { id:"ch2.brew", flag:36, do: async()=>{ await goTo(18); await converse(55,"I HAVE ALL THE INGREDIENTS OF THAT BREW"); } },
  ];

  // A milestone is done when: its flag is on, OR any altFlag is on, OR hasItem is held.
  // alsoNeed (if set) must also be on. Held items read from live state.inventory.
  async function isDone(m){
    const inv=((await st()).inventory)||[];
    const flagHit = have(m.flag) || (m.altFlags||[]).some(f=>have(f)) || (m.hasItem!=null && inv.includes(m.hasItem));
    return flagHit && (!m.alsoNeed || have(m.alsoNeed));
  }

  // auto-checkpoints use slots 13..19 so they never clobber slot 12 (room 6) or slot 20 (ch3).
  let stopped=null, cpSlot=13, done=0;
  for(let idx=0; idx<M.length; idx++){
    const m=M[idx];
    if(await isDone(m)){ L("SKIP "+m.id+" (already done)"); done++; }
    else {
      let ok=false;
      for(let a=1;a<=3 && !ok;a++){
        s=await st();
        L("== "+m.id+" attempt "+a+" (room "+s.room+") ==");
        try{ await m.do(); }catch(e){ L("  do() error: "+e.message); }
        ok=await isDone(m);
        L("  after: "+m.id+(ok?" DONE":" not done")+" flagsOn="+[...flagsOn].sort((a,b)=>a-b).join(","));
      }
      if(!ok){ if(m.optional){ L("  OPTIONAL "+m.id+" not set after 3; continuing"); } else { stopped=m.id; break; } }
      done++;
    }
    // checkpoint after every 3 milestones completed
    if(done%3===0){ const sl=cpSlot++; L("  checkpoint -> slot "+sl); await tool("save",{slot:sl}); }
  }

  if(stopped){ L("STOPPED at "+stopped); fs.writeFileSync(LOG, lines.join("\n")); await tool("stop",{}); srv.kill(); process.exit(0); }
  s=await st(); L("== ALL CH2 DONE; room "+s.room+" flagsOn="+[...flagsOn].sort((a,b)=>a-b).join(",")+" ==");

  // ---- Reach room 19, checkpoint slot 5, then down the well into room 20 ----
  // Route to nave (room 7) then churchyard well (room 19 via exit 164).
  L("== GO TO WELL (room 19) ==");
  await goTo(19);
  s=await st();
  if(s.room!==19){ L("!! not in room 19 (room "+s.room+"); cannot reach well"); }
  else {
    L("  in room 19; save slot 5"); await tool("save",{slot:5});
    L("== DOWN THE WELL (exit 173) =="); await A("walk",{target:173});
    s=await st(); L("  after well: room "+s.room+" chapter "+s.chapter);
    if(s.room===20){
      L("== REACHED ROOM 20; chapter-boundary checkpoint slot 20 =="); await tool("save",{slot:20});
      // survey room 20: look at every hotspot once
      L("== SURVEY ROOM 20 =="); L("STATE20 "+JSON.stringify(s));
      const hs=(s.hotspots||s.targets||[]);
      for(const h of hs){ const n=(typeof h==="number")?h:(h.id!=null?h.id:h.num); if(n==null)continue; const lk=await A("look",{target:n}); L("LOOK20 "+n+" :: "+JSON.stringify(lk.diff||lk)); }
    } else { L("!! well did not land in room 20 (room "+s.room+")"); }
  }
  fs.writeFileSync(LOG, lines.join("\n"));
  await tool("stop",{});
  srv.kill(); process.exit(0);
})().catch(e=>{ L("FATAL "+e.message); fs.writeFileSync(LOG, lines.join("\n")); try{srv.kill()}catch(_){ } process.exit(1); });
