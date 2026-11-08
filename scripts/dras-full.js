// dras-full.js — drives the drascula-live MCP engine through the 22 chapter-2 milestones to room 19, checkpointing every 3, so a survey run can reach the unpacked rooms without replaying chapter 1.
// Chapter-2 playthrough with checkpoints. Resumes from the highest checkpoint slot (10,11,12,...)
// or slot 9 if none. Saves a checkpoint after every 3 milestones. Verifies via diff flag folds.
// Exact pack-phrase choice matching. choices-before-talk on retry. Skip only when last diff had speech.
const fs = require("fs");
const { existsSync } = require("fs");
const { spawn } = require("child_process");
const SAVES = require("path").join(__dirname, "..", ".saves");
const LOG = "/tmp/dras-full-log.txt";
const lines = [];
function L(s){ lines.push(s); fs.writeFileSync(LOG, lines.join("\n")); console.log(s); }

// Decide the start slot: highest checkpoint present (10..40) else 9.
function slotFile(n){ return `${SAVES}/drascula.${String(n).padStart(3,"0")}`; }
let startSlot = 9;
for(let n=40;n>=10;n--){ if(existsSync(slotFile(n))){ startSlot=n; break; } }

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
async function st(){ return J(await tool("state",{})); }
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
  let c=J(await tool("choose",{n})); foldFlags(c); await advance(c);
  // End the conversation: pick the ends:true option (or the last) so the flag commits.
  let ch2=J(await tool("choices",{}));
  let opts2=(ch2.choices||ch2.options||[]);
  if(opts2.length){
    let end=opts2.find(o=>o.ends===true);
    let en = end ? (end.n!=null?end.n:opts2.indexOf(end)+1) : (opts2[opts2.length-1].n!=null?opts2[opts2.length-1].n:opts2.length);
    L("    end conversation -> choose "+en);
    const ce=J(await tool("choose",{n:en})); foldFlags(ce); await advance(ce);
  }
  return true;
}

(async()=>{
  await call("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"play",version:"1"}});
  srv.stdin.write(JSON.stringify({jsonrpc:"2.0",method:"notifications/initialized"})+"\n");
  let s=J(await tool("start",{slot:startSlot}));
  seedFlags(s);
  L("START slot"+startSlot+" ch"+s.chapter+" room"+s.room+" inv="+JSON.stringify(s.inventory)+" flagsOn="+[...flagsOn].sort((a,b)=>a-b).join(","));
  const have=(n)=> flagsOn.has(n);

  const M = [
    { id:"ch2.handbag", flag:20, do: async()=>{ await A("walk",{target:162}); await A("open",{target:183}); } },
    { id:"ch2.money", flag:23, do: async()=>{ await A("open",{target:22}); } },
    { id:"ch2.cigarettes", flag:26, do: async()=>{ await A("walk",{target:163}); await A("walk",{target:171}); await A("use",{item:18,target:188}); await A("push",{target:188}); } },
    { id:"ch2.von-braun-named", flag:40, do: async()=>{ await A("walk",{target:172}); await converse(53,"AND WHERE CAN I FIND VON BRAUN"); } },
    { id:"ch2.blind-man", flag:4, do: async()=>{ await A("walk",{target:159}); await A("walk",{target:149}); const t=await A("talk",{target:51}); await advance(t); } },
    { id:"ch2.sickle", flag:37, do: async()=>{ const u=await A("use",{item:7,target:51}); await advance(u); } },
    { id:"ch2.spike", flag:3, do: async()=>{ await A("walk",{target:152}); await A("walk",{target:146}); await A("walk",{target:126}); await A("walk",{target:127}); await A("take",{target:165}); } },
    { id:"ch2.church", flag:8, do: async()=>{ await A("walk",{target:134}); await A("use",{item:10,target:213}); } },
    { id:"ch2.crucifix", flag:10, do: async()=>{ await A("walk",{target:136}); await A("open",{target:139}); await A("take",{target:140}); } },
    { id:"ch2.candle", flag:35, do: async()=>{ await A("open",{target:138}); await A("walk",{target:138}); await A("take",{target:190}); } },
    { id:"ch2.leaves", flag:37, alsoNeed:8, do: async()=>{ await A("walk",{target:142}); await A("walk",{target:137}); await A("walk",{target:135}); await A("use",{item:14,target:166}); } },
    { id:"ch2.bubble-gum", flag:34, do: async()=>{ await A("walk",{target:128}); await A("walk",{target:125}); await A("push",{target:189}); } },
    { id:"ch2.tissues", flag:7, do: async()=>{ await A("walk",{target:145}); await A("walk",{target:148}); await A("walk",{target:160}); await A("look",{target:147}); } },
    { id:"ch2.into-hut", flag:14, do: async()=>{ await A("walk",{target:161}); await A("walk",{target:146}); await A("walk",{target:126}); await A("walk",{target:175}); await A("walk",{target:177}); await A("open",{target:177}); await converse(177,"DON'T BE AFRAID"); } },
    { id:"ch2.book", flag:28, do: async()=>{ await A("walk",{target:177}); await A("take",{target:182}); } },
    { id:"ch2.earplugs", flag:39, do: async()=>{ await A("walk",{target:178}); await A("walk",{target:176}); await A("walk",{target:125}); await A("walk",{target:145}); await A("walk",{target:148}); await A("use",{item:12,target:54}); } },
    { id:"ch2.test", flag:22, do: async()=>{ await A("use",{item:11,target:50}); await converse(55,"I AM READY TO FACE YOUR TEST"); } },
    { id:"ch2.recipe", flag:33, do: async()=>{ await converse(55,"WHY WOULDN'T DRASCULA KILL YOU"); } },
    { id:"ch2.brew", flag:36, do: async()=>{ await converse(55,"I HAVE ALL THE INGREDIENTS OF THAT BREW"); } },
  ];

  let stopped=null, cpSlot=10, done=0;
  for(let idx=0; idx<M.length; idx++){
    const m=M[idx];
    if(have(m.flag) && (!m.alsoNeed || have(m.alsoNeed))){ L("SKIP "+m.id+" (flag set)"); done++; }
    else {
      let ok=false;
      for(let a=1;a<=3 && !ok;a++){
        s=await st();
        L("== "+m.id+" attempt "+a+" (room "+s.room+") ==");
        try{ await m.do(); }catch(e){ L("  do() error: "+e.message); }
        ok=have(m.flag) && (!m.alsoNeed || have(m.alsoNeed));
        L("  after: flag"+m.flag+(ok?" SET":" not set")+" flagsOn="+[...flagsOn].sort((a,b)=>a-b).join(","));
      }
      if(!ok){ stopped=m.id; break; }
      done++;
    }
    // checkpoint after every 3 milestones completed
    if(done%3===0){ const sl=cpSlot++; L("  checkpoint -> slot "+sl); await tool("save",{slot:sl}); }
  }

  if(stopped){ L("STOPPED at "+stopped); }
  else { s=await st(); L("== ALL CH2 DONE; room "+s.room+" flagsOn="+[...flagsOn].sort((a,b)=>a-b).join(",")+" =="); }
  fs.writeFileSync(LOG, lines.join("\n"));
  await tool("stop",{});
  srv.kill(); process.exit(0);
})().catch(e=>{ L("FATAL "+e.message); fs.writeFileSync(LOG, lines.join("\n")); try{srv.kill()}catch(_){ } process.exit(1); });
